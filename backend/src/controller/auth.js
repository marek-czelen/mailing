import {unauthorized, unavailable, badRequest} from "../include/errors.js"
import { Response } from '../include/response.js';
import Auth from '../include/auth.js';
import User from '../models/user.model.js';
import Customers from '../models/customers.model.js';
import PermissionsTable from "../include/PermissionsTable.js"
import Admin from "../include/admin.js";
import PasswordResetToken from '../models/passwordResetToken.model.js';
import sequelize from '../include/db.js';
import EnvironmentConfig from '../config/environment.config.js';
import { Mail } from '../include/mail.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';

const PASSWORD_RESET_MESSAGE = 'Jeśli konto z podanym adresem istnieje, wysłaliśmy na nie wiadomość z instrukcją resetu hasła.';

function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function buildPasswordResetEmail(resetUrl, tokenTtlMinutes) {
    return {
        subject: 'Reset hasła - Aculeo Campaigner',
        text: `Aby ustawić nowe hasło, otwórz ten link: ${resetUrl}\n\nLink jest ważny przez ${tokenTtlMinutes} minut i może zostać użyty tylko raz.`,
        html: `<p>Otrzymaliśmy prośbę o ustawienie nowego hasła.</p><p><a href="${resetUrl}">Ustaw nowe hasło</a></p><p>Link jest ważny przez ${tokenTtlMinutes} minut i może zostać użyty tylko raz.</p>`
    };
}

async function sendPasswordResetEmail(userEmail, resetUrl, tokenTtlMinutes) {
    const smtp = EnvironmentConfig.getSMTPConfig();
    if (!smtp.host || !smtp.from) {
        throw new Error('Brak konfiguracji SMTP do odzyskiwania hasła');
    }

    const email = buildPasswordResetEmail(resetUrl, tokenTtlMinutes);
    return Mail.sendEmail({
        smtp: {
            host: smtp.host,
            port: smtp.port,
            secure: smtp.port === 465,
            ignoreTLS: smtp.ignoreTLS,
            rejectUnauthorized: smtp.rejectUnauthorized,
            auth: smtp.user || smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined
        },
        from: smtp.from,
        to: userEmail,
        subject: email.subject,
        text: email.text,
        html: email.html
    });
}

export async function addUser(req, res){
    let query = req.body
    if (!PermissionsTable.checkPermission(query.email,"users","manage","write")) return unauthorized(req,res)
    let data = null
    try{
        data = await Admin.AddUser(query.email, 1, query.password);
        if (!data)  return unavailable(req,res)
    }catch(err){
        return unavailable(req,res, err)
    }

    res.send(new Response(data, true, "Data received successfully."));  
}

export async function login(req,res){
        console.log("login")
        let query = req.body
        if (!query.email || !query.password) return unauthorized(req,res)
        let authToken = await Auth.login(query.email, query.password)
        if (authToken === false) return unauthorized(req,res)
        else res.send(new Response({token: authToken}, true, "Data received successfully."));

    }

export async function requestPasswordReset(req, res) {
    const email = normalizeEmail(req.body?.email);

    try {
        const user = email ? await User.findOne({ where: { email } }) : null;

        if (user?.active) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const { tokenTtlMinutes, frontendUrl } = EnvironmentConfig.getPasswordResetConfig();
            const expiresAt = new Date(Date.now() + tokenTtlMinutes * 60 * 1000);

            await PasswordResetToken.destroy({ where: { userEmail: user.email } });
            await PasswordResetToken.create({
                userEmail: user.email,
                tokenHash: hashResetToken(rawToken),
                expiresAt,
                createdAt: new Date()
            });

            const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
            try {
                const result = await sendPasswordResetEmail(user.email, resetUrl, tokenTtlMinutes);
                if (!result?.success) {
                    throw new Error(result?.error || 'Nie udało się wysłać wiadomości resetującej');
                }
            } catch (mailError) {
                await PasswordResetToken.destroy({ where: { userEmail: user.email } });
                throw mailError;
            }
        }

        return res.status(200).send(new Response(null, true, PASSWORD_RESET_MESSAGE));
    } catch (error) {
        console.error('Błąd podczas żądania resetu hasła:', error.message);
        return res.status(503).send(new Response(null, false, 'Usługa odzyskiwania hasła jest chwilowo niedostępna.'));
    }
}

export async function resetPassword(req, res) {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!/^[a-f0-9]{64}$/.test(token)) {
        return badRequest(req, res, 'Nieprawidłowy lub wygasły token.');
    }

    if (password.length < 8 || password.length > 128) {
        return badRequest(req, res, 'Hasło musi mieć od 8 do 128 znaków.');
    }

    const transaction = await sequelize.transaction();
    try {
        const resetToken = await PasswordResetToken.findOne({
            where: {
                tokenHash: hashResetToken(token),
                usedAt: null,
                expiresAt: { [Op.gt]: new Date() }
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!resetToken) {
            await transaction.rollback();
            return badRequest(req, res, 'Nieprawidłowy lub wygasły token.');
        }

        const user = await User.findOne({
            where: { email: resetToken.userEmail },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!user?.active) {
            await transaction.rollback();
            return badRequest(req, res, 'Nieprawidłowy lub wygasły token.');
        }

        user.hash = await bcrypt.hash(password, 10);
        await user.save({ transaction });
        await PasswordResetToken.destroy({
            where: { userEmail: user.email },
            transaction
        });

        await transaction.commit();
        return res.status(200).send(new Response(null, true, 'Hasło zostało zmienione.'));
    } catch (error) {
        await transaction.rollback();
        console.error('Błąd podczas resetowania hasła:', error.message);
        return unavailable(req, res, 'Nie udało się zmienić hasła.');
    }
}


export async function me(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const userData = await Admin.getCurrentUserData(authHeader);
        
        if (!userData) {
            return unauthorized(req, res);
        }

        // Sprawdź czy konto jest aktywne
        const user = await Admin.getUserByEmail(userData.email);
        if (!user.active) {
            return unauthorized(req, res);
        }

        // Zwróć dane użytkownika (bez hasła)
        const responseData = {
            email: userData.email,
            name: userData.name,
            customerId: userData.customerId,
            active: userData.active,
            roles: userData.roles,
            Customer: userData.Customer
        };

        res.send(new Response(responseData, true, "User data retrieved successfully."));
    } catch (err) {
        return unavailable(req, res, err);
    }
}


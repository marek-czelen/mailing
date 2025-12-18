import { unauthorized, unavailable, badRequest } from "../include/errors.js";
import { Response } from '../include/response.js';
import Admin from "../include/admin.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import UserRole from "../models/userRole.model.js";
import Customers from "../models/customers.model.js";
import bcrypt from "bcrypt";

/**
 * Pobiera listę użytkowników dla danego klienta
 * GET /api/users?customer_id={id}
 */
export async function getUsers(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        // Sprawdź czy użytkownik ma rolę administratora
        const hasAdminRole = await Admin.userHasRole(currentUser.email, 'administrator');
        if (!hasAdminRole) {
            return unauthorized(req, res);
        }

        const customerId = req.query.customer_id || currentUser.customerId;

        // Pobierz użytkowników z rolami
        const users = await User.findAll({
            where: { customerId: customerId },
            attributes: ['email', 'name', 'active', 'createdAt', 'lastLogin', 'customerId'],
            include: [
                {
                    model: Role,
                    as: 'Roles',
                    attributes: ['id', 'name', 'displayName'],
                    through: { attributes: [] }
                },
                {
                    model: Customers,
                    as: 'Customer',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Formatuj dane użytkowników
        const formattedUsers = users.map(user => ({
            id: user.email,
            email: user.email,
            name: user.name,
            customer_id: user.customerId,
            roles: user.Roles.map(role => role.name),
            active: user.active,
            created_at: user.createdAt,
            last_login: user.lastLogin
        }));

        res.send(new Response(formattedUsers, true, "Users retrieved successfully."));
    } catch (err) {
        console.error('Error fetching users:', err);
        return unavailable(req, res, err);
    }
}

/**
 * Pobiera szczegóły pojedynczego użytkownika
 * GET /api/users/:email
 */
export async function getUser(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        const hasAdminRole = await Admin.userHasRole(currentUser.email, 'administrator');
        if (!hasAdminRole) {
            return unauthorized(req, res);
        }

        const userEmail = req.params.email;

        const user = await User.findOne({
            where: { email: userEmail },
            attributes: ['email', 'name', 'active', 'createdAt', 'lastLogin', 'customerId'],
            include: [
                {
                    model: Role,
                    as: 'Roles',
                    attributes: ['id', 'name', 'displayName', 'description'],
                    through: { attributes: [] }
                },
                {
                    model: Customers,
                    as: 'Customer',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!user) {
            return badRequest(req, res, "User not found");
        }

        // Sprawdź czy użytkownik należy do tego samego klienta
        if (user.customerId !== currentUser.customerId) {
            return unauthorized(req, res);
        }

        const formattedUser = {
            id: user.email,
            email: user.email,
            name: user.name,
            customer_id: user.customerId,
            roles: user.Roles.map(role => ({
                id: role.id,
                name: role.name,
                displayName: role.displayName,
                description: role.description
            })),
            active: user.active,
            created_at: user.createdAt,
            last_login: user.lastLogin
        };

        res.send(new Response(formattedUser, true, "User retrieved successfully."));
    } catch (err) {
        console.error('Error fetching user:', err);
        return unavailable(req, res, err);
    }
}

/**
 * Tworzy nowego użytkownika
 * POST /api/users
 */
export async function createUser(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        const hasAdminRole = await Admin.userHasRole(currentUser.email, 'administrator');
        if (!hasAdminRole) {
            return unauthorized(req, res);
        }

        const { email, name, password, roles, active } = req.body;

        // Walidacja danych
        if (!email || !password || !roles || roles.length === 0) {
            return badRequest(req, res, "Email, password and at least one role are required");
        }

        if (password.length < 6) {
            return badRequest(req, res, "Password must be at least 6 characters long");
        }

        // Sprawdź czy użytkownik już istnieje
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return badRequest(req, res, "User with this email already exists");
        }

        // Hashuj hasło
        const hash = await bcrypt.hash(password, 10);

        // Utwórz użytkownika
        const newUser = await User.create({
            email,
            name: name || null,
            hash,
            customerId: currentUser.customerId,
            active: active !== undefined ? active : true
        });

        // Przypisz role
        const roleRecords = await Role.findAll({
            where: { name: roles }
        });

        if (roleRecords.length !== roles.length) {
            return badRequest(req, res, "One or more roles are invalid");
        }

        await Promise.all(roleRecords.map(role =>
            UserRole.create({
                userEmail: email,
                roleId: role.id,
                assignedBy: currentUser.email
            })
        ));

        // Pobierz utworzonego użytkownika z rolami
        const userWithRoles = await User.findOne({
            where: { email },
            attributes: ['email', 'name', 'active', 'createdAt', 'customerId'],
            include: [{
                model: Role,
                as: 'Roles',
                attributes: ['id', 'name', 'displayName'],
                through: { attributes: [] }
            }]
        });

        const formattedUser = {
            id: userWithRoles.email,
            email: userWithRoles.email,
            name: userWithRoles.name,
            customer_id: userWithRoles.customerId,
            roles: userWithRoles.Roles.map(role => role.name),
            active: userWithRoles.active,
            created_at: userWithRoles.createdAt
        };

        res.send(new Response(formattedUser, true, "User created successfully."));
    } catch (err) {
        console.error('Error creating user:', err);
        return unavailable(req, res, err);
    }
}

/**
 * Aktualizuje użytkownika
 * PUT /api/users/:email
 */
export async function updateUser(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        const hasAdminRole = await Admin.userHasRole(currentUser.email, 'administrator');
        if (!hasAdminRole) {
            return unauthorized(req, res);
        }

        const userEmail = req.params.email;
        const { name, email: newEmail, roles, active } = req.body;

        // Znajdź użytkownika
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return badRequest(req, res, "User not found");
        }

        // Sprawdź czy użytkownik należy do tego samego klienta
        if (user.customerId !== currentUser.customerId) {
            return unauthorized(req, res);
        }

        // Aktualizuj dane podstawowe
        if (name !== undefined) user.name = name;
        if (active !== undefined) user.active = active;
        
        // Jeśli zmieniono email
        if (newEmail && newEmail !== userEmail) {
            const existingUser = await User.findOne({ where: { email: newEmail } });
            if (existingUser) {
                return badRequest(req, res, "User with this email already exists");
            }
            
            // Usuń stare powiązania
            await UserRole.destroy({ where: { userEmail } });
            
            // Zmień email
            user.email = newEmail;
        }

        await user.save();

        // Aktualizuj role jeśli podano
        if (roles && Array.isArray(roles)) {
            const currentEmail = newEmail || userEmail;
            
            // Usuń obecne role
            await UserRole.destroy({ where: { userEmail: currentEmail } });

            // Dodaj nowe role
            const roleRecords = await Role.findAll({
                where: { name: roles }
            });

            if (roleRecords.length !== roles.length) {
                return badRequest(req, res, "One or more roles are invalid");
            }

            await Promise.all(roleRecords.map(role =>
                UserRole.create({
                    userEmail: currentEmail,
                    roleId: role.id,
                    assignedBy: currentUser.email
                })
            ));
        }

        // Pobierz zaktualizowanego użytkownika
        const updatedUser = await User.findOne({
            where: { email: newEmail || userEmail },
            attributes: ['email', 'name', 'active', 'createdAt', 'lastLogin', 'customerId'],
            include: [{
                model: Role,
                as: 'Roles',
                attributes: ['id', 'name', 'displayName'],
                through: { attributes: [] }
            }]
        });

        const formattedUser = {
            id: updatedUser.email,
            email: updatedUser.email,
            name: updatedUser.name,
            customer_id: updatedUser.customerId,
            roles: updatedUser.Roles.map(role => role.name),
            active: updatedUser.active,
            created_at: updatedUser.createdAt,
            last_login: updatedUser.lastLogin
        };

        res.send(new Response(formattedUser, true, "User updated successfully."));
    } catch (err) {
        console.error('Error updating user:', err);
        return unavailable(req, res, err);
    }
}

/**
 * Usuwa użytkownika
 * DELETE /api/users/:email
 */
export async function deleteUser(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        const hasAdminRole = await Admin.userHasRole(currentUser.email, 'administrator');
        if (!hasAdminRole) {
            return unauthorized(req, res);
        }

        const userEmail = req.params.email;

        // Nie pozwól usunąć samego siebie
        if (userEmail === currentUser.email) {
            return badRequest(req, res, "You cannot delete your own account");
        }

        // Znajdź użytkownika
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return badRequest(req, res, "User not found");
        }

        // Sprawdź czy użytkownik należy do tego samego klienta
        if (user.customerId !== currentUser.customerId) {
            return unauthorized(req, res);
        }

        // Usuń użytkownika (kaskadowo usunie też UserRole dzięki ON DELETE CASCADE)
        await user.destroy();

        res.send(new Response({ email: userEmail }, true, "User deleted successfully."));
    } catch (err) {
        console.error('Error deleting user:', err);
        return unavailable(req, res, err);
    }
}

/**
 * Zmienia status aktywności użytkownika
 * PATCH /api/users/:email/active
 */
export async function setUserActive(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        const hasAdminRole = await Admin.userHasRole(currentUser.email, 'administrator');
        if (!hasAdminRole) {
            return unauthorized(req, res);
        }

        const userEmail = req.params.email;
        const { active } = req.body;

        if (active === undefined) {
            return badRequest(req, res, "Active status is required");
        }

        // Nie pozwól dezaktywować samego siebie
        if (userEmail === currentUser.email && !active) {
            return badRequest(req, res, "You cannot deactivate your own account");
        }

        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return badRequest(req, res, "User not found");
        }

        // Sprawdź czy użytkownik należy do tego samego klienta
        if (user.customerId !== currentUser.customerId) {
            return unauthorized(req, res);
        }

        user.active = active;
        await user.save();

        res.send(new Response({ email: userEmail, active }, true, "User status updated successfully."));
    } catch (err) {
        console.error('Error updating user status:', err);
        return unavailable(req, res, err);
    }
}

/**
 * Zmienia hasło użytkownika
 * POST /api/users/:email/change-password
 */
export async function changePassword(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        const hasAdminRole = await Admin.userHasRole(currentUser.email, 'administrator');
        if (!hasAdminRole) {
            return unauthorized(req, res);
        }

        const userEmail = req.params.email;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return badRequest(req, res, "Password must be at least 6 characters long");
        }

        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return badRequest(req, res, "User not found");
        }

        // Sprawdź czy użytkownik należy do tego samego klienta
        if (user.customerId !== currentUser.customerId) {
            return unauthorized(req, res);
        }

        // Hashuj i zapisz nowe hasło
        const hash = await bcrypt.hash(password, 10);
        user.hash = hash;
        await user.save();

        res.send(new Response({ email: userEmail }, true, "Password changed successfully."));
    } catch (err) {
        console.error('Error changing password:', err);
        return unavailable(req, res, err);
    }
}

/**
 * Pobiera listę dostępnych ról
 * GET /api/roles
 */
export async function getRoles(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const currentUser = await Admin.getCurrentUserData(authHeader);
        
        if (!currentUser) {
            return unauthorized(req, res);
        }

        const roles = await Role.findAll({
            attributes: ['id', 'name', 'displayName', 'description']
        });

        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            display_name: role.displayName,
            description: role.description
        }));

        res.send(new Response(formattedRoles, true, "Roles retrieved successfully."));
    } catch (err) {
        console.error('Error fetching roles:', err);
        return unavailable(req, res, err);
    }
}

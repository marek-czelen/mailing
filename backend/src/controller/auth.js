import {unauthorized, unavailable} from "../include/errors.js" 
import { Response } from '../include/response.js';
import Auth from '../include/auth.js';
import User from '../models/user.model.js';
import Customers from '../models/customers.model.js';
import PermissionsTable from "../include/PermissionsTable.js"

export async function addUser(req, res){
    let query = req.body
    if (!PermissionsTable.checkPermission(query.email,"users","manage","write")) return unauthorized(req,res)
    let data = null
    try{
        data = await Auth.AddUser(query.email, 1, query.password);
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

export async function me(req, res) {
    try {
        // Pobierz token z nagłówka Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorized(req, res);
        }

        const token = authHeader.substring(7); // Usuń "Bearer " z początku
        
        // Zdekoduj token
        let decodedToken;
        try {
            decodedToken = Auth.decodeToken(token);
        } catch (err) {
            return unauthorized(req, res);
        }

        if (!decodedToken || !decodedToken.data || !decodedToken.data.userEmail) {
            return unauthorized(req, res);
        }

        const userEmail = decodedToken.data.userEmail;

        // Pobierz dane użytkownika z bazy
        const user = await Auth.getUserByEmail(userEmail);
        if (!user) {
            return unauthorized(req, res);
        }

        // Zwróć dane użytkownika (bez hasła)
        const userData = {
            email: user.email,
            customerId: user.customerId,
            Customer: user.Customer
        };

        res.send(new Response(userData, true, "User data retrieved successfully."));
    } catch (err) {
        return unavailable(req, res, err);
    }
}


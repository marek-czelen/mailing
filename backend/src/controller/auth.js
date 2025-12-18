import {unauthorized, unavailable} from "../include/errors.js" 
import { Response } from '../include/response.js';
import Auth from '../include/auth.js';
import User from '../models/user.model.js';
import Customers from '../models/customers.model.js';
import PermissionsTable from "../include/PermissionsTable.js"
import Admin from "../include/admin.js";

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


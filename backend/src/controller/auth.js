import {unauthorized, unavailable} from "../include/errors.js" 
import { Response } from '../include/response.js';
import Auth from '../include/auth.js';
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


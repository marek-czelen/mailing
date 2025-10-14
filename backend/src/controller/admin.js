import {unauthorized, unavailable} from "../include/errors.js" 
import { Response } from '../include/response.js';
import Admin from "../include/admin.js"
import PermissionsTable from "../include/PermissionsTable.js"

export async function getCustomers(req, res){
    let query = req.body
    if (!PermissionsTable.checkPermission(query.email,"customers","manage","admin")) return unauthorized(req,res)
    let data = null
    try{
        data = await Admin.getCustomers();
        if (!data)  return unavailable(req,res)
    }catch(err){
        return unavailable(req,res, err)
    }

    res.send(new Response(data, true, "Data received successfully."));  
}

export async function getUsers(req, res){
    let query = req.body
    if (!PermissionsTable.checkPermission(query.email,"user","manage","write")) return unauthorized(req,res)
    let data = null
    try{
        data = await Admin.getUsers(query);
        if (!data)  return unavailable(req,res)
    }catch(err){
        return unavailable(req,res, err)
    }

    res.send(new Response(data, true, "Data received successfully."));  
}
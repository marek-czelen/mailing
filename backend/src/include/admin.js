import Customers from "../models/customers.model.js";
import User from "../models/user.model.js";

export class Admin {
 static async getCustomers(query){
    return await Customers.findAll({where: query})
 }

 static async getUsers(query){
    return await User.findAll({where: query})
 }
}

export default Admin
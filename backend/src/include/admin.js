import Customers from "../models/customers.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt"
import { Auth } from "./auth.js";

export class Admin {
   static async getCustomers(query) {
      return await Customers.findAll({ where: query })
   }

   static async getUsers(query) {
      return await User.findAll({ where: query })
   }

   static async AddUser(email, companyId, password) {
      let hash = await bcrypt.hash(password, 10)
      let data = await User.create({ email: email, hash: hash, companyId: companyId })
      return data

   }

   static async getCurrentUserData(authHeader) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return null;
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
      const user = await Admin.getUserByEmail(userEmail);
      if (!user) { return null; }

      // Zwróć dane użytkownika (bez hasła)
      return {
         email: user.email,
         customerId: user.customerId,
         Customer: user.Customer
      };
   }

   static async getUserByEmail(email) {
      try {
         const user = await User.findOne({
            where: { email: email },
            include: [{
               model: Customers,
               as: 'Customer',
            }]
         });
         return user;
      } catch (err) {
         console.error('Error fetching user:', err);
         return null;
      }
   }
}

export default Admin
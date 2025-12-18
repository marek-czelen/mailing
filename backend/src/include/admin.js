import Customers from "../models/customers.model.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import UserRole from "../models/userRole.model.js";
import bcrypt from "bcrypt"
import crypto from "crypto";
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
         return null;
      }

      if (!decodedToken || !decodedToken.data || !decodedToken.data.userEmail) {
         return null;
      }

      const userEmail = decodedToken.data.userEmail;

      // Pobierz dane użytkownika z bazy
      const user = await Admin.getUserByEmail(userEmail);
      if (!user) { return null; }

      // Pobierz role użytkownika
      const roles = await Admin.getUserRoles(userEmail);

      // Zwróć dane użytkownika (bez hasła)
      return {
         email: user.email,
         name: user.name,
         customerId: user.customerId,
         active: user.active,
         roles: roles,
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

   /**
    * Pobiera role użytkownika
    */
   static async getUserRoles(email) {
      try {
         const userRoles = await UserRole.findAll({
            where: { userEmail: email },
            include: [{
               model: Role,
               as: 'Role',
               attributes: ['id', 'name', 'displayName', 'description']
            }]
         });

         return userRoles.map(ur => ur.Role.name);
      } catch (err) {
         console.error('Error fetching user roles:', err);
         return [];
      }
   }

   /**
    * Sprawdza czy użytkownik ma określoną rolę
    */
   static async userHasRole(email, roleName) {
      try {
         const roles = await Admin.getUserRoles(email);
         return roles.includes(roleName);
      } catch (err) {
         console.error('Error checking user role:', err);
         return false;
      }
   }

   /**
    * Sprawdza czy użytkownik ma którąkolwiek z podanych ról
    */
   static async userHasAnyRole(email, roleNames) {
      try {
         const roles = await Admin.getUserRoles(email);
         return roleNames.some(roleName => roles.includes(roleName));
      } catch (err) {
         console.error('Error checking user roles:', err);
         return false;
      }
   }

   /**
    * Sprawdza czy użytkownik ma wszystkie podane role
    */
   static async userHasAllRoles(email, roleNames) {
      try {
         const roles = await Admin.getUserRoles(email);
         return roleNames.every(roleName => roles.includes(roleName));
      } catch (err) {
         console.error('Error checking user roles:', err);
         return false;
      }
   }

   /**
    * Tworzy użytkownika jeśli nie istnieje (np. logowanie OAuth)
    */
   static async ensureUserExists({ email, name = null, customerId = null, active = true }) {
      let user = await User.findOne({ where: { email } });

      if (!user) {
         // generujemy losowe hasło ponieważ logowanie odbywa się przez OAuth
         const randomPassword = crypto.randomBytes(16).toString('hex');
         const hash = await bcrypt.hash(randomPassword, 10);

         user = await User.create({
            email,
            name,
            hash,
            customerId,
            active,
            createdAt: new Date()
         });
      } else {
         // Uaktualnij podstawowe dane jeśli są nowe
         if (name && !user.name) user.name = name;
         if (customerId && !user.customerId) user.customerId = customerId;
         if (user.active !== active && active !== undefined) user.active = active;
         await user.save();
      }

      return user;
   }

   /**
    * Upewnia się, że użytkownik ma podane role (dodaje brakujące)
    */
   static async ensureUserHasRoles(email, roleNames = []) {
      if (!roleNames.length) return [];

      const roles = await Role.findAll({ where: { name: roleNames } });
      const existing = await UserRole.findAll({ where: { userEmail: email } });
      const existingRoleIds = new Set(existing.map(er => er.roleId));

      const created = [];
      for (const role of roles) {
         if (!existingRoleIds.has(role.id)) {
            await UserRole.create({
               userEmail: email,
               roleId: role.id,
               assignedBy: 'oauth'
            });
            created.push(role.name);
         }
      }

      return created;
   }

   /**
    * Pobiera dane użytkownika wraz z rolami (bez hasła)
    */
   static async getUserWithRoles(email) {
      const user = await Admin.getUserByEmail(email);
      if (!user) return null;
      const roles = await Admin.getUserRoles(email);

      return {
         email: user.email,
         name: user.name,
         customerId: user.customerId,
         active: user.active,
         roles,
         Customer: user.Customer
      };
   }
}

export default Admin
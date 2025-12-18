import Admin from "./admin.js";
import { unauthorized } from "./errors.js";

/**
 * Middleware sprawdzający czy użytkownik ma określoną rolę
 * @param {string|string[]} roles - Nazwa roli lub tablica nazw ról (jeden z)
 */
export function requireRole(roles) {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const currentUser = await Admin.getCurrentUserData(authHeader);
            
            if (!currentUser) {
                return unauthorized(req, res);
            }

            // Sprawdź czy konto jest aktywne
            if (!currentUser.active) {
                return unauthorized(req, res);
            }

            // Normalizuj do tablicy
            const requiredRoles = Array.isArray(roles) ? roles : [roles];

            // Sprawdź czy użytkownik ma którakolwiek z wymaganych ról
            const hasRole = await Admin.userHasAnyRole(currentUser.email, requiredRoles);
            
            if (!hasRole) {
                return unauthorized(req, res);
            }

            // Dodaj dane użytkownika do requesta
            req.currentUser = currentUser;
            next();
        } catch (err) {
            console.error('Error in requireRole middleware:', err);
            return unauthorized(req, res);
        }
    };
}

/**
 * Middleware sprawdzający czy użytkownik ma wszystkie określone role
 * @param {string[]} roles - Tablica nazw ról (wszystkie wymagane)
 */
export function requireAllRoles(roles) {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const currentUser = await Admin.getCurrentUserData(authHeader);
            
            if (!currentUser) {
                return unauthorized(req, res);
            }

            // Sprawdź czy konto jest aktywne
            if (!currentUser.active) {
                return unauthorized(req, res);
            }

            // Sprawdź czy użytkownik ma wszystkie wymagane role
            const hasAllRoles = await Admin.userHasAllRoles(currentUser.email, roles);
            
            if (!hasAllRoles) {
                return unauthorized(req, res);
            }

            // Dodaj dane użytkownika do requesta
            req.currentUser = currentUser;
            next();
        } catch (err) {
            console.error('Error in requireAllRoles middleware:', err);
            return unauthorized(req, res);
        }
    };
}

/**
 * Middleware sprawdzający czy użytkownik jest administratorem
 */
export function requireAdmin(req, res, next) {
    return requireRole('administrator')(req, res, next);
}

/**
 * Middleware sprawdzający czy użytkownik ma rolę marketera
 */
export function requireMarketer(req, res, next) {
    return requireRole('marketer')(req, res, next);
}

/**
 * Middleware sprawdzający czy użytkownik ma rolę administratora danych
 */
export function requireDataAdmin(req, res, next) {
    return requireRole('data_administrator')(req, res, next);
}

export default {
    requireRole,
    requireAllRoles,
    requireAdmin,
    requireMarketer,
    requireDataAdmin
};

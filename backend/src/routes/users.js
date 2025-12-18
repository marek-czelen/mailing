import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    setUserActive,
    changePassword,
    getRoles
} from '../controller/users.js';

const router = express.Router();

// Endpointy dla użytkowników
router.get('/users', getUsers);                           // Lista użytkowników
router.get('/users/:email', getUser);                     // Szczegóły użytkownika
router.post('/users', createUser);                        // Tworzenie użytkownika
router.put('/users/:email', updateUser);                  // Aktualizacja użytkownika
router.delete('/users/:email', deleteUser);               // Usuwanie użytkownika
router.patch('/users/:email/active', setUserActive);      // Zmiana statusu aktywności
router.post('/users/:email/change-password', changePassword); // Zmiana hasła

// Endpoint dla ról
router.get('/roles', getRoles);                           // Lista dostępnych ról

export default router;

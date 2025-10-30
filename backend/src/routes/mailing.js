import express from 'express';
import {
    getCampaignsList,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    generateMailContent,
    computeSpamRating,
    listModels,
    getDatabasesList,
    getDatabaseById,
    createDatabase,
    updateDatabase,
    deleteDatabase,
    getDatabasesByCustomer,
    getCustomerDatabasesStats
} from '../controller/mailing.js';

const router = express.Router();

// Pobierz wszystkie kampanie
router.get('/getCampaignsList', getCampaignsList);

// Pobierz kampanię po ID
router.get('/getCampaignById/:id', getCampaignById);

// Utwórz nową kampanię
router.post('/createCampaign', createCampaign);

// Aktualizuj kampanię po ID
router.put('/updateCampaign/:id', updateCampaign);

// Usuń kampanię po ID
router.delete('/deleteCampaign/:id', deleteCampaign);
router.get('/listModels', listModels);
router.post('/generateMailContent', generateMailContent);
// Oblicz ocenę SPAM dla treści mailingu
router.post('/computeSpamRating', computeSpamRating);

// ============= DATABASES CRUD =============
// Pobierz wszystkie bazy danych
router.get('/getDatabasesList', getDatabasesList);

// Pobierz bazę danych po ID
router.get('/getDatabaseById/:id', getDatabaseById);

// Utwórz nową bazę danych
router.post('/createDatabase', createDatabase);

// Aktualizuj bazę danych po ID
router.put('/updateDatabase/:id', updateDatabase);

// Usuń bazę danych po ID
router.delete('/deleteDatabase/:id', deleteDatabase);

// Pobierz bazy danych dla konkretnego klienta
router.get('/getDatabasesByCustomer/:customerId', getDatabasesByCustomer);

// Pobierz statystyki baz danych dla klienta
router.get('/getCustomerDatabasesStats/:customerId', getCustomerDatabasesStats);

export default router;
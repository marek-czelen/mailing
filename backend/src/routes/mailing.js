import express from 'express';
import {
    getCampaignsList,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    setCampaignArchived,
    generateMailContent,
    computeSpamRating,
    listModels,
    importExcelToDatabase,
    getDatabasesList,
    getDatabaseById,
    getDatabaseInfoById,
    createDatabase,
    updateDatabase,
    deleteDatabase,
    getDatabasesByCustomer,
    getCustomerDatabasesStats,
    getDatabaseContacts,
    unsubscribeContact,
    resubscribeContact,
    contactUpdate,
    contactAdd,
    contactDelete,
    campaignSendingProgress
} from '../controller/mailing.js';

import { sendEmail } from '../controller/mailProcessing.js';
import { getCampaignReplies, getCampaignBounces, getReplyById, getCampaignRepliesStats, getReplyFullContent } from '../controller/campaignReplies.js';
import { testSmtpConnection, testImapConnection } from '../controller/connectionTest.js';

const router = express.Router();

// Pobierz wszystkie kampanie
router.get('/getCampaignsList', getCampaignsList);

// Postęp wysyłki kampanii
router.get('/campaignSendingProgress/:id', campaignSendingProgress);

// Pobierz kampanię po ID
router.get('/getCampaignById/:id', getCampaignById);

// Pobierz informacje o bazie danych po ID
router.get('/getDatabaseInfoById/:id', getDatabaseInfoById);

// Utwórz nową kampanię
router.post('/createCampaign', createCampaign);

// Aktualizuj kampanię po ID
router.put('/updateCampaign/:id', updateCampaign);

// Usuń kampanię po ID
router.delete('/deleteCampaign/:id', deleteCampaign);
router.put('/archiveCampaign/:id', setCampaignArchived);
router.get('/listModels', listModels);
router.post('/generateMailContent', generateMailContent);
// Oblicz ocenę SPAM dla treści mailingu
router.post('/computeSpamRating', computeSpamRating);

// ============= EXCEL IMPORT =============
// Importuj plik Excel do wskazanej bazy danych
router.post('/importExcelToDatabase/:databaseId', importExcelToDatabase);

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

// Pobierz kontakty przypisane do konkretnej bazy danych
router.get('/getDatabaseContacts/:databaseId', getDatabaseContacts);
// Eksport wszystkich kontaktów z bazy danych
import { exportDatabaseContacts } from '../controller/mailing.js';
router.get('/exportDatabaseContacts/:databaseId', exportDatabaseContacts);

// Wypisz kontakt ze wszystkich list mailingowych danego klienta
router.get('/unsubscribe/:contactHash', unsubscribeContact);
router.get('/resubscribe/:contactHash', resubscribeContact);

// ============= CONTACTS MANAGEMENT =============
// Aktualizuj dane kontaktu
router.post('/contactUpdate', contactUpdate);

// Dodaj nowy kontakt do bazy danych (wymaga tokena JWT)
router.post('/contactAdd', contactAdd);

router.post('/sendEmail', sendEmail);

router.delete('/contactDelete/:contactId', contactDelete);

// ============= CAMPAIGN REPLIES =============
// Pobierz odpowiedzi do kampanii (tylko prawidłowe odpowiedzi, bez bounce)
router.get('/campaigns/:campaignId/replies', getCampaignReplies);

// Pobierz bounce messages do kampanii (tylko bounce)
router.get('/campaigns/:campaignId/bounces', getCampaignBounces);

// Pobierz statystyki odpowiedzi kampanii
router.get('/campaigns/:campaignId/replies/stats', getCampaignRepliesStats);

// Pobierz szczegóły pojedynczej odpowiedzi
router.get('/replies/:replyId', getReplyById);

// Pobierz pełną treść odpowiedzi (oznacza jako odczytaną)
router.get('/replies/:replyId/full', getReplyFullContent);

// ============= CONNECTION TESTS =============
// Testuj połączenie SMTP
router.post('/test-smtp', testSmtpConnection);

// Testuj połączenie IMAP
router.post('/test-imap', testImapConnection);

export default router;
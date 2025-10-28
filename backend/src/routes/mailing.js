import express from 'express';
import {
    getCampaignsList,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    generateMailContent,
    computeSpamRating,
    listModels
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

export default router;
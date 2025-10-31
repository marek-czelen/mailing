import express from 'express';
import TemplatesController from  '../controller/TemplatesController.js';

const router = express.Router();

/**
 * ROUTES FOR EMAIL TEMPLATES API
 * 
 * Base path: /mailing/templates
 */

// GET /mailing/templates - Pobierz wszystkie dostÄ™pne templaty
router.get('/', TemplatesController.getTemplates);

// GET /mailing/templates/categories - Pobierz kategorie templat
router.get('/categories', TemplatesController.getCategories);

// GET /mailing/templates/popular - Pobierz popularne templaty
router.get('/popular', TemplatesController.getPopularTemplates);

// POST /mailing/templates/generate-thumbnail - Generuj thumbnail dla blokĂłw
router.post('/generate-thumbnail', TemplatesController.generateThumbnail);

// GET /mailing/templates/search - Wyszukaj templaty z zaawansowanymi filtrami
router.get('/search', TemplatesController.searchTemplates);

// GET /mailing/templates/:id - Pobierz template po ID z blokami
router.get('/:id', TemplatesController.getTemplateById);

// POST /mailing/templates - UtwĂłrz nowy template
router.post('/', TemplatesController.createTemplate);

// PUT /mailing/templates/:id - Aktualizuj template
router.put('/:id', TemplatesController.updateTemplate);

// DELETE /mailing/templates/:id - UsuĹ„ template
router.delete('/:id', TemplatesController.deleteTemplate);

// POST /mailing/templates/:id/duplicate - Duplikuj template
router.post('/:id/duplicate', TemplatesController.duplicateTemplate);

// POST /mailing/templates/:id/usage - ZwiÄ™ksz licznik uĹĽycia
router.post('/:id/usage', TemplatesController.incrementUsage);

export default router;

/**
 * INSTRUKCJA INTEGRACJI:
 * 
 * Aby zintegrowaÄ‡ te routes w gĹ‚Ăłwnej aplikacji Express:
 * 
 * 1. W gĹ‚Ăłwnym pliku app.js lub server.js dodaj:
 * 
 *    const templatesRoutes = require('./routes/templates');
 *    app.use('/mailing/templates', templatesRoutes);
 * 
 * 2. Upewnij siÄ™ ĹĽe modele Sequelize sÄ… poprawnie zaĹ‚adowane
 * 
 * 3. Uruchom migracje:
 * 
 *    npx sequelize-cli db:migrate
 * 
 * 4. Opcjonalnie uruchom seeders z przykĹ‚adowymi danymi:
 * 
 *    npx sequelize-cli db:seed:all
 * 
 * PRZYKĹADOWE UĹ»YCIE API:
 * 
 * // Pobierz wszystkie templaty
 * GET /mailing/templates
 * 
 * // Pobierz templaty dla konkretnego klienta z blokami
 * GET /mailing/templates?customerId=123&includeBlocks=true
 * 
 * // Wyszukaj templaty promocyjne
 * GET /mailing/templates?category=promocja&search=wyprzedaĹĽ
 * 
 * // Pobierz template po ID
 * GET /mailing/templates/1
 * 
 * // UtwĂłrz nowy template
 * POST /mailing/templates
 * {
 *   "name": "MĂłj szablon",
 *   "description": "Opis szablonu",
 *   "category": "newsletter",
 *   "tags": ["newsletter", "firmowy"],
 *   "blocks": [
 *     {
 *       "blockType": "text",
 *       "content": {"text": "Hello World"},
 *       "style": {"marginTop": 0, "marginBottom": 16, "textAlign": "center"}
 *     }
 *   ]
 * }
 * 
 * // Duplikuj template
 * POST /mailing/templates/1/duplicate
 * {
 *   "name": "Kopia mojego szablonu"
 * }
 */

import express from 'express';
import TemplatesController from  '../controller/TemplatesController.js';

const router = express.Router();

/**
 * ROUTES FOR EMAIL TEMPLATES API
 * 
 * Base path: /mailing/templates
 */

// GET /mailing/templates - Pobierz wszystkie dostępne templaty
router.get('/', TemplatesController.getTemplates);

// GET /mailing/templates/categories - Pobierz kategorie templat
router.get('/categories', TemplatesController.getCategories);

// GET /mailing/templates/popular - Pobierz popularne templaty
router.get('/popular', TemplatesController.getPopularTemplates);

// POST /mailing/templates/generate-thumbnail - Generuj thumbnail dla bloków
router.post('/generate-thumbnail', TemplatesController.generateThumbnail);

// GET /mailing/templates/:id - Pobierz template po ID z blokami
router.get('/:id', TemplatesController.getTemplateById);

// POST /mailing/templates - Utwórz nowy template
router.post('/', TemplatesController.createTemplate);

// PUT /mailing/templates/:id - Aktualizuj template
router.put('/:id', TemplatesController.updateTemplate);

// DELETE /mailing/templates/:id - Usuń template
router.delete('/:id', TemplatesController.deleteTemplate);

// POST /mailing/templates/:id/duplicate - Duplikuj template
router.post('/:id/duplicate', TemplatesController.duplicateTemplate);

// POST /mailing/templates/:id/usage - Zwiększ licznik użycia
router.post('/:id/usage', TemplatesController.incrementUsage);

export default router;

/**
 * INSTRUKCJA INTEGRACJI:
 * 
 * Aby zintegrować te routes w głównej aplikacji Express:
 * 
 * 1. W głównym pliku app.js lub server.js dodaj:
 * 
 *    const templatesRoutes = require('./routes/templates');
 *    app.use('/mailing/templates', templatesRoutes);
 * 
 * 2. Upewnij się że modele Sequelize są poprawnie załadowane
 * 
 * 3. Uruchom migracje:
 * 
 *    npx sequelize-cli db:migrate
 * 
 * 4. Opcjonalnie uruchom seeders z przykładowymi danymi:
 * 
 *    npx sequelize-cli db:seed:all
 * 
 * PRZYKŁADOWE UŻYCIE API:
 * 
 * // Pobierz wszystkie templaty
 * GET /mailing/templates
 * 
 * // Pobierz templaty dla konkretnego klienta z blokami
 * GET /mailing/templates?customerId=123&includeBlocks=true
 * 
 * // Wyszukaj templaty promocyjne
 * GET /mailing/templates?category=promocja&search=wyprzedaż
 * 
 * // Pobierz template po ID
 * GET /mailing/templates/1
 * 
 * // Utwórz nowy template
 * POST /mailing/templates
 * {
 *   "name": "Mój szablon",
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
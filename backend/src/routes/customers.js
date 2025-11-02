import express from 'express';
import CustomerController from '../controller/customers.js';

const router = express.Router();

// Pobierz wszystkich klientów
router.get('/', CustomerController.getAllCustomers);

// Pobierz bieżącego klienta
router.get('/current', CustomerController.getCurrentCustomer);

// Pobierz konkretnego klienta
router.get('/:id', CustomerController.getCustomer);

// Utwórz nowego klienta
router.post('/', 
  CustomerController.getValidationRules('create'), 
  CustomerController.createCustomer
);

// Aktualizuj klienta
router.put('/:id', 
  CustomerController.getValidationRules('update'), 
  CustomerController.updateCustomer
);

// Usuń klienta (soft delete)
router.delete('/:id', CustomerController.deleteCustomer);

// Testuj połączenie SMTP
router.post('/test-smtp', CustomerController.testSmtpConnection);

// Generuj domyślną stopkę RODO
router.post('/generate-rodo-footer', CustomerController.generateRodoFooter);

export default router;

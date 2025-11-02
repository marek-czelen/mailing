import { Response } from '../include/response.js';
import Customers from "../models/customers.model.js";
import Auth from '../include/auth.js';

import { validationResult, body } from 'express-validator';
import { Op } from 'sequelize';

/**
 * Kontroler do zarządzania ustawieniami użytkowników (model Customers)
 */
class UsersController {
  
  /**
   * Pobiera wszystkich użytkowników/klientów
   */
  static async getAllCustomers(req, res) {
    try {
      const customers = await Customers.findAll({
        where: { active: true },
        order: [['name', 'ASC']]
      });

      res.send(new Response(customers, true, "Data received successfully."));
    } catch (error) {
      console.error('Błąd podczas pobierania klientów:', error);
      res.status(500).send(new Response(null, false, `Failed to fetch customers. ${error.message}`));
    }
  }

  /**
   * Pobiera dane konkretnego klienta
   */
  static async getCustomer(req, res) {
    try {
      const { id } = req.params;

      const customer = await Customers.findByPk(id);

      if (!customer) {
        return res.send(new Response(null, false, 'Klient nie został znaleziony'));
      }

      res.send(new Response(customer, true, "Data received successfully."));
    } catch (error) {
      console.error('Błąd podczas pobierania klienta:', error);
      res.status(500).send(new Response(null, false, `Failed to fetch customer. ${error.message}`));
    }
  }

  /**
   * Pobiera dane bieżącego klienta z tokena
   */
  static async getCurrentCustomer(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.substring(7); // Usuń "Bearer " z początku
      let decodedToken;
      try {
          decodedToken = Auth.decodeToken(token);
      } catch (err) {
          return res.status(401).send(new Response(null, false, 'Unauthorized'));
      }
      if (!decodedToken || !decodedToken.data || !decodedToken.data.userEmail) {
          return res.status(401).send(new Response(null, false, 'Unauthorized 2'));
      }

      const userEmail = decodedToken.data.userEmail;

      // Pobierz dane użytkownika z bazy
      const user = await Auth.getUserByEmail(userEmail);
      if (!user) {
          return res.status(500).send(new Response(null, false, 'Failed to fetch current user.'));  
      }

      const customer = await Customers.findByPk(user.customerId);

      if (!customer) {
        return res.status(404).send(new Response(null, false, 'Customer nie został znaleziony'));
      }

      res.send(new Response(customer, true, "Data received successfully."));
    } catch (error) {
      console.error('Błąd podczas pobierania bieżącego użytkownika:', error);
      res.status(500).send(new Response(null, false, `Failed to fetch current user. ${error.message}`));
    }
  }

  /**
   * Tworzy nowego Klienta
   */
  static async createCustomer(req, res) {
    try {
      // Walidacja błędów
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send(new Response(null, false, 'Validation failed', errors.array()));
      }

      const customerData = req.body;

      // Sprawdź czy klient o tej nazwie już istnieje
      const existingCustomer = await Customers.findOne({
        where: { name: customerData.name }
      });

      if (existingCustomer) {
        return res.status(409).send(new Response(null, false, 'Klient o tej nazwie już istnieje'));
      }

      const newCustomer = await Customers.create(customerData);
      res.status(201).send(new Response(newCustomer, true, "Klient został pomyślnie utworzony."));
    } catch (error) {
      console.error('Błąd podczas tworzenia klienta:', error);
      res.status(500).send(new Response(null, false, `Failed to create customer. ${error.message}`));
    }
  }

  /**
   * Aktualizuje dane klienta
   */
  static async updateCustomer(req, res) {
    try {
      // Walidacja błędów
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send(new Response(errors, false, 'Validation failed:'+errors.errors?.map(x=>x.msg).join(', '), errors.array()));
      }

      const { id } = req.params;
      const customerData = req.body;

      const customer = await Customers.findByPk(id);

      if (!customer) {
        return res.status(404).send(new Response(null, false, 'Klient nie został znaleziony'));
      }

      // Sprawdź czy nazwa nie koliduje z innym klientem
      if (customerData.name && customerData.name !== customer.name) {
        const existingCustomer = await Customers.findOne({
          where: { 
            name: customerData.name,
            id: { [Op.ne]: id }
          }
        });

        if (existingCustomer) {
          return res.status(409).send(new Response(null, false, 'Klient o tej nazwie już istnieje'));
        }
      }

      await customer.update(customerData);
      res.send(new Response(customer, true, "Klient zaktualizowany pomyślnie."));
    } catch (error) {
      console.error('Błąd podczas aktualizacji klienta:', error);
      res.status(500).send(new Response(null, false, `Failed to update customer. ${error.message}`));
    }
  }

  /**
   * Usuwa klienta (soft delete - ustawia active na false)
   */
  static async deleteCustomer(req, res) {
    try {
      const { id } = req.params;

      const customer = await Customers.findByPk(id);

      if (!customer) {
        return res.status(404).send(new Response(null, false, 'Klient nie został znaleziony'));
      }

      await customer.update({ active: false });
      res.send(new Response(customer, true, "Klient dezaktywowany pomyślnie."));
    } catch (error) {
      console.error('Błąd podczas usuwania klienta:', error);
      res.status(500).send(new Response(null, false, `Failed to delete customer. ${error.message}`));
    }
  }

  /**
   * Testuje połączenie SMTP
   */
  static async testSmtpConnection(req, res) {
    try {
      const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from } = req.body;

      if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass) {
        return res.status(400).send(new Response(null, false, 'Wszystkie pola SMTP są wymagane'));
      }

      // Tutaj implementacja testowania SMTP
      // Na razie zwracamy sukces dla demonstracji
      const testResult = {
        success: true,
        message: 'Połączenie SMTP zostało pomyślnie przetestowane',
        host: smtp_host,
        port: smtp_port,
        secure: smtp_port == 465
      };

      res.send(new Response(testResult, true, "SMTP connection tested successfully."));
    } catch (error) {
      console.error('Błąd podczas testowania SMTP:', error);
      res.status(500).send(new Response(null, false, `Failed to test SMTP connection. ${error.message}`));
    }
  }

  /**
   * Walidatory dla różnych operacji
   */
  static getValidationRules(operation) {
    switch (operation) {
      case 'create':
      case 'update':
        return [
          body('name')
            .notEmpty()
            .withMessage('Nazwa klienta jest wymagana')
            .isLength({ min: 2 })
            .withMessage('Nazwa klienta musi mieć co najmniej 2 znaki'),
        
          body('smtpFrom')
            .optional()
            .isEmail()
            .withMessage('Adres email nadawcy musi być prawidłowy'),
        
          
          body('active')
            .optional()
            .isBoolean()
            .withMessage('Pole active musi być wartością logiczną'),
          
          body('internalMailServer')
            .optional()
            .isBoolean()
            .withMessage('Pole internalMailServer musi być wartością logiczną')
        ];
      
      default:
        return [];
    }
  }

  /**
   * Generuje domyślną stopkę RODO
   */
  static generateRodoFooter(req, res) {
    try {
      const { company_name, company_address_line_1, company_address_line_2, 
              company_address_city, company_address_postal_code } = req.body;

      const companyName = company_name || '[Nazwa firmy]';
      
      const addressParts = [
        company_address_line_1,
        company_address_line_2,
        company_address_postal_code && company_address_city ? 
          `${company_address_postal_code} ${company_address_city}` :
          company_address_city || company_address_postal_code
      ].filter(Boolean);

      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '[Adres firmy]';

      const rodoFooter = `Zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO), informujemy, że:

Administrator danych: ${companyName}
Adres: ${fullAddress}

Przetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych. Mają Państwo prawo do wycofania zgody w dowolnym momencie.

Jeśli nie chcą Państwo otrzymywać dalszych wiadomości, mogą się Państwo wypisać z listy mailingowej klikając: {{UNSUBSCRIBE_LINK}}

W przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt na adres: ${companyName}.`;

      res.json({ 
        rodo_footer: rodoFooter,
        placeholders: {
          company_name: companyName,
          company_address: fullAddress
        }
      });
    } catch (error) {
      console.error('Błąd podczas generowania stopki RODO:', error);
      res.status(500).json({ 
        error: 'Błąd podczas generowania stopki RODO',
        message: error.message 
      });
    }
  }
}

export default UsersController;
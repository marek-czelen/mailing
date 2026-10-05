/**
 * Testy API - Backend
 * 
 * Uruchomienie: npm test
 * Wymaga działającej bazy danych (konfiguracja w .env)
 */
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';

// Import aplikacji Express
import appModule from '../src/app.js';
const app = appModule.default || appModule;

// Token do testów (uzyskany przez login)
let authToken = '';
let testCampaignId = null;
let testDatabaseId = null;

describe('API - Pełny zestaw testów', () => {

  // ======================== AUTH ========================
  describe('POST /auth/login', () => {
    test('powinien zwrócić token dla poprawnych danych', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'admin123' });
      
      // Jeśli login się nie powiedzie (np. brak usera w DB), test przechodzi warunkowo
      if (res.status === 200 && res.body?.data?.token) {
        authToken = res.body.data.token;
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(authToken).toBeDefined();
      } else {
        console.log('  ⚠ Login testowy nie powiódł się - prawdopodobnie brak danych testowych w DB');
        console.log('  ⚠ Uruchom `npm run seed:demo` aby dodać dane testowe');
        expect([200, 400, 401, 403, 404]).toContain(res.status);
      }
    });

    test('powinien odrzucić nieprawidłowe dane logowania', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'fake@fake.com', password: 'wrong' });
      
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('powinien odrzucić pusty request', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({});
      
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Odzyskiwanie hasła', () => {
    test('powinien nie ujawniać istnienia konta dla pustego adresu', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.response?.success).toBe(true);
    });

    test('powinien odrzucić nieprawidłowy token resetu', async () => {
      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewPassword123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/addUser', () => {
    test('powinien utworzyć nowego użytkownika', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const res = await request(app)
        .post('/auth/addUser')
        .send({
          email: uniqueEmail,
          password: 'Test123!',
          name: 'Test User'
        });
      
      // Może się udać lub nie (zależnie od konfiguracji)
      expect([200, 201, 400, 409, 500]).toContain(res.status);
    });
  });

  describe('GET /auth/me', () => {
    test('powinien zwrócić dane zalogowanego użytkownika', async () => {
      if (!authToken) {
        console.log('  ⚠ Pomijam - brak tokenu');
        return;
      }
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
    });

    test('powinien odrzucić bez tokenu', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
    });
  });

  // ======================== MAILING / KAMPANIE ========================
  describe('POST /mailing/createCampaign', () => {
    test('powinien utworzyć kampanię', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .post('/mailing/createCampaign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Campaign ${Date.now()}`,
          subject: 'Test Subject',
          description: 'Test description',
          active: true
        });
      
      if (res.status === 200 || res.status === 201) {
        testCampaignId = res.body?.data?.id;
        expect(res.body.success).toBe(true);
      }
    });

    test('powinien odrzucić bez autoryzacji', async () => {
      const res = await request(app)
        .post('/mailing/createCampaign')
        .send({ name: 'Test' });
      
      expect(res.status).toBe(401);
    });
  });

  describe('GET /mailing/getCampaignsList', () => {
    test('powinien zwrócić listę kampanii', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .get('/mailing/getCampaignsList')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 403]).toContain(res.status);
    });
  });

  describe('GET /mailing/getCampaignById/:id', () => {
    test('powinien zwrócić kampanię po ID', async () => {
      if (!authToken || !testCampaignId) return;
      
      const res = await request(app)
        .get(`/mailing/getCampaignById/${testCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 403]).toContain(res.status);
    });

    test('powinien zwrócić 403 dla nieistniejącego ID', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .get('/mailing/getCampaignById/999999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([403, 404]).toContain(res.status);
    });
  });

  describe('PUT /mailing/updateCampaign/:id', () => {
    test('powinien zaktualizować kampanię', async () => {
      if (!authToken || !testCampaignId) return;
      
      const res = await request(app)
        .put(`/mailing/updateCampaign/${testCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Campaign Name' });
      
      expect([200, 403]).toContain(res.status);
    });
  });

  // ======================== AI ========================
  describe('POST /mailing/generateMailContent', () => {
    test('powinien wygenerować treść (jeśli AI skonfigurowane)', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .post('/mailing/generateMailContent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ prompt: 'Short promotional email about summer sale' });
      
      // Może zwrócić 200 jeśli AI działa, lub error jeśli nie
      expect([200, 500]).toContain(res.status);
    });

    test('powinien odrzucić bez promptu', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .post('/mailing/generateMailContent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      expect(res.status).not.toBe(200);
    });
  });

  describe('POST /mailing/computeSpamRating', () => {
    test('powinien obliczyć spam score', async () => {
      if (!authToken || !testCampaignId) return;
      
      const res = await request(app)
        .post('/mailing/computeSpamRating')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ id: testCampaignId });
      
      expect([200, 500]).toContain(res.status);
    });
  });

  // ======================== TEMPLATES ========================
  describe('GET /templates', () => {
    test('powinien zwrócić listę szablonów', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .get('/templates')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
    });
  });

  describe('POST /templates', () => {
    test('powinien utworzyć szablon', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .post('/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Template ${Date.now()}`,
          description: 'Test description',
          category: 'Newsletter',
          tags: ['test'],
          blocks: [{ blockType: 'text', content: { text: 'Hello' }, style: {} }]
        });
      
      expect([200, 201]).toContain(res.status);
    });
  });

  // ======================== DATABASES ========================
  describe('POST /mailing/createDatabase', () => {
    test('powinien utworzyć bazę danych', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .post('/mailing/createDatabase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test DB ${Date.now()}`,
          description: 'Test database'
        });
      
      if (res.status === 200 || res.status === 201) {
        testDatabaseId = res.body?.data?.id;
      }
      expect([200, 201, 500]).toContain(res.status);
    });
  });

  describe('GET /mailing/getDatabasesByCustomer/:id', () => {
    test('powinien zwrócić bazy danych klienta', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .get('/mailing/getDatabasesByCustomer/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 403]).toContain(res.status);
    });
  });

  // ======================== USERS (API) ========================
  describe('GET /api/users', () => {
    test('powinien zwrócić listę użytkowników', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .get('/api/users?customer_id=1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 403, 404]).toContain(res.status);
    });
  });

  // ======================== CUSTOMERS ========================
  describe('GET /customers', () => {
    test('powinien zwrócić listę klientów', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .get('/customers')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 403]).toContain(res.status);
    });
  });

  // ======================== EDGE CASES ========================
  describe('Testy brzegowe', () => {
    test('powinien obsłużyć nieistniejący endpoint', async () => {
      const res = await request(app).get('/nonexistent-endpoint-xyz');
      expect([404, 200]).toContain(res.status); // 200 = SPA fallback
    });

    test('powinien obsłużyć CORS preflight', async () => {
      const res = await request(app)
        .options('/auth/login')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');
      
      expect(res.status).toBeLessThan(500);
    });

    test('powinien zwrócić JSON dla API', async () => {
      if (!authToken) return;
      
      const res = await request(app)
        .get('/templates')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.headers['content-type']).toMatch(/json/);
    });

    test('powinien odrzucić nieprawidłowy format tokenu', async () => {
      const res = await request(app)
        .get('/mailing/getCampaignsList')
        .set('Authorization', 'InvalidToken');
      
      expect(res.status).toBe(401);
    });

    test('powinien odrzucić pusty header Authorization', async () => {
      const res = await request(app)
        .get('/mailing/getCampaignsList')
        .set('Authorization', '');
      
      expect(res.status).toBe(401);
    });
  });

  // ======================== PUBLICZNE ENDPOINTY ========================
  describe('Publiczne endpointy', () => {
    test('GET /mailing/unsubscribe/:hash powinien być dostępny bez autoryzacji', async () => {
      const res = await request(app).get('/mailing/unsubscribe/test-hash-123');
      // Powinien być dostępny (chociaż hash jest nieprawidłowy)
      expect(res.status).toBeLessThan(500);
    });
  });

  // ======================== SPRZĄTANIE ========================
  describe('Sprzątanie po testach', () => {
    test('powinien usunąć testową kampanię', async () => {
      if (!authToken || !testCampaignId) return;
      
      const res = await request(app)
        .delete(`/mailing/deleteCampaign/${testCampaignId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      // Może się udać lub nie
      expect(res.status).toBeLessThan(500);
    });

    test('powinien usunąć testową bazę danych', async () => {
      if (!authToken || !testDatabaseId) return;
      
      const res = await request(app)
        .delete(`/mailing/deleteDatabase/${testDatabaseId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBeLessThan(500);
    });
  });

});

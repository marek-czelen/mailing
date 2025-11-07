import express from 'express';
import EnvironmentConfig from '../config/environment.config.js';

const router = express.Router();

/**
 * GET /config/client
 * Zwraca konfigurację dla aplikacji klienckiej (publiczny endpoint)
 */
router.get('/client', function(req, res) {
  res.json({
    apiUrl: EnvironmentConfig.getApiUrl(),
    environment: EnvironmentConfig.get('NODE_ENV', 'production'),
    companyName: EnvironmentConfig.get('COMPANY_NAME', ''),
    websiteUrl: EnvironmentConfig.get('WEBSITE_URL', ''),
    supportEmail: EnvironmentConfig.get('SUPPORT_EMAIL', ''),
    privacyPolicyUrl: EnvironmentConfig.get('PRIVACY_POLICY_URL', ''),
    termsUrl: EnvironmentConfig.get('TERMS_URL', '')
  });
});

export default router;

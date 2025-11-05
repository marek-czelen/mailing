#!/usr/bin/env node

/**
 * Test systemu zmiennych środowiskowych
 * Uruchom: node test-environment.js
 */

import EnvironmentConfig from './src/config/environment.config.js';

console.log('🧪 Test Systemu Zmiennych Środowiskowych\n');

// Test podstawowych funkcji
console.log('📋 Podstawowe informacje:');
console.log(`   NODE_ENV: ${EnvironmentConfig.get('NODE_ENV')}`);
console.log(`   APP_NAME: ${EnvironmentConfig.get('APP_NAME')}`);
console.log(`   BASE_URL: ${EnvironmentConfig.get('BASE_URL')}`);
console.log(`   Development: ${EnvironmentConfig.isDevelopment()}`);
console.log(`   Production: ${EnvironmentConfig.isProduction()}\n`);

// Test konfiguracji bazy danych
console.log('🗄️  Konfiguracja bazy danych:');
const dbConfig = EnvironmentConfig.getDatabaseConfig();
console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.username}`);
console.log(`   Logging: ${dbConfig.logging}\n`);

// Test konfiguracji SMTP
console.log('📧 Konfiguracja SMTP:');
const smtpConfig = EnvironmentConfig.getSmtpConfig();
console.log(`   Host: ${smtpConfig.host}:${smtpConfig.port}`);
console.log(`   Secure: ${smtpConfig.secure}`);
console.log(`   From: ${smtpConfig.from}`);
console.log(`   Auth: ${smtpConfig.auth ? 'Skonfigurowane' : 'Brak'}\n`);

// Test CORS
console.log('🌐 CORS Origins:');
const corsOrigins = EnvironmentConfig.getCorsOrigins();
corsOrigins.forEach((origin, index) => {
    console.log(`   ${index + 1}. ${origin}`);
});
console.log();

// Test zmiennych wydajności
console.log('⚡ Ustawienia wydajności:');
console.log(`   JSON Limit: ${EnvironmentConfig.get('EXPRESS_JSON_LIMIT')}`);
console.log(`   Mailing Interval: ${EnvironmentConfig.get('MAILING_TASK_INTERVAL')}ms`);
console.log(`   Send Delay: ${EnvironmentConfig.get('MAILING_SEND_DELAY')}ms\n`);

// Test SSL/TLS
console.log('🔒 Ustawienia SSL/TLS:');
console.log(`   Ignore TLS: ${EnvironmentConfig.get('SMTP_IGNORE_TLS')}`);
console.log(`   Reject Unauthorized: ${EnvironmentConfig.get('SMTP_REJECT_UNAUTHORIZED')}\n`);

console.log('✅ Test zakończony pomyślnie!');
console.log('💡 Aby zmienić środowisko, ustaw NODE_ENV i uruchom ponownie.');
console.log('   Przykład: set NODE_ENV=production && node test-environment.js');
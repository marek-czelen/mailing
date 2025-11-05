import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Konfiguracja środowiska aplikacji
 * Automatycznie ładuje odpowiednie pliki .env w zależności od NODE_ENV
 */
class EnvironmentConfig {
  constructor() {
    this.loadEnvironmentVariables();
    this.validateRequiredVariables();
  }

  /**
   * Ładuje zmienne środowiskowe z odpowiednich plików .env
   */
  loadEnvironmentVariables() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // Ładuj zmienne w kolejności priorytetów:
    // 1. .env.{environment} (główny plik dla środowiska - najwyższy priorytet)
    // 2. .env.local (lokalne nadpisania - git ignored, opcjonalny)
    // 3. .env (główny plik projektu - opcjonalny)
    // 4. .env.example (fallback dla brakujących wartości - najniższy priorytet)

    const envFiles = [
      `.env.${nodeEnv}`,
      '.env.local', 
      '.env'
    ];

    envFiles.forEach((file, index) => {
      // Ścieżka do katalogu root projektu (../../ od src/config/)
      const filePath = path.resolve(__dirname, '..', '..', file);
      
      // Pierwszy plik (najwyższy priorytet) może nadpisywać
      // Pozostałe pliki działają tylko jako fallback
      const override = index === 0;
      
      try {
        const result = dotenv.config({ path: filePath, override });
        if (result.error) {
          throw result.error;
        }
        console.log(`✓ Załadowano zmienne z: ${file}${override ? ' (priorytet)' : ' (fallback)'}`);
      } catch (error) {
        // Plik nie istnieje - to normalne dla opcjonalnych plików
        if (file === '.env' || file === '.env.local' || file === '.env.example') {
          console.log(`- Plik ${file} nie istnieje (opcjonalny)`);
        } else {
          console.log(`- Plik ${file} nie znaleziony`);
        }
      }
    });

    console.log(`🚀 Środowisko: ${nodeEnv.toUpperCase()}`);
  }

  /**
   * Waliduje czy wszystkie wymagane zmienne są ustawione
   */
  validateRequiredVariables() {
    const required = [
      'NODE_ENV',
      'PORT',
      'DB_HOST',
      'DB_NAME',
      'DB_USER'
    ];

    const missing = required.filter(variable => !process.env[variable]);

    if (missing.length > 0) {
      console.error('❌ Brakuje wymaganych zmiennych środowiskowych:');
      missing.forEach(variable => console.error(`   - ${variable}`));
      console.error('\nSprawdź plik .env lub ustaw zmienne systemowe.');
      process.exit(1);
    }

    console.log('✓ Wszystkie wymagane zmienne środowiskowe są ustawione');
  }

  /**
   * Pobiera zmienną środowiskową z domyślną wartością
   */
  static get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  /**
   * Pobiera zmienną jako boolean
   */
  static getBoolean(key, defaultValue = false) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Pobiera zmienną jako liczbę
   */
  static getNumber(key, defaultValue = 0) {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Pobiera zmienną jako array (oddzieloną przecinkami)
   */
  static getArray(key, defaultValue = []) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.split(',').map(item => item.trim());
  }

  /**
   * Sprawdza czy jesteśmy w środowisku development
   */
  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Sprawdza czy jesteśmy w środowisku production
   */
  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Sprawdza czy jesteśmy w środowisku test
   */
  static isTest() {
    return process.env.NODE_ENV === 'test';
  }

  /**
   * Zwraca konfigurację bazy danych
   */
  static getDatabaseConfig() {
    return {
      host: this.get('DB_HOST', 'localhost'),
      database: this.get('DB_NAME', 'mailing'),
      username: this.get('DB_USER', 'mcl'),
      password: this.get('DB_PASSWORD', ''),
      dialect: 'mysql',
      //logging: this.isDevelopment() ? console.log : false,
      pool: {
        max: this.getNumber('DB_POOL_MAX', 5),
        min: this.getNumber('DB_POOL_MIN', 0),
        acquire: this.getNumber('DB_POOL_ACQUIRE', 30000),
        idle: this.getNumber('DB_POOL_IDLE', 10000)
      }
    };
  }

  /**
   * Zwraca konfigurację SMTP
   */
  static getSMTPConfig() {
    return {
      host: this.get('SMTP_HOST'),
      port: this.getNumber('SMTP_PORT', 587),
      user: this.get('SMTP_USER'),
      pass: this.get('SMTP_PASS'),
      from: this.get('SMTP_FROM'),
      ignoreTLS: this.getBoolean('IGNORE_TLS', false),
      rejectUnauthorized: this.getBoolean('REJECT_UNAUTHORIZED', true)
    };
  }

  /**
   * Zwraca konfigurację CORS
   */
  static getCORSConfig() {
    const corsOrigin = this.get('CORS_ORIGIN', 'http://localhost:3000');
    const credentials = this.getBoolean('CORS_CREDENTIALS', true);
    
    // Jeśli CORS_ORIGIN='*' i credentials=true, używamy funkcji dynamicznej
    // ponieważ CORS nie pozwala na '*' z credentials: true
    if (corsOrigin === '*' && credentials) {
      return {
        origin: (origin, callback) => {
          // Pozwalamy na wszystkie origins w trybie development
          // Logujemy origin dla debugowania
          if (this.isDevelopment()) {
            console.log(`🔐 CORS request from origin: ${origin}`);
          }
          callback(null, true);
        },
        credentials: true
      };
    }
    
    // Dla konkretnych domen - dzielimy przecinkami
    return {
      origin: this.getArray('CORS_ORIGIN', ['http://localhost:3000']),
      credentials: credentials
    };
  }

  /**
   * Zwraca konfigurację Rate Limiting
   */
  static getRateLimitConfig() {
    return {
      windowMs: this.getNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minut
      max: this.getNumber('RATE_LIMIT_MAX_REQUESTS', 100)
    };
  }

  /**
   * Zwraca konfigurację Email
   */
  static getEmailConfig() {
    return {
      batchSize: this.getNumber('EMAIL_BATCH_SIZE', 50),
      delay: this.getNumber('EMAIL_DELAY_MS', 100),
      maxConnections: this.getNumber('EMAIL_MAX_CONNECTIONS', 5),
      maxMessages: this.getNumber('EMAIL_MAX_MESSAGES', 100)
    };
  }

  /**
   * Wyświetla podsumowanie konfiguracji (bez haseł)
   */
  static displayConfig() {
    console.log('\n📋 KONFIGURACJA APLIKACJI:');
    console.log('================================');
    console.log(`Środowisko: ${process.env.NODE_ENV}`);
    console.log(`Port: ${process.env.PORT}`);
    console.log(`Host: ${process.env.HOST}`);
    console.log(`Baza danych: ${process.env.DB_HOST}:${process.env.DB_NAME}`);
    console.log(`SMTP Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`Firma: ${process.env.COMPANY_NAME}`);
    console.log(`Website: ${process.env.WEBSITE_URL}`);
    console.log(`Ignore TLS: ${process.env.IGNORE_TLS}`);
    console.log(`Log Level: ${process.env.LOG_LEVEL || 'info'}`);
    console.log('================================\n');
  }
}

// Inicjalizacja konfiguracji
const config = new EnvironmentConfig();

// Eksportuj klasę dla użycia w innych modułach
export default EnvironmentConfig;

// Wyświetl konfigurację przy starcie (tylko w development)
if (EnvironmentConfig.isDevelopment()) {
  EnvironmentConfig.displayConfig();
}
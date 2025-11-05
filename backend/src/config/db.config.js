import EnvironmentConfig from './environment.config.js';

// Eksportuj konfigurację bazy danych z zmiennych środowiskowych
export const dbConfig = EnvironmentConfig.getDatabaseConfig();

// Kompatybilność wsteczna z istniejącym kodem
export const dbConfigLegacy = {
    Host: EnvironmentConfig.get('DB_HOST', 'localhost'),
    Database: EnvironmentConfig.get('DB_NAME', 'mailing'),
    User: EnvironmentConfig.get('DB_USER', 'mcl'),
    Password: EnvironmentConfig.get('DB_PASSWORD', '')
};

export default dbConfig;
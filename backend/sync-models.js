import sequelize from './src/include/db.js';
import EmailTemplate from './src/models/EmailTemplate.js';
import TemplateBlock from './src/models/TemplateBlock.js';

async function syncModels() {
    try {
        console.log('🔄 Synchronizuję modele z bazą danych...');
        
        // Sprawdź czy modele są poprawnie załadowane
        console.log('📋 Załadowane modele:', Object.keys(sequelize.models));
        
        // Alter tabele aby dodać brakujące kolumny
        await sequelize.sync({ alter: true });
        
        console.log('✅ Synchronizacja zakończona');
        
        // Sprawdź nową strukturę
        console.log('🔍 Sprawdzam nową strukturę...');
        const [results] = await sequelize.query('DESCRIBE email_templates');
        console.log('📊 Aktualna struktura tabeli email_templates:');
        console.table(results);
        
    } catch (error) {
        console.error('❌ Błąd synchronizacji:', error.message);
        console.error(error.stack);
    } finally {
        await sequelize.close();
    }
}

syncModels();
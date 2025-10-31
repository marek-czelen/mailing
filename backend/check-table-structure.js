import sequelize from './src/include/db.js';

async function checkTableStructure() {
    try {
        console.log('🔍 Sprawdzam strukturę tabeli email_templates...');
        
        const [results] = await sequelize.query('DESCRIBE email_templates');
        console.log('📊 Struktura tabeli email_templates:');
        console.table(results);
        
        console.log('\n🔍 Sprawdzam czy tabela istnieje...');
        const [tableExists] = await sequelize.query(
            "SHOW TABLES LIKE 'email_templates'"
        );
        
        if (tableExists.length === 0) {
            console.log('❌ Tabela email_templates nie istnieje!');
            console.log('🛠️ Tworzę tabele...');
            
            // Synchronizuj modele
            await sequelize.sync({ force: false });
            console.log('✅ Tabele zostały utworzone/zsynchronizowane');
        } else {
            console.log('✅ Tabela email_templates istnieje');
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
        
        if (error.message.includes("doesn't exist")) {
            console.log('🛠️ Tabela nie istnieje, tworzę...');
            try {
                await sequelize.sync({ force: false });
                console.log('✅ Tabele zostały utworzone');
                
                // Sprawdź ponownie
                const [results] = await sequelize.query('DESCRIBE email_templates');
                console.log('📊 Nowa struktura tabeli:');
                console.table(results);
            } catch (syncError) {
                console.error('❌ Błąd podczas tworzenia tabel:', syncError.message);
            }
        }
    } finally {
        await sequelize.close();
    }
}

checkTableStructure();
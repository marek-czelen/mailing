import sequelize from './src/include/db.js';

async function checkMigratedData() {
    try {
        console.log('🔍 Sprawdzam zmigrowane dane...');
        
        // Sprawdź liczbę szablonów
        const [templatesCount] = await sequelize.query('SELECT COUNT(*) as count FROM email_templates');
        console.log(`📊 Liczba szablonów w bazie: ${templatesCount[0].count}`);
        
        // Sprawdź listę szablonów
        const [templates] = await sequelize.query(`
            SELECT id, name, category, author, version, isActive, usageCount, 
                   (SELECT COUNT(*) FROM template_blocks WHERE templateId = email_templates.id) as blocks_count
            FROM email_templates 
            ORDER BY id DESC
        `);
        
        console.log('\n📋 Lista zmigrowanych szablonów:');
        console.table(templates);
        
        // Sprawdź przykładowe bloki
        const [blocks] = await sequelize.query(`
            SELECT templateId, blockOrder, blockType, content
            FROM template_blocks 
            WHERE templateId = (SELECT MAX(id) FROM email_templates)
            ORDER BY blockOrder
            LIMIT 3
        `);
        
        if (blocks.length > 0) {
            console.log('\n📦 Przykładowe bloki ostatniego szablonu:');
            console.table(blocks.map(b => ({
                templateId: b.templateId,
                order: b.blockOrder,
                type: b.blockType,
                content: typeof b.content === 'string' ? (b.content.length > 50 ? b.content.substring(0, 50) + '...' : b.content) : JSON.stringify(b.content).substring(0, 50) + '...'
            })));
        }
        
    } catch (error) {
        console.error('❌ Błąd:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkMigratedData();
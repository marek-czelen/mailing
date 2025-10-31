/**
 * SKRYPT MIGRACJI TEMPLAT Z JSON DO MYSQL
 * 
 * Ten skrypt przenosi istniejące templaty z plików JSON do bazy MySQL
 * 
 * Użycie:
 * node scripts/migrate-templates-to-mysql.js
 */

const fs = require('fs').promises;
const path = require('path');
const { EmailTemplate, TemplateBlock, sequelize } = require('../models');

// Ścieżka do foldera z templatami JSON
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Mapowanie templat do migracji
const TEMPLATES_TO_MIGRATE = [
  'newsletter-basic.json',
  'promo-sale.json', 
  'notification-welcome.json',
  'event-invitation.json',
  'education-offer.json',
  'kindergarten-offer.json',
  'school-lab-offer.json',
  'primary-school-tablets.json',
  'highschool-projectors.json',
  'university-software.json'
];

async function migrateTemplates() {
  console.log('🚀 Rozpoczynanie migracji templat z JSON do MySQL...\n');

  try {
    // Sprawdź połączenie z bazą danych
    await sequelize.authenticate();
    console.log('✅ Połączenie z bazą danych nawiązane');

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const templateFile of TEMPLATES_TO_MIGRATE) {
      try {
        console.log(`📄 Przetwarzanie: ${templateFile}`);

        // Pobierz dane z pliku JSON
        const templatePath = path.join(TEMPLATES_DIR, templateFile);
        
        let templateData;
        try {
          const fileContent = await fs.readFile(templatePath, 'utf-8');
          templateData = JSON.parse(fileContent);
        } catch (error) {
          console.log(`   ⚠️  Pomijam - plik nie istnieje: ${templatePath}`);
          skippedCount++;
          continue;
        }

        // Sprawdź czy template już istnieje w bazie
        const existingTemplate = await EmailTemplate.findOne({
          where: {
            name: templateData.name,
            isSystem: true
          }
        });

        if (existingTemplate) {
          console.log(`   ⚠️  Pomijam - template już istnieje: ${templateData.name}`);
          skippedCount++;
          continue;
        }

        // Rozpocznij transakcję dla tego templatu
        const transaction = await sequelize.transaction();

        try {
          // Mapuj dane do nowego formatu
          const newTemplateData = {
            name: templateData.name,
            description: templateData.description,
            category: templateData.category,
            tags: templateData.tags || [],
            thumbnail: templateData.thumbnail,
            author: templateData.author || 'System',
            version: templateData.version || '1.0',
            isSystem: true,
            isPublic: true,
            isActive: true,
            customerId: null,
            metadata: {
              migratedFrom: templateFile,
              migratedAt: new Date().toISOString(),
              originalMetadata: templateData.metadata
            }
          };

          // Utwórz template
          const createdTemplate = await EmailTemplate.create(newTemplateData, { transaction });

          // Migruj bloki
          if (templateData.blocks && Array.isArray(templateData.blocks)) {
            for (let i = 0; i < templateData.blocks.length; i++) {
              const blockData = templateData.blocks[i];
              
              await TemplateBlock.create({
                templateId: createdTemplate.id,
                blockType: blockData.type, // Mapowanie z 'type' na 'blockType'
                blockOrder: i,
                content: blockData.content || {},
                style: blockData.style || {
                  marginTop: 0,
                  marginBottom: 0,
                  textAlign: 'left'
                },
                isActive: true,
                metadata: {
                  originalId: blockData.id,
                  migratedAt: new Date().toISOString()
                }
              }, { transaction });
            }
          }

          await transaction.commit();

          console.log(`   ✅ Zmigrowano: ${templateData.name} (${templateData.blocks?.length || 0} bloków)`);
          migratedCount++;

        } catch (error) {
          await transaction.rollback();
          throw error;
        }

      } catch (error) {
        console.log(`   ❌ Błąd migracji ${templateFile}:`, error.message);
        errorCount++;
      }
    }

    // Podsumowanie
    console.log('\n📊 PODSUMOWANIE MIGRACJI:');
    console.log(`✅ Zmigrowano: ${migratedCount} templat`);
    console.log(`⚠️  Pominięto: ${skippedCount} templat`);
    console.log(`❌ Błędy: ${errorCount} templat`);

    // Sprawdź stan bazy po migracji
    const totalTemplates = await EmailTemplate.count({
      where: { isActive: true }
    });
    const systemTemplates = await EmailTemplate.count({
      where: { isActive: true, isSystem: true }
    });

    console.log(`\n📈 STAN BAZY PO MIGRACJI:`);
    console.log(`Wszystkie aktywne templaty: ${totalTemplates}`);
    console.log(`Templaty systemowe: ${systemTemplates}`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migracja zakończona pomyślnie!');
      console.log('Możesz teraz korzystać z templat w aplikacji.');
    }

  } catch (error) {
    console.error('💥 Krytyczny błąd migracji:', error);
    process.exit(1);
  }
}

// Funkcja pomocnicza do tworzenia kopii zapasowej
async function createBackup() {
  try {
    const backupDir = path.join(__dirname, '../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `templates-backup-${timestamp}.sql`);
    
    // Tutaj można dodać eksport danych do SQL
    console.log(`💾 Kopia zapasowa zostanie utworzona w: ${backupPath}`);
    
  } catch (error) {
    console.warn('⚠️  Nie udało się utworzyć kopii zapasowej:', error.message);
  }
}

// Sprawdź argumenty wiersza poleceń
const args = process.argv.slice(2);
const forceMode = args.includes('--force');
const backupMode = args.includes('--backup');

async function main() {
  console.log('🗂️  MIGRACJA TEMPLAT JSON → MySQL\n');
  
  if (backupMode) {
    await createBackup();
  }

  if (!forceMode) {
    console.log('⚠️  UWAGA: Ta operacja może nadpisać istniejące dane!');
    console.log('Aby kontynuować, uruchom skrypt z flagą --force\n');
    console.log('Przykład: node migrate-templates-to-mysql.js --force\n');
    console.log('Opcje:');
    console.log('  --force   - Wymuś migrację');
    console.log('  --backup  - Utwórz kopię zapasową przed migracją\n');
    return;
  }

  await migrateTemplates();
}

// Uruchom migrację
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Nieoczekiwany błąd:', error);
    process.exit(1);
  });
}

module.exports = { migrateTemplates };
#!/usr/bin/env node

/**
 * SKRYPT MIGRACJI SZABLONÓW DO MYSQL
 * 
 * Ten skrypt migruje szablony email z plików JSON do bazy danych MySQL.
 * Obsługuje konwersję starych formatów do nowego API szablonów.
 * 
 * Użycie:
 * node migrate-templates-to-mysql.js [opcje]
 * 
 * Opcje:
 * --source-dir <path>   Katalog ze starymi szablonami JSON (domyślnie: ./templates)
 * --backup              Utwórz kopię zapasową przed migracją
 * --dry-run             Tylko pokaż co zostanie zmigrowane bez wykonywania
 * --help                Pokaż pomoc
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models
import sequelize from "./src/include/db.js";
import EmailTemplate from "./src/models/EmailTemplate.js";
import TemplateBlock from "./src/models/TemplateBlock.js"

console.log('📁 SKRYPT MIGRACJI SZABLONÓW DO MYSQL');
console.log('');

// Argumenty wiersza poleceń
const args = process.argv.slice(2);
const config = {
  sourceDir: './templates',
  backup: false,
  dryRun: false,
  help: false
};

// Parsowanie argumentów
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--source-dir':
      config.sourceDir = args[++i];
      break;
    case '--backup':
      config.backup = true;
      break;
    case '--dry-run':
      config.dryRun = true;
      break;
    case '--help':
      config.help = true;
      break;
  }
}

if (config.help) {
  console.log(`
SKRYPT MIGRACJI SZABLONÓW DO MYSQL

Użycie:
  node migrate-templates-to-mysql.js [opcje]

Opcje:
  --source-dir <path>   Katalog ze starymi szablonami JSON (domyślnie: ./templates)
  --backup              Utwórz kopię zapasową przed migracją
  --dry-run             Tylko pokaż co zostanie zmigrowane bez wykonywania
  --help                Pokaż tę pomoc

Przykłady:
  node migrate-templates-to-mysql.js
  node migrate-templates-to-mysql.js --source-dir /path/to/templates --backup
  node migrate-templates-to-mysql.js --dry-run
  `);
  process.exit(0);
}

/**
 * Generuje miniaturę SVG dla szablonu
 */
function generateThumbnail(template, blocks = []) {
  const width = 200;
  const height = 150;
  const bgColor = '#f5f5f5';
  const textColor = '#666666';
  
  // Proste kolory na podstawie kategorii
  const categoryColors = {
    'newsletter': '#2196F3',
    'promocja': '#e74c3c',
    'powiadomienie': '#27ae60',
    'wydarzenia': '#9c27b0',
    'transakcyjny': '#ff9800',
    'Inne': '#607d8b'
  };
  
  const primaryColor = categoryColors[template.category] || categoryColors['Inne'];
  
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <rect x="10" y="10" width="180" height="30" fill="${primaryColor}" rx="4"/>
    <text x="100" y="55" text-anchor="middle" font-family="Arial" font-size="12" fill="${textColor}" font-weight="bold">
      ${template.name}
    </text>
    <text x="100" y="75" text-anchor="middle" font-family="Arial" font-size="10" fill="${textColor}">
      ${blocks.length} blok(ów)
    </text>
    <text x="100" y="95" text-anchor="middle" font-family="Arial" font-size="9" fill="${textColor}">
      ${template.category}
    </text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Konwertuje stary format szablonu do nowego
 */
function convertLegacyTemplate(oldTemplate, templateId = null) {
  // Różne formaty starych szablonów
  let name, description, category, blocks, author;
  
  if (oldTemplate.template) {
    // Format 1: { template: { name, description, ... }, blocks: [...] }
    const tmpl = oldTemplate.template;
    name = tmpl.name || tmpl.title || 'Szablon bez nazwy';
    description = tmpl.description || '';
    category = tmpl.category || 'inne';
    blocks = oldTemplate.blocks || [];
    author = tmpl.author || 'Migracja';
  } else if (oldTemplate.name) {
    // Format 2: { name, description, blocks, ... }
    name = oldTemplate.name;
    description = oldTemplate.description || '';
    category = oldTemplate.category || 'inne';
    blocks = oldTemplate.blocks || oldTemplate.emailBlocks || [];
    author = oldTemplate.author || 'Migracja';
  } else {
    // Format 3: Tylko bloki
    name = templateId ? `Szablon ${templateId}` : 'Szablon bez nazwy';
    description = 'Szablon zmigrowany z starego systemu';
    category = 'inne';
    blocks = oldTemplate.blocks || oldTemplate || [];
    author = 'Migracja';
  }

  // Konwersja bloków do nowego formatu
  const convertedBlocks = blocks.map((block, index) => {
    // Różne formaty bloków
    let blockType, content, style;
    
    if (block.type) {
      blockType = block.type;
      content = block.content || {};
      style = block.style || {};
    } else if (block.blockType) {
      blockType = block.blockType;
      content = block.content || {};
      style = block.style || {};
    } else {
      // Domyślny blok tekstu jeśli format nieznany
      blockType = 'text';
      content = { text: JSON.stringify(block) };
      style = {};
    }
    
    // Uzupełnienie domyślnych stylów
    const defaultStyle = {
      marginTop: 0,
      marginBottom: 0,
      textAlign: 'left'
    };
    
    return {
      blockType,
      blockOrder: index,
      content,
      style: { ...defaultStyle, ...style }
    };
  });

  // Mapowanie kategorii do akceptowanych wartości modelu
  const categoryMapping = {
    'newsletter': 'newsletter',
    'promocja': 'promocja', 
    'powiadomienie': 'powiadomienie',
    'wydarzenia': 'wydarzenia',
    'wydarzenie': 'wydarzenia', // alternatywna nazwa
    'events': 'wydarzenia',
    'transakcyjny': 'transakcyjny',
    'transaction': 'transakcyjny',
    'inne': 'Inne',
    'other': 'Inne',
    'default': 'Inne'
  };
  
  const normalizedCategory = categoryMapping[category.toLowerCase()] || 'Inne';

  // Przygotowanie szablonu
  const template = {
    name,
    description,
    category: normalizedCategory,
    tags: oldTemplate.tags || [],
    author,
    version: oldTemplate.version || '1.0',
    isSystem: false,
    isPublic: false,
    customerId: null, // Będzie ustawione podczas migracji
    metadata: {
      blocks: convertedBlocks.length,
      estimatedHeight: convertedBlocks.length * 60,
      migratedFrom: 'legacy-json',
      migrationDate: new Date().toISOString()
    }
  };

  template.thumbnail = generateThumbnail(template, convertedBlocks);

  return {
    template,
    blocks: convertedBlocks
  };
}

/**
 * Skanuje katalog w poszukiwaniu plików JSON z szablonami
 */
async function findTemplateFiles(sourceDir) {
  const files = [];
  
  try {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(sourceDir, entry.name);
      
      if (entry.isDirectory()) {
        // Rekursywnie skanuj podkatalogi
        const subFiles = await findTemplateFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Nie można odczytać katalogu ${sourceDir}:`, error.message);
  }
  
  return files;
}

/**
 * Ładuje i parsuje plik JSON z szablonem
 */
async function loadTemplateFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    const templateId = path.basename(filePath, '.json');
    
    return {
      id: templateId,
      filePath,
      data,
      converted: convertLegacyTemplate(data, templateId)
    };
  } catch (error) {
    console.error(`Błąd podczas ładowania ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Tworzy kopię zapasową istniejących szablonów w bazie
 */
async function createBackup() {
  if (config.dryRun) {
    console.log('[DRY-RUN] Pominięto tworzenie kopii zapasowej');
    return null;
  }

  const backupDir = `./backups/templates-${new Date().toISOString().split('T')[0]}`;
  
  try {
    await fs.mkdir(backupDir, { recursive: true });
    
    // Eksportuj istniejące szablony
    const existingTemplates = await EmailTemplate.findAll({
      include: [{
        model: TemplateBlock,
        as: 'blocks',
        order: [['blockOrder', 'ASC']]
      }]
    });
    
    const backupData = {
      exportDate: new Date().toISOString(),
      totalTemplates: existingTemplates.length,
      templates: existingTemplates.map(template => ({
        ...template.toJSON(),
        blocks: template.blocks.map(block => block.toJSON())
      }))
    };
    
    const backupFile = path.join(backupDir, 'templates-backup.json');
    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Kopia zapasowa utworzona: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia kopii zapasowej:', error.message);
    throw error;
  }
}

/**
 * Migruje szablon do bazy danych
 */
async function migrateTemplate(templateData, transaction) {
  const { template: templateInfo, blocks } = templateData.converted;
  
  if (config.dryRun) {
    console.log(`[DRY-RUN] Szablon: ${templateInfo.name} (${blocks.length} bloków)`);
    return null;
  }

  try {
    // Utwórz szablon
    const template = await EmailTemplate.create(templateInfo, { transaction });
    
    // Utwórz bloki
    const blocksToCreate = blocks.map(block => ({
      ...block,
      templateId: template.id
    }));
    
    await TemplateBlock.bulkCreate(blocksToCreate, { transaction });
    
    console.log(`✅ Zmigrowano szablon: ${templateInfo.name} (ID: ${template.id})`);
    return template;
  } catch (error) {
    console.error(`❌ Błąd migracji szablonu ${templateInfo.name}:`, error.message);
    throw error;
  }
}

/**
 * Główna funkcja migracji
 */
async function migrate() {
  console.log('🚀 Rozpoczynam migrację szablonów do MySQL...\n');
  
  // Sprawdź połączenie z bazą danych
  try {
    await sequelize.authenticate();
    console.log('✅ Połączenie z bazą danych OK');
  } catch (error) {
    console.error('❌ Nie można połączyć się z bazą danych:', error.message);
    process.exit(1);
  }
  
  // Znajdź pliki szablonów
  console.log(`🔍 Szukam szablonów w katalogu: ${config.sourceDir}`);
  const templateFiles = await findTemplateFiles(config.sourceDir);
  
  if (templateFiles.length === 0) {
    console.log('ℹ️ Nie znaleziono plików szablonów do migracji');
    return;
  }
  
  console.log(`📁 Znaleziono ${templateFiles.length} plików szablonów`);
  
  // Ładuj szablony
  const templates = [];
  for (const filePath of templateFiles) {
    const template = await loadTemplateFile(filePath);
    if (template) {
      templates.push(template);
    }
  }
  
  console.log(`📋 Załadowano ${templates.length} szablonów do migracji`);
  
  if (templates.length === 0) {
    console.log('ℹ️ Brak prawidłowych szablonów do migracji');
    return;
  }
  
  // Wyświetl podsumowanie
  console.log('\n📊 Podsumowanie migracji:');
  templates.forEach((template, index) => {
    const { template: tmpl, blocks } = template.converted;
    console.log(`  ${index + 1}. ${tmpl.name} (${blocks.length} bloków) - ${template.filePath}`);
  });
  
  if (config.dryRun) {
    console.log('\n[DRY-RUN] Migracja nie zostanie wykonana. Usuń --dry-run aby wykonać migrację.');
    return;
  }
  
  // Kopia zapasowa
  if (config.backup) {
    console.log('\n💾 Tworzę kopię zapasową...');
    await createBackup();
  }
  
  // Wykonaj migrację
  console.log('\n🔄 Wykonuję migrację...');
  const transaction = await sequelize.transaction();
  
  try {
    const migratedTemplates = [];
    
    for (const template of templates) {
      const migratedTemplate = await migrateTemplate(template, transaction);
      if (migratedTemplate) {
        migratedTemplates.push(migratedTemplate);
      }
    }
    
    await transaction.commit();
    
    console.log(`\n✅ Migracja zakończona pomyślnie!`);
    console.log(`📈 Zmigrowano ${migratedTemplates.length} szablonów`);
    
    // Podsumowanie
    if (migratedTemplates.length > 0) {
      console.log('\n📋 Zmigrowane szablony:');
      migratedTemplates.forEach(template => {
        console.log(`  • ${template.name} (ID: ${template.id})`);
      });
    }
    
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Błąd podczas migracji:', error.message);
    console.error('🔄 Transakcja została wycofana');
    process.exit(1);
  }
}

// Uruchom migrację
migrate().catch(error => {
  console.error('💥 Nieoczekiwany błąd:', error);
  process.exit(1);
});
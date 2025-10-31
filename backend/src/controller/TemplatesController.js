import { EmailTemplate, TemplateBlock } from "../models/index.js";
import { Op } from 'sequelize';

class TemplatesController {
  /**
   * Pobierz wszystkie dostępne templaty
   * GET /mailing/templates
   */
  static async getTemplates(req, res) {
    try {
      console.log('🔍 Templates endpoint called with query:', req.query);
      const {
        category,
        search,
        includeBlocks = 'false',
        limit = 50,
        offset = 0,
        customerId
      } = req.query;

      // Buduj warunki WHERE
      const whereClause = {
        isActive: true
      };

      // Multi-tenant: dostęp do publicznych + własnych templat
      if (customerId) {
        whereClause[Op.or] = [
          { isPublic: true },
          { customerId: customerId }
        ];
      } else {
        whereClause.isPublic = true;
      }

      // Filtrowanie po kategorii
      if (category && category !== 'all') {
        whereClause.category = category;
      }

      // Wyszukiwanie po nazwie i opisie
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      // Opcje query
      const queryOptions = {
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['usageCount', 'DESC'], ['createdAt', 'DESC']],
        attributes: {
          exclude: ['deletedAt']
        }
      };

      // Dołącz bloki jeśli wymagane
      if (includeBlocks === 'true') {
        queryOptions.include = [{
          model: TemplateBlock,
          as: 'blocks',
          where: { isActive: true },
          required: false,
          order: [['blockOrder', 'ASC']]
        }];
      }

      const templates = await EmailTemplate.findAndCountAll(queryOptions);

      res.json({
        success: true,
        data: templates.rows,
        pagination: {
          total: templates.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: templates.count > (parseInt(offset) + parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Błąd pobierania templat:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się pobrać szablonów',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Pobierz template po ID z blokami
   * GET /mailing/templates/:id
   */
  static async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      const { customerId } = req.query;

      const whereClause = { id };

      // Multi-tenant check
      if (customerId) {
        whereClause[Op.or] = [
          { customerId: customerId },
          { isPublic: true }
        ];
      } else {
        whereClause.isPublic = true;
      }

      const template = await EmailTemplate.findOne({
        where: whereClause,
        include: [{
          model: TemplateBlock,
          as: 'blocks',
          where: { isActive: true },
          required: false,
          order: [['blockOrder', 'ASC']]
        }],
        attributes: {
          exclude: ['deletedAt']
        }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Szablon nie został znaleziony'
        });
      }

      res.json({
        success: true,
        data: template
      });

    } catch (error) {
      console.error('Błąd pobierania templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się pobrać szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Utwórz nowy template
   * POST /mailing/templates
   */
  static async createTemplate(req, res) {
    const transaction = await req.app.locals.sequelize.transaction();

    try {
      const {
        name,
        description,
        category = 'Inne',
        tags = [],
        thumbnail,
        blocks = [],
        metadata,
        customerId
      } = req.body;

      // Walidacja podstawowa
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nazwa szablonu jest wymagana'
        });
      }

      // Sprawdź czy szablon o takiej nazwie już istnieje dla tego klienta
      const existingTemplate = await EmailTemplate.findOne({
        where: {
          name: name.trim(),
          customerId: customerId || null,
          isActive: true
        }
      });

      if (existingTemplate) {
        return res.status(409).json({
          success: false,
          message: 'Szablon o takiej nazwie już istnieje'
        });
      }

      // Utwórz template
      const templateData = {
        name: name.trim(),
        description: description || '',
        category,
        tags: Array.isArray(tags) ? tags : [],
        thumbnail,
        customerId: customerId || null,
        isPublic: !customerId, // Szablony systemowe są publiczne
        metadata: metadata || {}
      };

      const template = await EmailTemplate.create(templateData, { transaction });

      // Utwórz bloki
      if (blocks.length > 0) {
        const blockPromises = blocks.map((blockData, index) => {
          return TemplateBlock.create({
            templateId: template.id,
            blockType: blockData.blockType,
            blockOrder: blockData.blockOrder !== undefined ? blockData.blockOrder : index,
            content: blockData.content || {},
            style: blockData.style || {
              marginTop: 0,
              marginBottom: 0,
              textAlign: 'left'
            },
            metadata: blockData.metadata
          }, { transaction });
        });

        await Promise.all(blockPromises);
      }

      await transaction.commit();

      // Pobierz template z blokami
      const createdTemplate = await EmailTemplate.findByPk(template.id, {
        include: [{
          model: TemplateBlock,
          as: 'blocks',
          order: [['blockOrder', 'ASC']]
        }]
      });

      res.status(201).json({
        success: true,
        data: createdTemplate,
        message: 'Szablon został utworzony pomyślnie'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Błąd tworzenia templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się utworzyć szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Aktualizuj template
   * PUT /mailing/templates/:id
   */
  static async updateTemplate(req, res) {
    const transaction = await req.app.locals.sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        name,
        description,
        category,
        tags,
        thumbnail,
        blocks,
        metadata,
        customerId
      } = req.body;

      // Znajdź template
      const template = await EmailTemplate.findOne({
        where: {
          id,
          customerId: customerId || null
        }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Szablon nie został znaleziony lub brak uprawnień'
        });
      }

      // Sprawdź czy nie próbuje się edytować systemowego templatu
      if (template.isSystem && !customerId) {
        return res.status(403).json({
          success: false,
          message: 'Nie można edytować szablonów systemowych'
        });
      }

      // Aktualizuj dane template
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (tags !== undefined) updateData.tags = tags;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
      if (metadata !== undefined) updateData.metadata = metadata;

      await template.update(updateData, { transaction });

      // Jeśli są nowe bloki, zastąp wszystkie
      if (blocks && Array.isArray(blocks)) {
        // Usuń stare bloki
        await TemplateBlock.destroy({
          where: { templateId: id },
          transaction
        });

        // Dodaj nowe bloki
        const blockPromises = blocks.map((blockData, index) => {
          return TemplateBlock.create({
            templateId: id,
            blockType: blockData.blockType,
            blockOrder: blockData.blockOrder !== undefined ? blockData.blockOrder : index,
            content: blockData.content || {},
            style: blockData.style || {
              marginTop: 0,
              marginBottom: 0,
              textAlign: 'left'
            },
            metadata: blockData.metadata
          }, { transaction });
        });

        await Promise.all(blockPromises);
      }

      await transaction.commit();

      // Pobierz zaktualizowany template
      const updatedTemplate = await EmailTemplate.findByPk(id, {
        include: [{
          model: TemplateBlock,
          as: 'blocks',
          order: [['blockOrder', 'ASC']]
        }]
      });

      res.json({
        success: true,
        data: updatedTemplate,
        message: 'Szablon został zaktualizowany pomyślnie'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Błąd aktualizacji templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się zaktualizować szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Usuń template
   * DELETE /mailing/templates/:id
   */
  static async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const { customerId } = req.query;

      const template = await EmailTemplate.findOne({
        where: {
          id,
          customerId: customerId || null
        }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Szablon nie został znaleziony lub brak uprawnień'
        });
      }

      if (template.isSystem) {
        return res.status(403).json({
          success: false,
          message: 'Nie można usunąć szablonów systemowych'
        });
      }

      // Soft delete
      await template.destroy();

      res.json({
        success: true,
        message: 'Szablon został usunięty pomyślnie'
      });

    } catch (error) {
      console.error('Błąd usuwania templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się usunąć szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Duplikuj template
   * POST /mailing/templates/:id/duplicate
   */
  static async duplicateTemplate(req, res) {
    const transaction = await req.app.locals.sequelize.transaction();

    try {
      const { id } = req.params;
      const { name, customerId } = req.body;

      // Pobierz oryginalny template
      const originalTemplate = await EmailTemplate.findByPk(id, {
        include: [{
          model: TemplateBlock,
          as: 'blocks',
          order: [['blockOrder', 'ASC']]
        }]
      });

      if (!originalTemplate) {
        return res.status(404).json({
          success: false,
          message: 'Szablon do duplikacji nie został znaleziony'
        });
      }

      // Utwórz kopię
      const duplicateData = {
        name: name || `${originalTemplate.name} (kopia)`,
        description: originalTemplate.description,
        category: originalTemplate.category,
        tags: originalTemplate.tags,
        thumbnail: originalTemplate.thumbnail,
        customerId: customerId || null,
        isPublic: !customerId,
        metadata: {
          ...originalTemplate.metadata,
          duplicatedFrom: originalTemplate.id,
          duplicatedAt: new Date().toISOString()
        }
      };

      const duplicatedTemplate = await EmailTemplate.create(duplicateData, { transaction });

      // Duplikuj bloki
      if (originalTemplate.blocks && originalTemplate.blocks.length > 0) {
        const blockPromises = originalTemplate.blocks.map(block => {
          return TemplateBlock.create({
            templateId: duplicatedTemplate.id,
            blockType: block.blockType,
            blockOrder: block.blockOrder,
            content: block.content,
            style: block.style,
            metadata: block.metadata
          }, { transaction });
        });

        await Promise.all(blockPromises);
      }

      await transaction.commit();

      // Pobierz zduplikowany template z blokami
      const result = await EmailTemplate.findByPk(duplicatedTemplate.id, {
        include: [{
          model: TemplateBlock,
          as: 'blocks',
          order: [['blockOrder', 'ASC']]
        }]
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Szablon został zduplikowany pomyślnie'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Błąd duplikacji templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się zduplikować szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Zwiększ licznik użycia templatu
   * POST /mailing/templates/:id/usage
   */
  static async incrementUsage(req, res) {
    try {
      const { id } = req.params;

      const template = await EmailTemplate.findByPk(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Szablon nie został znaleziony'
        });
      }

      await template.incrementUsage();

      res.json({
        success: true,
        message: 'Licznik użycia został zaktualizowany'
      });

    } catch (error) {
      console.error('Błąd aktualizacji licznika:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się zaktualizować licznika użycia',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Pobierz kategorie templat
   * GET /mailing/templates/categories
   */
  static async getCategories(req, res) {
    try {
      const categories = await EmailTemplate.findAll({
        attributes: ['category'],
        where: {
          isActive: true,
          isPublic: true
        },
        group: ['category'],
        raw: true
      });

      const categoryList = categories.map(c => c.category);

      res.json({
        success: true,
        data: categoryList
      });

    } catch (error) {
      console.error('Błąd pobierania kategorii:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się pobrać kategorii',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Pobierz popularne templaty
   * GET /mailing/templates/popular
   */
  static async getPopularTemplates(req, res) {
    try {
      const { limit = 10 } = req.query;

      const templates = await EmailTemplate.findAll({
        where: {
          isActive: true,
          isPublic: true
        },
        order: [['usageCount', 'DESC'], ['lastUsedAt', 'DESC']],
        limit: parseInt(limit),
        attributes: {
          exclude: ['deletedAt']
        }
      });

      res.json({
        success: true,
        data: templates
      });

    } catch (error) {
      console.error('Błąd pobierania popularnych templat:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się pobrać popularnych szablonów',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Generuj thumbnail dla templatu
   * POST /mailing/templates/generate-thumbnail
   */
  static async generateThumbnail(req, res) {
    try {
      const { blocks } = req.body;

      if (!blocks || !Array.isArray(blocks)) {
        return res.status(400).json({
          success: false,
          message: 'Bloki są wymagane do wygenerowania thumbnail'
        });
      }

      // Prosta generacja SVG thumbnail na podstawie bloków
      const blockTypes = blocks.map(b => b.blockType || b.type);
      const blockCount = blocks.length;

      const colors = {
        text: '#333333',
        button: '#007bff',
        image: '#28a745',
        spacer: '#f8f9fa'
      };

      let svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
          <rect width="200" height="150" fill="#f8f9fa"/>
      `;

      // Dodaj reprezentację bloków
      blockTypes.forEach((type, index) => {
        const y = 20 + (index * 20);
        const color = colors[type] || '#666666';
        
        svgContent += `
          <rect x="20" y="${y}" width="160" height="15" fill="${color}" rx="2"/>
        `;
      });

      svgContent += `
          <text x="100" y="140" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
            ${blockCount} blok(ów)
          </text>
        </svg>
      `;

      const thumbnail = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

      res.json({
        success: true,
        thumbnail: thumbnail
      });

    } catch (error) {
      console.error('Błąd generowania thumbnail:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się wygenerować thumbnail',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default TemplatesController;
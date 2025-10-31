import { EmailTemplate, TemplateBlock, sequelize } from "../models/index.js";
import { Op } from 'sequelize';

class TemplatesController {
  /**
   * Pobierz wszystkie dostÄ™pne templaty
   * GET /mailing/templates
   */
  static async getTemplates(req, res) {
    try {
      console.log('đź”Ť Templates endpoint called with query:', req.query);
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

      // Multi-tenant: dostÄ™p do publicznych + wĹ‚asnych templat
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

      // DoĹ‚Ä…cz bloki jeĹ›li wymagane
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
      console.error('BĹ‚Ä…d pobierania templat:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ pobraÄ‡ szablonĂłw',
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
          message: 'Szablon nie zostaĹ‚ znaleziony'
        });
      }

      res.json({
        success: true,
        data: template
      });

    } catch (error) {
      console.error('BĹ‚Ä…d pobierania templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ pobraÄ‡ szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * UtwĂłrz nowy template
   * POST /mailing/templates
   */
  static async createTemplate(req, res) {
    const transaction = await sequelize.transaction();

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

      // SprawdĹş czy szablon o takiej nazwie juĹĽ istnieje dla tego klienta
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
          message: 'Szablon o takiej nazwie juĹĽ istnieje'
        });
      }

      // UtwĂłrz template
      const templateData = {
        name: name.trim(),
        description: description || '',
        category,
        tags: Array.isArray(tags) ? tags : [],
        thumbnail,
        customerId: customerId || null,
        isPublic: !customerId, // Szablony systemowe sÄ… publiczne
        metadata: metadata || {}
      };

      const template = await EmailTemplate.create(templateData, { transaction });

      // UtwĂłrz bloki
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
        message: 'Szablon zostaĹ‚ utworzony pomyĹ›lnie'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('BĹ‚Ä…d tworzenia templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Aktualizuj template
   * PUT /mailing/templates/:id
   */
  static async updateTemplate(req, res) {
    const transaction = await sequelize.transaction();

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

      // ZnajdĹş template
      const template = await EmailTemplate.findOne({
        where: {
          id,
          customerId: customerId || null
        }
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Szablon nie zostaĹ‚ znaleziony lub brak uprawnieĹ„'
        });
      }

      // SprawdĹş czy nie prĂłbuje siÄ™ edytowaÄ‡ systemowego templatu
      if (template.isSystem && !customerId) {
        return res.status(403).json({
          success: false,
          message: 'Nie moĹĽna edytowaÄ‡ szablonĂłw systemowych'
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

      // JeĹ›li sÄ… nowe bloki, zastÄ…p wszystkie
      if (blocks && Array.isArray(blocks)) {
        // UsuĹ„ stare bloki
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
        message: 'Szablon zostaĹ‚ zaktualizowany pomyĹ›lnie'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('BĹ‚Ä…d aktualizacji templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ zaktualizowaÄ‡ szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * UsuĹ„ template
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
          message: 'Szablon nie zostaĹ‚ znaleziony lub brak uprawnieĹ„'
        });
      }

      if (template.isSystem) {
        return res.status(403).json({
          success: false,
          message: 'Nie moĹĽna usunÄ…Ä‡ szablonĂłw systemowych'
        });
      }

      // Soft delete
      await template.destroy();

      res.json({
        success: true,
        message: 'Szablon zostaĹ‚ usuniÄ™ty pomyĹ›lnie'
      });

    } catch (error) {
      console.error('BĹ‚Ä…d usuwania templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ usunÄ…Ä‡ szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Duplikuj template
   * POST /mailing/templates/:id/duplicate
   */
  static async duplicateTemplate(req, res) {
    const transaction = await sequelize.transaction();

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
          message: 'Szablon do duplikacji nie zostaĹ‚ znaleziony'
        });
      }

      // UtwĂłrz kopiÄ™
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
        message: 'Szablon zostaĹ‚ zduplikowany pomyĹ›lnie'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('BĹ‚Ä…d duplikacji templatu:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ zduplikowaÄ‡ szablonu',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * ZwiÄ™ksz licznik uĹĽycia templatu
   * POST /mailing/templates/:id/usage
   */
  static async incrementUsage(req, res) {
    try {
      const { id } = req.params;

      const template = await EmailTemplate.findByPk(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Szablon nie zostaĹ‚ znaleziony'
        });
      }

      await template.incrementUsage();

      res.json({
        success: true,
        message: 'Licznik uĹĽycia zostaĹ‚ zaktualizowany'
      });

    } catch (error) {
      console.error('BĹ‚Ä…d aktualizacji licznika:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ zaktualizowaÄ‡ licznika uĹĽycia',
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
      console.error('BĹ‚Ä…d pobierania kategorii:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ pobraÄ‡ kategorii',
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
      console.error('BĹ‚Ä…d pobierania popularnych templat:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ pobraÄ‡ popularnych szablonĂłw',
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
          message: 'Bloki sÄ… wymagane do wygenerowania thumbnail'
        });
      }

      // Prosta generacja SVG thumbnail na podstawie blokĂłw
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

      // Dodaj reprezentacjÄ™ blokĂłw
      blockTypes.forEach((type, index) => {
        const y = 20 + (index * 20);
        const color = colors[type] || '#666666';
        
        svgContent += `
          <rect x="20" y="${y}" width="160" height="15" fill="${color}" rx="2"/>
        `;
      });

      svgContent += `
          <text x="100" y="140" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
            ${blockCount} blok(Ăłw)
          </text>
        </svg>
      `;

      const thumbnail = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

      res.json({
        success: true,
        thumbnail: thumbnail
      });

    } catch (error) {
      console.error('BĹ‚Ä…d generowania thumbnail:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udaĹ‚o siÄ™ wygenerowaÄ‡ thumbnail',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  /**
   * Wyszukaj templaty z zaawansowanymi filtrami
   * GET /mailing/templates/search
   */
  static async searchTemplates(req, res) {
    try {
      console.log(' Templates search endpoint called with query:', req.query);
      const {
        q: query,
        category,
        tags,
        author,
        customerId,
        limit = 50,
        offset = 0
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

      // Wyszukiwanie tekstowe po nazwie, opisie i tagach
      if (query) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { tags: { [Op.like]: `%${query}%` } }
        ];
      }

      // Filtrowanie po kategorii
      if (category && category !== 'all') {
        whereClause.category = category;
      }

      // Filtrowanie po autorze
      if (author) {
        whereClause.author = { [Op.like]: `%${author}%` };
      }

      // Filtrowanie po tagach (obsługa wielu tagów)
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        const tagConditions = tagArray.map(tag => ({
          tags: { [Op.like]: `%${tag}%` }
        }));
        
        if (whereClause[Op.or]) {
          whereClause[Op.and] = [
            { [Op.or]: whereClause[Op.or] },
            { [Op.or]: tagConditions }
          ];
          delete whereClause[Op.or];
        } else {
          whereClause[Op.or] = tagConditions;
        }
      }

      // Opcje query z sortowaniem według trafności
      const queryOptions = {
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['usageCount', 'DESC'], 
          ['createdAt', 'DESC']
        ],
        attributes: {
          exclude: ['deletedAt']
        },
        include: [{
          model: TemplateBlock,
          as: 'blocks',
          where: { isActive: true },
          required: false,
          order: [['blockOrder', 'ASC']]
        }]
      };

      const templates = await EmailTemplate.findAndCountAll(queryOptions);

      res.json({
        success: true,
        data: templates.rows,
        searchQuery: query,
        filters: {
          category,
          tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
          author
        },
        pagination: {
          total: templates.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: templates.count > (parseInt(offset) + parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Błąd wyszukiwania templat:', error);
      res.status(500).json({
        success: false,
        message: 'Nie udało się wyszukać szablonów',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

}

export default TemplatesController;

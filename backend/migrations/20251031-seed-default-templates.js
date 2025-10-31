'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Dane templat do wstawienia (na podstawie istniejących plików JSON)
    const templates = [
      {
        name: 'Newsletter Firmowy',
        description: 'Profesjonalny szablon newslettera z logo, nagłówkiem i stopką',
        category: 'newsletter',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMjE5NkYzIi8+PHJlY3QgeD0iMTAiIHk9IjUwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjExMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNGNhZjUwIi8+PC9zdmc+',
        tags: JSON.stringify(['newsletter', 'firmowy', 'miesięczny']),
        author: 'System',
        version: '1.0',
        isSystem: true,
        isPublic: true,
        metadata: JSON.stringify({
          blocks: 8,
          estimatedHeight: 600,
          primaryColors: ['#2196F3', '#3498db', '#4caf50']
        }),
        blocks: [
          {
            blockType: 'image',
            blockOrder: 0,
            content: JSON.stringify({
              src: 'https://via.placeholder.com/300x80/2196F3/ffffff?text=LOGO+FIRMY',
              alt: 'Logo firmy',
              width: 300,
              height: 80,
              url: '',
              borderRadius: 0
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 32,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 1,
            content: JSON.stringify({
              text: 'Newsletter - Październik 2025',
              fontSize: 28,
              color: '#2c3e50',
              fontWeight: 'bold',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 24,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 2,
            content: JSON.stringify({
              text: 'Witaj w naszym miesięcznym newsletterze! Przygotowaliśmy dla Ciebie najważniejsze informacje z naszej firmy, nowości produktowe oraz ekskluzywne oferty.',
              fontSize: 16,
              color: '#333333',
              fontWeight: 'normal',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 24,
              textAlign: 'left'
            })
          },
          {
            blockType: 'text',
            blockOrder: 3,
            content: JSON.stringify({
              text: '🎉 Nowości tego miesiąca',
              fontSize: 22,
              color: '#e74c3c',
              fontWeight: 'bold',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 32,
              marginBottom: 16,
              textAlign: 'left'
            })
          },
          {
            blockType: 'text',
            blockOrder: 4,
            content: JSON.stringify({
              text: '• Nowa wersja naszej aplikacji z ulepszonymi funkcjami\n• Program lojalnościowy dla stałych klientów\n• Rozszerzona oferta produktów ekologicznych\n• Nowe partnerstwa biznesowe',
              fontSize: 15,
              color: '#333333',
              fontWeight: 'normal',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 32,
              textAlign: 'left'
            })
          },
          {
            blockType: 'button',
            blockOrder: 5,
            content: JSON.stringify({
              text: 'Zobacz więcej nowości',
              url: 'https://example.com/nowosci',
              backgroundColor: '#3498db',
              textColor: '#ffffff',
              borderRadius: 6,
              padding: '14px 28px'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 40,
              textAlign: 'center'
            })
          },
          {
            blockType: 'spacer',
            blockOrder: 6,
            content: JSON.stringify({
              height: 30,
              backgroundColor: 'transparent',
              borderRadius: 0
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 0,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 7,
            content: JSON.stringify({
              text: 'Dziękujemy za bycie z nami!\n\nZespół [Nazwa Firmy]\nwww.example.com | kontakt@example.com\n\nJeśli nie chcesz otrzymywać tych wiadomości, możesz się wypisać.',
              fontSize: 12,
              color: '#666666',
              fontWeight: 'normal',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 0,
              textAlign: 'center'
            })
          }
        ]
      },
      {
        name: 'Promocja - Wielka Wyprzedaż',
        description: 'Atrakcyjny szablon promocyjny z dużym rabatem i call-to-action',
        category: 'promocja',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNzRjM2M7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYzM0MzMzO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiLz48dGV4dCB4PSIxMDAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPi01MCU8L3RleHQ+PHJlY3QgeD0iNTAiIHk9IjYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZmZmIiByeD0iNSIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlNzRjM2MiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5LVVAgVEVSQVo8L3RleHQ+PC9zdmc+',
        tags: JSON.stringify(['promocja', 'wyprzedaż', 'rabat', 'ecommerce']),
        author: 'System',
        version: '1.0',
        isSystem: true,
        isPublic: true,
        metadata: JSON.stringify({
          blocks: 6,
          estimatedHeight: 500,
          primaryColors: ['#e74c3c', '#c34333', '#ffffff']
        }),
        blocks: [
          {
            blockType: 'text',
            blockOrder: 0,
            content: JSON.stringify({
              text: '🔥 WIELKA WYPRZEDAŻ 🔥',
              fontSize: 32,
              color: '#e74c3c',
              fontWeight: 'bold',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 20,
              marginBottom: 10,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 1,
            content: JSON.stringify({
              text: 'DO -50% NA WSZYSTKO!',
              fontSize: 24,
              color: '#c34333',
              fontWeight: 'bold',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 20,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 2,
            content: JSON.stringify({
              text: 'Nie przegap tej wyjątkowej okazji! Rabaty do 50% na cały asortyment. Promocja ważna tylko do końca miesiąca.',
              fontSize: 16,
              color: '#333333',
              fontWeight: 'normal',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 30,
              textAlign: 'center'
            })
          },
          {
            blockType: 'button',
            blockOrder: 3,
            content: JSON.stringify({
              text: 'KUP TERAZ Z RABATEM',
              url: 'https://example.com/promocja',
              backgroundColor: '#e74c3c',
              textColor: '#ffffff',
              borderRadius: 8,
              padding: '16px 32px'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 20,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 4,
            content: JSON.stringify({
              text: 'Kod promocyjny: WYPRZEDAŻ2025',
              fontSize: 18,
              color: '#27ae60',
              fontWeight: 'bold',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 30,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 5,
            content: JSON.stringify({
              text: '* Promocja ważna do 31.10.2025. Nie łączy się z innymi rabatami.',
              fontSize: 12,
              color: '#666666',
              fontWeight: 'normal',
              fontStyle: 'italic'
            }),
            style: JSON.stringify({
              marginTop: 20,
              marginBottom: 0,
              textAlign: 'center'
            })
          }
        ]
      },
      {
        name: 'Powiadomienie - Powitanie',
        description: 'Szablon powitalny dla nowych użytkowników lub klientów',
        category: 'powiadomienie',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNmMGYxIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNDAiIHI9IjI1IiBmaWxsPSIjMjdhZTYwIi8+PHRleHQgeD0iMTAwIiB5PSI0NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjAiPuKckTwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMmMzZTUwIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+V2l0YWo8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3ZjhjOGQiIGZvbnQtc2l6ZT0iMTAiPkRaw65rdWplbXkgemEgcmVqZXN0cmFjasW5PC90ZXh0PjxyZWN0IHg9IjcwIiB5PSIxMTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzM0OThkYiIgcng9IjMiLz48dGV4dCB4PSIxMDAiIHk9IjEyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iOSI+UG9jemF0ZWs8L3RleHQ+PC9zdmc+',
        tags: JSON.stringify(['powitanie', 'rejestracja', 'welcome', 'onboarding']),
        author: 'System',
        version: '1.0',
        isSystem: true,
        isPublic: true,
        metadata: JSON.stringify({
          blocks: 5,
          estimatedHeight: 400,
          primaryColors: ['#27ae60', '#3498db', '#2c3e50']
        }),
        blocks: [
          {
            blockType: 'text',
            blockOrder: 0,
            content: JSON.stringify({
              text: '👋 Witaj!',
              fontSize: 32,
              color: '#27ae60',
              fontWeight: 'bold',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 20,
              marginBottom: 16,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 1,
            content: JSON.stringify({
              text: 'Dziękujemy za rejestrację!',
              fontSize: 24,
              color: '#2c3e50',
              fontWeight: 'bold',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 24,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 2,
            content: JSON.stringify({
              text: 'Twoje konto zostało pomyślnie utworzone. Teraz możesz korzystać ze wszystkich funkcji naszej platformy.',
              fontSize: 16,
              color: '#333333',
              fontWeight: 'normal',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 32,
              textAlign: 'center'
            })
          },
          {
            blockType: 'button',
            blockOrder: 3,
            content: JSON.stringify({
              text: 'Zacznij korzystać',
              url: 'https://example.com/dashboard',
              backgroundColor: '#3498db',
              textColor: '#ffffff',
              borderRadius: 6,
              padding: '14px 28px'
            }),
            style: JSON.stringify({
              marginTop: 0,
              marginBottom: 40,
              textAlign: 'center'
            })
          },
          {
            blockType: 'text',
            blockOrder: 4,
            content: JSON.stringify({
              text: 'Jeśli masz pytania, skontaktuj się z nami pod adresem support@example.com',
              fontSize: 12,
              color: '#7f8c8d',
              fontWeight: 'normal',
              fontStyle: 'normal'
            }),
            style: JSON.stringify({
              marginTop: 20,
              marginBottom: 0,
              textAlign: 'center'
            })
          }
        ]
      }
    ];

    // Wstaw templates i bloki w transakcji
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      for (const template of templates) {
        const blocks = template.blocks;
        delete template.blocks;
        
        // Wstaw template
        const [insertedTemplate] = await queryInterface.bulkInsert('email_templates', [template], {
          returning: true,
          transaction
        });
        
        // Przygotuj bloki z templateId
        const blocksToInsert = blocks.map(block => ({
          ...block,
          templateId: insertedTemplate.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        // Wstaw bloki
        await queryInterface.bulkInsert('template_blocks', blocksToInsert, {
          transaction
        });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Usuń wszystkie systemowe templates
    await queryInterface.bulkDelete('template_blocks', {
      templateId: {
        [Sequelize.Op.in]: queryInterface.sequelize.literal(
          '(SELECT id FROM email_templates WHERE isSystem = true)'
        )
      }
    });
    
    await queryInterface.bulkDelete('email_templates', {
      isSystem: true
    });
  }
};
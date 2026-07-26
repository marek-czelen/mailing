import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import sequelize from '../src/include/db.js';
import Customers from '../src/models/customers.model.js';
import User from '../src/models/user.model.js';
import Role from '../src/models/role.model.js';
import UserRole from '../src/models/userRole.model.js';
import Databases from '../src/models/databases.model.js';
import MailAddress from '../src/models/mailAddress.model.js';
import MarketingCampanies from '../src/models/marketingCampanies.model.js';
import MarketingCampaniesMailingResult from '../src/models/marketingCampaniesMailing.model.js';
import CampaignReply from '../src/models/campaignReply.model.js';

const DEMO_CUSTOMER_NAME = 'Aculeo Demo Workspace';
const DEMO_USER_EMAIL = 'demo@aculeo.test';
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'DemoPass!2026';
const DEMO_ROLE = 'administrator';

const contacts = [
  ['anna.nowak@aculeo.test', 'Warszawa', 'VIP'],
  ['bartek.kowalski@aculeo.test', 'Kraków', 'Aktywni klienci'],
  ['celina.wisniewska@aculeo.test', 'Gdańsk', 'Newsletter'],
  ['dawid.zielinski@aculeo.test', 'Wrocław', 'Aktywni klienci'],
  ['ewa.wojciechowska@aculeo.test', 'Poznań', 'VIP'],
  ['filip.kaczmarek@aculeo.test', 'Łódź', 'Newsletter'],
  ['gosia.lewandowska@aculeo.test', 'Katowice', 'Newsletter'],
  ['hubert.sikora@aculeo.test', 'Rzeszów', 'Aktywni klienci']
];

const campaigns = [
  {
    name: 'Letnia premiera / segment VIP',
    subject: 'Poznaj nasze letnie nowości',
    description: 'Kampania dla najbardziej zaangażowanych odbiorców.',
    senderName: 'Aculeo Team',
    senderEmail: 'hello@aculeo.test',
    dateStart: daysAgo(1),
    active: false,
    sent: true,
    process: 100,
    status: 'sent'
  },
  {
    name: 'Raport trendów Q2',
    subject: 'Najważniejsze trendy drugiego kwartału',
    description: 'Automatyczny raport dla aktywnych klientów.',
    senderName: 'Aculeo Insights',
    senderEmail: 'insights@aculeo.test',
    dateStart: daysAgo(2),
    active: false,
    sent: true,
    process: 100,
    status: 'sent'
  },
  {
    name: 'Onboarding nowych klientów',
    subject: 'Zacznijmy współpracę',
    description: 'Seria powitalna uruchamiana po dodaniu kontaktu.',
    senderName: 'Aculeo Success',
    senderEmail: 'success@aculeo.test',
    dateStart: daysFromNow(1),
    active: true,
    sent: false,
    process: 0,
    status: 'scheduled'
  },
  {
    name: 'Weekendowy wybór redakcji',
    subject: 'Cztery rzeczy warte uwagi w ten weekend',
    description: 'Szkic newslettera do dalszej pracy zespołu.',
    senderName: 'Aculeo Editorial',
    senderEmail: 'editorial@aculeo.test',
    dateStart: null,
    active: false,
    sent: false,
    process: 0,
    status: 'draft'
  }
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function hashContact(email) {
  return crypto.createHash('sha256').update(email).digest('hex');
}

function htmlForCampaign(campaign) {
  return `<main><h1>${campaign.subject}</h1><p>${campaign.description}</p><p><a href="https://aculeo.test">Zobacz szczegóły</a></p></main>`;
}

async function seedDemo() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Seed demo jest zablokowany w produkcji. Ustaw ALLOW_DEMO_SEED=true tylko świadomie.');
  }

  await sequelize.authenticate();

  return sequelize.transaction(async (transaction) => {
    const [customer] = await Customers.findOrCreate({
      where: { name: DEMO_CUSTOMER_NAME },
      defaults: {
        name: DEMO_CUSTOMER_NAME,
        companyName: DEMO_CUSTOMER_NAME,
        active: true,
        internalMailServer: false
      },
      transaction
    });

    const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 12);
    const [user] = await User.findOrCreate({
      where: { email: DEMO_USER_EMAIL },
      defaults: {
        email: DEMO_USER_EMAIL,
        hash: passwordHash,
        customerId: customer.id,
        name: 'Demo Administrator',
        active: true
      },
      transaction
    });
    await user.update({
      hash: passwordHash,
      customerId: customer.id,
      name: 'Demo Administrator',
      active: true,
      updatedAt: new Date()
    }, { transaction });

    const [role] = await Role.findOrCreate({
      where: { name: DEMO_ROLE },
      defaults: {
        name: DEMO_ROLE,
        displayName: 'Administrator',
        description: 'Pełny dostęp do demonstracyjnego workspace.'
      },
      transaction
    });
    await UserRole.findOrCreate({
      where: { userEmail: DEMO_USER_EMAIL, roleId: role.id },
      defaults: { userEmail: DEMO_USER_EMAIL, roleId: role.id, assignedBy: 'seed:demo' },
      transaction
    });

    const [database] = await Databases.findOrCreate({
      where: { name: 'Newsletter PL', customer_id: customer.id },
      defaults: {
        name: 'Newsletter PL',
        description: 'Demo baza kontaktów do newslettera i kampanii produktowych.',
        tags: ['newsletter', 'pl', 'demo'],
        rodo_flag: true,
        export_enabled: true,
        customer_id: customer.id
      },
      transaction
    });

    const contactRows = [];
    for (const [email, city, segment] of contacts) {
      const [contact] = await MailAddress.findOrCreate({
        where: { mailAddress: email, customerId: customer.id, databaseId: database.id },
        defaults: {
          hash: hashContact(email),
          mailAddress: email,
          miasto: city,
          rodzaj: segment,
          active: 1,
          customerId: customer.id,
          databaseId: database.id
        },
        transaction
      });
      contactRows.push(contact);
    }

    const campaignRows = [];
    for (const campaign of campaigns) {
      const [row] = await MarketingCampanies.findOrCreate({
        where: { name: campaign.name, customerId: customer.id },
        defaults: {
          customerId: customer.id,
          databaseId: database.id,
          name: campaign.name,
          subject: campaign.subject,
          description: campaign.description,
          senderName: campaign.senderName,
          senderEmail: campaign.senderEmail,
          textContent: `${campaign.subject}\n\n${campaign.description}`,
          htmlContent: htmlForCampaign(campaign),
          dateStart: campaign.dateStart,
          active: campaign.active,
          sent: campaign.sent,
          process: campaign.process,
          sendingInProgress: false,
          scoring: campaign.status === 'sent' ? 82 : null,
          suggestions: []
        },
        transaction
      });
      campaignRows.push(row);
    }

    const sentCampaigns = campaignRows.filter((campaign) => campaign.sent);
    for (const [campaignIndex, campaign] of sentCampaigns.entries()) {
      for (const [contactIndex, contact] of contactRows.entries()) {
        const wasOpened = (contactIndex + campaignIndex) % 4 !== 0;
        await MarketingCampaniesMailingResult.findOrCreate({
          where: { marketingCampaniesId: campaign.id, mailAddressesId: contact.id },
          defaults: {
            marketingCampaniesId: campaign.id,
            mailAddressesId: contact.id,
            isReaded: wasOpened,
            responsDate: wasOpened ? daysAgo(campaignIndex + 1) : null,
            isSend: true,
            sendDate: daysAgo(campaignIndex + 1),
            messageId: `<demo-${campaign.id}-${contact.id}@aculeo.test>`,
            error: false
          },
          transaction
        });
      }
    }

    const replyCampaign = sentCampaigns[0];
    const replyContact = contactRows[1];
    const replyHash = hashContact(`reply-${replyCampaign.id}-${replyContact.id}`);
    await CampaignReply.findOrCreate({
      where: { replyHash },
      defaults: {
        campaignId: replyCampaign.id,
        mailAddressId: replyContact.id,
        fromEmail: replyContact.mailAddress,
        subject: `Re: ${replyCampaign.subject}`,
        receivedAt: daysAgo(0),
        messageId: `<reply-${replyCampaign.id}-${replyContact.id}@aculeo.test>`,
        replyHash,
        bodyPreview: 'Dziękujemy za wiadomość. Prosimy o kontakt z naszym zespołem.',
        bodyFull: 'Dziękujemy za wiadomość. Prosimy o kontakt z naszym zespołem.',
        imapUid: `demo-${replyCampaign.id}-${replyContact.id}`,
        isRead: 0,
        isBounce: 0
      },
      transaction
    });

    const bounceContact = contactRows[3];
    const bounceHash = hashContact(`bounce-${replyCampaign.id}-${bounceContact.id}`);
    await CampaignReply.findOrCreate({
      where: { replyHash: bounceHash },
      defaults: {
        campaignId: replyCampaign.id,
        mailAddressId: bounceContact.id,
        fromEmail: 'mailer-daemon@aculeo.test',
        subject: 'Delivery Status Notification',
        receivedAt: daysAgo(1),
        messageId: `<bounce-${replyCampaign.id}-${bounceContact.id}@aculeo.test>`,
        replyHash: bounceHash,
        bodyPreview: 'Demo hard bounce for delivery monitoring.',
        bodyFull: 'Demo hard bounce for delivery monitoring.',
        imapUid: `bounce-${replyCampaign.id}-${bounceContact.id}`,
        isRead: 1,
        isBounce: 1,
        bounceType: 'hard',
        bounceReason: 'Demo address does not exist'
      },
      transaction
    });

    return {
      customerId: customer.id,
      databaseId: database.id,
      campaignCount: campaignRows.length,
      contactCount: contactRows.length,
      userEmail: DEMO_USER_EMAIL
    };
  });
}

try {
  const result = await seedDemo();
  console.log('Demo seed zakończony pomyślnie:', result);
  console.log(`Login demo: ${DEMO_USER_EMAIL}`);
  console.log('Hasło demo: wartość DEMO_USER_PASSWORD lub domyślne DemoPass!2026');
} catch (error) {
  console.error('Demo seed nie powiódł się:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
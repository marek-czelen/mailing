# Mailing System — Backend API

> **Express.js REST API** — The backend server for the Mailing System email campaign management platform.

## Tech Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.21
- **Database:** MySQL 8.0+ / MariaDB via Sequelize ORM 6
- **Auth:** JWT (jsonwebtoken) + bcrypt + OAuth 2.0
- **Email:** Nodemailer (SMTP), imapflow (IMAP), mailparser
- **AI:** Hugging Face Inference API, OpenAI API
- **Process Manager:** PM2 with auto-restart and log rotation

## Project Structure
```
src/
├── app.js                  # Express app setup (middleware, routes, CORS)
├── bin/www.js              # HTTP server with graceful shutdown
├── config/                 # Environment, database, OpenAI, upload configs
├── controller/             # Request handlers for all API endpoints
├── include/                # Core modules (Auth, Mail, Admin, DB, helpers)
├── models/                 # Sequelize data models (16 models)
├── routes/                 # Express route declarations (7 route files)
├── tasks/                  # Background jobs (mailing, mailbox monitoring)
└── public/                 # Static files & SPA build output
```

## Key Modules
- **`include/mail.js`** — Email delivery engine: SMTP, bulk sending, direct MX delivery, placeholders
- **`include/auth.js`** — JWT token generation, validation, password authentication
- **`include/admin.js`** — Multi-tenant user & customer management, role resolution
- **`tasks/mailingTask.js`** — Automated campaign dispatch with placeholder personalization
- **`tasks/checkMailbox.js`** — IMAP reply monitoring with bounce classification
- **`controller/mailing.js`** — Campaign CRUD, spam analysis (50+ heuristics), AI content gen

## API Endpoints
See the main [README.md](../README.md) for the full API reference.

## Setup
```bash
npm install
cp .env.example .env.development
# Configure database & SMTP credentials
npm run watch:dev    # Development with nodemon
npm start            # Production
```

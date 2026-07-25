# 📧 Mailing System — Email Campaign Management Platform

> **A full-stack email marketing platform with campaign management, contact databases, AI-powered content generation, spam analysis, and automated reply monitoring.**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue%203-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Key Features

### 📨 Campaign Management
- **Full CRUD** for email marketing campaigns
- Schedule campaigns with start/end dates
- Track sending progress in real time
- Duplicate, draft, and archive campaigns
- SMTP configuration per campaign (multi-server support)

### 👥 Contact & Database Management
- **Multi-tenant databases** — each customer has isolated contact databases
- Import contacts from **Excel (.xlsx)** spreadsheets
- Custom contact attributes (extensible schema)
- Export contacts to Excel
- Contact activity tracking (active/inactive, unsubscribe date)

### ✍️ Email Editors
- **TinyMCE WYSIWYG Editor** — full-featured HTML email editor with rich text formatting
- **Block-based Email Editor** — drag-and-drop builder with reusable blocks (text, buttons, images, spacers, etc.)
- **Template System** — pre-designed email templates with block-level customization, categories, and tagging

### 🤖 AI Integration
- **AI-powered content generation** via Hugging Face Inference API
- **Smart spam scoring** — advanced heuristic engine analyzing subject lines, content, HTML quality, links, images, authentication headers, and more
- Spam suggestions to improve deliverability

### 📬 Automated Sending & Monitoring
- **Automated email dispatch** — background task sends emails for active campaigns via configurable SMTP
- **IMAP reply monitoring** — automatically fetches and processes replies to sent campaigns
- **Bounce detection** — hard bounce (permanent), soft bounce (temporary), and unknown bounce classification
- **Reply tracking** — full reply history with pagination, search, and filtering

### 🔐 Authentication & Authorization
- **JWT-based authentication** with 24h token expiry
- **Role-based access control** (RBAC) — Administrator, Marketer, Data Administrator roles
- **OAuth 2.0** login via Google and GitHub
- Multi-tenant data isolation — users only access their customer's data

### 🌐 Internationalization
- Full **Polish (pl)** and **English (en)** language support
- Built with **vue-i18n** for easy extensibility

### 📊 Dashboard & Analytics
- Campaign statistics with visual charts (Chart.js)
- Quick-access cards for main features
- Campaign reply stats with pagination
- Database contact stats

---

## 🏗️ Architecture

```
mailing/
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── app.js             # Express application setup
│   │   ├── bin/www.js         # HTTP server entry point
│   │   ├── config/            # Environment, DB, OpenAI, Upload configs
│   │   ├── controller/        # Route handlers (REST controllers)
│   │   ├── include/           # Core modules (Auth, Mail, Admin, DB, etc.)
│   │   ├── models/            # Sequelize ORM models
│   │   ├── routes/            # Express route definitions
│   │   ├── tasks/             # Background jobs (mailing, mailbox check)
│   │   └── public/            # Static files (Frontend SPA build)
│   ├── db/
│   │   ├── db.sql             # Database schema dump
│   │   └── migrations/        # SQL migration scripts
│   ├── docs/                  # Feature documentation
│   └── ecosystem.config.json  # PM2 production config
│
└── frontend/                  # Vue 3 SPA
    ├── src/
    │   ├── App.vue            # Root component
    │   ├── main.js            # App bootstrap
    │   ├── router/            # Vue Router with auth guards
    │   ├── views/             # Page components
    │   ├── components/        # Reusable UI components
    │   ├── services/          # API service layer
    │   ├── i18n/              # Internationalization setup
    │   ├── locales/           # PL/EN translation files
    │   ├── plugins/           # Vuetify configuration
    │   └── templates/         # Email templates
    └── vite.config.js         # Vite build configuration
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express.js** | REST API server |
| **Sequelize ORM** | Database abstraction layer |
| **MySQL / MariaDB** | Relational database |
| **JWT (jsonwebtoken)** | Authentication |
| **Nodemailer** | SMTP email sending |
| **imapflow / node-imap** | IMAP mailbox monitoring |
| **mailparser** | Email parsing (bounce detection) |
| **multer** | File upload handling |
| **bcrypt** | Password hashing |
| **express-validator** | Input validation |
| **xlsx** | Excel import/export |
| **OpenAI API / Hugging Face** | AI content generation |
| **axios** | HTTP client |
| **PM2** | Production process manager |

### Frontend
| Technology | Purpose |
|---|---|
| **Vue 3 (Composition API)** | Frontend framework |
| **Vuetify 3** | Material Design component library |
| **Vue Router** | Client-side routing with guards |
| **vue-i18n** | Internationalization |
| **TinyMCE** | Rich text HTML editor |
| **Chart.js** | Statistics visualization |
| **Axios** | HTTP client with interceptors |
| **Vite** | Build tool & dev server |
| **@mdi/font** | Material Design Icons |

### DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| **PM2** | Process management with auto-restart |
| **Babel** | ES6+ transpilation for production |
| **Nodemon** | Development auto-reload |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

---

## 📋 API Overview

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | User login (email + password) |
| POST | `/auth/addUser` | Register new user (admin only) |
| GET | `/auth/me` | Get current user profile |
| GET | `/auth/:provider` | Initiate OAuth login (google/github) |
| POST | `/auth/:provider/callback` | Process OAuth callback |

### Campaigns (`/mailing`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/getCampaignsList` | List all campaigns |
| GET | `/getCampaignById/:id` | Get campaign details |
| POST | `/createCampaign` | Create new campaign |
| PUT | `/updateCampaign/:id` | Update campaign |
| DELETE | `/deleteCampaign/:id` | Delete campaign |
| GET | `/campaignSendingProgress/:id` | Get sending progress |

### Databases & Contacts (`/mailing`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/getDatabasesList` | List all contact databases |
| POST | `/createDatabase` | Create new database |
| POST | `/importExcelToDatabase/:id` | Import contacts from Excel |
| GET | `/getDatabaseContacts/:id` | List contacts in database |
| GET | `/exportDatabaseContacts/:id` | Export contacts to Excel |
| POST | `/contactAdd` | Add new contact |
| POST | `/contactUpdate` | Update contact |
| DELETE | `/contactDelete/:id` | Delete contact |

### Email Operations (`/mailing`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/sendEmail` | Send test email |
| POST | `/generateMailContent` | AI content generation |
| POST | `/computeSpamRating` | Analyze spam score |
| GET | `/unsubscribe/:hash` | Public unsubscribe link |
| GET | `/resubscribe/:hash` | Public resubscribe link |

### Reply Monitoring (`/mailing`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/campaigns/:id/replies` | List campaign replies |
| GET | `/campaigns/:id/bounces` | List campaign bounces |
| GET | `/campaigns/:id/replies/stats` | Reply statistics |
| GET | `/replies/:id` | Get reply details |
| GET | `/replies/:id/full` | Get full reply content |

### Connection Testing (`/mailing`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/test-smtp` | Test SMTP connection |
| POST | `/test-imap` | Test IMAP connection |

### Templates (`/templates`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all templates (with filters) |
| POST | `/` | Create new template |
| GET | `/:id` | Get template with blocks |
| PUT | `/:id` | Update template |
| DELETE | `/:id` | Delete template |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **MySQL** 8.0+ or **MariaDB** 10.5+
- **npm** or **yarn**
- SMTP server credentials (for sending emails)
- (Optional) IMAP mailbox credentials (for reply monitoring)

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/mailing-system.git
cd mailing-system
```

#### 2. Backend Setup
```bash
cd backend
cp .env.example .env.development   # Create environment config
npm install                          # Install dependencies
```

Edit `.env.development` with your database credentials:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=mailing
DB_USER=root
DB_PASSWORD=your_password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password
```

#### 3. Database Setup
Import the database schema:
```bash
mysql -u root -p mailing < db/db.sql
```

Or run migrations:
```bash
mysql -u root -p mailing < db/migrations/20241207_add_user_roles_system.sql
```

#### 4. Frontend Setup
```bash
cd frontend
npm install
```

#### 5. Run the Application

**Development mode:**
```bash
# Terminal 1 - Backend with auto-reload
cd backend && npm run watch:dev

# Terminal 2 - Frontend dev server
cd frontend && npm run dev
```

**Production mode:**
```bash
cd backend
npm start   # Starts with PM2 or node directly
```

The backend will serve the built frontend from `backend/public/`.

### Default Credentials
- **Email:** `admin@admin.pl`
- **Password:** *(set during installation)*
- **Role:** Administrator (full access)

---

## 🧩 Core Modules

### 📧 Mail Engine (`src/include/mail.js`)
The `Mail` class is a comprehensive email delivery system:
- **SMTP delivery** with full TLS/SSL support
- **Self-signed certificate** compatibility for development
- **Bulk sending** with configurable batch size and delay
- **Direct sending** (MX lookup, no SMTP relay)
- **Placeholder system** with `{{PLACEHOLDER}}` syntax, default values, and RODO-compliant footers
- **Template block rendering** for structured email layouts

### 📥 Reply Monitoring (`src/tasks/checkMailbox.js`)
Automated background task that:
- Connects to IMAP mailboxes configured per campaign
- Fetches and deduplicates replies (by message ID / hash)
- Classifies messages as replies, bounces, or auto-replies
- Extracts sender information and matches to contact database
- Stores full reply content with read/unread tracking

### 📤 Automated Mailing (`src/tasks/mailingTask.js`)
Background task that:
- Polls for active, scheduled campaigns every N minutes
- Processes contacts with placeholder personalization
- Tracks sending progress per contact
- Handles SMTP connection per campaign configuration
- Records delivery results in the database

### 🔍 Spam Analyzer (`src/controller/mailing.js`)
Advanced heuristic spam scoring engine that analyzes:
- **Subject line** — length, uppercase ratio, exclamation marks
- **Content quality** — body length, HTML cleanliness, alt text
- **Spam keywords** — multi-language (English + Polish) dictionary
- **Links & images** — count, density, suspicious patterns
- **Authentication** — SPF, DKIM, DMARC DNS record checks
- **Sender reputation** — IP reputation, bounce rate, complaint rate
- **Unsubscribe compliance** — presence of unsubscribe mechanism

### 🎨 Placeholder System
Personalize emails with dynamic placeholders:
```
{{FIRST_NAME}} → "Jan"
{{UNSUBSCRIBE_LINK}} → "https://..."
{{CURRENT_YEAR}} → "2026"
{{PROMO_CODE|DEFAULT10}} → "SAVE20" or "DEFAULT10"
```

Built-in placeholders for: dates, company info, user data, RODO compliance, e-commerce, and marketing campaigns.

---

## 🔐 Security Features

- **JWT authentication** with 24-hour token expiry
- **Password hashing** using bcrypt (10 salt rounds)
- **Role-based access control** with granular permissions
- **Multi-tenant data isolation** — users only see their customer's data
- **CORS configuration** — restrict API access to allowed origins
- **Input validation** via express-validator
- **SQL injection protection** through Sequelize ORM parameterized queries
- **Graceful shutdown** handling (SIGTERM/SIGINT)

---

## 📈 Performance & Production Readiness

- **PM2 process management** with auto-restart, log rotation, and memory limits
- **Babel transpilation** for production deployment
- **Environment-specific configuration** (development, production, test)
- **Database connection pooling** with retry logic
- **Background task scheduling** with configurable intervals
- **Graceful error handling** with detailed development logging
- **Soft delete support** for data safety

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Marek Czelen**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/marek-czelen)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/marek-czelen)

---

> 💡 **Portfolio Project** — This application demonstrates full-stack development skills including REST API design, database modeling, modern frontend architecture, third-party API integration, automated task scheduling, and production deployment considerations.

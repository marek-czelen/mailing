# Mailing System — Frontend SPA

> **Vue 3 + Vuetify 3** — Modern single-page application for the Mailing System email campaign management platform.

## Tech Stack
- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **UI Library:** Vuetify 3 (Material Design)
- **Routing:** Vue Router 4 with auth guards
- **i18n:** vue-i18n (Polish & English)
- **HTTP:** Axios with interceptors (auto JWT injection)
- **Charts:** Chart.js for campaign analytics
- **Editor:** TinyMCE (rich text), Custom Block Editor (drag & drop)
- **Build:** Vite 7

## Project Structure
```
src/
├── App.vue                 # Root component with layout
├── main.js                 # Bootstrap: Vue, router, Vuetify, i18n
├── router/index.js         # Routes with auth & admin guards
├── views/                  # 10 page components
│   ├── LoginView.vue       # Auth page with OAuth providers
│   ├── dashboard.vue       # Quick-access dashboard
│   ├── CampaignsView.vue   # Campaign management
│   ├── DatabasesView.vue   # Contact database management
│   ├── EmailEditorView.vue # TinyMCE HTML email editor
│   ├── BlockEditorView.vue # Block-based email builder
│   ├── AdminView.vue       # User & role management
│   └── UnsubscribeView.vue # Public unsubscribe page
├── components/             # 20+ reusable components
├── services/               # 7 API service modules
├── locales/                # PL & EN translations
├── plugins/                # Vuetify configuration
└── style.css              # Global styles & gradients
```

## Key Features
- **Responsive design** — full-screen layout with mobile drawer
- **Authentication** — login form with email/password and OAuth (Google, GitHub)
- **Dashboard** — operational workspace with campaign metrics, delivery health, activity log, recent campaigns and demonstrable loading/empty/error/success/permission states
- **Visual system** — Manrope typography, graphite navigation, coral primary actions, restrained surfaces, status badges and responsive desktop/tablet/mobile layouts
- **Campaign management** — list/detail view with search, filters, CRUD
- **Database management** — contact list with import/export (Excel)
- **Email editors** — TinyMCE WYSIWYG + custom block editor
- **Admin panel** — user management with RBAC
- **Internationalization** — full Polish and English support
- **Public unsubscribe** — landing page for opt-out with confirmation

## Setup
```bash
npm install
npm run dev     # Development server (Vite)
npm run build   # Production build
```

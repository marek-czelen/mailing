import createError from 'http-errors';
import express from 'express';
import path  from 'path';
import cookieParser from 'cookie-parser';
import Auth from './include/auth.js';
import {unauthorized} from './include/errors.js';
import MailingTask from './tasks/mailingTask.js';
import CheckMailboxTask from './tasks/checkMailbox.js';
import EnvironmentConfig from './config/environment.config.js';

import authRouter from './routes/auth.js';
import customerRouter from './routes/customers.js';
import adminRouter from "./routes/admin.js";
import mailinngRouter from "./routes/mailing.js";
import uploadRoutes from './plugin/upload.js';
import templateRoutes from './routes/templates.js';
import cors from 'cors'

// Inicjalizuj modele i asocjacje
import './models/index.js';

var app = express();

// Konfiguracja CORS na podstawie zmiennych środowiskowych
const corsConfig = EnvironmentConfig.getCORSConfig();
const corsOptions = {
  origin: corsConfig.origin,
  credentials: corsConfig.credentials,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};

// Pliki statyczne dostępne publicznie (bez autoryzacji)
app.use(express.static(path.join("./", 'public')));

app.use(cors(corsOptions));
app.use(express.json({ limit: EnvironmentConfig.get('EXPRESS_JSON_LIMIT') }));
app.use(express.urlencoded({ extended: false, limit: EnvironmentConfig.get('EXPRESS_URL_ENCODED_LIMIT') }));
app.use(cookieParser());



// Upload routes (bez autoryzacji dla niektórych endpointów)
app.use(uploadRoutes);

// Dedykowany middleware autoryzacji tylko dla chronionych ścieżek API
function requireAuth(req, res, next) {
  // Przepuść preflight bez autoryzacji
  if (req.method === 'OPTIONS') return next();

  try {
    const auth = req.headers.authorization;
    if (!auth) {
      console.log("❌ Missing authorization header for:", req.method, req.originalUrl);
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const parts = auth.split(' ');
    if (parts[0] !== 'Bearer' || !parts[1]) {
      console.log("❌ Invalid authorization format (not Bearer):", parts[0]);
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    res.locals.Auth = { authorized: true, data: Auth.decodeToken(parts[1]) };
    return next();
  } catch (err) {
    console.log("❌ Token decode error:", err.message);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
}

//router
// Publiczne endpointy autoryzacji
app.use('/auth', authRouter);

// Chronione endpointy API
app.use('/customers', requireAuth, customerRouter);
app.use('/admin', requireAuth, adminRouter);
// /mailing z wyjątkiem publicznych linków wypisania
app.use('/mailing', (req, res, next) => {
  if (req.path.startsWith('/unsubscribe/')) return next();
  return requireAuth(req, res, next);
}, mailinngRouter);
app.use('/templates', requireAuth, templateRoutes);

// SPA fallback: serwuj index.html dla tras frontendu (np. /login) bez rozszerzenia
app.get('*', (req, res, next) => {
  // jeśli to żądanie do API, idź dalej
  const isApi = req.path.startsWith('/auth')
            || req.path.startsWith('/customers')
            || req.path.startsWith('/admin')
            || req.path.startsWith('/mailing')
            || req.path.startsWith('/templates');
  const acceptsHtml = req.method === 'GET' && (req.headers.accept || '').includes('text/html');
  const hasExtension = /\.[^\/]+$/.test(req.path);
  if (!isApi && acceptsHtml && !hasExtension) {
    return res.sendFile(path.resolve('./', 'public', 'index.html'));
  }
  return next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = EnvironmentConfig.isDevelopment() ? err : {};

  // Szczegółowe logowanie błędów w środowisku development
  if (EnvironmentConfig.isDevelopment()) {
    console.error('🔥 Application Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    });
  } else {
    console.error('Application Error:', err.message);
  }

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

// Uruchomienie zadania cyklicznego
MailingTask.run();
CheckMailboxTask.run();

export default app;

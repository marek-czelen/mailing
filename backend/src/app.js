import createError from 'http-errors';
import express from 'express';
import path  from 'path';
import cookieParser from 'cookie-parser';
import Auth from './include/auth.js';
import {unauthorized} from './include/errors.js';
import MailingTask from './tasks/mailingTask.js';
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
  optionsSuccessStatus: 200
};

// Tymczasowe logowanie CORS config
if (EnvironmentConfig.isDevelopment()) {
  console.log("🔐 CORS Configuration:", corsOptions);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: EnvironmentConfig.get('EXPRESS_JSON_LIMIT') }));
app.use(express.urlencoded({ extended: false, limit: EnvironmentConfig.get('EXPRESS_URL_ENCODED_LIMIT') }));
app.use(cookieParser());
app.use(express.static(path.join("./", 'public')));

app.use(uploadRoutes);

//veryfication of the token
app.all('*', function(req, res, next) 
  {
    // Logowanie requestów tylko w środowisku development
    if (EnvironmentConfig.isDevelopment()) {
      console.log("🌐 Request:", req.method, req.url);
    }
    
    if (req.originalUrl=="/auth/login") next()
    else{
      let authorized = false
      try{
        if (!req.headers.authorization)  {
          return res.status(401).json({
            success: false,
            message: 'Not authorized'
          });
        }
        let authHeader = req.headers.authorization.split(' ');
        if (authHeader[0] != "Bearer")  {
          return res.status(401).json({
            success: false,
            message: 'Not authorized'
          });
        }
        res.locals.Auth = {authorized: true, data: Auth.decodeToken(authHeader[1])}
        authorized = true;
      }catch(err){
        authorized = false
        
      }
      if (authorized === true) next();
      else {
        if (EnvironmentConfig.isDevelopment()) {
          console.log("❌ Unauthorized access attempt detected");
        }
        return res.status(401).json({
          success: false,
          message: 'Not authorized'
        });

      }
    }

  }
)

//router
app.use('/auth', authRouter);
app.use('/customers', customerRouter);
app.use('/admin', adminRouter);
app.use('/mailing', mailinngRouter);
app.use('/templates', templateRoutes);

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

export default app;
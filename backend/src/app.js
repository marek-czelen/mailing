import createError from 'http-errors';
import express from 'express';
import path  from 'path';
import cookieParser from 'cookie-parser';
import Auth from './include/auth.js';
import {unauthorized} from './include/errors.js';
import MailingTask from './tasks/mailingTask.js';

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import adminRouter from "./routes/admin.js";
import mailinngRouter from "./routes/mailing.js";
import uploadRoutes from './plugin/upload.js';
import templateRoutes from './routes/templates.js';
import cors from 'cors'

// Inicjalizuj modele i asocjacje
import './models/index.js';

var app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join("./", 'public')));

app.use(uploadRoutes);

//veryfication of the token
app.all('*', function(req, res, next) 
  {
    //console.log("next: ", req.url )
    if (req.originalUrl=="/auth/login") next()
    else{
      let authorized = false
      try{
        if (!req.headers.authorization) return unauthorized(req, res)
        let authHeader = req.headers.authorization.split(' ');
        if (authHeader[0] != "Bearer") return unauthorized(req, res)
        res.locals.Auth = {authorized: true, data: Auth.decodeToken(authHeader[1])}
        authorized = true;
      }catch(err){
        authorized = false
        
      }
      if (authorized === true) next();
      else return unauthorized(req, res, err.message)
    }

  }
)

//router
app.use('/auth', authRouter);
app.use('/users', usersRouter);
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
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

// Uruchomienie zadania cyklicznego
MailingTask.run();

export default app;
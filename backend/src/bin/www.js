#!/usr/bin/env node

/**
 * Module dependencies.
 */

// WAŻNE: Ładuj konfigurację środowiska jako pierwszą rzecz
import '../config/environment.config.js';

import app from "../app.js"
import EnvironmentConfig from '../config/environment.config.js';
import sequelize from '../include/db.js';
import MailingTask from '../tasks/mailingTask.js';
import http from "http"

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(EnvironmentConfig.get('PORT', '3000'));
const host = EnvironmentConfig.get('HOST', 'localhost');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);
server.on('listening', onListening);
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM otrzymany. Zamykanie serwera...');
  server.close(() => {
    console.log('✓ Serwer HTTP zamknięty.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT otrzymany. Zamykanie serwera...');
  server.close(() => {
    console.log('✓ Serwer HTTP zamknięty.');
    process.exit(0);
  });
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  console.error(`❌ Start aplikacji nie powiódł się (${bind}): ${error.message}`);

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : `${addr.address}:${addr.port}`;
  
  console.log(`🚀 Serwer nasłuchuje na ${bind}`);
  console.log(`🌍 Środowisko: ${EnvironmentConfig.get('NODE_ENV')}`);
  console.log('✅ Start aplikacji zakończony pomyślnie');

  MailingTask.run();
  
  if (EnvironmentConfig.isDevelopment()) {
    console.log(`📱 URL: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  }
}

async function startServer() {
  console.log('🔎 Sprawdzanie połączenia z bazą danych...');

  try {
    await sequelize.authenticate();
    console.log('✅ Baza danych: połączenie działa');
    server.listen(port, host);
  } catch (error) {
    console.error(`❌ Baza danych: brak połączenia (${error.message})`);
    console.error('❌ Start aplikacji przerwany');
    process.exitCode = 1;
  }
}

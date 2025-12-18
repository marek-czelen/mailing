import express from 'express';
const router = express.Router();

import { addUser, login, me } from "../controller/auth.js";
import { startOAuth, handleRedirect, processCallback } from "../controller/oauth.js";

// Klasyczne logowanie + user info
router.post('/login', login);
router.post('/addUser', addUser);
router.get('/me', me);

// OAuth - inicjacja
router.get('/:provider(google|github)', startOAuth);
// OAuth - redirect z providera do frontendu (z kodem)
router.get('/callback/:provider(google|github)', handleRedirect);
// OAuth - finalne przetwarzanie kodu na token backendowy
router.post('/:provider(google|github)/callback', processCallback);

export default router;

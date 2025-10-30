import express from 'express';
const router = express.Router();

import {addUser, login, me} from "../controller/auth.js"

/* GET home page. */
router.post('/login', login);
router.post('/addUser', addUser);
router.get('/me', me);
export default router;

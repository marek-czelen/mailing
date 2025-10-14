import express from 'express';
const router = express.Router();

import {addUser, login} from "../controller/auth.js"

/* GET home page. */
router.post('/login', login);
router.post('/addUser', addUser);
export default router;

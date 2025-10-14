import express from 'express';
const router = express.Router();

import {getCustomers, getUsers} from "../controller/admin.js"

/* GET home page. */
router.post('/getCustomers', getCustomers);
router.post('/getUsers', getUsers);
export default router;

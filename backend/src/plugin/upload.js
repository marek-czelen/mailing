import express from 'express';
import multer from 'multer';
import path from 'path';
const router = express.Router();

import UPLOAD_DIR from '../config/upload.config.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // folder docelowy
  },
  filename: (req, file, cb) => {
    // Unikalna nazwa pliku
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Endpoint do uploadu pliku
router.post('/mailing/uploadFile', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Brak pliku!' });
  }
  // Zwróć fylko filename
  res.json({ filePath: `${req.file.filename}` });
});


import fs from 'fs';
router.post('/mailing/deleteFile', (req, res) => {
  const fileName = req.body.path;
  if (!fileName) return res.status(400).json({ message: 'Brak nazwy pliku!' });

  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.unlink(filePath, err => {
    if (err) return res.status(500).json({ message: 'Błąd usuwania pliku!' });
    res.json({ success: true });
  });
});


export default router;
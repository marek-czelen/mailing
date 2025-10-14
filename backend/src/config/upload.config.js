// config/upload.config.js

export const UPLOAD_DIR = process.env.NODE_ENV === 'production'
  ? 'c:/tmp/prod/'
  : 'c:/tmp/!/';

export default UPLOAD_DIR;

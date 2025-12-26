const multer = require('multer');
const config = require('../config');

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory temporarily
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024, // Max file size in bytes
    files: 1, // Max number of files per request
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        `Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`
      );
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  },
});

module.exports = upload;

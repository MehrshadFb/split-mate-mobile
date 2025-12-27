const config = require('../config');

class ValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.status = 400;
  }
}

function validateFile(file) {
  if (!file) {
    throw new ValidationError('No file uploaded', 'NO_FILE');
  }
  if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`,
      'INVALID_FILE_TYPE'
    );
  }
  const maxSizeBytes = config.upload.maxFileSizeMB * 1024 * 1024; // Convert MB to bytes
  if (file.size > maxSizeBytes) {
    throw new ValidationError(
      `File size exceeds ${config.upload.maxFileSizeMB}MB limit`,
      'FILE_TOO_LARGE'
    );
  }
  return true;
}

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function validateScanJobId(scanJobId) {
  if (!scanJobId || typeof scanJobId !== 'string') {
    throw new ValidationError('Invalid scan job ID', 'INVALID_JOB_ID');
  }
  if (!isValidUUID(scanJobId)) {
    throw new ValidationError('Scan job ID must be a valid UUID', 'INVALID_JOB_ID');
  }
  return true;
}

function validateExtractedItems(items) {
  if (!Array.isArray(items)) {
    throw new ValidationError('Items must be an array', 'INVALID_FORMAT');
  }
  if (items.length === 0) {
    throw new ValidationError(
      'No items found - this may not be a valid receipt',
      'INVALID_RECEIPT'
    );
  }
  
  const validatedItems = items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new ValidationError(
        `Item at index ${index} is not a valid object`,
        'INVALID_ITEM_FORMAT'
      );
    }

    const name = item.name?.trim();
    if (!name || typeof name !== 'string') {
      return { name: 'Unknown Item', price: 0 };
    }

    let price = 0;
    if (typeof item.price === 'number') {
      price = item.price;
    } else if (typeof item.price === 'string') {
      price = parseFloat(item.price);
    }
    if (isNaN(price) || price < 0) { // Negative prices are invalid, but what if a negative price is used as a discount?
      price = 0;
    }
    price = Math.round(price * 100) / 100; // Round to 2 decimal places

    return { name, price };
  });

  const hasValidItems = validatedItems.some(item => item.price > 0);
  if (!hasValidItems) {
    throw new ValidationError(
      'No valid items with prices found - this may not be a receipt',
      'INVALID_RECEIPT'
    );
  }

  return validatedItems;
}

function sanitizeError(error) {
  const sanitized = {
    code: 'SERVER_ERROR',
    message: 'An unexpected error occurred',
  };

  if (error instanceof ValidationError) {
    sanitized.code = error.code;
    sanitized.message = error.message;
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    sanitized.code = 'FILE_TOO_LARGE';
    sanitized.message = 'File size exceeds limit';
  } else if (error.message) {
    if (config.server.environment !== 'production') {
      sanitized.message = error.message;
    }
  }

  return sanitized;
}

module.exports = {
  ValidationError,
  validateFile,
  validateScanJobId,
  validateExtractedItems,
  sanitizeError,
  isValidUUID,
};

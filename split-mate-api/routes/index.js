const express = require('express');
const healthRoutes = require('./health.routes');
const scanRoutes = require('./scan.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/api/scan', scanRoutes);

module.exports = router;

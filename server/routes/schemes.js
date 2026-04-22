const express = require('express');
const router = express.Router();
const schemesController = require('../controllers/schemes');

router.get('/', schemesController.getSchemes);
router.post('/sync', schemesController.syncSchemes); // Real-time sync endpoint
router.post('/seed', schemesController.seedSchemes); // Keeping public for easy setup, secure in prod

module.exports = router;

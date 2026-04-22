const express = require('express');
const { getAllData, verifyUser, rejectUser } = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/data').get(getAllData);
router.route('/verify/:id').put(verifyUser);
router.route('/reject/:id').put(rejectUser);

module.exports = router;

const router = require('express').Router();
const analytics = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/summary', authenticate, requireRole('admin'), analytics.getSummary);
router.get('/export', authenticate, requireRole('admin'), analytics.exportCsv);

module.exports = router;

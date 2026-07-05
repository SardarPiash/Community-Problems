const router = require('express').Router();
const users = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/me', authenticate, users.getMe);
router.put('/me', authenticate, users.updateMe);
router.get('/', authenticate, requireRole('admin'), users.listUsers);

module.exports = router;

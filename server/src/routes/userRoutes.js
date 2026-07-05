const router = require('express').Router();
const users = require('../controllers/userController');

// JWT + RBAC middleware added in Stage 2 (SRS Section 12)
router.get('/me', users.getMe);
router.put('/me', users.updateMe);
router.get('/', users.listUsers); // admin

module.exports = router;

const router = require('express').Router();
const notifications = require('../controllers/notificationController');

router.get('/', notifications.listNotifications);
router.put('/:id/read', notifications.markAsRead);

module.exports = router;

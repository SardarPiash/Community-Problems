const router = require('express').Router();
const analytics = require('../controllers/analyticsController');

router.get('/summary', analytics.getSummary);

module.exports = router;

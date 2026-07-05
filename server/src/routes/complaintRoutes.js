const router = require('express').Router();
const complaints = require('../controllers/complaintController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticate);

// Citizen (SRS 5.2, 5.3)
router.post('/', requireRole('citizen'), complaints.createComplaint);
router.get('/mine', requireRole('citizen'), complaints.getMyComplaints);

// Authority (SRS 5.5) — must precede /:id
router.get('/assigned', requireRole('authority'), complaints.getAssignedComplaints);

// Admin (SRS 5.4)
router.get('/', requireRole('admin'), complaints.listAllComplaints);
router.put('/:id/verify', requireRole('admin'), complaints.verifyComplaint);
router.put('/:id/assign', requireRole('admin'), complaints.assignComplaint);

// Authority status update (SRS 5.5)
router.put('/:id/status', requireRole('authority'), complaints.updateComplaintStatus);

// Shared detail view
router.get('/:id', complaints.getComplaintById);

module.exports = router;

const router = require('express').Router();
const complaints = require('../controllers/complaintController');

// JWT + RBAC middleware added in Stage 2 (SRS Section 12)

// Citizen (SRS 5.2, 5.3)
router.post('/', complaints.createComplaint);
router.get('/mine', complaints.getMyComplaints);

// Authority (SRS 5.5) — must precede /:id
router.get('/assigned', complaints.getAssignedComplaints);

// Admin (SRS 5.4)
router.get('/', complaints.listAllComplaints);
router.put('/:id/verify', complaints.verifyComplaint);
router.put('/:id/assign', complaints.assignComplaint);

// Authority status update (SRS 5.5)
router.put('/:id/status', complaints.updateComplaintStatus);

// Shared detail view
router.get('/:id', complaints.getComplaintById);

module.exports = router;

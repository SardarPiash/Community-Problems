const Complaint = require('../models/Complaint');
const { CATEGORIES } = require('../models/Complaint');
const { generateComplaintId } = require('../utils/complaintId');

function sanitizeComplaint(complaint) {
  return {
    id: complaint._id,
    complaintId: complaint.complaintId,
    category: complaint.category,
    title: complaint.title,
    description: complaint.description,
    location: complaint.location,
    images: complaint.images,
    status: complaint.status,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

exports.createComplaint = async (req, res, next) => {
  try {
    const { category, title, description, location } = req.body;

    if (!category || !title?.trim() || !description?.trim() || !location?.trim()) {
      return res.status(400).json({
        message: 'Category, title, description, and location are required',
      });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid complaint category' });
    }

    const imageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);

    if (imageUrls.length > 3) {
      return res.status(400).json({ message: 'Maximum 3 images allowed' });
    }

    const complaintId = await generateComplaintId();
    const now = new Date();

    const complaint = await Complaint.create({
      complaintId,
      citizenId: req.user._id,
      category,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      images: imageUrls,
      status: 'Pending Verification',
      statusHistory: [
        {
          status: 'Pending Verification',
          changedBy: req.user._id,
          note: 'Complaint submitted',
          timestamp: now,
        },
      ],
    });

    res.status(201).json({ complaint: sanitizeComplaint(complaint) });
  } catch (err) {
    next(err);
  }
};

exports.getMyComplaints = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/complaints/mine (Stage 4, FR-3.1)' });
};

exports.getAssignedComplaints = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/complaints/assigned (Stage 7, FR-5.1)' });
};

exports.getComplaintById = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/complaints/:id (Stage 4, FR-3.2)' });
};

exports.listAllComplaints = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/complaints (Stage 6, FR-4.1)' });
};

exports.verifyComplaint = (req, res) => {
  res.status(501).json({ message: 'Not implemented: PUT /api/complaints/:id/verify (Stage 6, FR-4.2)' });
};

exports.assignComplaint = (req, res) => {
  res.status(501).json({ message: 'Not implemented: PUT /api/complaints/:id/assign (Stage 6, FR-4.3)' });
};

exports.updateComplaintStatus = (req, res) => {
  res.status(501).json({ message: 'Not implemented: PUT /api/complaints/:id/status (Stage 7, FR-5.2)' });
};

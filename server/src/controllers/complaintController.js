const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { CATEGORIES, STATUSES } = require('../models/Complaint');
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

function sanitizeStatusHistoryEntry(entry) {
  const changedBy = entry.changedBy;
  return {
    status: entry.status,
    note: entry.note || '',
    timestamp: entry.timestamp,
    changedBy: changedBy
      ? {
          id: changedBy._id || changedBy,
          name: changedBy.name || null,
          role: changedBy.role || null,
        }
      : null,
  };
}

function sanitizeComplaintDetail(complaint) {
  return {
    ...sanitizeComplaint(complaint),
    statusHistory: (complaint.statusHistory || []).map(sanitizeStatusHistoryEntry),
  };
}

function buildMineFilter(req) {
  const filter = { citizenId: req.user._id };

  const { status, category, search } = req.query;

  if (status) {
    if (!STATUSES.includes(status)) {
      return { error: 'Invalid status filter' };
    }
    filter.status = status;
  }

  if (category) {
    if (!CATEGORIES.includes(category)) {
      return { error: 'Invalid category filter' };
    }
    filter.category = category;
  }

  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { complaintId: { $regex: term, $options: 'i' } },
      { location: { $regex: term, $options: 'i' } },
    ];
  }

  return { filter };
}

function canAccessComplaint(complaint, user) {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'citizen') {
    return complaint.citizenId.toString() === user._id.toString();
  }

  if (user.role === 'authority') {
    return (
      complaint.assignedAuthorityId &&
      complaint.assignedAuthorityId.toString() === user._id.toString()
    );
  }

  return false;
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

exports.getMyComplaints = async (req, res, next) => {
  try {
    const { filter, error } = buildMineFilter(req);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ complaints: complaints.map(sanitizeComplaint) });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const complaint = await Complaint.findById(req.params.id).populate(
      'statusHistory.changedBy',
      'name role'
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ complaint: sanitizeComplaintDetail(complaint) });
  } catch (err) {
    next(err);
  }
};

exports.getAssignedComplaints = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/complaints/assigned (Stage 7, FR-5.1)' });
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

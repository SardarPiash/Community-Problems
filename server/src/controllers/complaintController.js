const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { CATEGORIES, STATUSES } = require('../models/Complaint');
const { generateComplaintId } = require('../utils/complaintId');
const { applyStatusChange } = require('../utils/statusChange');

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

function sanitizeComplaintListItem(complaint) {
  const citizen = complaint.citizenId;
  const authority = complaint.assignedAuthorityId;

  return {
    ...sanitizeComplaint(complaint),
    citizen: citizen
      ? { id: citizen._id, name: citizen.name, email: citizen.email }
      : null,
    assignedAuthority: authority
      ? { id: authority._id, name: authority.name, email: authority.email }
      : null,
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
  const citizen = complaint.citizenId;
  const authority = complaint.assignedAuthorityId;

  return {
    ...sanitizeComplaint(complaint),
    citizen: citizen
      ? { id: citizen._id, name: citizen.name, email: citizen.email }
      : null,
    assignedAuthority: authority
      ? { id: authority._id, name: authority.name, email: authority.email }
      : null,
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

function buildAdminFilter(req) {
  const filter = {};
  const { status, category, authority, dateFrom, dateTo, search } = req.query;

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

  if (authority) {
    if (!mongoose.Types.ObjectId.isValid(authority)) {
      return { error: 'Invalid authority filter' };
    }
    filter.assignedAuthorityId = authority;
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (Number.isNaN(from.getTime())) {
        return { error: 'Invalid dateFrom' };
      }
      filter.createdAt.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (Number.isNaN(to.getTime())) {
        return { error: 'Invalid dateTo' };
      }
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
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

function refId(value) {
  if (!value) return null;
  return (value._id || value).toString();
}

function canAccessComplaint(complaint, user) {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'citizen') {
    return refId(complaint.citizenId) === user._id.toString();
  }

  if (user.role === 'authority') {
    return (
      complaint.assignedAuthorityId &&
      refId(complaint.assignedAuthorityId) === user._id.toString()
    );
  }

  return false;
}

async function loadComplaintDetail(id) {
  return Complaint.findById(id)
    .populate('citizenId', 'name email')
    .populate('assignedAuthorityId', 'name email')
    .populate('statusHistory.changedBy', 'name role');
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

exports.listAllComplaints = async (req, res, next) => {
  try {
    const { filter, error } = buildAdminFilter(req);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name email')
      .populate('assignedAuthorityId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ complaints: complaints.map(sanitizeComplaintListItem) });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const complaint = await loadComplaintDetail(req.params.id);

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

exports.verifyComplaint = async (req, res, next) => {
  try {
    const { decision, reason } = req.body;

    if (!['verified', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be verified or rejected' });
    }

    if (decision === 'rejected' && !reason?.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Pending Verification') {
      return res.status(400).json({ message: 'Only pending complaints can be verified or rejected' });
    }

    const newStatus = decision === 'verified' ? 'Verified' : 'Rejected';
    const note = decision === 'rejected' ? reason.trim() : 'Verified by admin';

    await applyStatusChange(complaint, {
      status: newStatus,
      changedBy: req.user._id,
      note,
    });

    const updated = await loadComplaintDetail(complaint._id);
    res.json({ complaint: sanitizeComplaintDetail(updated) });
  } catch (err) {
    next(err);
  }
};

exports.assignComplaint = async (req, res, next) => {
  try {
    const { authorityId } = req.body;

    if (!authorityId || !mongoose.Types.ObjectId.isValid(authorityId)) {
      return res.status(400).json({ message: 'Valid authorityId is required' });
    }

    const authority = await User.findOne({
      _id: authorityId,
      role: 'authority',
      status: 'active',
    });

    if (!authority) {
      return res.status(404).json({ message: 'Authority not found or inactive' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Verified') {
      return res.status(400).json({ message: 'Only verified complaints can be assigned' });
    }

    complaint.assignedAuthorityId = authority._id;
    await applyStatusChange(complaint, {
      status: 'Assigned',
      changedBy: req.user._id,
      note: `Assigned to ${authority.name}`,
    });

    const updated = await loadComplaintDetail(complaint._id);
    res.json({ complaint: sanitizeComplaintDetail(updated) });
  } catch (err) {
    next(err);
  }
};

exports.getAssignedComplaints = async (req, res, next) => {
  try {
    const filter = { assignedAuthorityId: req.user._id };
    const { status } = req.query;

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ complaints: complaints.map(sanitizeComplaintListItem) });
  } catch (err) {
    next(err);
  }
};

const AUTHORITY_UPDATE_STATUSES = ['In Progress', 'Resolved', 'Unable to Resolve'];
const AUTHORITY_UPDATABLE_FROM = ['Assigned', 'In Progress'];

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status || !AUTHORITY_UPDATE_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Status must be one of: In Progress, Resolved, Unable to Resolve',
      });
    }

    if (!note?.trim()) {
      return res.status(400).json({ message: 'Progress note is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.assignedAuthorityId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!AUTHORITY_UPDATABLE_FROM.includes(complaint.status)) {
      return res.status(400).json({
        message: `Cannot update status from "${complaint.status}"`,
      });
    }

    await applyStatusChange(complaint, {
      status,
      changedBy: req.user._id,
      note: note.trim(),
    });

    const updated = await loadComplaintDetail(complaint._id);
    res.json({ complaint: sanitizeComplaintDetail(updated) });
  } catch (err) {
    next(err);
  }
};

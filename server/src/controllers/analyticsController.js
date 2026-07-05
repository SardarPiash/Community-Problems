const Complaint = require('../models/Complaint');

function averageResolutionDays(complaints) {
  const durations = complaints
    .map((complaint) => {
      const resolvedEntry = [...(complaint.statusHistory || [])]
        .reverse()
        .find((entry) => entry.status === 'Resolved');
      if (!resolvedEntry) {
        return null;
      }
      const ms = resolvedEntry.timestamp - complaint.createdAt;
      return ms / (1000 * 60 * 60 * 24);
    })
    .filter((value) => value !== null);

  if (durations.length === 0) {
    return null;
  }

  const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;
  return Math.round(avg * 10) / 10;
}

function buildDateFilter(query) {
  const { dateFrom, dateTo } = query;
  if (!dateFrom && !dateTo) {
    return { filter: {}, error: null };
  }

  const filter = { createdAt: {} };

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

  return { filter, error: null };
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

exports.getSummary = async (req, res, next) => {
  try {
    const { filter: dateFilter, error } = buildDateFilter(req.query);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const matchStage = Object.keys(dateFilter).length ? [{ $match: dateFilter }] : [];

    const [byCategory, byStatus, resolvedComplaints, totalComplaints] = await Promise.all([
      Complaint.aggregate([
        ...matchStage,
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        ...matchStage,
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.find({ status: 'Resolved', ...dateFilter }).select('createdAt statusHistory'),
      Complaint.countDocuments(dateFilter),
    ]);

    const resolvedCount = byStatus.find((item) => item._id === 'Resolved')?.count || 0;
    const resolvedPercent =
      totalComplaints === 0 ? 0 : Math.round((resolvedCount / totalComplaints) * 1000) / 10;

    res.json({
      summary: {
        totalComplaints,
        resolvedCount,
        resolvedPercent,
        averageResolutionDays: averageResolutionDays(resolvedComplaints),
        byCategory: byCategory.map((item) => ({ category: item._id, count: item.count })),
        byStatus: byStatus.map((item) => ({ status: item._id, count: item.count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const { filter: dateFilter, error } = buildDateFilter(req.query);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const complaints = await Complaint.find(dateFilter)
      .populate('citizenId', 'name email')
      .populate('assignedAuthorityId', 'name email')
      .sort({ createdAt: -1 });

    const header = [
      'Complaint ID',
      'Title',
      'Category',
      'Status',
      'Location',
      'Citizen Name',
      'Citizen Email',
      'Authority Name',
      'Created At',
      'Updated At',
    ];

    const rows = complaints.map((complaint) =>
      [
        complaint.complaintId,
        complaint.title,
        complaint.category,
        complaint.status,
        complaint.location,
        complaint.citizenId?.name,
        complaint.citizenId?.email,
        complaint.assignedAuthorityId?.name,
        complaint.createdAt?.toISOString(),
        complaint.updatedAt?.toISOString(),
      ]
        .map(csvEscape)
        .join(',')
    );

    const csv = [header.join(','), ...rows].join('\n');
    const filename = `cprs-complaints-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

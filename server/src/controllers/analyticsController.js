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

exports.getSummary = async (req, res, next) => {
  try {
    const [byCategory, byStatus, resolvedComplaints, totalComplaints] = await Promise.all([
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.find({ status: 'Resolved' }).select('createdAt statusHistory'),
      Complaint.countDocuments(),
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

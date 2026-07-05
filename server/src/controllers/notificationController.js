const Notification = require('../models/Notification');

function sanitizeNotification(notification) {
  const complaint = notification.complaintId;
  return {
    id: notification._id,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    complaint: complaint
      ? {
          id: complaint._id,
          complaintId: complaint.complaintId,
          title: complaint.title,
        }
      : null,
  };
}

exports.listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('complaintId', 'complaintId title');

    res.json({ notifications: notifications.map(sanitizeNotification) });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = (req, res) => {
  res.status(501).json({ message: 'Not implemented: PUT /api/notifications/:id/read (Stage 7, FR-6.2)' });
};

// Notification system (SRS 5.6) — implemented in Stage 7.

exports.listNotifications = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/notifications (Stage 7, FR-6.2)' });
};

exports.markAsRead = (req, res) => {
  res.status(501).json({ message: 'Not implemented: PUT /api/notifications/:id/read (Stage 7, FR-6.2)' });
};

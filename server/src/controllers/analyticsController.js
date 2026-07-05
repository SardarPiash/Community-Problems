// Reports & analytics (SRS 5.7) — implemented in Stage 8.

exports.getSummary = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/analytics/summary (Stage 8, FR-7.2)' });
};

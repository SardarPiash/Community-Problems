// User management (SRS 5.1 FR-1.5, 5.4 FR-4.4) — implemented in Stages 2 and 6.

exports.getMe = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/users/me (Stage 2, FR-1.5)' });
};

exports.updateMe = (req, res) => {
  res.status(501).json({ message: 'Not implemented: PUT /api/users/me (Stage 2, FR-1.5)' });
};

exports.listUsers = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/users (Stage 6, FR-4.4)' });
};

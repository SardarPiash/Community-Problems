// Auth module (SRS 5.1) — implemented in Stage 2. Stubs only for Stage 1.

exports.register = (req, res) => {
  res.status(501).json({ message: 'Not implemented: POST /api/auth/register (Stage 2, FR-1.1)' });
};

exports.login = (req, res) => {
  res.status(501).json({ message: 'Not implemented: POST /api/auth/login (Stage 2, FR-1.3)' });
};

exports.forgotPassword = (req, res) => {
  res.status(501).json({ message: 'Not implemented: POST /api/auth/forgot-password (Stage 2, FR-1.4)' });
};

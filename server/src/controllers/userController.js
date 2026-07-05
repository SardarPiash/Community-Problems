const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validatePassword } = require('../utils/validation');

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

exports.getMe = (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, password, currentPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({ message: 'Phone cannot be empty' });
      }
      user.phone = phone.trim();
    }

    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      user.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.save();
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = (req, res) => {
  res.status(501).json({ message: 'Not implemented: GET /api/users (Stage 6, FR-4.4)' });
};

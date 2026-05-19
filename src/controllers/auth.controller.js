const jwt = require('jsonwebtoken');
const User = require('../models/User');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const errors = [];
    if (!username) errors.push({ field: 'username', message: 'username is required' });
    if (!password) errors.push({ field: 'password', message: 'password is required' });
    if (errors.length) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'Request validation failed',
        details: { errors }
      });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { sub: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 1. Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email?.trim() || !password || !name?.trim()) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole = role ? role.toLowerCase().trim() : 'candidate';
    if (!['candidate', 'recruiter'].includes(cleanRole)) {
      return res.status(400).json({ message: 'Choose Candidate or Recruiter as your account type.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: cleanRole
    });

    await user.save();

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// 2. Login User (Strict Role & Credential Matching)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole = role ? role.toLowerCase().trim() : 'candidate';

    // Find user
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify role (reject candidate trying to log in under recruiter tab & vice versa)
    const storedRole = (user.role || 'candidate').toLowerCase().trim();
    if (storedRole !== cleanRole) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user._id, role: storedRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: storedRole }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Profile not found.' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Could not load profile.', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fields = ['name', 'phone', 'headline', 'location', 'about', 'skills', 'experience', 'education', 'links', 'companyName', 'companyWebsite', 'companyLocation', 'companyIndustry', 'companyDescription'];
    const updates = {};
    fields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (updates.skills !== undefined && !Array.isArray(updates.skills)) {
      updates.skills = String(updates.skills).split(',').map((skill) => skill.trim()).filter(Boolean);
    }
    if (updates.experience !== undefined && !Array.isArray(updates.experience)) {
      updates.experience = String(updates.experience).split('\n').map((item) => item.trim()).filter(Boolean);
    }
    for (const listField of ['education', 'links']) {
      if (updates[listField] !== undefined && !Array.isArray(updates[listField])) {
        updates[listField] = String(updates[listField]).split('\n').map((item) => item.trim()).filter(Boolean);
      }
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Profile not found.' });
    return res.json({ message: 'Profile saved.', user });
  } catch (err) {
    return res.status(500).json({ message: 'Could not save profile.', error: err.message });
  }
};

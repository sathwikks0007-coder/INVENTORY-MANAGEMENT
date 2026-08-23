const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all system users
// @route   GET /api/users
// @access  Private (Administrator)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user with assigned role
// @route   POST /api/users
// @access  Private (Administrator)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, status } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role || 'Store Staff',
      phone: phone || '',
      status: status || 'Active'
    });

    await logAudit(req.user, 'CREATE_USER', 'User', user._id.toString(), `Created user ${email} with role ${role}`);

    const safeUser = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details / role / status
// @route   PUT /api/users/:id
// @access  Private (Administrator)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, status, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;
    if (password) user.password = password; // Will trigger pre-save hashing if modified

    await user.save();

    await logAudit(req.user, 'UPDATE_USER', 'User', user._id.toString(), `Updated user ${user.email}`);

    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Administrator)
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own active administrator account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAudit(req.user, 'DELETE_USER', 'User', req.params.id, `Deleted user ${user.email}`);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};

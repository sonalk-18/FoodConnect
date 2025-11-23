const userModel = require('../models/userModel');

const toUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  points: user.points,
  created_at: user.created_at
});

exports.getUsers = async (_req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    return res.json({
      status: 'success',
      users: users.map(toUserResponse)
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await userModel.updateUserRole(req.params.id, req.body.role);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.json({
      status: 'success',
      message: 'Role updated successfully',
      user: toUserResponse(user)
    });
  } catch (error) {
    return next(error);
  }
};


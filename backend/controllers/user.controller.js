export const getMe = async (req, res) => {
  res.status(200).json({
    message: "Authenticated successfully",
    user: req.user,
  });
};

export const getAdminDashboard = async (req, res) => {
  res.status(200).json({
    message: "Welcome to the DeQueens Atelier admin dashboard",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
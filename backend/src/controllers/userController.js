const User = require("../models/User");
const { sendError } = require("../utils/errorResponse");

// Get logged-in user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (err) {
    return sendError(res, err, { context: "Get Profile Error:", req });
  }
};

// Update logged-in user's profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      village,
      district,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (village !== undefined) {
      user.village = village;
    }

    if (district !== undefined) {
      user.district = district;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      village: updatedUser.village,
      district: updatedUser.district,
      role: updatedUser.role,
    });
  } catch (err) {
    return sendError(res, err, { context: "Update Profile Error:", req });
  }
};
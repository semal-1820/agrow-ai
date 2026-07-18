const User = require("../models/User");

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
    console.error("Get Profile Error:", err);

    res.status(500).json({
      message: err.message,
    });
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
    console.error("Update Profile Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};
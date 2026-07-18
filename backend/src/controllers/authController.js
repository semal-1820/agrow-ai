const User = require("../models/User");
const Enterprise = require("../models/Enterprise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      businessName,
      businessType,
      village,
      district,
      state,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const exists = await User.findOne({
      email: normalizedEmail,
    });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const userRole =
      role === "officer"
        ? "officer"
        : "entrepreneur";

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
    });

    let enterprise = null;

    if (userRole === "entrepreneur") {
      enterprise =
        await Enterprise.create({
          owner: user._id,
          name:
            businessName ||
            `${name}'s Enterprise`,
          type:
            businessType ||
            "Other",
          village:
            village || "",
          district:
            district || "",
          state:
            state || "",
          annualIncome: 0,
          employees: 0,
        });
    }

    return res.status(201).json({
      token: generateToken(user),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      enterprise,
    });
  } catch (err) {
    console.error(
      "Registration Error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid Credentials",
      });
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(400).json({
        message:
          "Invalid Credentials",
      });
    }

    return res.status(200).json({
      token: generateToken(user),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(
      "Login Error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(
      user
    );
  } catch (err) {
    console.error(
      "Profile Error:",
      err
    );

    return res.status(500).json({
      message: err.message,
    });
  }
};
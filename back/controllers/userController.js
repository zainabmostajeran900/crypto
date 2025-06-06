const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

async function countAdmins() {
  return User.countDocuments({ role: "admin" });
}

const register = async (req, res) => {
  const { fullname, username, password, email, phone } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user)
      return res
        .status(400)
        .json({ message: "User already exists with this username" });

    user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    user = await User.findOne({ phone });
    if (user)
      return res
        .status(400)
        .json({ message: "User already exists with this phone number" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullname,
      username,
      password: hashedPassword,
      email,
      phone,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in register:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const login = (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
};

const getMe = (req, res) => {
  res.json(req.user);
};

const updateMe = async (req, res) => {
  const { fullname, email, phone } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullname, email, phone },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteMe = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last remaining admin." });
      }
    }

    user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    res.json({ message: "User deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.favorites.includes(req.params.coinId)) {
      user.favorites.push(req.params.coinId);
      await user.save();
    }
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== req.params.coinId
    );
    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.fullname},</p>
        <p>You have requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px;">If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Your Crypto App Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html,
    });

    res.json({ message: "Email sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin" && req.body.role && req.body.role !== "admin") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot remove the last remaining admin." });
      }
    }

    const { fullname, username, email, phone, role, password } = req.body;
    if (fullname) user.fullname = fullname;
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last remaining admin." });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const seedDefaultAdmin = async (req, res) => {
  const adminCount = await countAdmins();
  if (adminCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const user = new User({
      fullname: process.env.DEFAULT_ADMIN_FULLNAME,
      username: process.env.DEFAULT_ADMIN_USERNAME,
      email: process.env.DEFAULT_ADMIN_EMAIL,
      phone: process.env.DEFAULT_ADMIN_PHONE,
      password: await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, salt),
      role: "admin",
    });
    await user.save();
    console.log(`✱ Created default admin (‘${user.username}’)`);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  deleteMe,
  uploadAvatar,
  addFavorite,
  removeFavorite,
  forgotPassword,
  resetPassword,
  getAllUsers,
  updateUser,
  deleteUser,
  seedDefaultAdmin,
};

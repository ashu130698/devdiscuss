const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ error: "Email already exists" });
    }

    return res
      .status(500)
      .json({ error: err.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

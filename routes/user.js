import express from "express";
const router = express.Router();
import User from "../models/UserSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Get User Count
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "user" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user count" });
  }
});


// Register Route
router.post("/register", async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  let token = jwt.sign(
    { email, id: newUser._id, role: newUser.role },
    process.env.SECRET_KEY,
    {
      expiresIn: "1w",
    }
  );

  return res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// Signin Route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and Password are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "user Not Found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ message: "Password is Not Correct" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.SECRET_KEY,
    {
      expiresIn: "1w",
    }
  );
  return res.status(201).json({
    message: "User Logged In successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Update User Route
router.put("/updateUser/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, image } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phone, image },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: userPassword, ...rest } = updatedUser._doc;

    return res.status(200).json({
      message: "User updated successfully",
      data: rest,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating user" });
  }
});

export default router;

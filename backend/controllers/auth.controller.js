import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

import generateToken from "../utils/generateToken.js";

import AppError from "../utils/appError.js";

import sendEmail from "../services/email.service.js";

import { welcomeEmail } from "../utils/emailTemplates.js";

// ============================================================
// REGISTER
// ============================================================

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------

    if (!name || !email || !password) {
      throw new AppError("Name, email and password are required", 400);
    }

    // ----------------------------------------------------------
    // Check if user already exists
    // ----------------------------------------------------------

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw new AppError("An account with this email already exists", 400);
    }

    // ----------------------------------------------------------
    // Hash password
    // ----------------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // ----------------------------------------------------------
    // Create user
    // ----------------------------------------------------------

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // ----------------------------------------------------------
    // Send welcome email
    // ----------------------------------------------------------

    try {
      await sendEmail({
        to: user.email,

        subject: "Welcome to DeQueens Atelier",

        html: welcomeEmail(user.name),
      });
    } catch (emailError) {
      // Email failure should not cancel
      // a successful registration.

      console.error("Welcome email failed:", emailError.message);
    }

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.status(201).json({
      status: "success",

      message: "Registration successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// LOGIN
// ============================================================

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // ----------------------------------------------------------
    // Find user
    // ----------------------------------------------------------

    const user = await User.findOne({
      email,
    }).select("+password");

    // ----------------------------------------------------------
    // Check user
    // ----------------------------------------------------------

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // ----------------------------------------------------------
    // Check password
    // ----------------------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError("Invalid email or password", 401);
    }

    // ----------------------------------------------------------
    // Generate JWT
    // ----------------------------------------------------------

    const token = generateToken(user._id);

    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    res.status(200).json({
      status: "success",

      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

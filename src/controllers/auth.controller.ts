// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User, UserRole } from '../models/user.model';
import { sendVerificationEmail } from '../utilities/mailer';
import { AuthRequest } from '../middlewares/auth.middleware';

// --- Type Definitions ---
interface JwtPayload {
  id: number;
  role: UserRole;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

// --- Helpers ---
const sanitizeUser = (user: User) => {
  const userJson = user.toJSON();
  delete userJson.password;
  delete userJson.emailToken;
  return userJson;
};

// --- Register Controller ---
export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
): Promise<void> => {
  const { name, email, password, role = UserRole.CREATOR } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: 'Name, email and password are required',
    });
    return;
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');

    // Create user with isVerified = false and emailToken
    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false,
      emailToken,
    });

    // Send verification email
    await sendVerificationEmail(email, emailToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

// --- Verify Email Controller ---
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const token = req.query.token as string;

  if (!token) {
    res.status(400).json({ message: 'Verification token missing.' });
    return;
  }

  try {
    const user = await User.findOne({ where: { emailToken: token } });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token.' });
      return;
    }

    user.isVerified = true;
    user.emailToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({
      message: 'Error verifying email',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

// --- Login Controller ---
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

  if (!JWT_SECRET) {
    console.error('Missing JWT_SECRET in environment');
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
    });
    return;
  }

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
    return;
  }

  try {
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email, // case-insensitive match
        },
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const payload: JwtPayload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET as Secret,
      {
        expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({ user: req.user });
};
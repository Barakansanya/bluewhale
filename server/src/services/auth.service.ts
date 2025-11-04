// ============================================
// FILE: server/src/services/auth.service.ts
// ============================================
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash.utils';
import { generateToken } from '../utils/jwt.utils';
import { RegisterInput, LoginInput } from '../validators/auth.validators';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        jobTitle: data.jobTitle,
        role: 'USER',
        subscription: 'FREE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscription: true,
        createdAt: true,
      },
    });

    // Create default watchlist
    await prisma.watchlist.create({
      data: {
        userId: user.id,
        name: 'My Watchlist',
        isDefault: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await comparePassword(data.password, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscription: user.subscription,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscription: true,
        subscriptionEndsAt: true,
        company: true,
        jobTitle: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../models/User';
import { generateToken, sanitizeUser } from '../utils/auth';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  password?: string;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(input: RegisterUserInput) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user with correct role handling
    const { role, ...rest } = input;
    const user = this.userRepository.create({
      ...rest,
      role: role === 'admin' ? UserRole.ADMIN : UserRole.USER,
    });
    await this.userRepository.save(user);

    // Generate token
    const token = generateToken(user);

    return {
      token,
      user: sanitizeUser(user),
    };
  }

  async login(input: LoginInput) {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (!user) {
      throw new ValidationError('Invalid email or password');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(input.password);
    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user);

    return {
      token,
      user: sanitizeUser(user),
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sanitizeUser(user);
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update user fields
    if (input.firstName) {
      user.firstName = input.firstName;
    }

    if (input.lastName) {
      user.lastName = input.lastName;
    }

    if (input.password) {
      user.password = await bcrypt.hash(input.password, 10);
    }

    // Save updated user
    await this.userRepository.save(user);

    return sanitizeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return true;
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal user existence, but don't error either
      return true;
    }

    // In a real application, you would:
    // 1. Generate a token
    // 2. Store it in the database with an expiry
    // 3. Send an email with a reset link

    // For demo purposes, we'll just return a token
    const token = generateToken(user);
    
    return { token };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
      
      if (typeof decoded !== 'object' || !decoded.id) {
        throw new ValidationError('Invalid or expired token');
      }

      // Find the user
      const user = await this.userRepository.findOne({
        where: { id: decoded.id as string },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update the password
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);

      return true;
    } catch (error) {
      throw new ValidationError('Invalid or expired token');
    }
  }
}

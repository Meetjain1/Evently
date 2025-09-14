import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  private authService = new AuthService();

  // Register a new user
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Login a user
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get current user profile
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await this.authService.getUserById(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Update user profile
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await this.authService.updateUser(req.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  // Change user password
  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(req.user.id, currentPassword, newPassword);
      
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  // Request password reset (forgot password)
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await this.authService.requestPasswordReset(email);
      
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      next(error);
    }
  };
  
  // Reset password with token
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params.token;
      const { password } = req.body;
      
      const result = await this.authService.resetPassword(token, password);
      
      if (result) {
        res.status(200).json({ message: 'Password reset successfully' });
      } else {
        res.status(400).json({ message: 'Password reset failed' });
      }
    } catch (error) {
      next(error);
    }
  };
  
  // Logout user
  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // In a token-based auth system like JWT, typically the client just discards the token
      // Here we can add token invalidation logic if needed (e.g., add to blacklist)
      
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };
}

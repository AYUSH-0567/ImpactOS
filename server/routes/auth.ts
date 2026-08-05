import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'impactos_production_secret_key_2026_jwt_auth';

// Helper setting HttpOnly Session Cookie
const setSessionCookie = (res: Response, token: string, rememberMe: boolean) => {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  res.cookie('impactos_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge
  });
};

// 1. REGISTER NEW USER & ORGANIZATION
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      email, 
      password, 
      name, 
      phone, 
      organizationName, 
      fcraRegId, 
      headquarters, 
      invitationToken 
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    let organizationId: string;
    let userRole: any = 'ADMIN';

    // Scenario A: Invitation Token Join
    if (invitationToken) {
      const invite = await prisma.organizationInvitation.findUnique({
        where: { token: invitationToken }
      });

      if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
      }

      organizationId = invite.organizationId;
      userRole = invite.role;

      await prisma.organizationInvitation.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' }
      });
    } 
    // Scenario B: Create New Organization
    else {
      if (!organizationName || !organizationName.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Organization Name is required for new organization setup.' 
        });
      }

      const finalFcraId = (fcraRegId && fcraRegId.trim()) ? fcraRegId.trim() : `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      if (fcraRegId && fcraRegId.trim()) {
        const existingOrg = await prisma.organization.findUnique({ where: { fcraRegId: fcraRegId.trim() } });
        if (existingOrg) {
          return res.status(400).json({ success: false, message: 'An organization with this FCRA Registration ID is already registered.' });
        }
      }

      const newOrg = await prisma.organization.create({
        data: {
          name: organizationName.trim(),
          fcraRegId: finalFcraId,
          headquarters: headquarters || 'New Delhi, India'
        }
      });

      organizationId = newOrg.id;
      userRole = 'ADMIN';
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const emailVerificationToken = `verif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name,
        phone,
        role: userRole,
        organizationId,
        isEmailVerified: false,
        emailVerificationToken
      },
      include: {
        organization: true
      }
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      isEmailVerified: user.isEmailVerified
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
    setSessionCookie(res, token, false);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Verification token generated.',
      token,
      verificationToken: emailVerificationToken,
      user: tokenPayload
    });

  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
});

// 2. SECURE LOGIN (HttpOnly Cookie & Bcrypt Verification)
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { organization: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password.' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      isEmailVerified: user.isEmailVerified
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: rememberMe ? '30d' : '24h' });
    setSessionCookie(res, token, Boolean(rememberMe));

    return res.json({
      success: true,
      token,
      user: tokenPayload
    });

  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server authentication error.' });
  }
});

// 3. LOGOUT (Clear HttpOnly Session Cookie)
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('impactos_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ success: true, message: 'Session logged out successfully.' });
});

// 4. FORGOT PASSWORD
router.post('/forgot-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists, a password reset token has been dispatched.'
      });
    }

    const passwordResetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires
      }
    });

    return res.json({
      success: true,
      message: 'Password reset token generated.',
      resetToken: passwordResetToken
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. RESET PASSWORD
router.post('/reset-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Valid reset token and new password (min 8 chars) are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: resetToken }
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return res.json({ success: true, message: 'Password updated successfully. Please sign in with your new password.' });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. VERIFY EMAIL
router.post('/verify-email', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { verificationToken } = req.body;
    if (!verificationToken) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: verificationToken }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email verification token.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null
      }
    });

    return res.json({ success: true, message: 'Email address verified successfully.' });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 7. GET ACTIVE SESSION USER PROFILE
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { organization: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

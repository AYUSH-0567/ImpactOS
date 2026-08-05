import { prisma } from '../db.js';
import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';

const router = Router();

// 1. GET ORGANIZATION PROFILE
router.get('/profile', authenticateToken, requirePermission('view:dashboard'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
            beneficiaries: true,
            donors: true
          }
        }
      }
    });

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization profile not found.' });
    }

    return res.json(org);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. UPDATE ORGANIZATION PROFILE (Admin / Director Only)
router.put('/profile', authenticateToken, requirePermission('admin:settings'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, tax80GId, headquarters } = req.body;

    const updatedOrg = await prisma.organization.update({
      where: { id: req.user!.organizationId }, // NEVER trust frontend organizationId
      data: {
        ...(name && { name }),
        ...(tax80GId !== undefined && { tax80GId }),
        ...(headquarters && { headquarters })
      }
    });

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'ORG_PROFILE_UPDATE',
        entity: 'organization',
        entityId: req.user!.organizationId,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({
      success: true,
      message: 'Organization profile updated successfully.',
      organization: updatedOrg
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET ORGANIZATION TEAM MEMBERS
router.get('/members', authenticateToken, requirePermission('view:dashboard'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const members = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId }, // Scoped strictly to session org
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(members);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. CREATE MEMBER INVITATION (Admin / Director Only)
router.post('/invitations', authenticateToken, requirePermission('admin:settings'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Email and role are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser && existingUser.organizationId === req.user!.organizationId) {
      return res.status(400).json({ success: false, message: 'This user is already a member of your organization.' });
    }

    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.organizationInvitation.create({
      data: {
        email: cleanEmail,
        role: role as any,
        token,
        organizationId: req.user!.organizationId, // Enforced from server session
        invitedBy: req.user!.id,
        expiresAt
      }
    });

    return res.status(201).json({
      success: true,
      message: `Invitation generated for ${cleanEmail} with role '${role}'.`,
      invitationToken: invite.token,
      expiresAt: invite.expiresAt
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. GET ACTIVE INVITATIONS
router.get('/invitations', authenticateToken, requirePermission('admin:settings'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const invitations = await prisma.organizationInvitation.findMany({
      where: { 
        organizationId: req.user!.organizationId,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(invitations);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. REVOKE INVITATION
router.delete('/invitations/:id', authenticateToken, requirePermission('admin:settings'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.organizationInvitation.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invitation not found or access denied.' });
    }

    await prisma.organizationInvitation.delete({ where: { id } });

    return res.json({ success: true, message: 'Invitation revoked.' });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

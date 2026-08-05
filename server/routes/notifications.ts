import { prisma } from '../db.js';
import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. GET ALL NOTIFICATIONS & UNREAD COUNT (Scoped to organizationId)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const notifications = await prisma.notification.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.json({
      notifications,
      unreadCount
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. CREATE NOTIFICATION (In-App & Email Dispatch)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, type, channel } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || 'INFO',
        channel: channel || 'IN_APP',
        isRead: false,
        emailSent: channel === 'EMAIL' || channel === 'BOTH',
        organizationId: req.user!.organizationId
      }
    });

    return res.status(201).json(notification);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. MARK SINGLE NOTIFICATION AS READ
router.put('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.notification.updateMany({
      where: { id, organizationId: req.user!.organizationId },
      data: { isRead: true }
    });

    return res.json({ success: true, count: updated.count });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. MARK ALL NOTIFICATIONS AS READ
router.put('/mark-all-read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: { organizationId: req.user!.organizationId, isRead: false },
      data: { isRead: true }
    });

    return res.json({ success: true, count: updated.count });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE NOTIFICATION
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.notification.deleteMany({
      where: { id, organizationId: req.user!.organizationId }
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. AUTOMATED SCANNER: EVALUATE DATABASE RULES & TRIGGER NOTIFICATIONS
router.post('/scan-alerts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const triggered: any[] = [];

    // Rule A: BUDGET_THRESHOLD (Projects exceeding 80% spend)
    const projects = await prisma.project.findMany({ where: { organizationId: orgId } });
    for (const p of projects) {
      if (p.budget > 0 && p.spent / p.budget >= 0.80) {
        const title = `Budget Threshold Alert: ${p.name}`;
        const message = `Project '${p.name}' has reached ${((p.spent / p.budget) * 100).toFixed(1)}% of its allocated budget (Spent: ₹${(p.spent / 100000).toFixed(2)} L of ₹${(p.budget / 100000).toFixed(2)} L).`;

        const existing = await prisma.notification.findFirst({
          where: { organizationId: orgId, title, type: 'BUDGET_THRESHOLD' }
        });

        if (!existing) {
          const n = await prisma.notification.create({
            data: {
              title,
              message,
              type: 'BUDGET_THRESHOLD',
              channel: 'BOTH',
              emailSent: true,
              organizationId: orgId
            }
          });
          triggered.push(n);
        }
      }
    }

    // Rule B: GRANT_EXPIRY (Agreements ending soon)
    const agreements = await prisma.donorAgreement.findMany({
      where: { donor: { organizationId: orgId } }
    });
    for (const ag of agreements) {
      const title = `Grant MOU Expiry Alert: ${ag.title}`;
      const message = `Grant MOU '${ag.title}' (Ref: ${ag.agreementNo}) is active for grant amount ₹${(ag.grantAmount / 100000).toFixed(2)} Lakhs. Review renewal terms.`;

      const existing = await prisma.notification.findFirst({
        where: { organizationId: orgId, title, type: 'GRANT_EXPIRY' }
      });

      if (!existing) {
        const n = await prisma.notification.create({
          data: {
            title,
            message,
            type: 'GRANT_EXPIRY',
            channel: 'BOTH',
            emailSent: true,
            organizationId: orgId
          }
        });
        triggered.push(n);
      }
    }

    // Rule C: VOLUNTEER_SHORTAGE
    const events = await prisma.volunteerEvent.findMany({});
    for (const evt of events) {
      if (evt.volunteersAssigned < 5) {
        const title = `Volunteer Shortage: ${evt.title}`;
        const message = `Field event '${evt.title}' has only ${evt.volunteersAssigned} assigned volunteers. Target mobilization is 10 volunteers.`;

        const existing = await prisma.notification.findFirst({
          where: { organizationId: orgId, title, type: 'VOLUNTEER_SHORTAGE' }
        });

        if (!existing) {
          const n = await prisma.notification.create({
            data: {
              title,
              message,
              type: 'VOLUNTEER_SHORTAGE',
              channel: 'IN_APP',
              organizationId: orgId
            }
          });
          triggered.push(n);
        }
      }
    }

    return res.json({
      success: true,
      triggeredCount: triggered.length,
      notifications: triggered
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

import { prisma } from '../db.js';
import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';

const router = Router();

// 1. GET ALL PROGRAMS
router.get('/', authenticateToken, requirePermission('view:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      where: { organizationId: req.user!.organizationId },
      include: {
        projects: true,
        _count: {
          select: {
            beneficiaries: true,
            donations: true,
            events: true,
            projects: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(programs);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. CREATE PROGRAM
router.post('/', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, vertical, budget, startDate, endDate, objectives, kpis } = req.body;

    if (!name || !vertical) {
      return res.status(400).json({ success: false, message: 'Program name and vertical category are required.' });
    }

    const program = await prisma.program.create({
      data: {
        name,
        vertical: vertical as any,
        budget: parseFloat(String(budget)) || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        objectives: objectives || null,
        kpis: kpis || null,
        status: 'ACTIVE',
        organizationId: req.user!.organizationId
      }
    });

    return res.status(201).json(program);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. EDIT PROGRAM
router.put('/:id', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, vertical, budget, startDate, endDate, objectives, kpis, status } = req.body;

    const existing = await prisma.program.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Program not found or access denied.' });
    }

    const updated = await prisma.program.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(vertical && { vertical: vertical as any }),
        ...(budget !== undefined && { budget: parseFloat(String(budget)) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(objectives !== undefined && { objectives }),
        ...(kpis !== undefined && { kpis }),
        ...(status && { status })
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. ARCHIVE PROGRAM
router.post('/:id/archive', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.program.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }

    const archived = await prisma.program.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    return res.json({ success: true, message: 'Program archived.', program: archived });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE PROGRAM
router.delete('/:id', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.program.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }

    await prisma.program.delete({ where: { id } });

    return res.json({ success: true, message: 'Program deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

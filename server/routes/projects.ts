import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. GET ALL PROJECTS (Multi-tenant scoped)
router.get('/', authenticateToken, requirePermission('view:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { organizationId: req.user!.organizationId },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        expenses: { orderBy: { date: 'desc' }, take: 5 },
        program: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(projects);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET SINGLE PROJECT DETAILED PROFILE
router.get('/:id', authenticateToken, requirePermission('view:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: { id, organizationId: req.user!.organizationId },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        expenses: { orderBy: { date: 'desc' } },
        program: true
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
    }

    return res.json(project);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. CREATE PROJECT
router.post('/', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      projectCode,
      category,
      state,
      district,
      lead,
      budget,
      beneficiariesTarget,
      startDate,
      endDate,
      risk,
      status,
      description,
      programId
    } = req.body;

    if (!name || !state || !district || !budget) {
      return res.status(400).json({ success: false, message: 'Name, state, district, and budget are required.' });
    }

    const code = projectCode || `PRJ-2026-${state.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const project = await prisma.project.create({
      data: {
        projectCode: code,
        name,
        category: category || 'EDUCATION',
        state,
        district,
        lead: lead || req.user!.name,
        budget: parseFloat(String(budget)),
        spent: 0,
        progress: 0,
        beneficiariesTarget: parseInt(String(beneficiariesTarget)) || 1000,
        beneficiariesReached: 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        risk: risk || 'LOW',
        status: status || 'ON_TRACK',
        description: description || 'Field initiative.',
        organizationId: req.user!.organizationId,
        programId: programId || null,
        createdBy: req.user!.id
      }
    });

    return res.status(201).json(project);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. EDIT PROJECT
router.put('/:id', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.project.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.category && { category: req.body.category }),
        ...(req.body.state && { state: req.body.state }),
        ...(req.body.district && { district: req.body.district }),
        ...(req.body.lead && { lead: req.body.lead }),
        ...(req.body.budget !== undefined && { budget: parseFloat(String(req.body.budget)) }),
        ...(req.body.spent !== undefined && { spent: parseFloat(String(req.body.spent)) }),
        ...(req.body.progress !== undefined && { progress: parseInt(String(req.body.progress)) }),
        ...(req.body.beneficiariesTarget !== undefined && { beneficiariesTarget: parseInt(String(req.body.beneficiariesTarget)) }),
        ...(req.body.beneficiariesReached !== undefined && { beneficiariesReached: parseInt(String(req.body.beneficiariesReached)) }),
        ...(req.body.risk && { risk: req.body.risk }),
        ...(req.body.status && { status: req.body.status }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.programId !== undefined && { programId: req.body.programId })
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE PROJECT
router.delete('/:id', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.project.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
    }

    await prisma.project.delete({ where: { id } });

    return res.json({ success: true, message: 'Project record deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. ADD TASK MILESTONE
router.post('/:id/milestones', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, dueDate, status } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Milestone title and due date are required.' });
    }

    const existing = await prisma.project.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: id,
        title,
        dueDate: new Date(dueDate),
        status: status || 'PENDING'
      }
    });

    return res.status(201).json(milestone);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

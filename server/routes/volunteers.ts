import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. GET ALL VOLUNTEERS (Multi-Tenant Scoped, Search & Filters)
router.get('/', authenticateToken, requirePermission('view:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, skill, city, availability, status } = req.query;

    const whereClause: any = {
      organizationId: req.user!.organizationId // Scoped strictly to session org
    };

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { volunteerCode: { contains: q } },
        { city: { contains: q } },
        { skill: { contains: q } }
      ];
    }

    if (skill && skill !== 'All') whereClause.skill = { contains: String(skill) };
    if (city && city !== 'All Cities') whereClause.city = String(city);
    if (availability && availability !== 'All') whereClause.availability = String(availability);
    if (status && status !== 'All') whereClause.status = String(status);

    const volunteers = await prisma.volunteer.findMany({
      where: whereClause,
      include: {
        assignments: { orderBy: { assignedAt: 'desc' } },
        certificates: { orderBy: { issuedDate: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(volunteers);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET VOLUNTEER ANALYTICS SUMMARY
router.get('/analytics/summary', authenticateToken, requirePermission('view:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const totalVolunteers = await prisma.volunteer.count({ where: { organizationId: orgId } });
    const activeVolunteers = await prisma.volunteer.count({ where: { organizationId: orgId, status: 'Active' } });
    const hoursAgg = await prisma.volunteer.aggregate({
      where: { organizationId: orgId },
      _sum: { hoursLogged: true },
      _avg: { rating: true }
    });

    const skillDistribution = await prisma.volunteer.groupBy({
      by: ['skill'],
      where: { organizationId: orgId },
      _count: { id: true }
    });

    return res.json({
      totalVolunteers,
      activeVolunteers,
      totalHoursLogged: hoursAgg._sum.hoursLogged || 0,
      averageRating: hoursAgg._avg.rating || 5.0,
      skillDistribution: skillDistribution.map(s => ({ skill: s.skill, count: s._count.id }))
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET VOLUNTEER EVENTS LIST
router.get('/events', authenticateToken, requirePermission('view:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const assignments = await prisma.volunteerAssignment.findMany({
      where: {
        volunteer: { organizationId: req.user!.organizationId }
      },
      include: { volunteer: true },
      orderBy: { assignedAt: 'desc' }
    });
    return res.json(assignments);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET SINGLE VOLUNTEER PROFILE
router.get('/:id', authenticateToken, requirePermission('view:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const volunteer = await prisma.volunteer.findFirst({
      where: { id, organizationId: req.user!.organizationId },
      include: {
        assignments: { orderBy: { assignedAt: 'desc' } },
        certificates: { orderBy: { issuedDate: 'desc' } }
      }
    });

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found or access denied.' });
    }

    return res.json(volunteer);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. REGISTER VOLUNTEER
router.post('/', authenticateToken, requirePermission('write:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      state,
      city,
      skill,
      availability,
      hoursLogged,
      rating,
      status
    } = req.body;

    if (!name || !email || !city || !state || !skill) {
      return res.status(400).json({ success: false, message: 'Name, email, state, city, and primary skill are required.' });
    }

    const code = `VOL-2026-${state.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const volunteer = await prisma.volunteer.create({
      data: {
        volunteerCode: code,
        name,
        email: email.trim().toLowerCase(),
        phone: phone || null,
        state,
        city,
        skill,
        availability: availability || 'Weekends',
        hoursLogged: parseFloat(String(hoursLogged)) || 0,
        eventsCount: 0,
        rating: parseFloat(String(rating)) || 5.0,
        status: status || 'Active',
        organizationId: req.user!.organizationId
      }
    });

    return res.status(201).json(volunteer);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. EDIT VOLUNTEER PROFILE
router.put('/:id', authenticateToken, requirePermission('write:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.volunteer.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.email && { email: req.body.email.trim().toLowerCase() }),
        ...(req.body.phone !== undefined && { phone: req.body.phone }),
        ...(req.body.city && { city: req.body.city }),
        ...(req.body.state && { state: req.body.state }),
        ...(req.body.skill && { skill: req.body.skill }),
        ...(req.body.availability && { availability: req.body.availability }),
        ...(req.body.hoursLogged !== undefined && { hoursLogged: parseFloat(String(req.body.hoursLogged)) }),
        ...(req.body.rating !== undefined && { rating: parseFloat(String(req.body.rating)) }),
        ...(req.body.status && { status: req.body.status })
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. ASSIGN VOLUNTEER TO PROGRAM
router.post('/:id/assignments', authenticateToken, requirePermission('write:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { programName, role } = req.body;

    if (!programName) {
      return res.status(400).json({ success: false, message: 'Program name is required.' });
    }

    const existing = await prisma.volunteer.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }

    const assignment = await prisma.volunteerAssignment.create({
      data: {
        volunteerId: id,
        programName,
        role: role || 'Field Volunteer',
        status: 'ACTIVE'
      }
    });

    await prisma.volunteer.update({
      where: { id },
      data: { eventsCount: { increment: 1 } }
    });

    return res.status(201).json(assignment);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 7. ISSUE CERTIFICATE OF SERVICE
router.post('/:id/certificates', authenticateToken, requirePermission('write:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, programName, hoursRecognized } = req.body;

    if (!title || !programName) {
      return res.status(400).json({ success: false, message: 'Certificate title and program name are required.' });
    }

    const existing = await prisma.volunteer.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }

    const certNo = `CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const cert = await prisma.volunteerCertificate.create({
      data: {
        volunteerId: id,
        certificateNo: certNo,
        title,
        programName,
        hoursRecognized: parseFloat(String(hoursRecognized)) || existing.hoursLogged
      }
    });

    return res.status(201).json(cert);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 8. DELETE VOLUNTEER
router.delete('/:id', authenticateToken, requirePermission('write:volunteers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.volunteer.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }

    await prisma.volunteer.delete({ where: { id } });

    return res.json({ success: true, message: 'Volunteer record deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

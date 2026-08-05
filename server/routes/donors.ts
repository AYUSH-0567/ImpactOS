import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. GET ALL DONORS & CSR PARTNERS
router.get('/', authenticateToken, requirePermission('view:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, type, status } = req.query;

    const whereClause: any = {
      organizationId: req.user!.organizationId // Scoped strictly to session org
    };

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { donorCode: { contains: q } },
        { location: { contains: q } },
        { contactPerson: { contains: q } },
        { email: { contains: q } }
      ];
    }

    if (type && type !== 'All Types') whereClause.type = String(type) as any;
    if (status && status !== 'All') whereClause.status = String(status);

    const donors = await prisma.donor.findMany({
      where: whereClause,
      include: {
        donations: { orderBy: { date: 'desc' }, take: 10 },
        agreements: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { totalDonated: 'desc' }
    });

    return res.json(donors);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET FUNDING ANALYTICS & RECURRING PIPELINE
router.get('/analytics/funding', authenticateToken, requirePermission('view:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const totalDonors = await prisma.donor.count({ where: { organizationId: orgId } });
    const fundingAgg = await prisma.donor.aggregate({
      where: { organizationId: orgId },
      _sum: { totalDonated: true }
    });

    const typeBreakdown = await prisma.donor.groupBy({
      by: ['type'],
      where: { organizationId: orgId },
      _sum: { totalDonated: true },
      _count: { id: true }
    });

    const recurringPipeline = await prisma.donor.groupBy({
      by: ['frequency'],
      where: { organizationId: orgId },
      _sum: { totalDonated: true },
      _count: { id: true }
    });

    return res.json({
      totalDonors,
      totalCapitalRaised: fundingAgg._sum.totalDonated || 0,
      typeBreakdown: typeBreakdown.map(t => ({
        type: t.type,
        count: t._count.id,
        totalAmount: t._sum.totalDonated || 0
      })),
      recurringPipeline: recurringPipeline.map(r => ({
        frequency: r.frequency,
        count: r._count.id,
        totalAmount: r._sum.totalDonated || 0
      }))
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET SINGLE DONOR DETAILED PROFILE
router.get('/:id', authenticateToken, requirePermission('view:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const donor = await prisma.donor.findFirst({
      where: { id, organizationId: req.user!.organizationId },
      include: {
        donations: { orderBy: { date: 'desc' } },
        agreements: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found or access denied.' });
    }

    return res.json(donor);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. REGISTER DONOR / CSR PARTNER
router.post('/', authenticateToken, requirePermission('write:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      type,
      location,
      contactPerson,
      email,
      phone,
      panTaxNo,
      frequency,
      primaryProgram,
      totalDonated
    } = req.body;

    if (!name || !type || !location) {
      return res.status(400).json({ success: false, message: 'Donor name, type, and location are required.' });
    }

    const code = `DNR-2026-${type.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const donor = await prisma.donor.create({
      data: {
        donorCode: code,
        name,
        type: type as any,
        location,
        contactPerson: contactPerson || null,
        email: email ? email.trim().toLowerCase() : null,
        phone: phone || null,
        panTaxNo: panTaxNo || null,
        frequency: frequency || 'Monthly',
        status: 'Active',
        primaryProgram: primaryProgram as any || 'EDUCATION',
        totalDonated: parseFloat(String(totalDonated)) || 0,
        organizationId: req.user!.organizationId
      }
    });

    return res.status(201).json(donor);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. RECORD DONATION / GRANT DISBURSEMENT
router.post('/:id/donations', authenticateToken, requirePermission('write:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, programId, paymentMethod, frequency, txHash, date } = req.body;

    if (!amount || !programId) {
      return res.status(400).json({ success: false, message: 'Donation amount and program ID are required.' });
    }

    const donor = await prisma.donor.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    const donationDate = date ? new Date(date) : new Date();
    const donationAmount = parseFloat(String(amount));

    const donation = await prisma.donation.create({
      data: {
        donorId: id,
        amount: donationAmount,
        date: donationDate,
        programId,
        paymentMethod: paymentMethod || 'Bank Transfer',
        frequency: frequency || 'One-time',
        status: 'Completed',
        txHash: txHash || `TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`
      }
    });

    // Update Donor totals
    await prisma.donor.update({
      where: { id },
      data: {
        totalDonated: { increment: donationAmount },
        lastDonationDate: donationDate
      }
    });

    return res.status(201).json(donation);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. RECORD GRANT AGREEMENT / MOU
router.post('/:id/agreements', authenticateToken, requirePermission('write:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, grantAmount, startDate, endDate } = req.body;

    if (!title || !grantAmount || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Agreement title, grant amount, start date, and end date are required.' });
    }

    const donor = await prisma.donor.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    const agreementNo = `MOU-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const agreement = await prisma.donorAgreement.create({
      data: {
        donorId: id,
        agreementNo,
        title,
        grantAmount: parseFloat(String(grantAmount)),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'ACTIVE'
      }
    });

    return res.status(201).json(agreement);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 7. EDIT DONOR PROFILE
router.put('/:id', authenticateToken, requirePermission('write:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.donor.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    const updated = await prisma.donor.update({
      where: { id },
      data: {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.type && { type: req.body.type as any }),
        ...(req.body.location && { location: req.body.location }),
        ...(req.body.contactPerson !== undefined && { contactPerson: req.body.contactPerson }),
        ...(req.body.email !== undefined && { email: req.body.email }),
        ...(req.body.phone !== undefined && { phone: req.body.phone }),
        ...(req.body.panTaxNo !== undefined && { panTaxNo: req.body.panTaxNo }),
        ...(req.body.frequency && { frequency: req.body.frequency }),
        ...(req.body.status && { status: req.body.status }),
        ...(req.body.primaryProgram && { primaryProgram: req.body.primaryProgram as any })
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 8. DELETE DONOR
router.delete('/:id', authenticateToken, requirePermission('write:donations'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.donor.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    await prisma.donor.delete({ where: { id } });

    return res.json({ success: true, message: 'Donor record deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

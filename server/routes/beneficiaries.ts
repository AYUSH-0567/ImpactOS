import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { AutomationPipelineService } from '../services/automationService';

const router = Router();
const prisma = new PrismaClient();

// Multer Storage Setup
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// 1. GET ALL BENEFICIARIES (Multi-tenant, Search, Filter & Pagination)
router.get('/', authenticateToken, requirePermission('view:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, gender, state, status, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 50));
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      organizationId: req.user!.organizationId // Scoped strictly to session org
    };

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { beneficiaryCode: { contains: q } },
        { district: { contains: q } },
        { phone: { contains: q } }
      ];
    }

    if (gender && gender !== 'All') whereClause.gender = String(gender);
    if (state && state !== 'All States') whereClause.state = String(state);
    if (status && status !== 'All Statuses') whereClause.status = String(status);

    const [totalCount, beneficiaries] = await Promise.all([
      prisma.beneficiary.count({ where: whereClause }),
      prisma.beneficiary.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        include: {
          documents: true,
          attendance: { orderBy: { date: 'desc' }, take: 5 },
          enrollments: true,
          history: { orderBy: { timestamp: 'desc' }, take: 5 }
        },
        orderBy: { registrationDate: 'desc' }
      })
    ]);

    return res.json({
      beneficiaries,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        pageSize: limitNum
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET SINGLE BENEFICIARY DETAILED PROFILE
router.get('/:id', authenticateToken, requirePermission('view:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const beneficiary = await prisma.beneficiary.findFirst({
      where: { id, organizationId: req.user!.organizationId },
      include: {
        documents: { orderBy: { uploadedAt: 'desc' } },
        attendance: { orderBy: { date: 'desc' } },
        enrollments: { orderBy: { enrolledAt: 'desc' } },
        history: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found or access denied.' });
    }

    return res.json(beneficiary);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. CREATE BENEFICIARY
router.post('/', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      beneficiaryCode,
      gender,
      age,
      phone,
      aadhaarMasked,
      district,
      state,
      incomeTier,
      address,
      status
    } = req.body;

    if (!name || !district || !state) {
      return res.status(400).json({ success: false, message: 'Name, district, and state are required.' });
    }

    const code = beneficiaryCode || `BEN-2026-${state.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const beneficiary = await prisma.beneficiary.create({
      data: {
        beneficiaryCode: code,
        name,
        gender: gender || 'Female',
        age: parseInt(String(age)) || 28,
        phone: phone || null,
        aadhaarMasked: aadhaarMasked || `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        district,
        state,
        incomeTier: incomeTier || 'Low Income',
        address: address || null,
        status: status || 'Active',
        organizationId: req.user!.organizationId // Scoped strictly to session org
      }
    });

    // Create Initial Audit History Event
    await prisma.beneficiaryHistory.create({
      data: {
        beneficiaryId: beneficiary.id,
        title: 'Beneficiary Profile Registered',
        description: `Profile initialized in ${district}, ${state} under organization tenant.`,
        category: 'REGISTRATION'
      }
    });

    return res.status(201).json(beneficiary);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. EDIT BENEFICIARY
router.put('/:id', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.beneficiary.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found or access denied.' });
    }

    const updated = await prisma.beneficiary.update({
      where: { id },
      data: {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.gender && { gender: req.body.gender }),
        ...(req.body.age !== undefined && { age: parseInt(String(req.body.age)) }),
        ...(req.body.phone !== undefined && { phone: req.body.phone }),
        ...(req.body.district && { district: req.body.district }),
        ...(req.body.state && { state: req.body.state }),
        ...(req.body.incomeTier !== undefined && { incomeTier: req.body.incomeTier }),
        ...(req.body.status && { status: req.body.status }),
        ...(req.body.address !== undefined && { address: req.body.address })
      }
    });

    // Audit Event
    await prisma.beneficiaryHistory.create({
      data: {
        beneficiaryId: updated.id,
        title: 'Profile Updated',
        description: `Demographic & status parameters updated by ${req.user!.name}.`,
        category: 'AUDIT'
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE BENEFICIARY
router.delete('/:id', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.beneficiary.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found or access denied.' });
    }

    await prisma.beneficiary.delete({ where: { id } });

    return res.json({ success: true, message: 'Beneficiary record deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. RECORD ATTENDANCE
router.post('/:id/attendance', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, date } = req.body;

    const existing = await prisma.beneficiary.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found.' });
    }

    const attendance = await prisma.beneficiaryAttendance.create({
      data: {
        beneficiaryId: id,
        status: status || 'PRESENT',
        notes: notes || null,
        date: date ? new Date(date) : new Date()
      }
    });

    await prisma.beneficiaryHistory.create({
      data: {
        beneficiaryId: id,
        title: `Attendance Marked: ${attendance.status}`,
        description: notes || `Attendance status recorded on ${new Date().toLocaleDateString()}`,
        category: 'ATTENDANCE'
      }
    });

    return res.status(201).json(attendance);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 7. RECORD PROGRAM ENROLLMENT
router.post('/:id/enrollments', authenticateToken, requirePermission('write:projects'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { programName, status } = req.body;

    if (!programName) {
      return res.status(400).json({ success: false, message: 'Program name is required.' });
    }

    const existing = await prisma.beneficiary.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found.' });
    }

    const enrollment = await prisma.beneficiaryEnrollment.create({
      data: {
        beneficiaryId: id,
        programName,
        status: status || 'ENROLLED'
      }
    });

    await prisma.beneficiaryHistory.create({
      data: {
        beneficiaryId: id,
        title: `Enrolled in '${programName}'`,
        description: `Status: ${enrollment.status}`,
        category: 'ENROLLMENT'
      }
    });

    return res.status(201).json(enrollment);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 8. UPLOAD BENEFICIARY DOCUMENT
router.post('/:id/documents', authenticateToken, requirePermission('write:projects'), upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const existing = await prisma.beneficiary.findFirst({
      where: { id, organizationId: req.user!.organizationId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found.' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;

    const doc = await prisma.beneficiaryDocument.create({
      data: {
        beneficiaryId: id,
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });

    await prisma.beneficiaryHistory.create({
      data: {
        beneficiaryId: id,
        title: 'Verification Document Attached',
        description: `Uploaded file '${req.file.originalname}' (${(req.file.size / 1024).toFixed(1)} KB).`,
        category: 'DOCUMENT'
      }
    });

    return res.status(201).json(doc);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 9. BULK CSV IMPORT
router.post('/import', authenticateToken, requirePermission('admin:import'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const beneficiaries = req.body.records || req.body.beneficiaries;

    if (!Array.isArray(beneficiaries) || beneficiaries.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload. Array of beneficiaries or records required.' });
    }

    const createdRecords = [];
    for (const b of beneficiaries) {
      const code = b.beneficiaryCode || `BEN-2026-${(b.state || 'DL').substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const created = await prisma.beneficiary.create({
        data: {
          beneficiaryCode: code,
          name: b.name || 'Unnamed Beneficiary',
          gender: b.gender || 'Female',
          age: parseInt(String(b.age)) || 25,
          phone: b.phone || null,
          aadhaarMasked: b.aadhaarMasked || `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
          district: b.district || 'Central District',
          state: b.state || 'Delhi',
          incomeTier: b.incomeTier || 'Low Income',
          status: b.status || 'Active',
          organizationId: req.user!.organizationId // Scoped strictly to session org
        }
      });
      createdRecords.push(created);
    }

    // TRIGGER REUSABLE AUTOMATION PIPELINE (Validate -> Import -> Recalculate KPIs -> AI Insights -> Notify -> Update Reports)
    const automationResult = await AutomationPipelineService.triggerFullIngestionPipeline(
      req.user!.organizationId,
      createdRecords.length,
      req.body.fileName || 'beneficiaries_import.csv'
    );

    return res.json({
      success: true,
      importedCount: createdRecords.length,
      automationResult,
      records: createdRecords
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

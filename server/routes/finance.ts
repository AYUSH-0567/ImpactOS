import { prisma } from '../db.js';
import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';

const router = Router();

// 1. GET FINANCIAL KPIS & SUMMARY (Isolated to view:finance role permission)
router.get('/summary', authenticateToken, requirePermission('view:finance'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    // Total Grants & Income Inflow from Donors
    const donorAgg = await prisma.donor.aggregate({
      where: { organizationId: orgId },
      _sum: { totalDonated: true }
    });
    const totalIncome = donorAgg._sum.totalDonated || 0;

    // Total Program & Project Allocated Budget
    const projectAgg = await prisma.project.aggregate({
      where: { organizationId: orgId },
      _sum: { budget: true, spent: true, beneficiariesReached: true }
    });
    const totalBudget = projectAgg._sum.budget || 0;
    const totalSpent = projectAgg._sum.spent || 0;
    const totalBeneficiaries = projectAgg._sum.beneficiariesReached || 1;

    // Capital Utilization & Burn Rate
    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const netBalance = totalIncome - totalSpent;
    const costPerBeneficiary = totalSpent > 0 ? totalSpent / totalBeneficiaries : 0;
    const socialRoiRatio = totalSpent > 0 ? (totalBeneficiaries * 1500) / totalSpent : 4.8;

    return res.json({
      totalIncome,
      totalBudget,
      totalSpent,
      netBalance,
      utilizationRate,
      costPerBeneficiary,
      socialRoiRatio: parseFloat(socialRoiRatio.toFixed(2))
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET LINE-ITEM EXPENSES
router.get('/expenses', authenticateToken, requirePermission('view:finance'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const expenses = await prisma.expense.findMany({
      where: {
        project: { organizationId: orgId } // Scoped via project tenant
      },
      include: {
        project: { select: { name: true, projectCode: true } }
      },
      orderBy: { date: 'desc' }
    });

    return res.json(expenses);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. LOG NEW EXPENSE RECORD (write:finance permission required)
router.post('/expenses', authenticateToken, requirePermission('write:finance'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, amount, projectId, approvedBy, vendor, receiptNumber, date } = req.body;

    if (!category || !amount || !projectId || !vendor) {
      return res.status(400).json({ success: false, message: 'Category, amount, project, and vendor are required.' });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: req.user!.organizationId }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
    }

    const expenseAmount = parseFloat(String(amount));

    const expense = await prisma.expense.create({
      data: {
        category,
        amount: expenseAmount,
        projectId,
        approvedBy: approvedBy || req.user!.name,
        vendor,
        receiptNumber: receiptNumber || `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: date ? new Date(date) : new Date(),
        organizationId: req.user!.organizationId
      }
    });

    // Update Project Spent Total
    await prisma.project.update({
      where: { id: projectId },
      data: { spent: { increment: expenseAmount } }
    });

    return res.status(201).json(expense);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. BUDGET VS ACTUAL REPORT
router.get('/budget-vs-actual', authenticateToken, requirePermission('view:finance'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const projects = await prisma.project.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        name: true,
        projectCode: true,
        category: true,
        budget: true,
        spent: true
      }
    });

    const report = projects.map(p => ({
      projectId: p.id,
      projectCode: p.projectCode,
      projectName: p.name,
      category: p.category,
      allocatedBudget: p.budget,
      actualSpent: p.spent,
      variance: p.budget - p.spent,
      utilizationPercentage: p.budget > 0 ? parseFloat(((p.spent / p.budget) * 100).toFixed(1)) : 0
    }));

    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 5. EXPENSE BREAKDOWN BY CATEGORY
router.get('/expense-breakdown', authenticateToken, requirePermission('view:finance'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const breakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        project: { organizationId: orgId }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    return res.json(breakdown.map(b => ({
      category: b.category,
      totalAmount: b._sum.amount || 0,
      count: b._count.id
    })));

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 6. CASH FLOW STATEMENT & FORECAST
router.get('/cash-flow', authenticateToken, requirePermission('view:finance'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const projects = await prisma.project.findMany({ where: { organizationId: orgId } });
    const donors = await prisma.donor.findMany({ where: { organizationId: orgId } });

    const totalIncome = donors.reduce((sum, d) => sum + d.totalDonated, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

    const cashFlowMonths = [
      { month: 'Q1 (Apr - Jun)', inflow: Math.round(totalIncome * 0.35), outflow: Math.round(totalSpent * 0.30) },
      { month: 'Q2 (Jul - Sep)', inflow: Math.round(totalIncome * 0.25), outflow: Math.round(totalSpent * 0.35) },
      { month: 'Q3 (Oct - Dec)', inflow: Math.round(totalIncome * 0.25), outflow: Math.round(totalSpent * 0.20) },
      { month: 'Q4 (Jan - Mar)', inflow: Math.round(totalIncome * 0.15), outflow: Math.round(totalSpent * 0.15) }
    ];

    const forecast = {
      projectedBurnRateMonthly: Math.round(totalSpent / 6),
      remainingBudget: Math.max(0, totalBudget - totalSpent),
      monthsCapitalRunway: totalSpent > 0 ? parseFloat(((totalBudget - totalSpent) / (totalSpent / 6)).toFixed(1)) : 12
    };

    return res.json({ cashFlowMonths, forecast });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

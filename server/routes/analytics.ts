import { prisma } from '../db.js';
import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { KPICalculationService } from '../services/kpiService';
import { AIImpactAnalystService } from '../services/aiAnalystService';
import { QueryAssistantService } from '../services/queryAssistantService';

const router = Router();

// GET LIVE DASHBOARD KPIS & CALCULATED STATS
router.get('/dashboard-kpis', authenticateToken, requirePermission('view:dashboard'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { region } = req.query;
    const kpis = await KPICalculationService.calculateOrganizationKPIs(
      req.user!.organizationId,
      region ? String(region) : undefined
    );
    return res.json(kpis);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET DASHBOARD SUMMARY FOR REPORTS
router.get('/dashboard-summary', authenticateToken, requirePermission('view:reports'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = await KPICalculationService.calculateOrganizationKPIs(req.user!.organizationId);
    return res.json(kpis);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET STATE IMPACT METRICS
router.get('/state-impact', authenticateToken, requirePermission('view:dashboard'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { organizationId: req.user!.organizationId }
    });

    const stateMap: Record<string, { reach: number; funding: number; count: number }> = {};

    projects.forEach(p => {
      if (!stateMap[p.state]) {
        stateMap[p.state] = { reach: 0, funding: 0, count: 0 };
      }
      stateMap[p.state].reach += p.beneficiariesReached;
      stateMap[p.state].funding += p.budget;
      stateMap[p.state].count += 1;
    });

    const result = Object.entries(stateMap).map(([state, data]) => ({
      state,
      reach: data.reach,
      fundingLakhs: Math.round(data.funding / 100000),
      projectsCount: data.count,
      beneficiaries: data.reach
    }));

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET AI INSIGHTS (Deterministic AI Impact Analyst Engine)
router.get('/ai-insights', authenticateToken, requirePermission('view:ai_insights'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const insights = await AIImpactAnalystService.generateTraceableInsights(req.user!.organizationId);
    return res.json(insights);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST INTERACTIVE QUERY ASSISTANT
router.post('/query-assistant', authenticateToken, requirePermission('view:ai_insights'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query string is required.' });
    }

    const result = await QueryAssistantService.answerQuery(req.user!.organizationId, String(query));
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

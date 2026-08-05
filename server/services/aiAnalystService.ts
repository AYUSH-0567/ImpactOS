import { prisma } from '../db.js';


export interface TraceableInsight {
  id: string;
  category: 'DUPLICATE_DETECTION' | 'BUDGET_ANOMALY' | 'UNDERPERFORMING_PROGRAM' | 'MOBILIZATION_DECLINE' | 'VOLUNTEER_SHORTAGE';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  confidence: number;
  evidence: string[];
  dataSource: string;
  timePeriod: string;
  recommendedInvestigation: string;
  affectedRecordIds: string[];
  createdAt: string;
}

export class AIImpactAnalystService {
  /**
   * Deterministically analyzes stored organization database records to generate traceable, zero-hallucination insights.
   */
  public static async generateTraceableInsights(organizationId: string): Promise<TraceableInsight[]> {
    const insights: TraceableInsight[] = [];

    // 1. Fetch Organization Database Records
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { organizationId },
      include: { attendance: true }
    });

    const projects = await prisma.project.findMany({
      where: { organizationId }
    });

    const volunteers = await prisma.volunteer.findMany({
      where: { organizationId },
      include: { assignments: true }
    });

    const events = await prisma.volunteerEvent.findMany({});

    // ----------------------------------------------------
    // DETECTOR 1: DUPLICATE BENEFICIARY DETECTION
    // ----------------------------------------------------
    const phoneMap: Record<string, typeof beneficiaries> = {};
    const nameDistrictMap: Record<string, typeof beneficiaries> = {};

    beneficiaries.forEach(b => {
      if (b.phone && b.phone.trim().length > 5) {
        const cleanPhone = b.phone.replace(/[^0-9]/g, '');
        if (!phoneMap[cleanPhone]) phoneMap[cleanPhone] = [];
        phoneMap[cleanPhone].push(b);
      }

      const key = `${b.name.toLowerCase().trim()}_${b.district.toLowerCase().trim()}`;
      if (!nameDistrictMap[key]) nameDistrictMap[key] = [];
      nameDistrictMap[key].push(b);
    });

    Object.entries(phoneMap).forEach(([phone, matches]) => {
      if (matches.length > 1) {
        insights.push({
          id: `INS-DUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'DUPLICATE_DETECTION',
          title: `Duplicate Beneficiary Registration Detected (Phone: +${phone})`,
          severity: 'HIGH',
          confidence: 98,
          evidence: matches.map(m => `Beneficiary '${m.name}' (Code: ${m.beneficiaryCode}, District: ${m.district}) shares phone +${phone}`),
          dataSource: 'Database Table: beneficiaries (WHERE organizationId = req.user.organizationId)',
          timePeriod: 'Active Database Registry',
          recommendedInvestigation: 'Conduct field phone verification to confirm duplicate registrations vs shared household contacts.',
          affectedRecordIds: matches.map(m => m.id),
          createdAt: new Date().toISOString()
        });
      }
    });

    Object.entries(nameDistrictMap).forEach(([key, matches]) => {
      if (matches.length > 1) {
        const first = matches[0];
        insights.push({
          id: `INS-DUP-NAME-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'DUPLICATE_DETECTION',
          title: `Identical Beneficiary Name & Location Match ('${first.name}' in ${first.district})`,
          severity: 'MEDIUM',
          confidence: 92,
          evidence: matches.map(m => `Record Code ${m.beneficiaryCode}: '${m.name}' registered in ${m.district}, ${m.state} on ${new Date(m.registrationDate).toLocaleDateString()}`),
          dataSource: 'Database Table: beneficiaries (WHERE organizationId = req.user.organizationId)',
          timePeriod: 'Active Database Registry',
          recommendedInvestigation: 'Inspect registration timestamps and Aadhaar attachments to merge duplicate field records.',
          affectedRecordIds: matches.map(m => m.id),
          createdAt: new Date().toISOString()
        });
      }
    });

    // ----------------------------------------------------
    // DETECTOR 2: BUDGET ANOMALY & BURN RATE DETECTION
    // ----------------------------------------------------
    projects.forEach(p => {
      const burnRate = p.budget > 0 ? p.spent / p.budget : 0;
      const progressRatio = p.progress / 100;

      if (burnRate > 0.75 && progressRatio < 0.40) {
        insights.push({
          id: `INS-BUDGET-${p.id}`,
          category: 'BUDGET_ANOMALY',
          title: `Capital Burn Anomaly in Project '${p.name}'`,
          severity: 'CRITICAL',
          confidence: 96,
          evidence: [
            `Project Budget: ₹${(p.budget / 100000).toFixed(2)} Lakhs | Spent: ₹${(p.spent / 100000).toFixed(2)} Lakhs (${(burnRate * 100).toFixed(1)}% burn rate)`,
            `Field Progress: ${p.progress}% completed (Progress deficit: ${(burnRate * 100 - p.progress).toFixed(1)}%)`,
            `Lead Manager: ${p.lead} | State: ${p.state}`
          ],
          dataSource: 'Database Table: projects (WHERE organizationId = req.user.organizationId)',
          timePeriod: `Project Term: ${new Date(p.startDate).toLocaleDateString()} — ${new Date(p.endDate).toLocaleDateString()}`,
          recommendedInvestigation: 'Audit vendor disbursement vouchers and line-item field expenses to explain capital burn ahead of milestone achievements.',
          affectedRecordIds: [p.id],
          createdAt: new Date().toISOString()
        });
      }
    });

    // ----------------------------------------------------
    // DETECTOR 3: UNDERPERFORMING PROGRAM DETECTION
    // ----------------------------------------------------
    projects.forEach(p => {
      const reachRatio = p.beneficiariesTarget > 0 ? p.beneficiariesReached / p.beneficiariesTarget : 1;

      if (p.risk === 'HIGH' || p.risk === 'CRITICAL' || p.status === 'AT_RISK' || reachRatio < 0.45) {
        insights.push({
          id: `INS-PERF-${p.id}`,
          category: 'UNDERPERFORMING_PROGRAM',
          title: `Underperforming Field Initiative: '${p.name}'`,
          severity: p.risk === 'HIGH' || p.risk === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          confidence: 94,
          evidence: [
            `Target Reach: ${p.beneficiariesTarget.toLocaleString()} beneficiaries | Actual Reached: ${p.beneficiariesReached.toLocaleString()} (${(reachRatio * 100).toFixed(1)}% target completion)`,
            `Risk Level: ${p.risk} | Status: ${p.status}`,
            `Location: ${p.district}, ${p.state}`
          ],
          dataSource: 'Database Table: projects (WHERE organizationId = req.user.organizationId)',
          timePeriod: `Active Project Window: ${new Date(p.startDate).toLocaleDateString()} — Present`,
          recommendedInvestigation: 'Review field mobilization strategy and reallocate regional field workers to accelerate beneficiary onboarding.',
          affectedRecordIds: [p.id],
          createdAt: new Date().toISOString()
        });
      }
    });

    // ----------------------------------------------------
    // DETECTOR 4: DECLINING ATTENDANCE DETECTION
    // ----------------------------------------------------
    beneficiaries.forEach(b => {
      const absentCount = b.attendance?.filter(a => a.status === 'ABSENT').length || 0;
      if (absentCount >= 2) {
        insights.push({
          id: `INS-ATT-BEN-${b.id}`,
          category: 'MOBILIZATION_DECLINE',
          title: `Beneficiary Attendance Drop Detected ('${b.name}')`,
          severity: 'MEDIUM',
          confidence: 91,
          evidence: [
            `Beneficiary Code ${b.beneficiaryCode}: ${absentCount} missed field sessions recorded`,
            `District: ${b.district}, ${b.state} • Status: ${b.status}`
          ],
          dataSource: 'Database Table: beneficiary_attendance',
          timePeriod: 'Recent Session Records',
          recommendedInvestigation: 'Conduct field visit to evaluate transportation or schedule conflicts preventing attendance.',
          affectedRecordIds: [b.id],
          createdAt: new Date().toISOString()
        });
      }
    });

    // ----------------------------------------------------
    // DETECTOR 5: VOLUNTEER SHORTAGE DETECTION
    // ----------------------------------------------------
    events.forEach(evt => {
      if (evt.volunteersAssigned < 5) {
        insights.push({
          id: `INS-VOL-SHORTAGE-${evt.id}`,
          category: 'VOLUNTEER_SHORTAGE',
          title: `Field Volunteer Shortage in '${evt.title}'`,
          severity: 'HIGH',
          confidence: 95,
          evidence: [
            `Volunteers Assigned: ${evt.volunteersAssigned} assigned (Target: 10 field volunteers)`,
            `Event Location: ${evt.location} | Date: ${new Date(evt.date).toLocaleDateString()}`
          ],
          dataSource: 'Database Table: volunteer_events',
          timePeriod: `Upcoming Event: ${new Date(evt.date).toLocaleDateString()}`,
          recommendedInvestigation: 'Issue regional volunteer mobilization broadcast to assign available field volunteers.',
          affectedRecordIds: [evt.id],
          createdAt: new Date().toISOString()
        });
      }
    });

    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, INFO: 3 };
    insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return insights;
  }
}

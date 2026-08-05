import { 
  Project, 
  Beneficiary, 
  Donor, 
  Donation, 
  Volunteer, 
  VolunteerEvent,
  ExpenseItem, 
  AttentionAlert, 
  ActivityItem, 
  StateImpact, 
  AiInsight 
} from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-101',
    organizationId: 'org-impactos-01',
    name: 'Pratham Shiksha — Digital Learning Labs',
    category: 'Education',
    state: 'Haryana',
    district: 'Gurugram',
    lead: 'Dr. Ananya Sharma',
    budget: 4500000,
    spent: 3820000,
    progress: 85,
    beneficiariesTarget: 6000,
    beneficiariesReached: 5420,
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    status: 'On Track',
    risk: 'Low',
    description: 'Equipping 45 rural government schools with solar-powered smart digital labs, tablets, and interactive STEM software.',
    milestones: [
      { title: 'School Site Surveys & Solar Installs', completed: true, dueDate: '2025-06-30' },
      { title: 'Tablet Distribution & Network Setup', completed: true, dueDate: '2025-09-30' },
      { title: 'Teacher Training Workshops (Phase 1)', completed: true, dueDate: '2025-12-15' },
      { title: 'Mid-Term Learning Outcome Evaluation', completed: false, dueDate: '2026-02-28' },
    ],
    keyOutcomes: ['38% increase in math proficiency', '94% student attendance rate', '45 teachers certified in digital pedagogy']
  },
  {
    id: 'PRJ-102',
    name: 'Aarogya Seva — Rural Mobile Health Vans',
    category: 'Healthcare',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    lead: 'Dr. Rajesh Verma',
    budget: 6800000,
    spent: 6150000,
    progress: 92,
    beneficiariesTarget: 12000,
    beneficiariesReached: 11450,
    startDate: '2025-01-15',
    endDate: '2026-01-14',
    status: 'At Risk',
    risk: 'High',
    description: 'Deploying 4 specialized medical vans with tele-consultation, diagnostic kits, and maternal health monitoring across remote blocks.',
    milestones: [
      { title: 'Van Fleet Acquisition & Customization', completed: true, dueDate: '2025-03-15' },
      { title: 'Medical Staff & Driver Recruitment', completed: true, dueDate: '2025-04-30' },
      { title: '10,000 Health Checkups Milestone', completed: true, dueDate: '2025-10-31' },
      { title: 'Budget Allocation for Q4 Supplies', completed: false, dueDate: '2025-12-31' }
    ],
    keyOutcomes: ['11,450 patients screened', '1,840 high-risk pregnancies detected & referred', 'Free diagnostic tests provided']
  },
  {
    id: 'PRJ-103',
    name: 'Nari Shakti — Micro-Enterprise Incubator',
    category: 'Women Empowerment',
    state: 'Rajasthan',
    district: 'Jaipur',
    lead: 'Sunita Meena',
    budget: 3200000,
    spent: 2400000,
    progress: 75,
    beneficiariesTarget: 3500,
    beneficiariesReached: 2980,
    startDate: '2025-05-01',
    endDate: '2026-04-30',
    status: 'On Track',
    risk: 'Low',
    description: 'Empowering women Self-Help Groups (SHGs) through artisan craft training, micro-grants, and digital storefront setup.',
    milestones: [
      { title: 'SHG Formation & Need Assessment', completed: true, dueDate: '2025-06-30' },
      { title: 'Artisan & Financial Literacy Bootcamps', completed: true, dueDate: '2025-09-15' },
      { title: 'Seed Grant Disbursement to 120 SHGs', completed: true, dueDate: '2025-11-30' },
      { title: 'E-commerce Integration & Fair Trade Expo', completed: false, dueDate: '2026-03-15' }
    ],
    keyOutcomes: ['2,980 women earning independent income', 'Average monthly income boosted by 140%', '120 active micro-enterprises']
  },
  {
    id: 'PRJ-104',
    name: 'Kaushal Vikas — Youth Tech Apprenticeships',
    category: 'Skill Development',
    state: 'Delhi',
    district: 'South Delhi',
    lead: 'Vikram Singh',
    budget: 5000000,
    spent: 4750000,
    progress: 95,
    beneficiariesTarget: 2000,
    beneficiariesReached: 1920,
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    status: 'Completed',
    risk: 'Low',
    description: 'Providing job-linked software coding, hardware repair, and digital marketing bootcamps to underrepresented urban youth.',
    milestones: [
      { title: 'Curriculum Alignment with Industry Needs', completed: true, dueDate: '2025-03-01' },
      { title: 'Cohort 1 & 2 Graduation', completed: true, dueDate: '2025-07-31' },
      { title: 'Placement Drive with 35 Partner Firms', completed: true, dueDate: '2025-11-15' }
    ],
    keyOutcomes: ['78% job placement rate', 'Average starting salary of ₹24,000/month', '1,920 youth skilled']
  },
  {
    id: 'PRJ-105',
    name: 'Jal Raksha — Rainwater Harvesting & Watershed',
    category: 'Environment',
    state: 'Maharashtra',
    district: 'Pune',
    lead: 'Rohan Kulkarni',
    budget: 4200000,
    spent: 3100000,
    progress: 68,
    beneficiariesTarget: 15000,
    beneficiariesReached: 10500,
    startDate: '2025-03-15',
    endDate: '2026-05-14',
    status: 'On Track',
    risk: 'Medium',
    description: 'Constructing check dams, recharge wells, and drip irrigation systems in drought-prone farming villages.',
    milestones: [
      { title: 'Hydrological Mapping & Geo-Surveys', completed: true, dueDate: '2025-05-15' },
      { title: 'Construction of 12 Check Dams', completed: true, dueDate: '2025-10-31' },
      { title: 'Community Water Management Committees', completed: false, dueDate: '2026-02-15' }
    ],
    keyOutcomes: ['4.5 Million Liters annual water storage created', 'Water table raised by 1.8m', '1,200 farming families benefited']
  },
  {
    id: 'PRJ-106',
    name: 'Shiksha Setu — Girls Secondary Education',
    category: 'Education',
    state: 'Bihar',
    district: 'Patna',
    lead: 'Pooja Kumari',
    budget: 3800000,
    spent: 3450000,
    progress: 60,
    beneficiariesTarget: 4000,
    beneficiariesReached: 2800,
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    status: 'Delayed',
    risk: 'High',
    description: 'Preventing school dropouts among adolescent girls via bicycle distribution, remedial tutoring, and sanitation kit supply.',
    milestones: [
      { title: 'Enrollment Drive & Dropout Mapping', completed: true, dueDate: '2025-07-15' },
      { title: 'Bicycle Distribution to 1,200 Girls', completed: true, dueDate: '2025-10-15' },
      { title: 'Remedial Learning Center Operations', completed: false, dueDate: '2026-01-31' }
    ],
    keyOutcomes: ['Dropout rate reduced by 62%', '2,800 girls re-enrolled', '100% menstrual hygiene awareness']
  }
];

export const STATE_IMPACT_DATA: StateImpact[] = [
  { stateId: 'IN-HR', name: 'Haryana', projectsCount: 4, beneficiariesCount: 8400, fundingAllocated: 6500000, volunteersCount: 95, healthIndex: 88 },
  { stateId: 'IN-DL', name: 'Delhi', projectsCount: 3, beneficiariesCount: 6200, fundingAllocated: 5800000, volunteersCount: 140, healthIndex: 92 },
  { stateId: 'IN-UP', name: 'Uttar Pradesh', projectsCount: 5, beneficiariesCount: 18500, fundingAllocated: 11200000, volunteersCount: 110, healthIndex: 74 },
  { stateId: 'IN-RJ', name: 'Rajasthan', projectsCount: 3, beneficiariesCount: 5400, fundingAllocated: 4600000, volunteersCount: 65, healthIndex: 82 },
  { stateId: 'IN-MH', name: 'Maharashtra', projectsCount: 2, beneficiariesCount: 12100, fundingAllocated: 5200000, volunteersCount: 85, healthIndex: 90 },
  { stateId: 'IN-BR', name: 'Bihar', projectsCount: 3, beneficiariesCount: 9800, fundingAllocated: 4900000, volunteersCount: 75, healthIndex: 68 }
];

export const ATTENTION_ALERTS: AttentionAlert[] = [
  {
    id: 'ALT-01',
    severity: 'High',
    title: 'Healthcare Budget Depletion Warning',
    explanation: 'Aarogya Seva (UP) has utilized 90.4% of total grant budget with 2 months remaining in project lifecycle.',
    relevantMetric: '₹61.5L spent of ₹68L',
    actionText: 'Review Expense Requests',
    category: 'Budget',
    projectId: 'PRJ-102'
  },
  {
    id: 'ALT-02',
    severity: 'Medium',
    title: 'Volunteer Drop in Bihar Region',
    explanation: 'Volunteer active participation in Patna district decreased by 8.4% over the last 30 days during harvests.',
    relevantMetric: '75 active vs 82 target',
    actionText: 'Launch Campaign',
    category: 'Volunteer'
  },
  {
    id: 'ALT-03',
    severity: 'High',
    title: 'Shiksha Setu Milestone Delayed',
    explanation: 'Remedial Learning Center rollout in Gaya is 18 days behind schedule due to vendor logistics.',
    relevantMetric: 'Delayed 18 Days',
    actionText: 'Escalate to Program Lead',
    category: 'Timeline',
    projectId: 'PRJ-106'
  },
  {
    id: 'ALT-04',
    severity: 'Medium',
    title: 'CSR Utilization Compliance Window',
    explanation: 'HDFC Parivartan FY25 grant (₹25 Lakhs) requires 80% expenditure audit proof within 14 calendar days.',
    relevantMetric: '14 Days Remaining',
    actionText: 'Generate Audit PDF',
    category: 'Grant'
  }
];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  { id: 'ACT-1', type: 'csr', title: '₹15,00,000 CSR Grant disburse approved by Infosys Foundation', timestamp: '2 hours ago', amount: '₹15.0 Lakhs', location: 'Bengaluru' },
  { id: 'ACT-2', type: 'milestone', title: 'Pratham Shiksha site setup completed in 12 Gurugram rural schools', timestamp: '4 hours ago', location: 'Gurugram, HR' },
  { id: 'ACT-3', type: 'beneficiary', title: '450 new adolescent girls enrolled in Shiksha Setu program', timestamp: 'Yesterday', location: 'Patna, BR' },
  { id: 'ACT-4', type: 'volunteer', title: 'Weekend Medical Camp completed — 820 rural patients examined', timestamp: '2 days ago', location: 'Varanasi, UP' },
  { id: 'ACT-5', type: 'donation', title: 'Individual Recurring Donor milestone reached (1,250 active donors)', timestamp: '3 days ago', amount: '₹4.2 Lakhs/mo' }
];

export const FUNDING_TRENDS = [
  { month: 'Apr', CSR: 18.5, Individual: 8.2, Grants: 12.0, total: 38.7 },
  { month: 'May', CSR: 22.0, Individual: 9.1, Grants: 10.5, total: 41.6 },
  { month: 'Jun', CSR: 19.8, Individual: 9.8, Grants: 15.0, total: 44.6 },
  { month: 'Jul', CSR: 25.4, Individual: 11.2, Grants: 14.2, total: 50.8 },
  { month: 'Aug', CSR: 28.0, Individual: 12.5, Grants: 18.0, total: 58.5 },
  { month: 'Sep', CSR: 32.5, Individual: 14.0, Grants: 22.0, total: 68.5 },
  { month: 'Oct', CSR: 30.1, Individual: 13.8, Grants: 20.5, total: 64.4 },
  { month: 'Nov', CSR: 36.8, Individual: 16.2, Grants: 25.0, total: 78.0 },
  { month: 'Dec', CSR: 42.0, Individual: 18.5, Grants: 30.0, total: 90.5 }
];

export const EXPENSE_CATEGORIES = [
  { name: 'Program Execution', value: 72, amount: 27500000, color: '#3b82f6' },
  { name: 'Admin & Operations', value: 12, amount: 4580000, color: '#10b981' },
  { name: 'Fundraising & Donor Care', value: 9, amount: 3430000, color: '#f59e0b' },
  { name: 'Equipment & Solar Labs', value: 5, amount: 1910000, color: '#8b5cf6' },
  { name: 'Logistics & Field Travel', value: 2, amount: 760000, color: '#ec4899' }
];

export const PROGRAM_IMPACT_METRICS = [
  { program: 'Education', beneficiaries: 12220, spendLakhs: 83.0, outcomeRate: 92, costPerBeneficiary: 679 },
  { program: 'Healthcare', beneficiaries: 11450, spendLakhs: 68.0, outcomeRate: 88, costPerBeneficiary: 593 },
  { program: 'Women Empowerment', beneficiaries: 2980, spendLakhs: 32.0, outcomeRate: 95, costPerBeneficiary: 1073 },
  { program: 'Skill Development', beneficiaries: 1920, spendLakhs: 50.0, outcomeRate: 84, costPerBeneficiary: 2604 },
  { program: 'Environment', beneficiaries: 10500, spendLakhs: 42.0, outcomeRate: 90, costPerBeneficiary: 400 }
];

export const AI_INSIGHTS: AiInsight[] = [
  {
    id: 'AI-101',
    type: 'trend',
    title: 'CSR Grants Acceleration in Q3',
    insight: 'Corporate CSR funding experienced a 28.4% Quarter-over-Quarter surge, driven primarily by Tech & Financial firms fulfilling FY25 CSR mandates.',
    impactScore: 'High',
    metricReference: '₹36.8L raised in Nov',
    recommendedAction: 'Submit follow-up proposals to Infosys & Tata Trusts for FY26 expansion before March 15.',
    program: 'Organization-Wide'
  },
  {
    id: 'AI-102',
    type: 'anomaly',
    title: 'Healthcare Cost Variance Detected',
    insight: 'Healthcare program spending per beneficiary (₹593) increased 14% faster than beneficiary reach growth due to emergency medical supplies restocking.',
    impactScore: 'High',
    metricReference: '90.4% budget utilized',
    recommendedAction: 'Audit mobile van medical procurement prices & renegotiate bulk supplier rates in Varanasi.',
    program: 'Healthcare'
  },
  {
    id: 'AI-103',
    type: 'risk',
    title: 'Shiksha Setu Dropout Risk Alert',
    insight: '18-day delay in Gaya learning center setup correlates with a 5.2% dip in weekly student engagement across surrounding villages.',
    impactScore: 'Medium',
    metricReference: '60% project progress',
    recommendedAction: 'Reallocate 2 field coordinators from Patna to expedite Gaya center installation.',
    program: 'Education'
  },
  {
    id: 'AI-104',
    type: 'forecast',
    title: 'Year-End Beneficiary Milestone Target',
    insight: 'Based on current monthly run-rate (3,200 new registrations/mo), ImpactOS models that total beneficiaries will exceed 32,000 by March 31, 2026 (+14% over annual target).',
    impactScore: 'High',
    metricReference: '24,850 current reached',
    recommendedAction: 'Prepare annual impact summary report for donor showcase ahead of April AGM.',
    program: 'Organization-Wide'
  },
  {
    id: 'AI-105',
    type: 'recommendation',
    title: 'Resource Optimization Opportunity',
    insight: 'Environment programs yield the highest cost efficiency at ₹400 per community member impacted, while Skill Development yields highest income conversion.',
    impactScore: 'Medium',
    metricReference: '₹400/beneficiary',
    recommendedAction: 'Bundle Skill Development bootcamps with Environmental SHGs to double household impact.',
    program: 'Skill Development'
  }
];

export const MOCK_DONORS: Donor[] = [
  { id: 'DNR-01', name: 'Tata Trusts Foundation', type: 'Foundation Grant', location: 'Mumbai, MH', totalDonated: 12500000, lastDonationDate: '2025-11-10', frequency: 'Annual', status: 'Active', primaryProgram: 'Education' },
  { id: 'DNR-02', name: 'Infosys Foundation', type: 'CSR Corporate', location: 'Bengaluru, KA', totalDonated: 8500000, lastDonationDate: '2025-11-20', frequency: 'Quarterly', status: 'Active', primaryProgram: 'Healthcare' },
  { id: 'DNR-03', name: 'HDFC Parivartan CSR', type: 'CSR Corporate', location: 'Mumbai, MH', totalDonated: 5000000, lastDonationDate: '2025-08-15', frequency: 'Quarterly', status: 'Active', primaryProgram: 'Women Empowerment' },
  { id: 'DNR-04', name: 'Azim Premji Philanthropic', type: 'Foundation Grant', location: 'Bengaluru, KA', totalDonated: 9200000, lastDonationDate: '2025-10-05', frequency: 'Annual', status: 'Active', primaryProgram: 'Education' },
  { id: 'DNR-05', name: 'Reliance CSR Foundation', type: 'CSR Corporate', location: 'Mumbai, MH', totalDonated: 6000000, lastDonationDate: '2025-09-12', frequency: 'Monthly', status: 'Active', primaryProgram: 'Environment' },
  { id: 'DNR-06', name: 'Dr. Rajiv & Meera Kapoor', type: 'Individual', location: 'Delhi, DL', totalDonated: 1200000, lastDonationDate: '2025-11-01', frequency: 'Monthly', status: 'Active', primaryProgram: 'Healthcare' },
  { id: 'DNR-07', name: 'Global Giving Impact Fund', type: 'Government', location: 'New Delhi, DL', totalDonated: 4500000, lastDonationDate: '2025-06-30', frequency: 'Annual', status: 'Active', primaryProgram: 'Skill Development' }
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: 'VOL-01', name: 'Aarav Mehta', email: 'aarav.m@gmail.com', phone: '+91 98765 43210', state: 'Delhi', city: 'South Delhi', skill: 'Tech & Data', hoursLogged: 142, eventsCount: 18, joinDate: '2024-03-15', status: 'Active', rating: 4.9 },
  { id: 'VOL-02', name: 'Priya Sharma', email: 'priya.s@yahoo.co.in', phone: '+91 98123 45678', state: 'Haryana', city: 'Gurugram', skill: 'Teaching', hoursLogged: 198, eventsCount: 26, joinDate: '2024-01-10', status: 'Active', rating: 5.0 },
  { id: 'VOL-03', name: 'Dr. Siddharth Rao', email: 'dr.siddharth@health.org', phone: '+91 97654 32109', state: 'Uttar Pradesh', city: 'Varanasi', skill: 'Medical', hoursLogged: 110, eventsCount: 12, joinDate: '2024-06-01', status: 'Active', rating: 4.8 },
  { id: 'VOL-04', name: 'Neha Gupta', email: 'neha.g@outlook.com', phone: '+91 96543 21098', state: 'Rajasthan', city: 'Jaipur', skill: 'Field Work', hoursLogged: 86, eventsCount: 9, joinDate: '2024-08-20', status: 'Active', rating: 4.7 },
  { id: 'VOL-05', name: 'Rohan Deshmukh', email: 'rohan.d@gmail.com', phone: '+91 95432 10987', state: 'Maharashtra', city: 'Pune', skill: 'Logistics', hoursLogged: 165, eventsCount: 21, joinDate: '2024-02-14', status: 'Active', rating: 4.9 }
];

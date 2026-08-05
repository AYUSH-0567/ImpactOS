export type Region = 'All India' | 'North Region' | 'West Region' | 'East Region' | 'South Region';
export type DateRange = 'This Month' | 'Last Month' | 'This Quarter' | 'FY 2025-26' | 'Custom';

export type ProgramCategory = 
  | 'Education' 
  | 'Healthcare' 
  | 'Women Empowerment' 
  | 'Skill Development' 
  | 'Environment'
  | 'EDUCATION'
  | 'HEALTHCARE'
  | 'WOMEN_EMPOWERMENT'
  | 'SKILL_DEVELOPMENT'
  | 'ENVIRONMENT';

export type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Completed' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RoleEnum = 
  | 'ADMINISTRATOR'
  | 'EXECUTIVE_DIRECTOR'
  | 'FINANCE_MANAGER'
  | 'PROGRAM_MANAGER'
  | 'VOLUNTEER_MANAGER'
  | 'DATA_ANALYST'
  | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleEnum;
  organizationId: string;
  organizationName: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive';
}

export interface ProjectMilestone {
  id?: string;
  title: string;
  dueDate: string;
  status?: string;
  completed?: boolean;
}

export interface Project {
  id: string;
  organizationId?: string;
  projectCode?: string;
  name: string;
  category: ProgramCategory;
  state: string;
  district: string;
  lead: string;
  budget: number; // in INR
  spent: number; // in INR
  progress: number; // 0 - 100
  beneficiariesTarget: number;
  beneficiariesReached: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  risk: RiskLevel;
  description: string;
  milestones?: ProjectMilestone[];
  keyOutcomes?: string[];
}

export interface BeneficiaryDocument {
  id: string;
  beneficiaryId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface BeneficiaryAttendance {
  id: string;
  beneficiaryId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
  notes?: string;
  createdAt: string;
}

export interface BeneficiaryEnrollment {
  id: string;
  beneficiaryId: string;
  programName: string;
  status: 'ENROLLED' | 'COMPLETED' | 'DROPPED';
  enrolledAt: string;
}

export interface BeneficiaryHistory {
  id: string;
  beneficiaryId: string;
  title: string;
  description: string;
  category: 'REGISTRATION' | 'ENROLLMENT' | 'DOCUMENT' | 'ATTENDANCE' | 'AUDIT';
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  organizationId?: string;
  beneficiaryCode: string;
  name: string;
  gender: 'Female' | 'Male' | 'Other';
  age: number;
  phone?: string;
  aadhaarMasked: string;
  district: string;
  state: string;
  program?: string;
  incomeTier?: string;
  registrationDate: string;
  status: 'Active' | 'Under Audit' | 'Graduated';
  address?: string;
  documents?: BeneficiaryDocument[];
  attendance?: BeneficiaryAttendance[];
  enrollments?: BeneficiaryEnrollment[];
  history?: BeneficiaryHistory[];
}

export interface DonorAgreement {
  id: string;
  donorId: string;
  title: string;
  agreementNo: string;
  grantAmount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
}

export interface Donor {
  id: string;
  organizationId?: string;
  donorCode?: string;
  name: string;
  type: 'CSR Corporate' | 'Individual' | 'Foundation Grant' | 'Government' | 'CSR_CORPORATE' | 'INDIVIDUAL' | 'FOUNDATION_GRANT' | 'GOVERNMENT';
  location: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  panTaxNo?: string;
  totalDonated: number;
  lastDonationDate?: string;
  frequency: 'One-time' | 'Monthly' | 'Quarterly' | 'Annual';
  status: 'Active' | 'Lapsed' | 'Pledged';
  primaryProgram: ProgramCategory;
  donations?: Donation[];
  agreements?: DonorAgreement[];
}

export interface Donation {
  id: string;
  organizationId?: string;
  donorName: string;
  donorType: Donor['type'];
  amount: number;
  date: string;
  program: ProgramCategory;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Processing';
  txHash: string;
}

export interface VolunteerCertificate {
  id: string;
  volunteerId: string;
  certificateNo: string;
  title: string;
  programName: string;
  issuedDate: string;
  hoursRecognized: number;
}

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  programName: string;
  role: string;
  assignedAt: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Volunteer {
  id: string;
  organizationId?: string;
  volunteerCode?: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  skill: string;
  availability?: string;
  hoursLogged: number;
  eventsCount: number;
  joinDate?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  rating: number;
  certificates?: VolunteerCertificate[];
  assignments?: VolunteerAssignment[];
}

export interface VolunteerEvent {
  id: string;
  organizationId?: string;
  title: string;
  location: string;
  date: string;
  program: ProgramCategory;
  volunteersAssigned: number;
  hoursSpent: number;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

export interface ExpenseItem {
  id: string;
  organizationId?: string;
  category: 'Program Execution' | 'Admin & Operations' | 'Fundraising' | 'Equipment & Supplies' | 'Travel & Logistics';
  amount: number;
  date: string;
  project: string;
  approvedBy: string;
  vendor: string;
  receiptNumber: string;
}

export interface AttentionAlert {
  id: string;
  severity: RiskLevel;
  title: string;
  explanation: string;
  relevantMetric: string;
  actionText: string;
  category: 'Budget' | 'Timeline' | 'Volunteer' | 'Grant' | 'Impact';
  projectId?: string;
}

export interface ActivityItem {
  id: string;
  type: 'donation' | 'milestone' | 'beneficiary' | 'volunteer' | 'csr';
  title: string;
  timestamp: string;
  amount?: string;
  location?: string;
  user?: string;
}

export interface StateImpact {
  stateId: string;
  name: string;
  projectsCount: number;
  beneficiariesCount: number;
  fundingAllocated: number; // in INR
  volunteersCount: number;
  healthIndex: number;
}

export interface AiInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'risk' | 'forecast' | 'recommendation';
  title: string;
  insight: string;
  impactScore: 'High' | 'Medium' | 'Low';
  metricReference: string;
  recommendedAction: string;
  program: ProgramCategory | 'Organization-Wide';
}

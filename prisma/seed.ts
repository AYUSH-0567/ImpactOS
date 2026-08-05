import { prisma } from '../server/db.js';
import bcrypt from 'bcryptjs';


async function main() {
  console.log('🌱 Starting ImpactOS Multi-Tenant Database Seeding...');

  // 1. Create Primary Organization
  const org = await prisma.organization.upsert({
    where: { fcraRegId: 'FCRA-2026-IND-01' },
    update: {},
    create: {
      name: 'ImpactOS NGO Foundation',
      fcraRegId: 'FCRA-2026-IND-01',
      tax80GId: '80G-DELHI-2024-9982',
      headquarters: 'New Delhi, India'
    }
  });

  console.log(`✅ Created Organization: ${org.name} (${org.id})`);

  // 2. Hash Password
  const passwordHash = await bcrypt.hash('ImpactOS2026!', 10);

  // 3. Create Demo Users across 7 RBAC Roles
  const demoUsers = [
    { email: 'admin@impactos.org', name: 'Ayush Sharma', role: 'ADMIN' },
    { email: 'director@impactos.org', name: 'Dr. Sunita Rao', role: 'DIRECTOR' },
    { email: 'finance@impactos.org', name: 'Rajesh Malhotra', role: 'FINANCE_LEAD' },
    { email: 'program@impactos.org', name: 'Ananya Verma', role: 'PROGRAM_MANAGER' },
    { email: 'volunteer@impactos.org', name: 'Vikram Singh', role: 'VOLUNTEER_MANAGER' },
    { email: 'analyst@impactos.org', name: 'Priya Nair', role: 'DATA_ANALYST' },
    { email: 'viewer@impactos.org', name: 'Kavita Patel', role: 'VIEWER' }
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role as any, isEmailVerified: true },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role as any,
        isEmailVerified: true,
        organizationId: org.id
      }
    });
  }

  console.log('✅ Created 7 RBAC Demo User Accounts with bcrypt hashes');

  // 4. Create Initial Programs
  const eduProgram = await prisma.program.create({
    data: {
      name: 'Pratham Shiksha Secondary Education',
      vertical: 'EDUCATION',
      organizationId: org.id
    }
  });

  const healthProgram = await prisma.program.create({
    data: {
      name: 'Aarogya Seva Mobile Clinics',
      vertical: 'HEALTHCARE',
      organizationId: org.id
    }
  });

  // 5. Create Initial Projects
  await prisma.project.upsert({
    where: { projectCode: 'PRJ-2026-DEL-01' },
    update: {},
    create: {
      projectCode: 'PRJ-2026-DEL-01',
      name: 'Digital STEM Labs in Govt Schools',
      category: 'EDUCATION',
      state: 'Haryana',
      district: 'Gurugram',
      lead: 'Ananya Verma',
      budget: 4500000,
      spent: 3200000,
      progress: 72,
      beneficiariesTarget: 6000,
      beneficiariesReached: 5420,
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      status: 'ON_TRACK',
      risk: 'LOW',
      description: 'Installing solar-powered computer labs in rural Gurugram schools.',
      organizationId: org.id,
      programId: eduProgram.id
    }
  });

  await prisma.project.upsert({
    where: { projectCode: 'PRJ-2026-UP-02' },
    update: {},
    create: {
      projectCode: 'PRJ-2026-UP-02',
      name: 'Varanasi Maternal Health Screening Vans',
      category: 'HEALTHCARE',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      lead: 'Rajesh Malhotra',
      budget: 6800000,
      spent: 4900000,
      progress: 65,
      beneficiariesTarget: 15000,
      beneficiariesReached: 11450,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2026-04-30'),
      status: 'AT_RISK',
      risk: 'HIGH',
      description: 'Mobile diagnostic screening fleet operating in peri-urban Varanasi.',
      organizationId: org.id,
      programId: healthProgram.id
    }
  });

  console.log('✅ Created Initial Multi-Tenant Projects');

  // 6. Create Initial Beneficiaries
  const initialBeneficiaries = [
    {
      beneficiaryCode: 'BEN-2026-DL-001',
      name: 'Sunita Devi',
      gender: 'Female',
      ageGroup: '26-50 Yrs',
      state: 'Delhi',
      district: 'Central Delhi',
      status: 'Active',
      incomeTier: '< ₹10,000/mo',
      phone: '+91 98102 33411',
      address: 'House #42, Paharganj, New Delhi'
    },
    {
      beneficiaryCode: 'BEN-2026-HR-002',
      name: 'Rahul Kumar',
      gender: 'Male',
      ageGroup: '7-15 Yrs',
      state: 'Haryana',
      district: 'Gurugram',
      status: 'Active',
      incomeTier: '₹10,000 - ₹20,000/mo',
      phone: '+91 98711 44522',
      address: 'Village Badshahpur, Gurugram'
    },
    {
      beneficiaryCode: 'BEN-2026-UP-003',
      name: 'Pooja Verma',
      gender: 'Female',
      ageGroup: '16-25 Yrs',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      status: 'Graduated',
      incomeTier: '< ₹10,000/mo',
      phone: '+91 94501 88933',
      address: 'Ward #12, Assi Ghat, Varanasi'
    },
    {
      beneficiaryCode: 'BEN-2026-RJ-004',
      name: 'Meena Sharma',
      gender: 'Female',
      ageGroup: '26-50 Yrs',
      state: 'Rajasthan',
      district: 'Jaipur',
      status: 'Active',
      incomeTier: '₹10,000 - ₹20,000/mo',
      phone: '+91 94140 22144',
      address: 'Sangeeta Colony, Amer Road, Jaipur'
    },
    {
      beneficiaryCode: 'BEN-2026-MH-005',
      name: 'Rohan Deshmukh',
      gender: 'Male',
      ageGroup: '16-25 Yrs',
      state: 'Maharashtra',
      district: 'Pune',
      status: 'Active',
      incomeTier: '₹20,000 - ₹35,000/mo',
      phone: '+91 98220 55655',
      address: 'Shivajinagar, Pune'
    }
  ];

  for (const b of initialBeneficiaries) {
    await prisma.beneficiary.upsert({
      where: { beneficiaryCode: b.beneficiaryCode },
      update: {},
      create: {
        ...b,
        programId: eduProgram.id,
        organizationId: org.id
      }
    });
  }

  // 7. Create Initial Donors
  await prisma.donor.upsert({
    where: { donorCode: 'DNR-CSR-001' },
    update: {},
    create: {
      donorCode: 'DNR-CSR-001',
      name: 'Tata Trusts CSR',
      type: 'CSR_CORPORATE',
      location: 'Mumbai, Maharashtra',
      totalDonated: 12500000,
      frequency: 'Annual',
      status: 'Active',
      primaryProgram: 'EDUCATION',
      organizationId: org.id
    }
  });

  console.log('🎉 Multi-Tenant Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

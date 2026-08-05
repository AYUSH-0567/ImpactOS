import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';


export async function runAuthSecurityTestSuite() {
  console.log('--------------------------------------------------');
  console.log('🔒 RUNNING AUTHENTICATION & SECURITY TEST SUITE');
  console.log('--------------------------------------------------\n');

  const testResults = {
    csrfProtectionEnforced: false,
    csrfHeaderAccepted: false,
    invalidCredentialsRejected: false,
    emptyFieldsRejected: false,
    rateLimiterActive: false,
    sessionPersistenceVerified: false,
    logoutInvalidatedSession: false,
    passed: true
  };

  try {
    const baseUrl = 'http://localhost:5000/api/v1';

    // Seed test org & test admin user if needed
    const org = await prisma.organization.upsert({
      where: { id: 'org-auth-test-01' },
      update: { name: 'Auth Test Org' },
      create: { id: 'org-auth-test-01', name: 'Auth Test Org', fcraRegId: 'FCRA-AUTH-TEST-2026', headquarters: 'Delhi' }
    });

    const hashedPw = await bcrypt.hash('TestAdminPass123!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'authtest@impactos.org' },
      update: { passwordHash: hashedPw, organizationId: org.id },
      create: {
        email: 'authtest@impactos.org',
        passwordHash: hashedPw,
        name: 'Auth Test Admin',
        role: 'ADMIN',
        organizationId: org.id
      }
    });

    // 1. TEST MISSING CSRF HEADER REJECTION
    console.log('[TEST 1] Testing CSRF Protection (Missing X-Requested-With header)...');
    const csrfFailRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'authtest@impactos.org', password: 'TestAdminPass123!' })
    });

    if (csrfFailRes.status === 403) {
      testResults.csrfProtectionEnforced = true;
      console.log('✅ TEST 1 PASSED: Missing CSRF header correctly rejected with HTTP 403.\n');
    } else {
      console.error(`❌ TEST 1 FAILED: Expected HTTP 403, got ${csrfFailRes.status}`);
      testResults.passed = false;
    }

    // 2. TEST VALID CSRF HEADER ACCEPTANCE & SUCCESSFUL LOGIN
    console.log('[TEST 2] Testing Successful Login with X-Requested-With header...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ email: 'authtest@impactos.org', password: 'TestAdminPass123!' })
    });

    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.success && loginData.user) {
      testResults.csrfHeaderAccepted = true;
      console.log(`✅ TEST 2 PASSED: Authenticated user '${loginData.user.name}' (${loginData.user.role}) for org '${loginData.user.organizationName}'.\n`);
    } else {
      console.error(`❌ TEST 2 FAILED: Login failed: ${loginData.message}`);
      testResults.passed = false;
    }

    // 3. TEST INVALID PASSWORD REJECTION
    console.log('[TEST 3] Testing Invalid Password Rejection...');
    const invalidPwRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ email: 'authtest@impactos.org', password: 'WrongPassword123!' })
    });

    if (invalidPwRes.status === 401 || invalidPwRes.status === 400) {
      testResults.invalidCredentialsRejected = true;
      console.log('✅ TEST 3 PASSED: Invalid password correctly rejected.\n');
    } else {
      console.error(`❌ TEST 3 FAILED: Invalid password not rejected cleanly (${invalidPwRes.status})`);
      testResults.passed = false;
    }

    // 4. TEST EMPTY FIELDS REJECTION
    console.log('[TEST 4] Testing Empty Fields Rejection...');
    const emptyRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({ email: '', password: '' })
    });

    if (emptyRes.status === 400 || emptyRes.status === 401) {
      testResults.emptyFieldsRejected = true;
      console.log('✅ TEST 4 PASSED: Empty fields correctly rejected.\n');
    } else {
      console.error(`❌ TEST 4 FAILED: Empty fields not rejected (${emptyRes.status})`);
      testResults.passed = false;
    }

    // 5. TEST GENUINE ORGANIZATION REGISTRATION FLOW
    console.log('[TEST 5] Testing Genuine Database Organization Registration Flow...');
    const regEmail = `regtest_${Date.now()}@newngo.org`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        email: regEmail,
        password: 'NewStrongPassword2026!',
        name: 'Anita Sharma',
        organizationName: 'New Horizon Foundation',
        fcraRegId: `FCRA-NH-${Date.now()}`
      })
    });

    const regData = await regRes.json();
    if (regRes.status === 201 && regData.success && regData.user) {
      // Verify database record
      const dbUser = await prisma.user.findUnique({
        where: { email: regEmail },
        include: { organization: true }
      });

      if (dbUser && dbUser.role === 'ADMIN' && dbUser.organization.name === 'New Horizon Foundation') {
        console.log(`✅ TEST 5 PASSED: Created database Org '${dbUser.organization.name}' (ID: ${dbUser.organizationId}) and Admin User '${dbUser.name}' (${dbUser.role}).\n`);
        // Clean up registered test records
        await prisma.user.delete({ where: { id: dbUser.id } });
        await prisma.organization.delete({ where: { id: dbUser.organizationId } });
      } else {
        console.error('❌ TEST 5 FAILED: Registered database user record mismatch.');
        testResults.passed = false;
      }
    } else {
      console.error(`❌ TEST 5 FAILED: Registration request failed (${regRes.status}): ${regData.message}`);
      testResults.passed = false;
    }

    // Clean up test data
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.organization.deleteMany({ where: { id: org.id } });

  } catch (err: any) {
    console.error('Auth Test Suite Error:', err);
    testResults.passed = false;
  }

  console.log('==================================================');
  console.log('AUTH TEST SUITE SUMMARY:', testResults);
  console.log('==================================================');

  return testResults;
}

runAuthSecurityTestSuite();

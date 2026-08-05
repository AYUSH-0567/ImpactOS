import React, { useState } from 'react';
import { AuthService, DEMO_USERS } from '../../services/authService';
import { User } from '../../types';
import { ImpactNetworkCanvas } from './ImpactNetworkCanvas';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Key,
  ChevronRight,
  User as UserIcon,
  Building2,
  FileCheck,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenMarketing?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onOpenMarketing }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [fcraRegId, setFcraRegId] = useState('');
  const [invitationToken, setInvitationToken] = useState('');

  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'reset'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyTokenInput, setVerifyTokenInput] = useState('');

  // Parallax
  const [parallax, setParallax] = useState({
    layer3: { x: 0, y: 0 },
    layer4: { x: 0, y: 0 }
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const normX = (clientX / innerWidth - 0.5);
    const normY = (clientY / innerHeight - 0.5);

    setParallax({
      layer3: { x: normX * 55, y: normY * 55 },
      layer4: { x: -normX * 25, y: -normY * 25 }
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const result = await AuthService.login(email, password, rememberMe);
        if (result.success && result.session) {
          onLoginSuccess(result.session.user);
        } else {
          setErrorMessage(result.error || 'Invalid email address or password.');
        }
      } else {
        const result = await AuthService.register({
          email,
          password,
          name,
          organizationName,
          fcraRegId,
          invitationToken: invitationToken || undefined
        });

        if (result.success && result.session) {
          if (result.verificationToken) {
            setVerifyTokenInput(result.verificationToken);
            setShowVerifyModal(true);
          }
          onLoginSuccess(result.session.user);
        } else {
          setErrorMessage(result.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (resetStep === 'request') {
      const res = await AuthService.forgotPassword(resetEmail || email);
      if (res.success) {
        if (res.resetToken) setResetTokenInput(res.resetToken);
        setResetStep('reset');
        setSuccessMessage('Password reset token generated. Enter new password below.');
      } else {
        setErrorMessage(res.error || 'Failed to process request.');
      }
    } else {
      const res = await AuthService.resetPassword(resetTokenInput, newPasswordInput);
      if (res.success) {
        setShowForgotPasswordModal(false);
        setSuccessMessage('Password updated successfully. Please sign in.');
        setResetStep('request');
      } else {
        setErrorMessage(res.error || 'Reset failed.');
      }
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await AuthService.verifyEmail(verifyTokenInput);
    if (res.success) {
      setShowVerifyModal(false);
      setSuccessMessage('Email address verified successfully!');
    } else {
      setErrorMessage(res.error || 'Email verification failed.');
    }
  };

  const handleQuickDemoSelect = (demoEmail: string) => {
    setAuthMode('login');
    setEmail(demoEmail);
    setPassword('ImpactOS2026!');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-[#f6f5ff] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-teal-100 selection:text-teal-900 relative overflow-x-hidden flex flex-col justify-between"
    >
      <ImpactNetworkCanvas />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 sm:py-12 lg:py-16 flex-1 flex flex-col justify-between">
        
        {/* Brand Bar */}
        <header className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              I
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                IMPACT<span className="text-teal-700">OS</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                NGO Data Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/80 border border-slate-200/80 px-3 py-1 rounded-full backdrop-blur-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Tenant HttpOnly Session Guard</span>
          </div>
        </header>

        {/* Asymmetric Core Layout Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto py-6">
          
          {/* Left Value Statement */}
          <div 
            className="lg:col-span-7 space-y-6 transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${parallax.layer3.x}px, ${parallax.layer3.y}px, 0)` }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> Production Auth & Multi-Tenant Scoping
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                See the impact behind <br className="hidden sm:block" />
                <span className="text-teal-800">the numbers.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Enterprise SaaS platform powering Indian NGOs with authenticated field telemetry, bcrypt encryption, signed session cookies, and 7-role access control.
              </p>
            </div>

            {/* Spatial Context Metric Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">48,700+</span>
                <span>Verified Reach</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-800 text-sm">1 : 4.8</span>
                <span>Social ROI Ratio</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-700 text-sm">100% FCRA</span>
                <span>Audit Readiness</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div 
            className="lg:col-span-5 transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${parallax.layer4.x}px, ${parallax.layer4.y}px, 0)` }}
          >
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
              
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                    authMode === 'login'
                      ? 'border-teal-700 text-teal-800'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                    authMode === 'register'
                      ? 'border-teal-700 text-teal-800'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Register Organization
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  {authMode === 'login' ? 'Sign in to ImpactOS' : 'Create Organization Workspace'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {authMode === 'login' 
                    ? 'Enter your authenticated credentials to access workspace telemetry.' 
                    : 'Setup a new multi-tenant organization account or join via invitation token.'}
                </p>
              </div>

              {/* Error & Success Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.org"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'register' ? 'Create a strong password' : '••••••••••••'}
                      className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Organization Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required={!invitationToken}
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="Enter your organization's legal or operating name"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">FCRA Registration ID (Optional)</label>
                      <div className="relative">
                        <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={fcraRegId}
                          onChange={(e) => setFcraRegId(e.target.value)}
                          placeholder="Enter FCRA registration ID (if applicable)"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Invitation Token (Optional)</label>
                      <input
                        type="text"
                        value={invitationToken}
                        onChange={(e) => setInvitationToken(e.target.value)}
                        placeholder="Enter invitation token (if joining an existing organization)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white transition font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Remember Me & Forgot Password Row */}
                {authMode === 'login' && (
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 text-xs">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-teal-700 focus:ring-teal-700 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Keep me signed in (30 days)</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); setShowForgotPasswordModal(true); setErrorMessage(null); }}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating Session...
                    </span>
                  ) : (
                    <>
                      {authMode === 'login' ? 'Sign In to Workspace' : 'Create Organization Account'} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Optional Development Demo Selector (Only visible if VITE_DEMO_MODE === 'true') */}
              {authMode === 'login' && import.meta.env.VITE_DEMO_MODE === 'true' && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Key className="w-3 h-3 text-teal-700" /> Development Evaluation Quick Selector
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    {Object.values(DEMO_USERS).map(({ user }) => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => handleQuickDemoSelect(user.email)}
                        className={`p-1.5 rounded-lg border text-left transition flex justify-between items-center cursor-pointer ${
                          email === user.email
                            ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                            : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{user.name.split(' ')[0]} ({user.role.split('_')[0]})</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </main>

        <footer className="pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2 font-mono">
          <span>© 2026 ImpactOS Foundation India</span>
          <span>HttpOnly Session Guard • Bcrypt Password Encryption • 7-Role RBAC</span>
        </footer>

      </div>

      {/* FORGOT / RESET PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-teal-700" /> Reset Password
              </h3>
              <button onClick={() => setShowForgotPasswordModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              {resetStep === 'request' ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Enter Registered Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="user@organization.org"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Reset Token</label>
                    <input
                      type="text"
                      required
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value)}
                      placeholder="reset_171000_..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">New Password (min 8 chars)</label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  {resetStep === 'request' ? 'Send Reset Token' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL VERIFICATION MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl text-xs font-sans animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verify Email Address
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Verification Token</label>
                <input
                  type="text"
                  required
                  value={verifyTokenInput}
                  onChange={(e) => setVerifyTokenInput(e.target.value)}
                  placeholder="verif_171000_..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold cursor-pointer"
                >
                  Confirm Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

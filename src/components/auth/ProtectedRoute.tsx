import React from 'react';
import { AuthService, Permission } from '../../services/authService';
import { Lock, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  requiredPermission?: Permission;
  children: React.ReactNode;
  onRedirectToLogin: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  children,
  onRedirectToLogin
}) => {
  const session = AuthService.getSession();

  if (!session) {
    onRedirectToLogin();
    return null;
  }

  if (requiredPermission && !AuthService.hasPermission(requiredPermission)) {
    return (
      <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-2xs text-center space-y-3 font-sans my-8">
        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted by RBAC Policy</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Your active role (<strong className="text-slate-800">{session.user.role}</strong>) does not hold the required <code className="font-mono text-teal-800 font-bold bg-teal-50 px-1 py-0.5 rounded">{requiredPermission}</code> permission to access this module.
        </p>
        <p className="text-[11px] text-slate-400">
          Contact your ImpactOS Organization Administrator to request access elevation.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

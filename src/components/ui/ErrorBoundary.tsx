import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ImpactOS Application Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f6f5ff] flex items-center justify-center p-6 font-sans">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Workspace Application Error</h1>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              ImpactOS encountered a runtime rendering exception.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg text-left text-[11px] font-mono text-slate-700 mb-6 overflow-x-auto border border-slate-200 max-h-32">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

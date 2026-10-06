/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  variant?: 'login' | 'admin-hero';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CommandCoreErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CommandCore3D Error]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isLogin = this.props.variant === 'login';

      return (
        <div 
          className={`flex flex-col items-center justify-center p-6 text-center select-none rounded-2xl border transition-all ${
            isLogin 
              ? 'w-full h-[320px] bg-black/60 border-rose-500/10 text-neutral-300 shadow-xl' 
              : 'w-full h-40 bg-rose-950/10 border-rose-500/15 text-neutral-300'
          }`}
          id="command-core-error-fallback"
        >
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 mb-3 animate-pulse">
            <AlertCircle size={24} />
          </div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-200">
            Render Core Restrained
          </h4>
          <p className="text-[10px] text-neutral-500 font-mono mt-1.5 leading-relaxed max-w-xs">
            A graphics exception occurred. The live 3D matrix is suspended, but studio configurations are intact.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-mono uppercase tracking-widest text-[#67b2b6] flex items-center space-x-1.5 transition-all text-xs cursor-pointer active:scale-95"
          >
            <RefreshCw size={10} className="animate-spin" />
            <span>Reset Graphics Device</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

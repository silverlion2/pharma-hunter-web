import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[BioQuantix ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Something went wrong</h2>
          <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
            The dashboard encountered an unexpected error. This is likely a temporary data issue. 
            Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs px-6 py-3 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            RELOAD PAGE
          </button>
          <p className="text-[10px] text-slate-600 mt-6 font-mono">
            {this.state.error?.message || 'Unknown error'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

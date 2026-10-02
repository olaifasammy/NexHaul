import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

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
    console.error("Uncaught render error:", error, errorInfo);
  }

  private handleRepairAndReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-white">Save State Sync Warning</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              An incompatible save file attribute was detected. Tap below to automatically repair and reload your logistics company!
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-rose-500/30 text-rose-400 text-[10px] font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleRepairAndReset}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repair & Refresh Fleet Storage</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


import React from 'react';
import { Upload, History } from 'lucide-react';

interface HeaderProps {
  onNewAnalysis?: () => void;
  onToggleHistory: () => void;
}

const ElectroRescueLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* PCB Board Outline */}
    <rect x="3" y="3" width="18" height="18" rx="4" />
    
    {/* Circuit Traces */}
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="8" r="2" />
    <path d="M8 10V12L12 14" />
    <path d="M16 10V12L12 14" />
    <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
    
    {/* Lightning Bolt Overlay (Bottom Left) */}
    <path d="M3 14H8C9.1 14 10 14.9 10 16V21H7C4.8 21 3 19.2 3 17V14Z" fill="currentColor" stroke="none" />
    <path d="M5.5 19L6.5 16.5H5L7 14.5L6 17H7.5L5.5 19Z" fill="#020617" stroke="none" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onNewAnalysis, onToggleHistory }) => {
  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNewAnalysis}>
          <div className="bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
            <ElectroRescueLogo className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              ElectroRescue<span className="text-emerald-400">AI</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Don't Throw - Re-Grow</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleHistory}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            title="Scan History"
          >
            <History className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">History</span>
          </button>
          <div className="h-6 w-px bg-slate-700 mx-1"></div>
          <button 
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">New Analysis</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

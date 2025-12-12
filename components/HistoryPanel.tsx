
import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect, 
  onClear,
  onDelete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-slate-900 h-full border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Scan History</h2>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
              {history.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm">No previous scans found.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className="group relative bg-slate-800/40 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/30 rounded-xl p-3 transition-all cursor-pointer overflow-hidden"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 shrink-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-700/50">
                    <img 
                      src={item.imageData} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-blue-400 text-xs font-bold font-mono px-1.5 py-0.5 bg-blue-500/10 rounded">
                        {item.result.pcbCategory || "PCB"}
                      </span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1
                        ${item.result.damageAssessment.conditionGrade === 'A' ? 'text-green-400 bg-green-500/10' :
                          item.result.damageAssessment.conditionGrade === 'B' ? 'text-blue-400 bg-blue-500/10' :
                          item.result.damageAssessment.conditionGrade === 'C' ? 'text-amber-400 bg-amber-500/10' :
                          'text-red-400 bg-red-500/10'
                        }
                      `}>
                         Grade {item.result.damageAssessment.conditionGrade}
                      </span>
                    </div>
                    
                    <h4 className="text-white text-sm font-medium truncate mb-1">
                      {item.result.finalValuation.asIsValue}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-between items-end pl-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button 
              onClick={onClear}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;

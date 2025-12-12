
import React, { useState } from 'react';
import { ProjectIdea } from '../types';
import { generateProjectIdeas } from '../services/geminiService';
import { X, Lightbulb, PenTool, Loader2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectCreator: React.FC<ProjectCreatorProps> = ({ isOpen, onClose }) => {
  const [components, setComponents] = useState('');
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!components.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const results = await generateProjectIdeas(components);
      setIdeas(results);
    } catch (err) {
      setError("Failed to generate ideas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className="relative bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-emerald-400" />
              Project Creator
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              List your components, and we'll suggest what to build.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Input Section */}
          <div className="w-full md:w-1/3 p-5 border-r border-slate-700 bg-slate-900/50 flex flex-col">
            <label className="text-sm font-medium text-slate-300 mb-2">My Available Components</label>
            <textarea
              className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none outline-none mb-4"
              placeholder="E.g., 2x Arduino Nano, 5x Servos, assorted LEDs, 10k resistors, breadboard..."
              value={components}
              onChange={(e) => setComponents(e.target.value)}
            />
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !components.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Brainstorming...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  Suggest Projects
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="w-full md:w-2/3 bg-slate-950 p-5 overflow-y-auto custom-scrollbar">
            {ideas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <div className="w-20 h-20 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center mb-4">
                  <PenTool className="w-8 h-8" />
                </div>
                <p>Enter your components to generate ideas</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Suggested Projects</h3>
                {ideas.map((project, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      {project.description}
                    </p>

                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-semibold text-slate-300 uppercase">Missing Components Required</span>
                      </div>
                      {project.missingComponents.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {project.missingComponents.map((item, i) => (
                            <span key={i} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>You have everything!</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreator;


import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ComponentList from './components/ComponentList';
import DamageReport from './components/DamageReport';
import ValuationPanel from './components/ValuationPanel';
import ChatWidget from './components/ChatWidget';
import HistoryPanel from './components/HistoryPanel';
import ProjectCreator from './components/ProjectCreator';
import { analyzePCBImage } from './services/geminiService';
import { AnalysisResult, AnalysisState, HistoryItem } from './types';
import { Lightbulb, PenTool, Sparkles, ArrowRight, X } from 'lucide-react';

const STORAGE_KEY = 'electro_rescue_history';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
    imagePreview: null,
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProjectCreatorOpen, setIsProjectCreatorOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (newItem: HistoryItem) => {
    setHistory(prev => {
      // Keep last 10 items to prevent storage quota issues
      const updated = [newItem, ...prev].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Storage quota exceeded", e);
        // Fallback: don't save to LS but update state
      }
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleImageSelect = async (file: File) => {
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      imagePreview: objectUrl,
      result: null // Reset previous result
    }));

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Extract base64 data (remove "data:image/jpeg;base64," prefix)
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        try {
          const result = await analyzePCBImage(base64Data, mimeType);
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            result
          }));

          // Save to History
          saveToHistory({
            id: Date.now().toString(),
            timestamp: Date.now(),
            result,
            imageData: base64String // Store full data URI for the thumbnail
          });
          
          // Scroll to results
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);

        } catch (apiError: any) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: apiError.message || "Failed to analyze image. Please try again."
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Error processing image file."
      }));
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setState({
      isLoading: false,
      result: item.result,
      error: null,
      imagePreview: item.imageData
    });
    // Scroll to results
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    // Note: We don't revokeObjectURL here if it came from history (string), 
    // but browser handles simple string garbage collection fine.
    setState({
      isLoading: false,
      result: null,
      error: null,
      imagePreview: null
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const capabilities = [
    { icon: "🔍", text: "Intelligent component identification for ICs, resistors, capacitors, and more" },
    { icon: "🔠", text: "High-accuracy OCR for part numbers, labels, and manufacturer markings" },
    { icon: "🔥", text: "Automatic detection of burn, heat, moisture, and corrosion damage" },
    { icon: "🟩", text: "Component condition grading (A–D) for fast evaluation 🟨🟧🟥" },
    { icon: "⚡", text: "Real-time defect detection using vision-based AI models" },
    { icon: "📋", text: "Instant component list generation with specifications" },
    { icon: "💰", text: "Estimation of component value and pricing—often lower than market rate" },
    { icon: "🚀", text: "Fast processing with clean, structured reports" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Header 
        onNewAnalysis={handleReset} 
        onToggleHistory={() => setIsHistoryOpen(true)}
      />

      <HistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
        onDelete={removeFromHistory}
      />

      <ProjectCreator 
        isOpen={isProjectCreatorOpen}
        onClose={() => setIsProjectCreatorOpen(false)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        
        {/* Intro Section - Full Width */}
        <div className="space-y-6 max-w-4xl">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
              Don’t Throw – Re-Grow
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
              Get a quick, intelligent overview of your PCB before taking any action. ELECTRORESCUE.AI analyzes the image and provides insights such as component detection, damage identification, and salvage valuation—all in one place.
            </p>
          </div>

          <div className="bg-slate-900/30 border-l-4 border-emerald-500/50 pl-6 py-2 rounded-r-lg">
            <h3 className="text-lg font-bold text-white mb-2">
              Overview
            </h3>
            <p className="text-slate-400 text-base leading-relaxed max-w-3xl">
              Upload a clear photo of any printed circuit board. Our system identifies the components, detects issues like burns, corrosion, or missing parts, and calculates component-level salvage value.
              <br className="my-2 block" />
              You can upload one PCB image at a time, and each analysis will automatically be saved in your History for later review.
            </p>
          </div>
        </div>

        {/* 1. Analysis Capabilities - Enhanced Visual Grid */}
        <div className="relative">
          {/* Subtle colorful glow behind */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-emerald-500/10 rounded-2xl blur-xl" />
          
          <div className="relative bg-slate-900/40 rounded-2xl p-6 border border-slate-800/50 backdrop-blur-sm shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              System Capabilities
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {capabilities.map((item, i) => (
                 <div 
                   key={i} 
                   className="group p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden"
                 >
                   {/* Background Emoji Watermark */}
                   <div className="absolute -top-2 -right-2 text-6xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity grayscale group-hover:grayscale-0 select-none">
                     {item.icon}
                   </div>
                   
                   <div className="relative z-10 flex flex-col gap-2">
                     <span className="text-2xl mb-1 filter drop-shadow-md">{item.icon}</span>
                     <p className="text-sm text-slate-300 group-hover:text-white font-medium leading-relaxed">
                        {item.text}
                     </p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Main Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* 2. Upload Area - Left 2/3 */}
          <div className="lg:col-span-2 relative flex flex-col h-full">
             {state.imagePreview ? (
               <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl h-full min-h-[350px]">
                 <img 
                   src={state.imagePreview} 
                   alt="PCB Preview" 
                   className="w-full h-full object-contain mx-auto bg-slate-950/50"
                 />
                 {!state.isLoading && (
                   <button 
                     onClick={handleReset}
                     className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-sm border border-slate-700 transition-colors"
                     title="Remove Image"
                   >
                     <X className="w-5 h-5" />
                   </button>
                 )}
                 {state.isLoading && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                     <div className="text-center">
                        <div className="inline-block w-16 h-1 w-16 bg-blue-500 rounded-full animate-ping mb-4"></div>
                        <p className="text-white font-mono animate-pulse">Scanning PCB topology...</p>
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <ImageUpload onImageSelect={handleImageSelect} isLoading={state.isLoading} />
             )}
             {state.error && (
               <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                 {state.error}
               </div>
             )}
          </div>

          {/* 3. Project Creator - Right 1/3 */}
          <div className="lg:col-span-1">
            <button 
              onClick={() => setIsProjectCreatorOpen(true)}
              className="group relative w-full rounded-xl border border-emerald-500/20 bg-slate-900/40 hover:bg-slate-900/60 p-6 text-left transition-all hover:border-emerald-500/50 overflow-hidden shadow-lg shadow-emerald-900/5 flex flex-col justify-between gap-4"
            >
               {/* Background Accent */}
               <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-all" />
               
               <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                     <PenTool className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                      Create Project <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    </h3>
                    <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                      Share your available components or let the AI read them from your PCB image. Our system will recommend personalized project ideas you can build today. Missing some components? Easily purchase it from our Buy section at a lower price.
                    </p>
                  </div>
               </div>
               
               <div className="relative z-10 flex items-center gap-2 text-emerald-400 font-medium text-sm mt-2 group-hover:gap-3 transition-all">
                 Start Now <ArrowRight className="w-4 h-4" />
               </div>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {state.result && (
          <div ref={scrollRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono rounded-full border border-blue-500/20">
                {state.result.pcbCategory || "General PCB"}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Components + Insights + Damage Report */}
              <div className="lg:col-span-2 space-y-6">
                <ComponentList components={state.result.components} summary={state.result.summary} />
                
                <div className="bg-slate-800/20 p-6 rounded-lg border border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Technical Insights
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {state.result.technicalInsights}
                  </p>
                  
                  {state.result.suggestions.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-800/50">
                        <h4 className="text-sm font-medium text-slate-400 mb-2">Suggestions</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                          {state.result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                     </div>
                  )}
                </div>

                {/* Damage Report moved here (Left Column) */}
                <DamageReport assessment={state.result.damageAssessment} />
              </div>

              {/* Right Column: Valuation Panel */}
              <div className="space-y-6">
                <ValuationPanel cost={state.result.costAnalysis} valuation={state.result.finalValuation} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Widget Overlay */}
      <ChatWidget />
    </div>
  );
};

export default App;

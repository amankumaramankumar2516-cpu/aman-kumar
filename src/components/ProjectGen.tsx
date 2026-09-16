import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Box, Terminal, CheckCircle2, Circle, Loader2, Play, Code2, Rocket, Download, ChevronRight, Check } from 'lucide-react';

import { Tooltip } from './ui/Tooltip';

const AGENTS = [
  { id: "planner", name: "Planner Agent", desc: "Analyzes the prompt, determines requirements, and creates the architectural blueprint." },
  { id: "ui", name: "UI Designer", desc: "Generates the design system, Tailwind configurations, and responsive component layouts." },
  { id: "database", name: "Database Agent", desc: "Provisions the database schema, creates tables, and sets up object-relational mappings." },
  { id: "coder", name: "Coding Agent", desc: "Writes the actual application code, connecting the frontend UI with backend APIs and state." },
  { id: "qa", name: "QA Agent", desc: "Runs automated tests to verify business logic, component rendering, and error handling." },
  { id: "security", name: "Security Agent", desc: "Scans for vulnerabilities, configures authentication rules, and ensures data privacy." },
  { id: "deployment", name: "Deployment Agent", desc: "Prepares production builds, optimizes assets, and configures hosting environments." },
  { id: "integrator", name: "Final Integrator", desc: "Stitches all agent outputs together, resolves conflicts, and finalizes the build." },
];

const VERIFICATION_STEPS = [
  "Frontend Architecture",
  "Backend Services",
  "Database Provisioning",
  "Authentication Setup",
  "Payment Gateways",
  "Admin Dashboard",
  "Responsive UI",
  "Security Scan",
  "Automated QA"
];

export default function ProjectGen() {
  const [prompt, setPrompt] = useState('');
  const [buildState, setBuildState] = useState<'idle' | 'analyzing' | 'building' | 'verifying' | 'complete'>('idle');
  
  // Analysis simulation
  const [extractedFeatures, setExtractedFeatures] = useState<string[]>([]);
  
  // Agent simulation
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  
  // Verification simulation
  const [verifiedSteps, setVerifiedSteps] = useState<string[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [extractedFeatures, activeAgentIndex, verifiedSteps, buildState]);

  const handleBuild = async () => {
    if (!prompt.trim()) return;
    
    // Reset states
    setBuildState('analyzing');
    setExtractedFeatures([]);
    setActiveAgentIndex(-1);
    setVerifiedSteps([]);
    
    // Step 1: Analyze Request
    await new Promise(r => setTimeout(r, 1200));
    
    const keywords = prompt.toLowerCase();
    const dynamicFeatures = [];
    if (keywords.includes('ecommerce') || keywords.includes('store') || keywords.includes('shop')) {
      dynamicFeatures.push("E-commerce platform detected", "Cart & Checkout required", "Payment system required");
    } else if (keywords.includes('ai') || keywords.includes('chat')) {
      dynamicFeatures.push("AI logic detected", "LLM integrations required", "Streaming interface required");
    } else {
      dynamicFeatures.push("Custom application structure detected", "Interactive components required");
    }
    
    dynamicFeatures.push("User accounts & authentication required", "Admin dashboard & analytics required");
    
    for (const feature of dynamicFeatures) {
      await new Promise(r => setTimeout(r, 400));
      setExtractedFeatures(prev => [...prev, feature]);
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 2: Agent Orchestrator
    setBuildState('building');
    for (let i = 0; i < AGENTS.length; i++) {
      setActiveAgentIndex(i);
      // random delay between 800ms and 1500ms
      await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    }
    setActiveAgentIndex(AGENTS.length); 
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 3: Final Integrator & Verification
    setBuildState('verifying');
    for (const step of VERIFICATION_STEPS) {
      await new Promise(r => setTimeout(r, 300));
      setVerifiedSteps(prev => [...prev, step]);
    }
    
    await new Promise(r => setTimeout(r, 800));
    setBuildState('complete');
  };

  return (
    <div className="flex flex-col h-full bg-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Terminal className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="font-bold text-white tracking-wide">NEXORA Core</h2>
          <p className="text-xs text-indigo-300 font-mono">Autonomous App Builder Protocol</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        
        {buildState === 'idle' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8 text-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
              <Layers className="w-10 h-10 text-indigo-400 relative z-10" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                What do you want to build?
              </h1>
              <p className="text-slate-400">
                Describe your app, website, or platform. NEXORA's AI Workforce will automatically orchestrate the architecture, design, and code in real-time.
              </p>
            </div>

            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuild()}
                  placeholder="e.g. Build a futuristic luxury e-commerce store with an admin dashboard..."
                  className="flex-1 bg-transparent px-4 py-3 text-slate-200 focus:outline-none placeholder-slate-500 font-medium"
                />
                <button
                  onClick={handleBuild}
                  disabled={!prompt.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  Generate
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto w-full font-mono text-sm space-y-8">
            
            {/* Analyzing Phase */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-indigo-400 font-bold text-lg mb-4">
                <ChevronRight className="w-5 h-5" />
                <span>Understanding request...</span>
              </div>
              
              <AnimatePresence>
                {extractedFeatures.map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-slate-300 ml-4"
                  >
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {extractedFeatures.length > 0 && buildState !== 'analyzing' && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-slate-500 italic ml-4 mt-4"
                >
                  Production defaults selected.
                </motion.div>
              )}
            </div>

            {/* Agent Workforce Phase */}
            {(buildState === 'building' || buildState === 'verifying' || buildState === 'complete') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-indigo-400 font-bold text-lg mb-4">
                  <ChevronRight className="w-5 h-5" />
                  <span>Deploying AI workforce...</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                  {AGENTS.map((agent, index) => {
                    const isCompleted = index < activeAgentIndex;
                    const isRunning = index === activeAgentIndex;
                    const isWaiting = index > activeAgentIndex;
                    
                    return (
                      <Tooltip key={agent.id} content={agent.desc}>
                        <div 
                          className={`group relative flex items-center justify-between rounded-xl border p-4 transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' :
                            isRunning ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' :
                            'bg-white/5 border-white/5 opacity-50 hover:opacity-80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : isRunning ? (
                              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-500" />
                            )}
                            <span className={isCompleted ? 'text-emerald-400' : isRunning ? 'text-indigo-300 font-bold' : 'text-slate-400 group-hover:text-slate-300'}>
                              {agent.name}
                            </span>
                          </div>
                          <span className="text-xs uppercase tracking-wider">
                            {isCompleted ? <span className="text-emerald-500/70">Completed</span> : 
                             isRunning ? <span className="text-indigo-400/90 animate-pulse">Running</span> : 
                             <span className="text-slate-600 group-hover:text-slate-500">Waiting</span>}
                          </span>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Verification Phase */}
            {(buildState === 'verifying' || buildState === 'complete') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-indigo-400 font-bold text-lg mb-4">
                  <ChevronRight className="w-5 h-5" />
                  <span>BUILD COMPLETE</span>
                </div>
                
                <div className="flex flex-wrap gap-x-8 gap-y-3 ml-4">
                  <AnimatePresence>
                    {verifiedSteps.map((step, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-slate-300 w-full sm:w-[calc(50%-2rem)]"
                      >
                        <Check className="w-4 h-4 text-emerald-500" />
                        {step}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {verifiedSteps.length === VERIFICATION_STEPS.length && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-4 mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 inline-block">
                    <span className="text-emerald-400 font-bold">Build Verification: {VERIFICATION_STEPS.length}/{VERIFICATION_STEPS.length} PASSED</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Complete Actions */}
            {buildState === 'complete' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex flex-wrap gap-4 pt-8 pb-12 justify-center border-t border-white/5 mt-8"
              >
                <button className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <Play className="w-4 h-4 fill-current" />
                  OPEN LIVE PREVIEW
                </button>
                <button className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-lg font-bold transition-all">
                  <Code2 className="w-4 h-4" />
                  VIEW SOURCE
                </button>
                <button className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-lg font-bold transition-all">
                  <Rocket className="w-4 h-4" />
                  DEPLOY
                </button>
                <button className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-lg font-bold transition-all">
                  <Download className="w-4 h-4" />
                  EXPORT PROJECT
                </button>
              </motion.div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}


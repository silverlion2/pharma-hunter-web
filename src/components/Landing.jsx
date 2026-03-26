import React from 'react';
import { Zap, Database, TerminalSquare, ShieldCheck, TrendingUp, Brain, Target } from 'lucide-react';

const Landing = ({ setView, setShowPastDeals }) => {
  return (
    <section aria-label="BioQuantix - AI-powered bio-pharma M&A intelligence platform">
    <div className="min-h-[70vh] flex flex-col justify-center max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16 relative">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
        
        {/* Badge */}
        <div className="animate-slideUp inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-4">
          <Zap size={12} className="fill-cyan-400" /> Powered by AI & Deep Industry Data
        </div>
        
        {/* Launch Promo */}
        <div className="animate-slideUp delay-100 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <Zap size={14} className="fill-emerald-400" /> BIOQUANTIX 2.0 LIVE: Track $150B+ in Cross-Border BD
        </div>

        {/* Hero Heading */}
        <h1 className="animate-slideUp delay-200 text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
          The Intelligence Engine for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Predicting M&A.</span>
        </h1>
        <p className="animate-slideUp delay-300 text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          We aggregate clinical milestones, institutional options sweeps, and the Biosecure decoupling paradox to score bio-pharma assets. <strong className="text-white">When the algorithm fires, the smart money moves.</strong>
        </p>
        
        {/* Stats Row */}
        <div className="animate-slideUp delay-400 flex flex-wrap justify-center gap-3 mb-10">
          <div className="bg-slate-900/80 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2">
            <TrendingUp size={14} className="text-cyan-400" />
            <span className="text-[11px] font-mono font-bold text-cyan-400">$15B+ M&A Tracked</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2">
            <Brain size={14} className="text-blue-400" />
            <span className="text-[11px] font-mono font-bold text-blue-400">150+ Clinical Assets</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 px-5 py-2.5 rounded-xl flex items-center gap-2">
            <Target size={14} className="text-indigo-400" />
            <span className="text-[11px] font-mono font-bold text-indigo-400">12 Anomalies Flagged</span>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-slideUp delay-500 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => {setView('dashboard'); setShowPastDeals(false);}}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-base sm:text-lg px-8 py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            <Database size={22} /> LAUNCH BIOQUANTIX TERMINAL
          </button>
          <button
            onClick={() => setView('biosecure')}
            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm px-6 py-4 rounded-2xl transition-all w-full sm:w-auto justify-center flex items-center gap-2"
          >
            <ShieldCheck size={18} className="text-emerald-400" /> Read the Convergence Thesis
          </button>
        </div>
        
        {/* Case Study Card */}
        <div className="animate-slideUp delay-600 mt-20 max-w-2xl mx-auto text-left bg-slate-900/60 border border-slate-800/60 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TerminalSquare className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-4">
            <ShieldCheck size={14} /> Data-Driven Track Record
          </div>
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">The Alpine Immune ($ALPN) Anomaly</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            See how the BioQuantix algorithm identified structural data anomalies in Alpine Immune 7 days prior to the <strong className="text-slate-200">$4.9B Vertex acquisition</strong>.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                <span className="text-slate-500">TIMESTAMP: T-7 DAYS</span>
                <span className="text-emerald-400 font-black">QUANT SCORE: 96.5</span>
            </div>
            <div className="text-indigo-400 font-bold mb-1">FLAG_FIRED: [OPTIONS_FLOW]</div>
            <div className="text-slate-400 leading-tight">Massive unhedged OTM call buying detected 5 days prior to announcement. Vertex pipeline gap correlation established.</div>
          </div>
        </div>

      </div>
    </div>
    </section>
  );
};

export default Landing;

import React from 'react';
import { Zap, Database, TerminalSquare, ShieldCheck } from 'lucide-react';

const Landing = ({ setView, setShowPastDeals }) => {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs font-black uppercase tracking-widest mb-8">
          <Zap size={14} className="fill-cyan-400" /> Powered by AI & Indepth Industry Data
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
          Algorithmic Bio-Pharma <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Market Intelligence.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          Institutional research requires armies of analysts. <strong className="text-white">BioQuantix uses machine learning.</strong> We track clinical milestones, pipeline gaps, and alternative data to quantify bio-pharma M&A trends.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-10 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
          <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-cyan-400">[ $15B+ M&A Value Tracked ]</span>
          <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-blue-400">[ 150+ Clinical Assets Monitored ]</span>
          <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-indigo-400">[ 12 Institutional Anomalies Flagged ]</span>
        </div>

        <button 
          onClick={() => {setView('dashboard'); setShowPastDeals(false);}}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-lg px-10 py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/20 flex items-center gap-3 mx-auto"
        >
          <Database size={24} /> ENTER TERMINAL
        </button>
        
        <div className="mt-20 max-w-2xl mx-auto text-left bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
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
  );
};

export default Landing;

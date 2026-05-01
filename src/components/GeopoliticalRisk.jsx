import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Shield, AlertOctagon } from 'lucide-react';

const RiskRow = ({ label, desc, status }) => {
  const statusConfig = {
    'green': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'CLEARED' },
    'amber': { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'MONITOR' },
    'red': { icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'HIGH RISK' }
  };
  const Cfg = statusConfig[status];
  const Icon = Cfg.icon;

  return (
    <div className={`p-4 rounded-xl border ${Cfg.border} ${Cfg.bg} flex items-start gap-4 mb-3 last:mb-0 transition-colors`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${Cfg.color}`} />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className={`text-xs font-black uppercase tracking-wider ${Cfg.color}`}>{label}</h4>
          <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border ${Cfg.border} ${Cfg.color}`}>
            {Cfg.text}
          </span>
        </div>
        <p className="text-[10px] text-slate-300 leading-snug">{desc}</p>
      </div>
    </div>
  );
};

const GeopoliticalRisk = ({ activeAsset }) => {
  // Mock logic: randomly assign some risk structure based on string length to simulate variety
  const isHighRisk = activeAsset?.ticker?.length === 3; // e.g. ALT is 3, IMVT is 4

  return (
    <div className="bg-slate-900 border border-slate-700/80 p-6 rounded-3xl relative overflow-hidden shadow-2xl h-[450px] flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
         <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <ShieldAlert className="text-red-400 w-4 h-4" />
         </div>
         <div>
           <h3 className="text-sm font-black text-white tracking-widest uppercase">Compliance & Geopolitics</h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">BIOSECURE / CFIUS Deal Breakers</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <RiskRow 
          label="Supply Chain (BIOSECURE)" 
          status={isHighRisk ? 'red' : 'green'} 
          desc={isHighRisk 
            ? "Critical dependency detected. API synthesis is currently sole-sourced from WuXi AppTec. A US licensee must mandate an immediate tech-transfer to alternate CDMO (est. 12-18 months)." 
            : "No restricted entities detected in the manufacturing supply chain. API synthesis verified outside of Biosecure Act scope."}
        />
        <RiskRow 
          label="Clinical Data & Privacy (HGRAC)" 
          status="amber" 
          desc="Phase 2 trial data subject to China's HGRAC (Human Genetic Resources) strict export rules. Expect a 3-5 month regulatory delay to securely transfer raw patient data to a Western Virtual Data Room."
        />
        <RiskRow 
          label="Cap Table (CFIUS)" 
          status="green" 
          desc="Investor cap table cleanly audited. No sanctioned state-backed capital or SOE controlling stakes that would trigger a CFIUS tech-transfer blockade."
        />
        <RiskRow 
          label="IP & Patent Geography" 
          status={isHighRisk ? 'amber' : 'green'} 
          desc={isHighRisk 
            ? "Core compositions of matter patents are only solidified in CN. US filings are pending continuation. Licensee assumes moderate FTO (Freedom to Operate) timeline risk." 
            : "Global IP fortress confirmed. Unified PCT filings secure composition of matter across US, EU, and CN until 2042."}
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center bg-slate-900 absolute bottom-0 left-0 right-0 px-6 pb-6 w-full">
         <div className="flex items-center gap-2">
           <Shield className="w-4 h-4 text-slate-500" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Engine Powered by Palantir / LexisNexis</span>
         </div>
         <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[9px] text-white font-bold uppercase tracking-widest rounded transition-colors border border-slate-600">
           Export Report
         </button>
      </div>
    </div>
  );
};

export default GeopoliticalRisk;

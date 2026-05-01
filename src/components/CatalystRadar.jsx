import React from 'react';
import { Clock, Activity, Flag } from 'lucide-react';

const CatalystRadar = ({ catalysts }) => {
  // Demo fallback
  const safeCatalysts = catalysts?.length > 0 ? catalysts : [
    { phase: 'Phase 2', drug: 'Primary Asset', indication: 'Lead Indication', readout: 'Q3 2026', type: 'Topline Data' },
    { phase: 'Phase 1/2', drug: 'Next-Gen Asset', indication: 'Secondary Ind.', readout: 'Q1 2027', type: 'Safety & Efficacy' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 relative overflow-hidden mt-8 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
        <Clock className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-black text-white tracking-widest uppercase">Clinical Catalyst Radar</h3>
        <span className="ml-auto px-2 py-0.5 mt-0.5 rounded text-[9px] font-black tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
          TIMING VECTOR
        </span>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:to-transparent">
        {safeCatalysts.map((cat, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-900 bg-blue-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[-1px] z-10 hidden md:block">
              <Activity size={10} strokeWidth={4} />
            </div>
            
            {/* Mobile Circle */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-slate-900 bg-blue-500 text-slate-900 shadow shrink-0 md:hidden ml-[-1px] z-10 inline-flex">
              <Activity size={10} strokeWidth={4} />
            </div>

            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow hover:bg-slate-800/60 transition-colors ml-4 md:ml-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {cat.readout}
                </span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                  <Flag size={10} /> {cat.phase}
                </span>
              </div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">{cat.type}</h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                {cat.drug} • {cat.indication}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalystRadar;

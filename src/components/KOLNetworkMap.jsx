import React from 'react';
import { Network, User, Building } from 'lucide-react';

const KOLNetworkMap = ({ network, ticker }) => {
  // Demo fallback
  const safeNetwork = network?.length > 0 ? network : [
    { name: 'Dr. Jane Smith', institution: 'MD Anderson', role: 'SAB Member', weight: 85 },
    { name: 'Dr. John Doe', institution: 'Dana-Farber', role: 'Lead PI', weight: 60 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-8 mt-8 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4 relative z-10">
        <Network className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-black text-white tracking-widest uppercase">Shadow KOL Network</h3>
        <span className="ml-auto px-2 py-0.5 mt-0.5 rounded text-[9px] font-black tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
          ACADEMIC ALPHA
        </span>
      </div>

      <div className="relative py-8 flex flex-col md:flex-row items-center justify-center gap-12 z-10">
        {/* Core Target Node */}
        <div className="flex flex-col items-center z-20 group">
          <div className="w-20 h-20 rounded-full bg-slate-950 border-4 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
             <span className="font-black text-white text-xl tracking-tighter">{ticker || 'ASSET'}</span>
          </div>
          <span className="mt-3 text-[10px] uppercase font-black tracking-widest text-slate-500">Target</span>
        </div>

        {/* Connections SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block" style={{ top: '50%', transform: 'translateY(-50%)' }}>
           {safeNetwork.map((_, i) => {
             // Basic naive routing from center to right-side nodes
             return (
               <path 
                 key={i}
                 d={`M 50% 50% C 65% 50%, 65% ${15 + (i * 35)}%, 80% ${15 + (i * 35)}%`} 
                 stroke="rgba(168, 85, 247, 0.4)" 
                 strokeWidth={2} 
                 fill="none" 
                 strokeDasharray="4 4"
                 className="animate-pulse"
               />
             )
           })}
        </svg>

        {/* KOL Nodes */}
        <div className="flex flex-col gap-6 z-20 w-full md:w-auto">
          {safeNetwork.map((kol, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl w-full md:w-64 hover:border-purple-500/50 transition-colors shadow-lg shadow-purple-500/5 cursor-default relative">
              <div className="absolute -left-2 w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center md:hidden">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="text-purple-400 w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-tight">{kol.name}</h4>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  <Building size={10} /> <span className="truncate">{kol.institution}</span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-0.5">Role</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-purple-300 font-mono text-[9px] border border-slate-700">{(kol.role).slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KOLNetworkMap;

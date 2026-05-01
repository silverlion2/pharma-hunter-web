import React from 'react';
import { Target, CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react';

const TPPMapping = ({ activeAsset }) => {
  const isObesity = activeAsset?.targetArea?.toLowerCase() === 'metabolic' || activeAsset?.digest?.toLowerCase().includes('obesity');
  
  // TPP logic based on area
  const tppData = isObesity ? [
    { metric: 'Efficacy (At Wk 48)', target: '> 15% Weight Loss', asset: '15.6% (Phase 2)', soc: '15% (Wegovy)', comp: '22% (Zepbound)', status: 'competitive' },
    { metric: 'Safety (GI Tol)', target: '< 10% Discontinuation', asset: '8.4%', soc: '16%', comp: '12%', status: 'best' },
    { metric: 'Dosing', target: 'Oral Daily or Monthly SC', asset: 'Weekly SC', soc: 'Weekly SC', comp: 'Weekly SC', status: 'parity' },
    { metric: 'Lean Mass Ret.', target: '> 75% Fat Loss ratio', asset: '78%', soc: '60%', comp: '65%', status: 'best' }
  ] : [
    { metric: 'Efficacy (Remission)', target: '> 30% PASI 100', asset: '35% (Phase 2)', soc: '28% (Humira)', comp: '40% (Skyrizi)', status: 'competitive' },
    { metric: 'Safety (BBW Risk)', target: 'No Black Box', asset: 'Clean', soc: 'Black Box', comp: 'Clean', status: 'best' },
    { metric: 'Dosing', target: 'Oral Daily', asset: 'Oral BID', soc: 'Bi-weekly SC', comp: 'Every 12 Wks SC', status: 'parity' },
    { metric: 'Sustained Durability', target: '> 52 Wks Maintenance', asset: 'Pending', soc: 'Confirmed', comp: 'Confirmed', status: 'lagging' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'best': return <CheckCircle2 className="text-emerald-500 w-4 h-4 ml-auto" />;
      case 'competitive': return <TrendingUp className="text-blue-400 w-4 h-4 ml-auto" />;
      case 'parity': return <CheckCircle2 className="text-slate-500 w-4 h-4 ml-auto opacity-50" />;
      case 'lagging': return <AlertCircle className="text-amber-500 w-4 h-4 ml-auto" />;
      default: return <XCircle className="text-red-500 w-4 h-4 ml-auto" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'best': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-bold';
      case 'competitive': return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
      case 'parity': return 'bg-slate-800/30 border-slate-700/50 text-slate-400';
      case 'lagging': return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      default: return 'bg-slate-800 border-slate-700 text-slate-500';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
         <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Target className="text-emerald-400 w-4 h-4" />
         </div>
         <div>
           <h3 className="text-sm font-black text-white tracking-widest uppercase">Target Product Profile (TPP)</h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Benchmarking vs Standard of Care (SoC)</p>
         </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 w-[20%]">Metric</th>
              <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 w-[20%] border-r border-slate-800/50">TPP Target</th>
              <th className="p-3 text-[10px] font-black uppercase text-cyan-400 tracking-widest border-b border-slate-800 w-[20%]">{activeAsset?.ticker || 'ASSET'} Profile</th>
              <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 w-[20%]">SoC</th>
              <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800 w-[20%]">Lead Comp.</th>
            </tr>
          </thead>
          <tbody>
            {tppData.map((row, idx) => (
              <tr key={idx} className="group hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0">
                <td className="p-3 text-xs font-bold text-slate-300">{row.metric}</td>
                <td className="p-3 text-xs text-slate-500 font-mono tracking-tight border-r border-slate-800/50">{row.target}</td>
                <td className="p-2">
                  <div className={`p-2 rounded-lg border text-xs flex items-center ${getStatusBg(row.status)}`}>
                    {row.asset}
                    {getStatusIcon(row.status)}
                  </div>
                </td>
                <td className="p-3 text-xs text-slate-400 font-medium">{row.soc}</td>
                <td className="p-3 text-xs text-slate-500 font-medium">{row.comp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 px-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800/50">
         <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
           <CheckCircle2 className="text-emerald-500 w-3 h-3" /> Best-in-Class
         </div>
         <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
           <TrendingUp className="text-blue-400 w-3 h-3" /> Competitive
         </div>
         <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
           <CheckCircle2 className="text-slate-500 w-3 h-3 opacity-50" /> Parity
         </div>
         <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
           <AlertCircle className="text-amber-500 w-3 h-3" /> Lagging
         </div>
      </div>
    </div>
  );
};

export default TPPMapping;

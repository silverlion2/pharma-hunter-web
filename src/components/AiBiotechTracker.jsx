import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Database, Network, Activity, TrendingUp, Building2, Beaker, ChevronRight } from 'lucide-react';
import { aiBiotechData as mockAiBiotechData } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
export default function AiBiotechTracker() {
  const [aiBiotechData, setAiBiotechData] = useState(mockAiBiotechData);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data: aiData } = await supabase.from('ai_biotech_landscape').select('*').limit(1);
        if (aiData && aiData.length > 0) {
          setAiBiotechData(aiData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch AiBiotech component data: ", err);
      }
    };
    fetchData();
  }, []);

  const { capitalFlows, platformCompanies, timeline, strategicImplications } = aiBiotechData || mockAiBiotechData;

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Building2': return <Building2 size={24} className="text-blue-400" />;
      case 'Activity': return <Activity size={24} className="text-emerald-400" />;
      case 'TrendingUp': return <TrendingUp size={24} className="text-purple-400" />;
      default: return <Brain size={24} />;
    }
  };

  const getColorClass = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-500/10 border-blue-500/30';
      case 'emerald': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'purple': return 'bg-purple-500/10 border-purple-500/30';
      default: return 'bg-cyan-500/10 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-10 animate-in mt-6 max-w-[1440px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
              <Brain size={32} className="text-cyan-400" />
            </div>
            BioQuantix AI Asset Tracker
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded font-black tracking-widest hidden md:inline-block ml-2 align-middle">NEW ASSET CLASS</span>
          </h1>
          <p className="text-sm text-slate-400 mt-4 max-w-3xl leading-relaxed">
            The convergence of generative AI and drug discovery is absorbing massive capital. BioQuantix physically tracks the mega-rounds, platform pioneers, and strategic M&A implications of the "Tech-Bio" supercycle through proprietary capital flow monitoring.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[140px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Tracked Funding</span>
            <span className="text-2xl font-black text-emerald-400">$8.4B+</span>
          </div>
          <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[140px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Active AI Targets</span>
            <span className="text-2xl font-black text-cyan-400">42</span>
          </div>
        </div>
      </div>

      {/* Grid: Heatmap + Strategic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Capital Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-black tracking-widest text-white uppercase">Capital Mega-Rounds Heatmap</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capitalFlows.map((deal, idx) => {
              const isMega = deal.amount.includes('B') || parseInt(deal.amount.replace(/[^0-9]/g, '')) > 300;
              return (
                <div key={idx} className={`p-5 rounded-2xl border transition-all hover:-translate-y-1 ${isMega ? 'bg-slate-900/80 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800'}`}>
                  {isMega && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none -mr-10 -mt-10" />}
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1">{deal.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">{deal.round} • {deal.date}</span>
                    </div>
                    <div className="text-xl font-black text-emerald-400">{deal.amount}</div>
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-xs text-slate-400 mb-2 truncate" title={deal.focus}>{deal.focus}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 uppercase font-black">Lead Investors:</span>
                      <p className="text-[10px] text-slate-300 font-medium truncate">{deal.investors.join(', ')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategic Implications */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-black tracking-widest text-white uppercase">Strategic Implications</h2>
          </div>
          
          <div className="space-y-4">
            {strategicImplications.map((imp, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border ${getColorClass(imp.color)}`}>
                <div className="flex items-center gap-3 mb-3">
                  {getIcon(imp.icon)}
                  <h3 className="font-bold text-white tracking-wide">{imp.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {imp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Platform Landscape + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        
        {/* Platform Landscape */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Cpu className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black tracking-widest text-white uppercase">Platform Landscape</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-3 text-[10px] font-black tracking-widest text-slate-500 uppercase">Entity</th>
                  <th className="pb-3 text-[10px] font-black tracking-widest text-slate-500 uppercase">Modality</th>
                  <th className="pb-3 text-[10px] font-black tracking-widest text-slate-500 uppercase">Status / Capital</th>
                  <th className="pb-3 text-[10px] font-black tracking-widest text-slate-500 uppercase text-right">Latest Catalyst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {platformCompanies.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 font-bold text-sm text-white">{comp.name}</td>
                    <td className="py-4">
                      <span className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                        {comp.type}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-medium text-emerald-400">{comp.funding}</td>
                    <td className="py-4 text-xs text-slate-400 text-right group-hover:text-cyan-400 transition-colors">{comp.recent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Convergence Timeline */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Beaker className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-black tracking-widest text-white uppercase">Convergence Timeline</h2>
            </div>
          </div>
          
          <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-rose-500/20 before:via-slate-800 before:to-transparent">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-6 group">
                <div className="absolute left-[-29px] flex items-center justify-center w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-rose-500 group-hover:scale-125 transition-all z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-rose-500 transition-colors" />
                </div>
                <div className="flex-1 bg-slate-900/80 border border-slate-800 p-4 rounded-xl group-hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-rose-400 tracking-widest">{item.date}</span>
                    <ChevronRight size={12} className="text-slate-600" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{item.event}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

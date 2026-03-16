import React, { useState, useMemo } from 'react';
import { Target, Search, ArrowRight, Activity, Cpu, Briefcase, DollarSign, ShieldAlert, ArrowLeft } from 'lucide-react';
import { TARGET_DICTIONARY } from '../data/mockData';

const GapMap = ({ pipelineGapsData, setView }) => {
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedTarget, setSelectedTarget] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten the grouped gaps into a single array for easier filtering/sorting
  const allGaps = useMemo(() => {
    let gaps = [];
    Object.keys(pipelineGapsData).forEach(area => {
      pipelineGapsData[area].forEach(gap => {
        gaps.push({ ...gap, _areaKey: area });
      });
    });
    return gaps.sort((a, b) => b.level - a.level);
  }, [pipelineGapsData]);

  const availableAreas = ['All', ...Object.keys(TARGET_DICTIONARY)];
  const availableTargets = selectedArea === 'All' 
    ? ['All', ...[...new Set(Object.values(TARGET_DICTIONARY).flat())].sort()]
    : ['All', ...TARGET_DICTIONARY[selectedArea] || []];

  const filteredGaps = useMemo(() => {
    return allGaps.filter(gap => {
      const matchArea = selectedArea === 'All' || gap.target === selectedArea || gap._areaKey === selectedArea;
      const matchTarget = selectedTarget === 'All' || (gap.secondary_targets && gap.secondary_targets.includes(selectedTarget));
      const matchSearch = gap.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (gap.strategic_focus && gap.strategic_focus.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchArea && matchTarget && matchSearch;
    });
  }, [allGaps, selectedArea, selectedTarget, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors font-bold text-xs mb-4 uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Terminal
          </button>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <Cpu className="text-cyan-500" size={32} /> 
            Pipeline Gap Map
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Strategic mapping of Multi-National Corporation (MNC) pipeline deficiencies, impending patent cliffs, and acquisition urgency.
          </p>
        </div>

        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search MNCs or strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-lg"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">Primary Area:</span>
          <select 
            value={selectedArea}
            onChange={(e) => { setSelectedArea(e.target.value); setSelectedTarget('All'); }}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none w-full md:w-auto min-w-[160px]"
          >
            {availableAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        <div className="hidden md:block w-px h-8 bg-slate-800"></div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">Secondary Target:</span>
          <select 
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none w-full md:w-auto min-w-[160px]"
          >
            {availableTargets.map(target => (
              <option key={target} value={target}>{target}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredGaps.length > 0 ? filteredGaps.map((gap, idx) => (
          <div key={`${gap.name}-${idx}`} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700 transition-all flex flex-col h-full shadow-2xl relative overflow-hidden group">
            {/* Urgency Highlight Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${gap.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {gap.name}
                  <span className="text-[10px] uppercase font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded-md tracking-widest border border-slate-700">
                    {gap.target}
                  </span>
                </h3>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {gap.secondary_targets && gap.secondary_targets.map(t => (
                    <span key={t} className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">M&A Urgency Level</div>
                <div className={`text-3xl font-mono font-black ${gap.level >= 90 ? 'text-red-400' : gap.level >= 80 ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {gap.level}<span className="text-sm text-slate-500">%</span>
                </div>
              </div>
            </div>

            <div className="flex-grow space-y-6">
              {/* Strategic Focus */}
              {gap.strategic_focus && (
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                    <Target size={14} className="text-amber-500" /> Strategic Focus
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{gap.strategic_focus}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expiring Patents */}
                {gap.expiring_patents && gap.expiring_patents.length > 0 && (
                  <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-red-400 tracking-widest mb-3">
                      <ShieldAlert size={14} /> Patent Cliffs
                    </h4>
                    <div className="space-y-3">
                      {gap.expiring_patents.map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                          <div>
                            <div className="text-xs font-bold text-slate-200">{p.asset}</div>
                            <div className="text-[10px] text-slate-500">{p.year}</div>
                          </div>
                          <div className="text-xs font-mono font-black text-red-400 shrink-0">{p.revenue_at_risk}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Acquisitions */}
                {gap.recent_acquisitions && gap.recent_acquisitions.length > 0 && (
                  <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-3">
                      <Briefcase size={14} /> Recent M&A Track Record
                    </h4>
                    <div className="space-y-3">
                      {gap.recent_acquisitions.map((acq, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                          <div>
                            <div className="text-xs font-bold text-slate-200">{acq.name}</div>
                            <div className="text-[10px] text-slate-500">{acq.area} ({acq.year})</div>
                          </div>
                          <div className="text-xs font-mono font-black text-cyan-400 shrink-0">{acq.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Scientific Data & Market Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gap.scientific_data_overview && (
                  <div className="space-y-1">
                     <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Scientific Requirements</h4>
                     <p className="text-xs text-slate-400 leading-relaxed italic">{gap.scientific_data_overview}</p>
                  </div>
                )}
                {gap.market_size && (
                  <div className="space-y-1">
                     <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1"><DollarSign size={12}/> Addressable Market</h4>
                     <p className="text-xs font-mono font-bold text-emerald-400">{gap.market_size}</p>
                     {gap.budget_estimate && <p className="text-[10px] text-slate-500 mt-1">Warchest: {gap.budget_estimate}</p>}
                  </div>
                )}
              </div>

            </div>
          </div>
        )) : (
          <div className="col-span-1 xl:col-span-2 py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No Gap Data Found</h3>
            <p className="text-sm text-slate-500">Try adjusting your primary area or secondary target filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GapMap;

import React, { useState, useMemo } from 'react';
import { Target, Search, ArrowRight, Activity, Cpu, Briefcase, DollarSign, ShieldAlert, ArrowLeft, LayoutList, Grid3X3, CheckCircle2 } from 'lucide-react';
import { TARGET_DICTIONARY } from '../data/mockData';

const GapMap = ({ pipelineGapsData, setView }) => {
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedTarget, setSelectedTarget] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' or 'matrix'
  const [selectedMncIdx, setSelectedMncIdx] = useState(0);

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

  // Derive columns for matrix view based on selected area
  const matrixTargets = useMemo(() => {
    if (selectedArea !== 'All') return TARGET_DICTIONARY[selectedArea] || [];
    // If 'All', just take targets from the filtered companies to avoid a massive table
    const targets = new Set();
    filteredGaps.forEach(gap => {
      if (gap.secondary_targets) gap.secondary_targets.forEach(t => targets.add(t));
    });
    return Array.from(targets).sort();
  }, [selectedArea, filteredGaps]);

  const activeGap = filteredGaps[selectedMncIdx] || filteredGaps[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-2">
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-lg shrink-0">
            <button 
              onClick={() => setActiveTab('dossier')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'dossier' ? 'bg-slate-800 text-cyan-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutList size={16} /> Dossier
            </button>
            <button 
              onClick={() => setActiveTab('matrix')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'matrix' ? 'bg-slate-800 text-cyan-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Grid3X3 size={16} /> Matrix
            </button>
          </div>
          
          <div className="relative flex-grow sm:w-64">
            <input
              type="text"
              placeholder="Search MNCs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-lg"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">Primary Area:</span>
          <select 
            value={selectedArea}
            onChange={(e) => { setSelectedArea(e.target.value); setSelectedTarget('All'); setSelectedMncIdx(0); }}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none w-full sm:w-auto min-w-[160px]"
          >
            {availableAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-800"></div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">Target Gap:</span>
          <select 
            value={selectedTarget}
            onChange={(e) => { setSelectedTarget(e.target.value); setSelectedMncIdx(0); }}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none w-full sm:w-auto min-w-[160px]"
          >
            {availableTargets.map(target => (
              <option key={target} value={target}>{target}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredGaps.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">No Gap Data Found</h3>
          <p className="text-sm text-slate-500">Try adjusting your filters.</p>
        </div>
      ) : activeTab === 'dossier' ? (
        /* DOSSIER VIEW (Master-Detail) */
        <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
          {/* Master List */}
          <div className="w-full lg:w-1/3 flex flex-col bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">MNC Targets</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {filteredGaps.map((gap, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMncIdx(idx)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedMncIdx === idx ? 'bg-slate-800 border-cyan-500/50 shadow-lg' : 'bg-transparent border-transparent hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-white text-sm">{gap.name}</div>
                    <div className={`text-xs font-black font-mono ${gap.level >= 90 ? 'text-red-400' : gap.level >= 80 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {gap.level}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    <span>{gap.target}</span>
                    {gap.expiring_patents && gap.expiring_patents.length > 0 && (
                      <span className="flex items-center gap-1 text-red-400/80"><ShieldAlert size={10} /> Cliff {gap.expiring_patents[0].year}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail Dossier */}
          {activeGap && (
            <div className="w-full lg:w-2/3 flex flex-col bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${activeGap.color} opacity-80`} />
              
              <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{activeGap.name}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md tracking-widest border border-slate-700">
                      {activeGap.target}
                    </span>
                    {activeGap.budget_estimate && (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                        <DollarSign size={12} /> Warchest: {activeGap.budget_estimate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Acquisition Urgency</div>
                  <div className={`text-4xl font-mono font-black leading-none ${activeGap.level >= 90 ? 'text-red-400' : activeGap.level >= 80 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {activeGap.level}<span className="text-lg text-slate-500">%</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                
                {activeGap.strategic_focus && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase text-amber-500 tracking-widest">
                      <Target size={16} /> Strategic Focus
                    </h4>
                    <p className="text-slate-300 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl text-sm">
                      {activeGap.strategic_focus}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Patent Cliffs vs Assets */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">
                        <DollarSign size={14} className="text-cyan-500" /> Key Revenue Generators
                      </h4>
                      <div className="space-y-3">
                        {activeGap.key_assets && activeGap.key_assets.map((a, i) => (
                          <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                            <span className="font-bold text-slate-300">{a.name}</span>
                            <span className="font-mono text-cyan-400">{a.revenue_2023}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {activeGap.expiring_patents && activeGap.expiring_patents.length > 0 && (
                      <div className="pt-2">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 tracking-widest mb-4">
                          <ShieldAlert size={14} /> Critical Patent Cliffs
                        </h4>
                        <div className="space-y-3">
                          {activeGap.expiring_patents.map((p, i) => (
                            <div key={i} className="flex justify-between items-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                              <div>
                                <div className="text-sm font-bold text-white mb-0.5">{p.asset}</div>
                                <div className="text-[10px] font-black tracking-widest text-red-400/80 uppercase">LOE: {p.year}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Rev at Risk</div>
                                <div className="text-sm font-mono font-black text-red-400">{p.revenue_at_risk}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scientific Needs & Pipeline */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">
                        <Activity size={14} className="text-purple-500" /> Target Gaps (Secondary)
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {activeGap.secondary_targets && activeGap.secondary_targets.map(t => (
                          <span key={t} className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {activeGap.scientific_data_overview && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Scientific Requirements</h4>
                        <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-3">"{activeGap.scientific_data_overview}"</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-800">
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">
                        Internal Clinical Pipeline
                      </h4>
                      <div className="space-y-3">
                        {activeGap.current_pipeline && activeGap.current_pipeline.map((p, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl">
                            <div>
                               <div className="text-xs font-bold text-slate-200">{p.name}</div>
                               <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.type}</div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded">
                              {p.phase}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* M&A History */}
                {activeGap.recent_acquisitions && activeGap.recent_acquisitions.length > 0 && (
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-cyan-500 tracking-widest mb-4">
                      <Briefcase size={14} /> Recent M&A Track Record
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {activeGap.recent_acquisitions.map((acq, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                          <div>
                            <div className="text-sm font-bold text-slate-200">{acq.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{acq.area} &middot; {acq.year}</div>
                          </div>
                          <div className="text-sm font-mono font-black text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">{acq.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MATRIX VIEW (Heatmap) */
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr>
                 <th className="sticky left-0 z-20 bg-slate-950 p-4 border-b border-r border-slate-800 text-xs font-black uppercase tracking-widest text-slate-400 min-w-[200px]">
                   MNC / Urgency
                 </th>
                 {matrixTargets.map(target => (
                   <th key={target} className="p-4 border-b border-slate-800 border-r last:border-r-0 text-xs font-mono font-bold text-slate-300 min-w-[140px] text-center bg-slate-950/50">
                     {target}
                   </th>
                 ))}
               </tr>
             </thead>
             <tbody>
               {filteredGaps.map((gap, rowIdx) => (
                 <tr key={rowIdx} className="hover:bg-slate-800/30 transition-colors group">
                   <td className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 p-4 border-b border-r border-slate-800">
                     <div className="font-bold text-white text-sm whitespace-nowrap">{gap.name}</div>
                     <div className="flex items-center gap-2 mt-1 whitespace-nowrap">
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{gap.target}</div>
                       <div className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${gap.level >= 90 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                         Urg: {gap.level}%
                       </div>
                     </div>
                   </td>
                   {matrixTargets.map(target => {
                     // Determine status
                     const isTargetGap = gap.secondary_targets && gap.secondary_targets.includes(target);
                     // Check if pipeline has it
                     const isInPipeline = gap.current_pipeline && gap.current_pipeline.some(p => p.type.includes(target) || p.name.includes(target));
                     
                     let cellBg = "bg-transparent";
                     let content = <span className="text-slate-700 text-2xl leading-none">&middot;</span>;
                     
                     if (isTargetGap) {
                       cellBg = gap.level >= 90 ? "bg-red-500/10" : "bg-amber-500/10";
                       content = <span className={`text-[10px] font-black uppercase tracking-widest ${gap.level >= 90 ? 'text-red-400' : 'text-amber-400'}`}>Active Gap</span>;
                     } else if (isInPipeline) {
                       cellBg = "bg-emerald-500/10";
                       content = <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 size={12}/> In Pipeline</span>;
                     }
                     
                     return (
                       <td key={target} className={`p-4 border-b border-slate-800 border-r last:border-r-0 text-center align-middle ${cellBg}`}>
                         {content}
                       </td>
                     );
                   })}
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default GapMap;

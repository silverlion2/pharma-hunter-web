import React, { useState, useMemo } from 'react';
import { Target, Search, Activity, Cpu, Briefcase, DollarSign, ShieldAlert, ArrowLeft, LayoutList, Grid3X3, CheckCircle2, Globe, TrendingUp, Beaker, Users, Building2, ArrowUpRight } from 'lucide-react';
import { TARGET_DICTIONARY } from '../data/mockData';

// Urgency Ring SVG component
const UrgencyRing = ({ level }) => {
  const radius = 36;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (level / 100) * circumference;
  const color = level >= 90 ? '#f87171' : level >= 80 ? '#fbbf24' : level >= 60 ? '#38bdf8' : '#34d399';
  const glowColor = level >= 90 ? 'rgba(248,113,113,0.4)' : level >= 80 ? 'rgba(251,191,36,0.3)' : 'rgba(56,189,248,0.2)';
  return (
    <div className="relative w-24 h-24 shrink-0" style={{ filter: level >= 90 ? `drop-shadow(0 0 12px ${glowColor})` : 'none' }}>
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 86 86">
        <circle cx="43" cy="43" r={radius} fill="none" stroke="rgb(30,41,59)" strokeWidth={stroke} />
        <circle cx="43" cy="43" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black font-mono leading-none" style={{ color }}>{level}</span>
        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">URG</span>
      </div>
    </div>
  );
};

// Stat Pill
const StatPill = ({ icon: Icon, label, value, color = 'text-slate-300' }) => (
  <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex flex-col gap-1 min-w-0">
    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
      <Icon size={10} /> {label}
    </div>
    <div className={`text-sm font-mono font-bold truncate ${color}`}>{value}</div>
  </div>
);

const GapMap = ({ pipelineGapsData, setView }) => {
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedTarget, setSelectedTarget] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dossier');
  const [selectedMncIdx, setSelectedMncIdx] = useState(0);

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

  const matrixTargets = useMemo(() => {
    if (selectedArea !== 'All') return TARGET_DICTIONARY[selectedArea] || [];
    const targets = new Set();
    filteredGaps.forEach(gap => {
      if (gap.secondary_targets) gap.secondary_targets.forEach(t => targets.add(t));
    });
    return Array.from(targets).sort();
  }, [selectedArea, filteredGaps]);

  const activeGap = filteredGaps[selectedMncIdx] || filteredGaps[0];

  // Compute total revenue at risk for active gap
  const totalRevAtRisk = useMemo(() => {
    if (!activeGap?.expiring_patents) return 0;
    return activeGap.expiring_patents.reduce((sum, p) => {
      const match = String(p.revenue_at_risk).match(/[\d.]+/);
      return sum + (match ? parseFloat(match[0]) : 0);
    }, 0);
  }, [activeGap]);

  // Compute pipeline coverage ratio
  const pipelineCoverage = useMemo(() => {
    if (!activeGap?.secondary_targets || !activeGap.current_pipeline) return 0;
    const covered = activeGap.secondary_targets.filter(t => 
      activeGap.current_pipeline.some(p => p.type.includes(t) || p.name.includes(t))
    ).length;
    return Math.round((covered / activeGap.secondary_targets.length) * 100);
  }, [activeGap]);

  return (
    <div className="space-y-5 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        <div>
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors font-bold text-xs mb-3 uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Terminal
          </button>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <Cpu className="text-cyan-500" size={28} /> Pipeline Gap Map
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 max-w-xl">Comprehensive intelligence on MNC pipeline deficiencies, patent cliffs, and acquisition urgency across therapeutic areas.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className="flex bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-1 shadow-lg shrink-0">
            <button onClick={() => setActiveTab('dossier')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'dossier' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-md' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
              <LayoutList size={14} /> Dossier
            </button>
            <button onClick={() => setActiveTab('matrix')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'matrix' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-md' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
              <Grid3X3 size={14} /> Matrix
            </button>
          </div>
          <div className="relative flex-grow sm:w-56">
            <input type="text" placeholder="Search MNCs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all shadow-lg" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-3 flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Area:</span>
          <select value={selectedArea} onChange={(e) => { setSelectedArea(e.target.value); setSelectedTarget('All'); setSelectedMncIdx(0); }} className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none w-full sm:w-auto min-w-[140px]">
            {availableAreas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
        <div className="hidden sm:block w-px h-6 bg-slate-800"></div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Target:</span>
          <select value={selectedTarget} onChange={(e) => { setSelectedTarget(e.target.value); setSelectedMncIdx(0); }} className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none w-full sm:w-auto min-w-[140px]">
            {availableTargets.map(target => <option key={target} value={target}>{target}</option>)}
          </select>
        </div>
        <div className="hidden sm:block flex-grow"></div>
        <div className="text-[10px] text-slate-500 font-mono">{filteredGaps.length} MNC entr{filteredGaps.length === 1 ? 'y' : 'ies'}</div>
      </div>

      {filteredGaps.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">No Gap Data Found</h3>
          <p className="text-sm text-slate-500">Try adjusting your filters.</p>
        </div>
      ) : activeTab === 'dossier' ? (
        /* ── DOSSIER VIEW ── */
        <div className="flex flex-col lg:flex-row gap-5" style={{ minHeight: '820px' }}>
          {/* Master List */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">MNC Acquisition Targets</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1" style={{ maxHeight: '780px' }}>
              {filteredGaps.map((gap, idx) => (
                <button key={`${gap.name}-${gap.target}-${idx}`} onClick={() => setSelectedMncIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${selectedMncIdx === idx ? 'bg-slate-800/80 border-cyan-500/40 shadow-lg' : 'bg-transparent border-transparent hover:bg-slate-800/40'}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="font-bold text-white text-sm truncate pr-2">{gap.name}</div>
                    <div className={`text-xs font-black font-mono shrink-0 ${gap.level >= 90 ? 'text-red-400' : gap.level >= 80 ? 'text-amber-400' : gap.level >= 60 ? 'text-cyan-400' : 'text-emerald-400'}`}>{gap.level}%</div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase font-bold tracking-widest">
                    <span className="flex items-center gap-1">{gap.hq_country && <Globe size={8} />} {gap.target}</span>
                    {gap.expiring_patents && gap.expiring_patents.length > 0 && (
                      <span className="flex items-center gap-1 text-red-400/70"><ShieldAlert size={8} /> LOE {gap.expiring_patents[0].year}</span>
                    )}
                  </div>
                  {gap.total_revenue && <div className="text-[9px] text-slate-600 font-mono mt-1">Rev: {gap.total_revenue} · MCap: {gap.market_cap_value}</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Detail Dossier */}
          {activeGap && (
            <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
              <div className={`absolute top-0 left-0 right-0 h-1 ${activeGap.color} opacity-70`} />
              
              {/* Header */}
              <div className="p-6 pb-4 border-b border-slate-800 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-5 min-w-0">
                    <UrgencyRing level={activeGap.level} />
                    <div className="min-w-0">
                      <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2 truncate">{activeGap.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded tracking-widest border border-slate-700">{activeGap.target}</span>
                        {activeGap.hq_country && <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded tracking-widest border border-slate-700 flex items-center gap-1"><Globe size={9}/> {activeGap.hq_country}</span>}
                        {activeGap.ceo && <span className="text-[9px] text-slate-500 font-mono">CEO: {activeGap.ceo}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeGap.preferred_deal_type && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">{activeGap.preferred_deal_type}</span>}
                        {activeGap.deal_size_range && <span className="text-[8px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">{activeGap.deal_size_range}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <StatPill icon={Building2} label="Revenue" value={activeGap.total_revenue || 'N/A'} color="text-white" />
                  <StatPill icon={Beaker} label="R&D Spend" value={activeGap.r_and_d_spend || 'N/A'} color="text-cyan-400" />
                  <StatPill icon={TrendingUp} label="Market Cap" value={activeGap.market_cap_value || 'N/A'} color="text-emerald-400" />
                  <StatPill icon={DollarSign} label="Warchest" value={activeGap.budget_estimate || 'N/A'} color="text-amber-400" />
                  <StatPill icon={ShieldAlert} label="Rev @ Risk" value={`$${totalRevAtRisk.toFixed(1)}B`} color="text-red-400" />
                  <StatPill icon={Activity} label="Pipeline Cover" value={`${pipelineCoverage}%`} color={pipelineCoverage > 50 ? "text-emerald-400" : "text-red-400"} />
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: '600px' }}>
                
                {activeGap.strategic_focus && (
                  <div>
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2"><Target size={13} /> Strategic Focus</h4>
                    <p className="text-slate-300 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl text-xs">{activeGap.strategic_focus}</p>
                  </div>
                )}

                {/* Competitors */}
                {activeGap.competitors && activeGap.competitors.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 flex items-center gap-2"><Users size={13} className="text-purple-400" /> Competing Acquirers</h4>
                    <div className="flex gap-2 flex-wrap">
                      {activeGap.competitors.map(c => <span key={c} className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">{c}</span>)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {/* Left: Assets + Patent Cliffs */}
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-5">
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3"><DollarSign size={12} className="text-cyan-500" /> Key Revenue Generators</h4>
                      <div className="space-y-2">
                        {activeGap.key_assets && activeGap.key_assets.map((a, i) => (
                          <div key={i} className="flex justify-between items-center text-xs border-b border-slate-800/50 pb-1.5">
                            <span className="font-bold text-slate-300">{a.name}</span>
                            <span className="font-mono text-cyan-400 shrink-0">{a.revenue_2023}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {activeGap.expiring_patents && activeGap.expiring_patents.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 tracking-widest mb-3"><ShieldAlert size={12} /> Patent Cliffs</h4>
                        <div className="space-y-2">
                          {activeGap.expiring_patents.map((p, i) => (
                            <div key={i} className="flex justify-between items-center bg-red-500/10 p-2.5 rounded-lg border border-red-500/15">
                              <div>
                                <div className="text-xs font-bold text-white">{p.asset}</div>
                                <div className="text-[9px] font-black tracking-widest text-red-400/70 uppercase">LOE: {p.year}</div>
                              </div>
                              <div className="text-xs font-mono font-black text-red-400 shrink-0">{p.revenue_at_risk}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Pipeline + Targets */}
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-5">
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2"><Activity size={12} className="text-purple-500" /> Target Gap Coverage</h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {activeGap.secondary_targets && activeGap.secondary_targets.map(t => {
                          const covered = activeGap.current_pipeline && activeGap.current_pipeline.some(p => p.type.includes(t) || p.name.includes(t));
                          return <span key={t} className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg border ${covered ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>{t} {covered ? '✓' : '✗'}</span>;
                        })}
                      </div>
                    </div>

                    {activeGap.scientific_data_overview && (
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Scientific Rationale</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-3">"{activeGap.scientific_data_overview}"</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Internal Clinical Pipeline</h4>
                      <div className="space-y-2">
                        {activeGap.current_pipeline && activeGap.current_pipeline.map((p, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                            <div>
                              <div className="text-xs font-bold text-slate-200">{p.name}</div>
                              <div className="text-[9px] text-slate-500 font-mono mt-0.5">{p.type}</div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${p.phase === 'Approved' || p.phase === 'Launched' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{p.phase}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* M&A History */}
                {activeGap.recent_acquisitions && activeGap.recent_acquisitions.length > 0 && (
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-cyan-500 tracking-widest mb-3"><Briefcase size={12} /> M&A Track Record</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {activeGap.recent_acquisitions.map((acq, i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-cyan-500/30 transition-colors">
                          <div>
                            <div className="text-xs font-bold text-slate-200 flex items-center gap-1">{acq.name} <ArrowUpRight size={10} className="text-slate-600 group-hover:text-cyan-400 transition-colors" /></div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{acq.area} · {acq.year}</div>
                          </div>
                          <div className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">{acq.value}</div>
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
        /* ── MATRIX VIEW ── */
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-slate-950 p-3 border-b border-r border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[220px]">MNC / Urgency</th>
                {matrixTargets.map(target => (
                  <th key={target} className="p-3 border-b border-slate-800 border-r last:border-r-0 text-[10px] font-mono font-bold text-slate-300 min-w-[120px] text-center bg-slate-950/50">{target}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredGaps.map((gap, rowIdx) => (
                <tr key={`${gap.name}-${gap.target}-${rowIdx}`} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800/80 p-3 border-b border-r border-slate-800 transition-colors">
                    <div className="font-bold text-white text-xs whitespace-nowrap">{gap.name}</div>
                    <div className="flex items-center gap-2 mt-1 whitespace-nowrap">
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{gap.target}</div>
                      <div className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${gap.level >= 90 ? 'bg-red-500/20 text-red-400' : gap.level >= 80 ? 'bg-amber-500/20 text-amber-400' : gap.level >= 60 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{gap.level}%</div>
                    </div>
                  </td>
                  {matrixTargets.map(target => {
                    const isTargetGap = gap.secondary_targets && gap.secondary_targets.includes(target);
                    const isInPipeline = gap.current_pipeline && gap.current_pipeline.some(p => p.type.includes(target) || p.name.includes(target));
                    let cellBg = "bg-transparent";
                    let content = <span className="text-slate-800 text-lg">·</span>;
                    if (isTargetGap && !isInPipeline) {
                      const intensity = gap.level >= 90 ? 'bg-red-500/15' : gap.level >= 80 ? 'bg-red-500/10' : 'bg-amber-500/10';
                      cellBg = intensity;
                      content = <span className={`text-[9px] font-black uppercase tracking-widest ${gap.level >= 90 ? 'text-red-400' : 'text-amber-400'}`}>GAP</span>;
                    } else if (isTargetGap && isInPipeline) {
                      cellBg = "bg-amber-500/10";
                      content = <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Partial</span>;
                    } else if (isInPipeline) {
                      cellBg = "bg-emerald-500/10";
                      content = <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 size={10}/> Covered</span>;
                    }
                    return (
                      <td key={target} className={`p-3 border-b border-slate-800/60 border-r last:border-r-0 text-center align-middle ${cellBg} transition-colors`}>{content}</td>
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

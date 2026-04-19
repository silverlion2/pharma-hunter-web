import React, { useState, useEffect } from 'react';
import { ShieldAlert, Clock, TrendingUp, AlertTriangle, ArrowRight, Building2, Map, Zap, Users, CalendarDays, Radio, MapPin, Briefcase, MessageCircle } from 'lucide-react';
import { biosecureData as mockBiosecureData, conferencePulseData as mockConferencePulseData } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
export default function BiosecureTracker({ userRole }) {
  const [activeTab, setActiveTab] = useState('conference'); // 'biosecure' | 'conference'
  const [agendaDay, setAgendaDay] = useState(0);

  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900 rounded-3xl border border-slate-800">
        <ShieldAlert size={48} className="text-slate-700 mb-4" />
        <h2 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-widest">Restricted Access</h2>
        <p className="text-sm text-slate-400">The Pharma BD Intelligence Hub is currently restricted to Admin users.</p>
      </div>
    );
  }

  const [biosecureData, setBiosecureData] = useState(mockBiosecureData);
  const [conferencePulseData, setConferencePulseData] = useState(mockConferencePulseData);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data: bData } = await supabase.from('biosecure_signals').select('*').limit(1);
        if (bData && bData.length > 0) {
          setBiosecureData(bData[0]);
        }
        
        const { data: cData } = await supabase.from('conference_pulse').select('*').limit(1);
        if (cData && cData.length > 0) {
          setConferencePulseData(cData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch Biosecure component data: ", err);
      }
    };
    fetchData();
  }, []);

  const { timeline, exposureMap, dealFlow } = biosecureData || mockBiosecureData;
  const { conference, stats, rumoredDeals, agenda, signalFeed } = conferencePulseData || mockConferencePulseData;

  const moodColors = {
    'RUMOR': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
    'CONFIRMED': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    'BREAKING': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400' },
    'STRATEGIC': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  };

  const getProbColor = (prob) => {
    if (prob >= 70) return 'bg-emerald-500';
    if (prob >= 50) return 'bg-amber-500';
    return 'bg-slate-500';
  };

  return (
    <div className="space-y-8 animate-in mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <ShieldAlert size={28} className="text-red-500" />
            Pharma BD Intelligence
            <span className="text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-1 rounded-sm font-black tracking-widest ml-2 align-middle">ADMIN ONLY</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Geopolitical BD signals, cross-border licensing paradoxes, and live conference intelligence.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 w-max">
        <button
          onClick={() => setActiveTab('conference')}
          className={`px-5 py-2.5 rounded-lg font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'conference' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
        >
          <Zap size={14} className={activeTab === 'conference' ? 'animate-pulse' : ''} />
          CONFERENCE PULSE
          {conference.status === 'LIVE' && (
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('biosecure')}
          className={`px-5 py-2.5 rounded-lg font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'biosecure' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
        >
          <ShieldAlert size={14} />
          BIOSECURE ACT
        </button>
      </div>

      {/* ============ CONFERENCE PULSE TAB ============ */}
      {activeTab === 'conference' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-orange-900/20 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    {conference.status}
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-1 rounded-full font-bold tracking-widest">DAY {conference.currentDay || 3} — FINAL DAY</span>
                  {stats.dealsAnnounced && <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full font-bold tracking-widest">{stats.chinaDealsAnnounced} CHINA DEALS CONFIRMED</span>}
                </div>
                <h2 className="text-xl font-black text-white tracking-tight mb-1">{conference.name}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-amber-400" /> {conference.location}</span>
                  <span className="text-slate-700">|</span>
                  <span className="flex items-center gap-1"><CalendarDays size={12} className="text-amber-400" /> {conference.dates}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 max-w-lg leading-relaxed">{conference.description}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                {[
                  { label: 'Attendees', value: stats.attendees, icon: Users },
                  { label: 'BD Meetings', value: stats.partneringMeetings, icon: Briefcase },
                  { label: 'China Delegates', value: stats.chinaDelegates, icon: MapPin },
                  { label: 'Deals Announced', value: stats.dealsAnnounced || '0', icon: Zap },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center min-w-[100px]">
                    <s.icon size={14} className="text-amber-400 mx-auto mb-1.5" />
                    <div className="text-lg font-black font-mono text-white">{s.value}</div>
                    <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Grid: Deals + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* China Out-Licensing Watchlist */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <Radio size={14} className="animate-pulse" /> China Out-Licensing Watchlist
                </h3>
                <span className="text-[9px] text-slate-500 font-bold">RUMORED & SPECULATED DEALS</span>
              </div>
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead className="bg-slate-950/50">
                    <tr className="border-b border-slate-800">
                      <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Chinese Biotech</th>
                      <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">MNC Partner</th>
                      <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset / Target</th>
                      <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Est. Value</th>
                      <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rumoredDeals.sort((a, b) => b.probability - a.probability).map((deal) => (
                      <tr key={deal.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group ${deal.probability === 100 ? 'bg-emerald-500/5' : ''}`}>
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-200 text-sm">{deal.company}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <ArrowRight size={10} className="text-amber-500" />
                            <span className="font-bold text-amber-400 text-sm">{deal.partner}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs">{deal.asset}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-800 inline-block px-1.5 py-0.5 rounded mt-0.5 w-max">{deal.target}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-mono font-black text-emerald-400 text-sm">{deal.estimatedValue}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-full max-w-[80px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${getProbColor(deal.probability)} transition-all`} style={{ width: `${deal.probability}%` }} />
                            </div>
                            <span className={`text-[10px] font-black font-mono ${deal.probability >= 70 ? 'text-emerald-400' : deal.probability >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>{deal.probability}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-slate-800 bg-slate-950/50">
                <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest italic">
                  Speculative intelligence only — not confirmed deals. Monitor for press releases.
                </p>
              </div>
            </div>

            {/* Sidebar: Agenda + Signal Feed */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* Agenda */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-widest flex items-center gap-2 mb-4">
                  <CalendarDays size={14} className="text-cyan-500" /> Conference Agenda
                </h3>
                <div className="flex gap-1 mb-4">
                  {agenda.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAgendaDay(idx)}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border ${agendaDay === idx ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'}`}
                    >
                      Day {idx + 1}
                    </button>
                  ))}
                </div>
                <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar max-h-[320px]">
                  {agenda[agendaDay]?.sessions.map((session, idx) => (
                    <div key={idx} className={`flex gap-3 p-2.5 rounded-lg border transition-colors ${session.highlight ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-slate-800/20 border-slate-800/50'}`}>
                      <div className="shrink-0">
                        <span className="text-[10px] font-mono font-black text-cyan-400">{session.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-bold leading-snug ${session.highlight ? 'text-white' : 'text-slate-400'}`}>{session.title}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest mt-1 inline-block px-1.5 py-0.5 rounded ${session.highlight ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>{session.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Signal Feed */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
                <h3 className="text-xs font-black uppercase text-slate-300 tracking-widest flex items-center gap-2 mb-4">
                  <MessageCircle size={14} className="text-amber-400 animate-pulse" /> Live Signal Feed
                </h3>
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[360px] pr-1">
                  {signalFeed.map((signal, idx) => {
                    const mc = moodColors[signal.mood] || moodColors['STRATEGIC'];
                    return (
                      <div key={idx} className={`p-3 rounded-xl border ${mc.border} ${mc.bg} transition-colors hover:opacity-90`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${mc.dot}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${mc.text}`}>{signal.mood}</span>
                          </div>
                          <span className="text-[8px] font-mono text-slate-600">{signal.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed mb-1.5">{signal.text}</p>
                        <span className="text-[8px] text-slate-600 italic">via {signal.source}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* TA Heatmap Mini Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-black uppercase text-slate-300 tracking-widest flex items-center gap-2 mb-5">
              <TrendingUp size={14} className="text-emerald-400" /> Expected Deal Announcements by TA
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Oncology (ADC/Bispecific)', count: '4–5', pct: 85, color: 'from-red-500 to-rose-400' },
                { name: 'Autoimmune', count: '1–2', pct: 35, color: 'from-indigo-500 to-violet-400' },
                { name: 'Metabolic', count: '0–1', pct: 15, color: 'from-emerald-500 to-teal-400' },
                { name: 'CNS / Other', count: '0–1', pct: 10, color: 'from-sky-500 to-blue-400' },
              ].map((ta, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-colors">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{ta.name}</div>
                  <div className="text-2xl font-black font-mono text-white mb-3">{ta.count}</div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${ta.color} rounded-full transition-all`} style={{ width: `${ta.pct}%` }} />
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1.5">{ta.pct}% of total expected</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ BIOSECURE ACT TAB (EXISTING) ============ */}
      {activeTab === 'biosecure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BCC Timeline Radar */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xs tracking-widest uppercase text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  BCC Timeline Radar
                </h2>
              </div>
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center mt-1">
                      <div className={`w-3 h-3 rounded-full border-2 ${item.status === 'past' ? 'bg-slate-600 border-slate-500' : item.status === 'imminent' ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-slate-900 border-cyan-500'}`} />
                      {idx < timeline.length - 1 && <div className="w-0.5 h-full bg-slate-800 my-1" />}
                    </div>
                    <div className={`pb-4 ${item.status === 'past' ? 'opacity-50' : ''}`}>
                      <div className="text-[10px] font-black tracking-widest text-cyan-500 mb-1">{item.date}</div>
                      <div className="text-sm font-bold text-slate-200">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Paradox Deal Flow Monitor */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xs tracking-widest uppercase text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  The Paradox Deal Flow
                </h2>
              </div>
              <p className="text-[10px] text-slate-500 mb-4 italic">China-to-West out-licensing continues at record highs despite decoupling pressure.</p>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {dealFlow.map((deal, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
                        <span>{deal.licensor}</span>
                        <ArrowRight size={12} className="text-slate-500" />
                        <span className="text-amber-400">{deal.licensee}</span>
                      </div>
                      <div className="text-[9px] text-slate-400">{deal.structure} • {deal.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400">{deal.value}</div>
                      <div className="text-[8px] font-mono text-slate-500 mt-1">PARADOX: {deal.paradox_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Entity Status & Exposure Maps */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-xs tracking-widest uppercase text-slate-300 flex items-center gap-2">
                <Map className="w-4 h-4 text-red-500" />
                Entity Status & Exposure Maps
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 px-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Target Entity</th>
                    <th className="py-3 px-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Risk Level</th>
                    <th className="py-3 px-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Known Western Partners</th>
                    <th className="py-3 px-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Shift Trend (Alt CDMOs)</th>
                  </tr>
                </thead>
                <tbody>
                  {exposureMap.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-bold text-sm text-slate-200 flex items-center gap-2">
                        <Building2 size={14} className="text-slate-500" /> {item.entity}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[9px] font-black px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          {item.risk.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {item.westernPartners.join(', ')}
                      </td>
                      <td className="py-4 px-4 text-xs text-indigo-300">
                        {item.shiftTrend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

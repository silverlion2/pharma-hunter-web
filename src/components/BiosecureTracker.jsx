import React from 'react';
import { ShieldAlert, Clock, TrendingUp, AlertTriangle, ArrowRight, Building2, Map } from 'lucide-react';
import { biosecureData } from '../data/mockData';

export default function BiosecureTracker({ userRole }) {
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900 rounded-3xl border border-slate-800">
        <ShieldAlert size={48} className="text-slate-700 mb-4" />
        <h2 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-widest">Restricted Access</h2>
        <p className="text-sm text-slate-400">The Biosecure Impact Tracker is currently restricted to Admin users.</p>
      </div>
    );
  }

  const { timeline, exposureMap, dealFlow } = biosecureData;

  return (
    <div className="space-y-8 animate-in mt-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white hover:text-cyan-400 transition-colors uppercase tracking-widest flex items-center gap-3">
            <ShieldAlert size={28} className="text-red-500" />
            Biosecure Impact Tracker
            <span className="text-[10px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-1 rounded-sm font-black tracking-widest ml-2 align-middle">ADMIN ONLY</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Real-time tracking of geopolitical shifts, CDMO supply chain uncoupling, and cross-border licensing paradoxes triggered by the Biosecure Act.
          </p>
        </div>
      </div>

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
  );
}

import React, { useState } from 'react';
import { Star, TrendingUp, TrendingDown, Minus, ArrowRight, ChevronLeft, Newspaper, Bell } from 'lucide-react';
import AlertConfigModal from './AlertConfigModal';

const DeltaPill = ({ label, current, historical }) => {
  if (historical === null || historical === undefined) {
    return (
      <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-800 min-w-[56px]">
        <span className="text-[8px] font-black text-slate-500 tracking-widest">{label}</span>
        <span className="text-[10px] font-bold text-slate-600">NEW</span>
      </div>
    );
  }

  const delta = current - historical;
  const isUp = delta > 0.5;
  const isDown = delta < -0.5;

  const color = isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-500';
  const borderColor = isUp ? 'border-emerald-500/20' : isDown ? 'border-red-500/20' : 'border-slate-800';
  const bgColor = isUp ? 'bg-emerald-500/5' : isDown ? 'bg-red-500/5' : 'bg-slate-800/50';
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${bgColor} border ${borderColor} min-w-[56px]`}>
      <span className="text-[8px] font-black text-slate-500 tracking-widest">{label}</span>
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon size={10} />
        <span className="text-[10px] font-black">{isUp ? '+' : ''}{delta.toFixed(1)}</span>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-[9px] font-bold text-slate-500 w-20 shrink-0 truncate">{label}</span>
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        style={{ width: `${Math.min(score, 100)}%` }}
      />
    </div>
    <span className="text-[9px] font-mono font-black text-slate-400 w-6 text-right">{score}</span>
  </div>
);

const Watchlist = ({
  trackedTickers = [],
  assetData = [],
  watchlistHistory = {},
  toggleTrackTicker,
  setView,
  setSelectedTicker,
  handleSelect,
}) => {
  const trackedAssets = assetData.filter(a => trackedTickers.includes(a.ticker));
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTicker, setConfigTicker] = useState(null);
  const [configName, setConfigName] = useState(null);

  const getStatusBadge = (score) => {
    if (score >= 90) return { text: 'S-CLASS', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (score >= 80) return { text: 'A-CLASS', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { text: 'B-CLASS', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-all font-bold text-xs">
          <ChevronLeft size={14} /> BACK
        </button>
      </div>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">My Watchlist</h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {trackedAssets.length} asset{trackedAssets.length !== 1 ? 's' : ''} tracked • Score deltas since 1D / 7D / 30D
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {trackedAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
            <Star className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-sm text-slate-400 font-bold">No starred assets yet.</p>
          <p className="text-xs text-slate-600 max-w-xs text-center">
            Go to the Dashboard and click the ★ icon on any asset to add it to your watchlist.
          </p>
          <button 
            onClick={() => setView('dashboard')} 
            className="mt-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            OPEN DASHBOARD
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {trackedAssets.map(asset => {
            const score = asset.score || 0;
            const badge = getStatusBadge(score);
            const history = watchlistHistory[asset.ticker] || {};

            const factors = [
              { label: 'Cash Pressure', score: Math.round(asset.cash_score || 50), color: 'from-blue-500 to-cyan-400' },
              { label: 'Scarcity', score: Math.round(asset.scarcity_score || 50), color: 'from-purple-500 to-indigo-400' },
              { label: 'Catalyst', score: Math.round(asset.milestone_score || 50), color: 'from-indigo-500 to-blue-500' },
              { label: 'Value Gap', score: Math.round(asset.valuation_score || 50), color: 'from-sky-400 to-cyan-300' },
            ];

            return (
              <div key={asset.ticker} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                {/* Top Row: Ticker, Score, Delta Pills */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-sm text-cyan-400 border border-slate-700">
                      {asset.ticker?.[0] || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">{asset.ticker}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${badge.bg}`}>{badge.text}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{asset.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center mr-2">
                      <span className="text-[8px] font-black text-slate-500 tracking-widest">SCORE</span>
                      <span className={`text-2xl font-black font-mono ${score >= 80 ? 'text-amber-400' : score >= 60 ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {score.toFixed(1)}
                      </span>
                    </div>
                    {/* Delta Pills */}
                    <div className="flex gap-1.5">
                      <DeltaPill label="1D" current={score} historical={history.d1} />
                      <DeltaPill label="7D" current={score} historical={history.d7} />
                      <DeltaPill label="30D" current={score} historical={history.d30} />
                    </div>
                  </div>
                </div>

                {/* Factor Bars */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                  {factors.map(f => (
                    <ScoreBar key={f.label} label={f.label} score={f.score} color={f.color} />
                  ))}
                </div>

                {/* Bottom Row: News + Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 text-slate-500 min-w-0">
                    <Newspaper size={12} className="shrink-0" />
                    <span className="text-[10px] font-medium truncate">{asset.latest_news_headline || 'No recent news'}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setConfigTicker(asset.ticker); setConfigName(asset.name); setShowConfigModal(true); }}
                      className="p-1.5 px-3 text-slate-500 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 rounded-lg transition-all"
                      title="Alert Settings"
                    >
                      <Bell size={12} />
                    </button>
                    <button
                      onClick={() => toggleTrackTicker(asset.ticker)}
                      className="px-3 py-1.5 text-[9px] font-black text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-lg transition-all"
                    >
                      UNSTAR
                    </button>
                    <button
                      onClick={() => { handleSelect(asset.ticker); setView('dashboard'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[9px] font-black rounded-lg border border-cyan-500/20 transition-all"
                    >
                      VIEW DETAILS <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Alert Config Modal */}
      <AlertConfigModal 
        isOpen={showConfigModal} 
        onClose={() => { setShowConfigModal(false); setConfigTicker(null); }} 
        ticker={configTicker} 
        assetName={configName} 
      />
    </div>
  );
};

export default Watchlist;

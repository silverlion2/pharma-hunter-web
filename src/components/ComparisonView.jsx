import React from 'react';
import { 
  ChevronLeft, Swords, DollarSign, BarChart3, Newspaper, 
  Activity, TrendingUp, AlertCircle, Cpu, Target, Clock 
} from 'lucide-react';

const ComparisonView = ({ tickers = [], assetData = [], setView, setSelectedTicker, handleSelect }) => {
  if (tickers.length !== 2) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-black text-slate-300">Invalid Comparison</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">You must select exactly two assets to enter Combat Mode.</p>
        <button onClick={() => setView('dashboard')} className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs rounded-xl">
          RETURN TO DASHBOARD
        </button>
      </div>
    );
  }

  const assetA = assetData.find(a => a.ticker === tickers[0]) || {};
  const assetB = assetData.find(a => a.ticker === tickers[1]) || {};

  const scoreA = assetA.score || 0;
  const scoreB = assetB.score || 0;
  
  // Decide who is winning overall
  const winner = scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : 'TIE';

  const FactorRow = ({ label, icon: Icon, valA, valB, invert = false, isPercent = false, isDollar = false }) => {
    const numA = parseFloat(valA) || 0;
    const numB = parseFloat(valB) || 0;
    
    // For standard scores, higher is better. If invert is true (like Cash Pressure), lower might be better or it's just raw comparison.
    // In our model: Factor scores are 0-100, HIGHER means more attractive target (even cash: 100 cash score = highly distressed/distressed is good for M&A).
    const winA = numA > numB;
    const winB = numB > numA;

    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-800/50 group hover:bg-slate-800/20 px-4 rounded-lg transition-colors">
        <div className={`w-1/3 text-right font-mono text-sm font-black ${winA ? 'text-amber-400' : 'text-slate-400'}`}>
          {isDollar ? '$' : ''}{valA}{isPercent ? '%' : ''}
        </div>
        <div className="w-1/3 flex flex-col items-center justify-center gap-1 shrink-0 px-2">
          <Icon size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
          <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase text-center">{label}</span>
        </div>
        <div className={`w-1/3 text-left font-mono text-sm font-black ${winB ? 'text-amber-400' : 'text-slate-400'}`}>
          {isDollar ? '$' : ''}{valB}{isPercent ? '%' : ''}
        </div>
      </div>
    );
  };

  const getStatusBadge = (score) => {
    if (score >= 90) return { text: 'S-CLASS', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    if (score >= 80) return { text: 'A-CLASS', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { text: 'B-CLASS', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
  };

  const badgeA = getStatusBadge(scoreA);
  const badgeB = getStatusBadge(scoreB);

  return (
    <div className="max-w-[1200px] mx-auto py-4 px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-all font-bold text-xs">
          <ChevronLeft size={14} /> BACK TO TERMINAL
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mb-10 border-b border-slate-800/50 pb-8">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 shadow-lg shadow-indigo-500/10">
          <Swords className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Asset Combat</h2>
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest mt-1">Head-to-Head Quantitative Profile</p>
      </div>

      {/* Versus Headers */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Asset A */}
        <div className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${winner === 'A' ? 'bg-slate-900 border-cyan-500/40 shadow-2xl shadow-cyan-500/10' : 'bg-slate-900/40 border-slate-800'}`}>
          {winner === 'A' && <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 left-0"></div>}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-black text-white">{assetA.ticker}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider ${badgeA.bg}`}>{badgeA.text}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{assetA.name}</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1">Overall Quant</span>
              <span className={`text-4xl font-mono font-black ${winner === 'A' ? 'text-amber-400' : 'text-slate-300'}`}>
                {scoreA.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] rounded-md font-bold uppercase">{assetA.category || 'TBD'}</span>
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] rounded-md font-bold uppercase">{assetA.target_area || 'TBD'}</span>
          </div>
        </div>

        {/* Asset B */}
        <div className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${winner === 'B' ? 'bg-slate-900 border-cyan-500/40 shadow-2xl shadow-cyan-500/10' : 'bg-slate-900/40 border-slate-800'}`}>
          {winner === 'B' && <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 left-0"></div>}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-black text-white">{assetB.ticker}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider ${badgeB.bg}`}>{badgeB.text}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{assetB.name}</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] font-black text-slate-500 tracking-widest uppercase mb-1">Overall Quant</span>
              <span className={`text-4xl font-mono font-black ${winner === 'B' ? 'text-amber-400' : 'text-slate-300'}`}>
                {scoreB.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] rounded-md font-bold uppercase">{assetB.category || 'TBD'}</span>
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[9px] rounded-md font-bold uppercase">{assetB.target_area || 'TBD'}</span>
          </div>
        </div>
      </div>

      {/* Metrics Combat Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 lg:px-12">
        <h3 className="text-center text-[10px] font-black tracking-widest text-slate-600 uppercase mb-6">Algorithm Sub-Scores</h3>
        <FactorRow label="Asset Scarcity" icon={Target} valA={Math.round(assetA.scarcity_score || 0)} valB={Math.round(assetB.scarcity_score || 0)} />
        <FactorRow label="Cash Strain" icon={AlertCircle} valA={Math.round(assetA.cash_score || 0)} valB={Math.round(assetB.cash_score || 0)} />
        <FactorRow label="Clinical Alpha" icon={Activity} valA={Math.round(assetA.clinical_score || 0)} valB={Math.round(assetB.clinical_score || 0)} />
        <FactorRow label="Catalyst Imminency" icon={Clock} valA={Math.round(assetA.milestone_score || 0)} valB={Math.round(assetB.milestone_score || 0)} />
        <FactorRow label="Value Gap" icon={TrendingUp} valA={Math.round(assetA.valuation_score || 0)} valB={Math.round(assetB.valuation_score || 0)} />

        <h3 className="text-center text-[10px] font-black tracking-widest text-slate-600 uppercase mt-10 mb-6 border-t border-slate-800/50 pt-8">Fundamental Data</h3>
        
        {/* Raw text comparisons */}
        <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
          <div className="w-1/3 text-right font-mono text-sm font-bold text-blue-400">{assetA.cash_amount || '—'}</div>
          <div className="w-1/3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest"><DollarSign size={14} className="mx-auto mb-1 opacity-50"/> Cash On Hand</div>
          <div className="w-1/3 text-left font-mono text-sm font-bold text-blue-400">{assetB.cash_amount || '—'}</div>
        </div>
        
        <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
          <div className="w-1/3 text-right font-mono text-sm font-bold text-emerald-400">{assetA.market_cap || '—'}</div>
          <div className="w-1/3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest"><BarChart3 size={14} className="mx-auto mb-1 opacity-50"/> Market Cap</div>
          <div className="w-1/3 text-left font-mono text-sm font-bold text-emerald-400">{assetB.market_cap || '—'}</div>
        </div>

        <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
          <div className="w-[40%] text-right text-xs text-slate-300 font-medium leading-relaxed">{assetA.predicted_time || '—'}</div>
          <div className="w-[20%] text-center text-[9px] font-black text-slate-500 uppercase tracking-widest"><Clock size={14} className="mx-auto mb-1 opacity-50"/> Window</div>
          <div className="w-[40%] text-left text-xs text-slate-300 font-medium leading-relaxed">{assetB.predicted_time || '—'}</div>
        </div>

        <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
          <div className="w-[40%] text-right font-mono text-sm font-black text-purple-400">{assetA.estimated_premium || '—'}</div>
          <div className="w-[20%] text-center text-[9px] font-black text-slate-500 uppercase tracking-widest"><TrendingUp size={14} className="mx-auto mb-1 opacity-50"/> Est. Premium</div>
          <div className="w-[40%] text-left font-mono text-sm font-black text-purple-400">{assetB.estimated_premium || '—'}</div>
        </div>
        
        <div className="flex justify-between items-center py-6">
          <div className="w-[45%] text-right text-[10px] text-slate-400 italic font-medium leading-snug border-r border-slate-800/50 pr-6">
            "{assetA.latest_news_headline || 'No recent news'}"
          </div>
          <div className="w-[10%] text-center text-[9px] font-black text-slate-500 uppercase tracking-widest"><Newspaper size={14} className="mx-auto opacity-50"/></div>
          <div className="w-[45%] text-left text-[10px] text-slate-400 italic font-medium leading-snug border-l border-slate-800/50 pl-6">
            "{assetB.latest_news_headline || 'No recent news'}"
          </div>
        </div>
      </div>

    </div>
  );
};

export default ComparisonView;

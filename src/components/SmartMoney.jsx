import React, { useEffect } from 'react';
import { User, ChevronLeft, Lock, Star, Activity, AlertCircle, ArrowRight } from 'lucide-react';

const SmartMoney = ({ 
  smartMoneyData = [], 
  smartMoneyLoading, 
  fetchSmartMoneyData, 
  userRole, 
  setView, 
  handleSelect,
  assetData = []
}) => {
  
  useEffect(() => {
    // Refresh data when mounting if authorized
    if (userRole === 'pro' || userRole === 'admin') {
      fetchSmartMoneyData();
    }
  }, []);

  if (userRole !== 'pro' && userRole !== 'admin') {
    return (
      <div className="max-w-[1200px] mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="w-16 h-16 text-slate-700 mb-6" />
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Smart Money Consensus</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
          This feature is exclusive to Elite Pass members. Upgrade to see which assets the top hedge funds and institutional traders are silently accumulation.
        </p>
        <button 
          onClick={() => setView('landing')} 
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-xl tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          UPGRADE NOW <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto py-4 px-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-all font-bold text-xs">
          <ChevronLeft size={14} /> BACK TO TERMINAL
        </button>
        <button 
          onClick={fetchSmartMoneyData}
          disabled={smartMoneyLoading}
          className={`flex items-center gap-2 px-4 py-2 bg-slate-800 text-amber-400 rounded-lg text-[10px] font-black tracking-widest border border-slate-700 hover:bg-slate-700 transition-colors ${smartMoneyLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Activity size={14} className={smartMoneyLoading ? 'animate-spin' : ''} />
          {smartMoneyLoading ? 'SCANNING...' : 'REFRESH DATA'}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mb-10 border-b border-slate-800/50 pb-8">
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-4 shadow-lg shadow-amber-500/10">
          <User className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Smart Money Consensus</h2>
        <p className="text-xs text-slate-400 font-medium mt-2 max-w-xl text-center leading-relaxed">
          The ultimate aggregated view of high-intent market behavior. See exactly which assets are being starred and tracked most heavily by other Pro-tier users on the BioQuantix network.
        </p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 lg:p-6 border-b border-slate-800 bg-slate-900/80 items-center">
          <div className="col-span-1 text-center text-[10px] font-black text-slate-500 tracking-widest uppercase">Rank</div>
          <div className="col-span-4 lg:col-span-5 text-left text-[10px] font-black text-slate-500 tracking-widest uppercase">Target Asset</div>
          <div className="col-span-3 lg:col-span-2 text-center text-[10px] font-black text-amber-500 tracking-widest uppercase flex items-center justify-center gap-1"><Star size={12}/> Pro Trackers</div>
          <div className="col-span-2 lg:col-span-2 text-center text-[10px] font-black text-slate-500 tracking-widest uppercase hidden sm:block">Retail Trackers</div>
          <div className="col-span-4 sm:col-span-2 lg:col-span-2 text-center text-[10px] font-black text-slate-500 tracking-widest uppercase">Total Heat</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-800/50">
          {smartMoneyLoading && smartMoneyData.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <Activity className="w-8 h-8 animate-spin mb-4 text-amber-500/50" />
              <p className="text-sm font-bold tracking-widest uppercase text-slate-400">Aggregating Global Network Data...</p>
            </div>
          ) : smartMoneyData.length > 0 ? (
            smartMoneyData.map((item, index) => {
              const fullAsset = assetData.find(a => a.ticker === item.ticker) || {};
              const isTop3 = index < 3;
              
              return (
                <div 
                  key={item.ticker} 
                  onClick={() => {
                     handleSelect(item.ticker);
                     setView('dashboard');
                  }}
                  className={`grid grid-cols-12 gap-4 p-4 lg:p-6 items-center transition-all cursor-pointer hover:bg-slate-800/40 group ${isTop3 ? 'bg-amber-500/[0.02]' : ''}`}
                >
                  <div className="col-span-1 flex justify-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${isTop3 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800/50 text-slate-400 border-slate-700/50 group-hover:border-slate-600'}`}>
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="col-span-4 lg:col-span-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className={`text-base font-black transition-colors ${isTop3 ? 'text-white' : 'text-slate-200'} group-hover:text-amber-400`}>
                          {item.ticker}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium line-clamp-1">{fullAsset.name || 'Unknown Entity'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 lg:col-span-2 flex justify-center">
                    <div className={`px-3 py-1.5 rounded-lg border font-mono text-base font-black ${isTop3 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-900 border-slate-800 text-amber-500/70'}`}>
                      {item.pro_count || 0}
                    </div>
                  </div>
                  
                  <div className="col-span-2 lg:col-span-2 justify-center hidden sm:flex">
                    <div className="font-mono text-sm font-bold text-slate-500">
                      {item.free_count || 0}
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-2 lg:col-span-2 flex justify-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden w-16">
                         {/* Visual heat bar based on total relative to #1 */}
                         <div 
                           className={`h-full ${isTop3 ? 'bg-amber-400' : 'bg-slate-600'}`} 
                           style={{ width: `${Math.max(10, Math.min(100, ((item.total_count || 0) / (smartMoneyData[0]?.total_count || 1)) * 100))}%` }}
                         />
                      </div>
                      <span className="font-mono text-xs font-black text-white">{item.total_count || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 mb-4 text-slate-700" />
              <p className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">No Tracking Data Available Yet</p>
              <p className="text-xs max-w-md">Our network of institutional users hasn't starred enough assets to form a consensus. Check back later as the market develops.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartMoney;

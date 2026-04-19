import React, { useEffect } from 'react';
import { User, ChevronLeft, Lock, Star, Activity, AlertCircle, ArrowRight, ShieldAlert, Zap } from 'lucide-react';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
        <h2 className="text-3xl font-black text-white tracking-tight">BioQuantix Institutional Flow</h2>
        <p className="text-xs text-slate-400 font-medium mt-2 max-w-xl text-center leading-relaxed">
          The ultimate aggregated view of high-intent market behavior. See exactly which assets are tracking the heaviest institutional flow on the BioQuantix network.
        </p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 lg:p-6 border-b border-slate-800 bg-slate-900/80 items-center">
          <div className="col-span-1 text-center text-[10px] font-black text-slate-500 tracking-widest uppercase">Rank</div>
          <div className="col-span-4 lg:col-span-5 text-left text-[10px] font-black text-slate-500 tracking-widest uppercase">Target Asset</div>
          <div className="col-span-3 lg:col-span-2 text-center text-[10px] font-black text-amber-500 tracking-widest uppercase flex items-center justify-center gap-1"><Star size={12}/> Pro Flow</div>
          <div className="col-span-2 lg:col-span-2 text-center text-[10px] font-black text-slate-500 tracking-widest uppercase hidden sm:block">Retail Flow</div>
          <div className="col-span-4 sm:col-span-2 lg:col-span-2 text-center text-[10px] font-black text-slate-500 tracking-widest uppercase">Conviction Heat</div>
        </div>

        {/* Table Body */}
        <div className="relative">
          {(userRole !== 'pro' && userRole !== 'admin') && (
            <div className="absolute inset-x-0 bottom-0 top-[10%] z-20 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent backdrop-blur-[2px]">
              <div className="max-w-md w-full bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center mt-8">
                <User className="w-10 h-10 text-amber-500 mb-4" />
                <h3 className="text-white font-black text-xl mb-2 tracking-tight">Consensus Gated</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Real-time network behavior and institutional positioning is a Pro feature. Upgrade to see what top-performing users are tracking right now.
                </p>
                <button
                  onClick={() => setView('upgrade')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20"
                >
                  UNLOCK PRO INTELLIGENCE
                </button>
              </div>
            </div>
          )}
          
          <div className={`divide-y divide-slate-800/50 ${(userRole !== 'pro' && userRole !== 'admin') ? 'blur-sm opacity-50 select-none pointer-events-none' : ''}`}>
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

        {/* Shadow Ledger Section */}
        <div className="mt-12 mb-6 border-t border-slate-800/50 pt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Institutional Shadow Ledger</h3>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-0.5">Live Options & Capital Flow Anomalies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartMoneyData.map(item => {
              const fullAsset = assetData.find(a => a.ticker === item.ticker) || {};
              if (!fullAsset.shadow_signals || fullAsset.shadow_signals.length === 0) return null;

              return fullAsset.shadow_signals.map((signal, sIdx) => {
                const isHighIntent = signal.mood === 'HIGH-INTENT';
                
                return (
                  <div key={`${item.ticker}-${sIdx}`} className={`bg-slate-900/60 border rounded-2xl p-4 transition-all hover:bg-slate-800/40 relative overflow-hidden ${(userRole !== 'pro' && userRole !== 'admin') ? 'blur-[3px] select-none pointer-events-none opacity-60' : 'border-slate-800 hover:border-slate-700'}`}>
                    {isHighIntent && <div className="absolute top-0 right-0 w-16 h-1 bg-gradient-to-l from-rose-500 to-transparent"></div>}
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-black text-slate-400 tracking-wider">
                          {signal.type}
                        </span>
                        {isHighIntent && (
                          <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] font-black text-rose-400 flex items-center gap-1">
                            <ShieldAlert size={10} /> {signal.mood}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{signal.date}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-black text-white">{item.ticker}</span>
                      <span className="text-[10px] text-slate-500">{fullAsset.name}</span>
                    </div>

                    <p className="text-xs text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-800 pl-3">
                      {signal.desc}
                    </p>
                  </div>
                );
              });
            })}
          </div>
          {(userRole !== 'pro' && userRole !== 'admin') && (
            <div className="flex justify-center -mt-16 relative z-30">
               <button
                  onClick={() => setView('upgrade')}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[10px] px-6 py-2.5 rounded-lg uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
                >
                  DECRYPT SIGNALS
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

export default SmartMoney;

import React, { useState } from 'react';
import { TrendingUp, AlertCircle, Cpu, Clock, Database, Activity, Lock, CheckCircle2, DollarSign, Newspaper, BarChart3, Star, Search, User, Swords, ArrowRight } from 'lucide-react';

const Dashboard = ({
  availableAreas = ['Metabolic', 'Autoimmune'], targetArea, setTargetArea, showPastDeals, themeColorText,
  activeList, currentGaps, activeAsset, safeTicker, safeName, safeCategory,
  safeScore, safeDealInfo, userRole, safeFactors, safeTime, safeUpside,
  safeDigest, safeSignals, safeCashAmount, safeNewsHeadline, safeMarketCap, isCurrentlyLocked, handleSelect,
  trackedTickers = [], toggleTrackTicker, showOnlyTracked, setShowOnlyTracked, fetchAnalyticsData,
  handleSearch, fetchSmartMoneyData,
  isCompareMode, setIsCompareMode, compareSelection, toggleCompareSelection, handleStartCombat,
  isSearching, searchStep, searchedTicker, setView
}) => {
  const [searchInput, setSearchInput] = useState('');
  
  const loadingMessages = [
    `[1/4] Parsing SEC filings for ${searchedTicker}...`,
    `[2/4] Analyzing ClinicalTrials.gov outcomes...`,
    `[3/4] Quantifying unhedged options flow...`,
    `[4/4] Finalizing predictive AI model...`
  ];
  
  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-slate-800/50 pb-4">
        <div className="flex gap-4 overflow-x-auto custom-scrollbar w-full md:w-auto">
          {availableAreas.map(area => (
          <button 
            key={area}
            onClick={() => setTargetArea(area)}
            className={`px-5 py-2.5 rounded-full text-xs font-black tracking-widest transition-all border whitespace-nowrap ${targetArea === area ? (area === 'Autoimmune' ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/20') : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
          >
            {area.toUpperCase()}
          </button>
        ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Compare Mode Toggle */}
          <div className="relative group/tooltip shrink-0">
            <button
              onClick={() => {
                setIsCompareMode(!isCompareMode);
                if (isCompareMode && compareSelection?.length > 0) {
                  // If turning off compare mode, we could clear selection or just hide it
                  // We'll let App.js handle the clearing if needed, but usually we just toggle UI
                }
              }}
              className={`px-4 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-colors flex items-center gap-2 border whitespace-nowrap shadow-lg ${isCompareMode ? 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20' : 'bg-slate-800 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300 border-slate-700'}`}
            >
              <Swords size={14} className={isCompareMode ? "animate-pulse" : ""} />
              {isCompareMode ? 'CANCEL COMBAT' : 'ASSET COMBAT'}
            </button>
            <div className="absolute top-full lg:bottom-full lg:top-auto lg:mb-2 mt-2 right-0 w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700 p-3 rounded-xl shadow-2xl invisible opacity-0 translate-y-2 lg:translate-y-0 lg:translate-y-[-8px] transition-all z-50 text-left">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Combat Mode</h4>
              <p className="text-xs text-slate-300 leading-snug">Select two assets side-by-side to compare their quantitative profiles to uncover relative alpha.</p>
            </div>
          </div>

          {userRole === 'admin' && (
          <div className="relative group/tooltip shrink-0">
            <button
              onClick={fetchSmartMoneyData}
              className="px-4 py-2.5 rounded-full text-[10px] font-black tracking-widest bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors flex items-center gap-2 border border-slate-700 whitespace-nowrap shadow-lg"
            >
              <User size={14} className="animate-pulse" />
              SMART MONEY
            </button>
            
            <div className="absolute top-full lg:bottom-full lg:top-auto lg:mb-2 mt-2 right-0 w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700 p-3 rounded-xl shadow-2xl invisible opacity-0 translate-y-2 lg:translate-y-0 lg:translate-y-[-8px] transition-all z-50 text-left cursor-default pointer-events-none">
              <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Admin Intelligence</h4>
              <p className="text-xs text-slate-300 leading-snug">Aggregate view of assets currently tracked by high-intent Pro users.</p>
            </div>
          </div>
          )}

          <div className="relative group/tooltip shrink-0">
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2.5 rounded-full text-[10px] font-black tracking-widest bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 transition-colors flex items-center gap-2 border border-slate-700 whitespace-nowrap shadow-lg shadow-cyan-500/10"
            >
              <Activity size={14} className="animate-pulse" />
              MARKET ANALYTICS <span className="text-[7px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.5 rounded-sm font-black">BETA</span>
            </button>
            
            <div className="absolute top-full lg:bottom-full lg:top-auto lg:mb-2 mt-2 right-0 w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-700 p-3 rounded-xl shadow-2xl invisible opacity-0 translate-y-2 lg:translate-y-0 lg:translate-y-[-8px] transition-all z-50 text-left">
              <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Live Leaderboards</h4>
              <p className="text-xs text-slate-300 leading-snug">Instantly discover the fastest moving assets, critical cash pressures, target scarcity rankings, and imminent clinical catalysts across all sectors.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside className="lg:col-span-3 space-y-6">
          <div className={`bg-slate-900/40 border rounded-2xl overflow-hidden transition-all ${isCompareMode ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-slate-800'}`}>
            <div className={`p-4 border-b flex justify-between items-center transition-colors ${isCompareMode ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/60 border-slate-800/80'}`}>
              <div className="flex items-center gap-4 w-full justify-between">
                <h2 className={`font-bold text-xs tracking-widest uppercase flex items-center gap-2 ${isCompareMode ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {isCompareMode ? <Swords className="w-4 h-4" /> : <TrendingUp className={`w-4 h-4 ${showPastDeals ? 'text-indigo-400' : themeColorText}`} />}
                  {isCompareMode ? `SELECT ASSETS (${compareSelection?.length || 0}/2)` : (showPastDeals ? 'Historical Deals' : 'Quant Radar')}
                </h2>
                {!showPastDeals && !isCompareMode && (
                  <div className="flex items-center gap-2">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSearch(searchInput); setSearchInput(''); }}
                      className="relative hidden xl:block"
                    >
                      <input 
                        type="text" 
                        placeholder="Scan Ticker..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 w-28 focus:w-36 focus:outline-none focus:border-cyan-500 transition-all font-mono"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400">
                        <Search size={12} />
                      </button>
                    </form>

                    <button 
                      onClick={() => setShowOnlyTracked(!showOnlyTracked)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black tracking-wider transition-colors border ${showOnlyTracked ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(251,191,36,0.1)]' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-500 hover:text-slate-300'}`}
                    >
                      <Star size={10} className={showOnlyTracked ? "fill-amber-400" : ""} />
                      {showOnlyTracked ? 'STARRED' : 'ALL'}
                    </button>
                  </div>
                )}
                {isCompareMode && compareSelection?.length === 2 && (
                  <button 
                    onClick={handleStartCombat}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[9px] rounded-lg tracking-widest animate-pulse"
                  >
                    START
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-800/30 overflow-y-auto max-h-[500px] custom-scrollbar relative">
              {isSearching && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col justify-center items-center p-6 text-center">
                   <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-cyan-500 animate-spin mb-4" />
                   <div className="font-mono text-xs text-cyan-400 font-bold mb-2">
                     SCANNING {searchedTicker}...
                   </div>
                   <div className="text-[10px] text-slate-400 font-mono w-full max-w-[200px] text-left">
                      {loadingMessages.map((msg, idx) => (
                        <div key={idx} className={`mb-1 transition-opacity duration-300 ${idx <= searchStep ? 'opacity-100' : 'opacity-0'}`}>
                          {msg}
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeList.map((item) => {
                const isSelectedForCompare = compareSelection?.includes(item.ticker);
                const isCompareDisabled = isCompareMode && !isSelectedForCompare && compareSelection?.length >= 2;
                
                return (
                  <div 
                    key={item.ticker}
                    onClick={() => {
                      if (isCompareMode) {
                        if (item.locked) return;
                        if (!isCompareDisabled) toggleCompareSelection(item.ticker);
                      } else {
                        handleSelect(item.ticker);
                      }
                    }}
                    className={`group px-4 py-3.5 flex items-center justify-between transition-all ${item.locked || isCompareDisabled ? `opacity-50 cursor-not-allowed` : 'cursor-pointer hover:bg-white/[0.02]'} ${(!isCompareMode && safeTicker === item.ticker && !item.locked) ? 'bg-white/[0.04]' : ''} ${isCompareMode && isSelectedForCompare ? 'bg-indigo-500/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {isCompareMode ? (
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelectedForCompare ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-600 bg-slate-900 group-hover:border-indigo-500/50'}`}>
                          {isSelectedForCompare && <CheckCircle2 size={12} strokeWidth={4} />}
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black ${item.locked ? 'text-[9px]' : 'text-xs'} border ${item.locked ? 'bg-slate-900 text-slate-500 border-slate-700 w-11' : `bg-slate-800/50 ${themeColorText} border-slate-700/50`}`}>
                          {item.display_ticker || item.ticker}
                        </div>
                      )}
                      
                      <div>
                        <div className={`text-sm font-bold text-slate-200 transition-colors line-clamp-1 ${!item.locked && !isCompareDisabled && !isCompareMode && `group-hover:${themeColorText}`} ${isCompareMode && isSelectedForCompare && 'text-indigo-400'}`}>
                          {!isCompareMode && isSelectedForCompare ? '' : (item.display_name || item.name)}
                          {isCompareMode && <span className="mr-2 font-mono text-[10px] text-slate-500">[{item.display_ticker || item.ticker}]</span>}
                          {isCompareMode && (item.display_name || item.name)}
                        </div>
                        <div className={`text-[9px] font-black tracking-widest mt-0.5 ${item.status === 'IMMINENT' || item.status === 'ACQUIRED' ? 'text-blue-400' : 'text-slate-500'}`}>
                          {item.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {item.fto_risk && !item.locked && !isCompareMode && (
                        <div className="hidden sm:flex flex-col items-end gap-0.5 mr-2">
                          <span className={`text-[9px] font-black tracking-widest ${item.fto_risk === 'LOW' ? 'text-emerald-500' : item.fto_risk === 'MODERATE' ? 'text-amber-500' : 'text-red-500'}`}>
                            {item.fto_risk} FTO
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono tracking-widest">
                            IP: {item.ip_score}/100
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {(item.warning_flag === 'AI_TIMEOUT' || item.warning_flag === 'SEC_MISSING') && !item.locked && (
                          <div className="group/tooltip relative flex items-center">
                            <AlertCircle className="w-4 h-4 text-amber-500 cursor-help" />
                            <div className="absolute right-0 top-6 w-52 p-2 bg-slate-800 border border-slate-700 text-[9px] text-slate-300 rounded opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-xl">
                              {item.warning_flag === 'AI_TIMEOUT' 
                                ? 'Data source feedback delayed. Displaying T-1 cached evaluation.' 
                                : 'Data source feedback delayed. Using historical or neutral baseline.'}
                            </div>
                          </div>
                        )}
                        <div className={`text-sm font-mono font-black ${item.locked ? 'text-slate-800' : (isCompareMode && isSelectedForCompare ? 'text-indigo-400' : 'text-slate-300')}`}>
                          {item.locked ? '?.?' : item.score}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeList.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-slate-500">No signals detected yet.</div>
              )}
              {userRole === 'visitor' && (
                <div className="sticky bottom-0 z-20 mx-1 mt-2">
                  <div className="p-4 rounded-xl border border-dashed border-cyan-500/50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-2 shadow-2xl shadow-cyan-500/5">
                    <Lock size={16} className="text-cyan-500 mb-1" />
                    <p className="text-[10px] text-slate-400 font-medium leading-tight text-center">
                      Viewing limited sector sample. Dozens of highly-correlated assets are hidden.
                    </p>
                    <ul className="text-[9px] text-slate-500 w-full mb-1 space-y-1">
                      <li className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-cyan-500"/> Personal Watchlist & Tracking</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-cyan-500"/> Access to More Tickers</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-cyan-500"/> Limited Ticker Search (3/day)</li>
                    </ul>
                    <button 
                      onClick={() => setView && setView('auth')} 
                      className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-900 bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20 w-full"
                    >
                      Join Free to Unlock More Features
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-slate-400 text-xs font-black tracking-widest uppercase flex items-center gap-2`}>
                <Cpu className={`w-4 h-4 ${themeColorText}`} /> Pipeline Gap Map
              </h3>
              <button 
                onClick={() => setView && setView('gap-map')}
                className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 bg-slate-800/50 hover:bg-slate-800 px-2 py-1 rounded-md border border-slate-700/50"
              >
                View Full Horizon <span className="text-[7px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.5 rounded-sm font-black">BETA</span> <ArrowRight size={10} />
              </button>
            </div>
            <p className="text-[9px] text-slate-500 italic mb-5 leading-tight">
              Urgency reflects MNC's impending patent cliffs (revenue at risk) and strategic desperation for assets in this sector.
            </p>
            <div className="space-y-6">
              {currentGaps.length > 0 ? currentGaps.map((m) => (
                <div key={m.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                       <span className="text-white text-[11px] font-black">{m.name}</span>
                       <span className="text-[9px] text-slate-500">{m.target}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Urgency: {m.level}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color}`} style={{ width: `${m.level}%` }} />
                  </div>
                </div>
              )) : (
                <div className="text-xs text-slate-600 text-center py-4">No data available</div>
              )}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {activeAsset && (
          <section className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
              <div className="flex gap-6 items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 shadow-lg ${showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-500 text-white shadow-indigo-500/10' : 'bg-cyan-500 text-slate-900 shadow-cyan-500/10'}`}>
                  {safeTicker}
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center flex-wrap gap-2">
                    {safeName} 
                    <span className="text-slate-500 font-mono text-xl mr-2">[{activeAsset.display_ticker || activeAsset.ticker}]</span>
                    {!showPastDeals && (
                      <button 
                        onClick={() => toggleTrackTicker && toggleTrackTicker(activeAsset.ticker)}
                        className="hover:scale-110 active:scale-95 transition-transform"
                        title={trackedTickers?.includes(activeAsset.ticker) ? "Untrack Ticker" : "Track Ticker"}
                      >
                        <Star 
                          className={`w-6 h-6 transition-all ${trackedTickers?.includes(activeAsset.ticker) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'text-slate-600 hover:text-slate-400'}`} 
                        />
                      </button>
                    )}
                  </h2>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] rounded-md font-bold uppercase">{safeCategory}</span>
                    
                    <span className={`px-2.5 py-1 text-[10px] rounded-md font-bold uppercase ${showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      {showPastDeals ? 'M&A Validated' : (
                        <div className="group/badge relative flex items-center gap-1 cursor-help">
                          {safeScore >= 90 ? 'S-Class Asset' : (safeScore >= 80 ? 'A-Class Target' : 'B-Class Watchlist')}
                          <AlertCircle size={10} className="text-slate-500" />
                          <div className="absolute top-full mt-1 left-0 w-64 p-2 bg-slate-800 border border-slate-700 text-[9px] text-slate-300 rounded opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all z-50 shadow-xl whitespace-normal normal-case font-normal leading-relaxed">
                            <span className="font-bold text-cyan-400">S-Class (90+):</span> Extremely scarce asset with imminent catalysts.<br/>
                            <span className="font-bold text-blue-400">A-Class (80+):</span> High-potential buyout target.<br/>
                            <span className="font-bold text-slate-400">B-Class (&lt;80):</span> Monitor for future developments.
                          </div>
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 shrink-0">
                <div className="px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                  <div className="text-[9px] text-slate-600 font-black uppercase mb-1">
                    {showPastDeals ? 'T-7 Days Score' : 'Quant Score'}
                  </div>
                  <div className={`text-3xl font-mono font-black leading-none ${showPastDeals || targetArea === 'Autoimmune' ? 'text-indigo-400' : 'text-cyan-400'}`}>{safeScore}</div>
                </div>
              </div>
            </div>

            {showPastDeals && safeDealInfo && (
              <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-indigo-400" />
                <span className="text-indigo-200 font-black text-sm tracking-wide">{safeDealInfo}</span>
              </div>
            )}

            {!showPastDeals && (
              <div className="flex flex-wrap items-stretch gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Cash</span>
                  <span className="text-sm font-mono font-black text-blue-400">{safeCashAmount}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Mkt Cap</span>
                  <span className="text-sm font-mono font-black text-emerald-400">{safeMarketCap}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/5 border border-violet-500/20 rounded-xl flex-1 min-w-0">
                  <Newspaper className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider shrink-0">News</span>
                  <span className="text-xs text-violet-300 italic truncate" title={safeNewsHeadline}>{safeNewsHeadline}</span>
                </div>
              </div>
            )}

            {!showPastDeals && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                {safeFactors.map((f, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 flex flex-col justify-center group/card hover:border-white/[0.1] transition-all">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{f.label}</span>
                      <div className="group/tooltip2 relative flex items-center shrink-0">
                        <span className={`text-sm font-mono font-black px-2 py-1 rounded cursor-help bg-white/[0.08] ${f.score >= 80 ? 'text-cyan-400' : f.score >= 50 ? 'text-slate-300' : 'text-slate-500'}`}>{f.score}%</span>
                        <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-slate-800 border border-slate-700 text-[9px] text-slate-300 rounded opacity-0 invisible group-hover/tooltip2:opacity-100 group-hover/tooltip2:visible transition-all z-50 shadow-xl normal-case flex-wrap">
                           {f.desc}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold text-white mb-2 tracking-tight truncate leading-snug" title={f.raw}>{f.raw}</div>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden mb-2">
                      <div className={`h-full bg-gradient-to-r ${f.color} transition-all duration-700`} style={{ width: `${f.score}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium uppercase leading-snug line-clamp-2 min-h-[1.75rem]" title={f.desc}>{f.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {!showPastDeals && (
              <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-slate-950 rounded-2xl border border-slate-800/60 mb-8 relative">
                <div className={`flex flex-col md:flex-row items-center gap-6 w-full ${isCurrentlyLocked ? 'blur-[3px] opacity-40 select-none pointer-events-none' : ''}`}>
                  <div className="flex-1">
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Transaction Prediction</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-md italic">Calculated based on institutional BD benchmarks and current MarketData API volume intensity.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                    <div className={`flex items-center gap-4 px-5 py-3 bg-opacity-5 border rounded-xl w-full sm:w-auto ${targetArea === 'Autoimmune' ? 'bg-indigo-500 border-indigo-500/20' : 'bg-cyan-500 border-cyan-500/20'}`}>
                      <Clock className={`shrink-0 ${themeColorText}`} size={18} />
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Predicted Execution</div>
                        <div className={`text-lg font-mono font-black leading-none ${themeColorText}`}>{safeTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 px-5 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl w-full sm:w-auto">
                      <TrendingUp className="text-emerald-400 shrink-0" size={18} />
                      <div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Estimated Premium</div>
                        <div className="text-lg font-mono font-black text-emerald-400 leading-none">{safeUpside}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              {isCurrentlyLocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/20 backdrop-blur-[1px] rounded-[2rem]">
                  <div className="max-w-md w-full bg-slate-900/90 border border-slate-700/50 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center transform -translate-y-12">
                     <Lock className="w-10 h-10 text-cyan-500 mb-4" />
                     <h3 className="text-white font-black text-xl mb-2 tracking-tight">
                       {safeScore < 80 ? 'Quantitative Target Locked' : 'Proprietary Intelligence Gated'}
                     </h3>
                     <p className="text-slate-400 text-xs leading-relaxed mb-6">
                       {safeScore < 80 
                         ? 'This institutional target is locked for unregistered visitors. Create a free account to track and analyze standard pipeline assets.'
                         : 'This is an S-Class or A-Class asset. The AI Strategic Digest, Model Verdicts, and Institutional Options Flow are reserved for active PRO tier subscribers.'}
                     </p>
                     
                     {safeScore < 80 && userRole === 'visitor' ? (
                       <button
                         onClick={() => setView && setView('auth')} 
                         className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                       >
                         CREATE FREE ACCOUNT TO UNLOCK
                       </button>
                     ) : (
                       <button
                         onClick={() => setView && setView('upgrade')}
                         className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                       >
                         UNLOCK PRO INTELLIGENCE
                       </button>
                     )}
                  </div>
                </div>
              )}
              <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isCurrentlyLocked ? 'blur-sm opacity-30 select-none pointer-events-none' : ''}`}>
                
                <section className={`lg:col-span-7 bg-slate-950 border rounded-[2rem] p-6 relative ${showPastDeals || targetArea === 'Autoimmune' ? 'border-indigo-500/20' : 'border-slate-800/60'}`}>
                  <h3 className={`text-sm font-black uppercase flex items-center gap-2 mb-4 ${showPastDeals || targetArea === 'Autoimmune' ? 'text-indigo-400' : 'text-cyan-400'}`}>
                    <Database className="w-4 h-4" /> 
                    {showPastDeals ? 'Historical T-7 Digest & Outcome' : 'AI Model Digest'}
                  </h3>
                  <article className="space-y-4 text-slate-400 text-sm leading-relaxed overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {safeDigest.split('\n').filter(line => line.trim() !== '').map((paragraph, index) => (
                      <p key={index} className={paragraph.includes('VERDICT') || paragraph.includes('OUTCOME') ? `p-4 bg-slate-900 border rounded-xl text-xs text-slate-300 ${showPastDeals || targetArea === 'Autoimmune' ? 'border-indigo-500/30' : 'border-cyan-500/30'}` : ""}>
                        {paragraph.includes('VERDICT') && !showPastDeals ? <span className={`font-black block mb-1 ${themeColorText}`}>MODEL VERDICT:</span> : null}
                        {paragraph.includes('OUTCOME') && showPastDeals ? <span className="text-indigo-400 font-black block mb-1">ACTUAL OUTCOME:</span> : null}
                        {paragraph.replace('VERDICT:', '').replace('OUTCOME:', '')}
                      </p>
                    ))}
                  </article>
                </section>

                <section className={`lg:col-span-5 bg-slate-950 border rounded-[2rem] p-6 ${showPastDeals || targetArea === 'Autoimmune' ? 'border-indigo-500/20' : 'border-slate-800/60'}`}>
                  <h3 className={`text-sm font-black uppercase mb-2 flex items-center gap-2 ${showPastDeals || targetArea === 'Autoimmune' ? 'text-indigo-400' : 'text-blue-400'}`}>
                    <Activity className="w-4 h-4" /> 
                    {showPastDeals ? 'Historical Signals (T-7)' : 'Shadow Intelligence Feed'}
                  </h3>
                  <p className="text-[10px] text-slate-500 italic mb-6 leading-relaxed">
                    Monitors real-time institutional footprint and API data to detect front-running activity prior to public M&A.
                  </p>
                  
                    <div className="space-y-6 relative">
                      <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-800" />
                      
                      {safeSignals.map((s, idx) => {
                        let displayDesc = s.desc;
                        if (s.type === 'OPTIONS' && (userRole === 'visitor' || userRole === 'free') && !showPastDeals) {
                          displayDesc = displayDesc.replace(/\$\d+(\.\d+)?/g, '$***').replace(/\d{3,}/g, '***');
                        }
  
                        let sentiment = 'Neutral';
                        if (s.mood === 'HIGH-INTENT' || s.mood === 'STRATEGIC' || s.mood === 'VALIDATED') sentiment = '🐂 Bullish';
                        else if (s.mood === 'DELAYED' || s.mood === 'RISK') sentiment = '🐻 Bearish';
  
                        let explanation = 'System indicator for baseline observation.';
                        if (s.type === 'OPTIONS') explanation = 'Options Flow Interpretation: Abnormal unhedged block trades often precede public M&A announcements as informed institutional capital positions itself.';
                        else if (s.type === 'CLINICAL') explanation = 'Clinical Interpretation: Strategic pipeline progress perfectly aligns with known acquirer gaps.';
  
                        return (
                          <div key={idx} className="flex gap-5 relative">
                            <div className={`w-3.5 h-3.5 rounded-full bg-slate-950 border-2 z-10 shrink-0 mt-1 flex items-center justify-center ${showPastDeals || targetArea === 'Autoimmune' ? 'border-indigo-500/50' : 'border-slate-700'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? (showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-400' : 'bg-cyan-400') : 'bg-slate-800'}`} />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-mono font-bold">{s.date}</span>
                                <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded ${showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>{s.mood}</span>
                                <span className={`text-[9px] font-bold ${sentiment.includes('Bullish') ? 'text-emerald-400' : sentiment.includes('Bearish') ? 'text-red-400' : 'text-slate-500'}`}>{sentiment}</span>
                              </div>
                              <div className="text-xs font-bold text-slate-200 leading-tight">
                                {displayDesc}
                              </div>
                              <div className="text-[9px] text-slate-500 italic mt-1 font-medium leading-relaxed">
                                {explanation}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
  
                  {safeDealInfo?.ip_score !== undefined && (
                    <section className="lg:col-span-12 bg-slate-950 border rounded-[2rem] p-6 border-cyan-900/30">
                      <h3 className="text-sm font-black uppercase mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" /> 
                          Patent Intelligence
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black tracking-widest px-2 py-1 rounded ${
                            safeDealInfo.fto_risk === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            safeDealInfo.fto_risk === 'MODERATE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            FTO RISK: {safeDealInfo.fto_risk}
                          </span>
                        </div>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black text-slate-400 tracking-widest">COMPOSITE IP SCORE</span>
                            <span className="text-xl font-black font-mono text-white">{safeDealInfo.ip_score}<span className="text-xs text-slate-500">/100</span></span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 mb-4 overflow-hidden border border-slate-800">
                            <div 
                              className={`h-2 rounded-full ${safeDealInfo.ip_score >= 80 ? 'bg-emerald-500' : safeDealInfo.ip_score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${safeDealInfo.ip_score}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                              <span className="text-[9px] text-slate-500 font-bold block mb-1">PATENT FAMILIES</span>
                              <span className="text-sm font-mono text-emerald-400">{safeDealInfo.patent_families}</span>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                              <span className="text-[9px] text-slate-500 font-bold block mb-1">KEY PATENTS</span>
                              <span className="text-xs text-slate-300 font-mono line-clamp-1" title={safeDealInfo.key_patents?.join(', ')}>{safeDealInfo.key_patents?.[0] || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                          <h4 className="text-[10px] font-black tracking-widest text-slate-500 mb-2">DEFENSIVE STRATEGY</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {safeDealInfo.defensive_strategy || 'No publicly disclosed strategic moat. IP relies on standard compound coverage.'}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}
              </div>
            </div>
          </section>
          )}
        </main>
      </div>
    </>
  );
};

export default Dashboard;

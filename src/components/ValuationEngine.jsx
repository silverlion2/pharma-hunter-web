import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Lock, AlertCircle, Percent, Clock } from 'lucide-react';

const ValuationEngine = ({ activeAsset, userRole, setView }) => {
  const [peakSales, setPeakSales] = useState(1500); // in millions
  const [pos, setPos] = useState(30); // Probability of Success %
  const [wacc, setWacc] = useState(12); // Discount Rate %
  const [years, setYears] = useState(5); // Years to Peak
  const [margin] = useState(85); // Operating Margin %
  const [multiple] = useState(4); // EV/Peak Sales Multiple

  const isLocked = userRole !== 'pro' && userRole !== 'admin';

  // Parse Market Cap string to actual numeric value (in millions)
  const parseMarketCap = (capStr) => {
    if (!capStr) return 0;
    const cleanStr = capStr.replace(/\$/g, '').replace(/,/g, '').toUpperCase();
    if (cleanStr.includes('B')) {
      return parseFloat(cleanStr.replace('B', '')) * 1000;
    } else if (cleanStr.includes('M')) {
      return parseFloat(cleanStr.replace('M', ''));
    }
    return 0;
  };

  const parsedMarketCap = activeAsset?.marketCap ? parseMarketCap(activeAsset.marketCap) : 0; // in Millions

  // Calculate rNPV (in Millions)
  const calculateRNPV = () => {
    // 1. Peak Cash Flow
    const peakCashFlow = peakSales * (margin / 100);
    // 2. Terminal Value at Peak (using standard biopharma multiple)
    const terminalValue = peakCashFlow * multiple;
    // 3. Discount to Present Day
    const discountedValue = terminalValue / Math.pow(1 + (wacc / 100), years);
    // 4. Risk Adjust (POS)
    const riskAdjustedValue = discountedValue * (pos / 100);
    
    return riskAdjustedValue;
  };

  const rNPV = calculateRNPV();
  
  // Diff analysis
  const isOvervalued = parsedMarketCap > 0 && parsedMarketCap > rNPV;
  const diffPercent = parsedMarketCap > 0 
    ? Math.abs(((rNPV - parsedMarketCap) / parsedMarketCap) * 100).toFixed(1)
    : 0;

  const formatCurrency = (valInMillions) => {
    if (valInMillions >= 1000) return `$${(valInMillions / 1000).toFixed(2)}B`;
    return `$${Math.round(valInMillions)}M`;
  };

  return (
    <div className="relative mt-8 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex justify-between items-center relative z-10">
        <h3 className="text-sm font-black text-emerald-400 tracking-widest uppercase flex items-center gap-2">
          <Calculator className="w-4 h-4" /> 
          rNPV M&A Valuation Engine
        </h3>
        <div className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          PRO QUANT
        </div>
      </div>

      {/* Main Content */}
      <div className={`p-6 relative transition-all duration-500 ${isLocked ? 'blur-md opacity-50 select-none pointer-events-none' : ''}`}>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left: Input Controls */}
          <div className="md:col-span-7 space-y-5">
            <div className="grid grid-cols-2 gap-6">
              
              {/* Peak Sales Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><DollarSign size={12}/> Peak Sales (Total)</label>
                  <span className="text-xs font-mono font-bold text-white">{formatCurrency(peakSales)}</span>
                </div>
                <input 
                  type="range" min="100" max="10000" step="50" 
                  value={peakSales} onChange={(e) => setPeakSales(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* POS Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Percent size={12}/> Prob. of Success</label>
                  <span className="text-xs font-mono font-bold text-white">{pos}%</span>
                </div>
                <input 
                  type="range" min="1" max="100" step="1" 
                  value={pos} onChange={(e) => setPos(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* WACC Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><TrendingDown size={12}/> WACC (Discount)</label>
                  <span className="text-xs font-mono font-bold text-white">{wacc}%</span>
                </div>
                <input 
                  type="range" min="5" max="25" step="0.5" 
                  value={wacc} onChange={(e) => setWacc(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Years Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> Years to Peak</label>
                  <span className="text-xs font-mono font-bold text-white">{years} yrs</span>
                </div>
                <input 
                  type="range" min="1" max="15" step="1" 
                  value={years} onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

            </div>
            
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-start gap-2">
              <AlertCircle size={14} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                Standard Biopharma M&A baseline assumes 85% operating margins and a 4x EV/Peak Sales multiple. Adjust sliders to stress-test terminal values against clinical/regulatory fallout risks.
              </p>
            </div>
          </div>

          {/* Right: Output Engine */}
          <div className="md:col-span-5 flex flex-col justify-center gap-4">
            
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <h4 className="text-[10px] font-black text-emerald-400 tracking-widest uppercase mb-1">Calculated Intrinsic Value</h4>
               <div className="text-4xl font-mono font-black text-white">{formatCurrency(rNPV)}</div>
            </div>

            {parsedMarketCap > 0 ? (
              <div className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${isOvervalued ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div>
                  <h4 className={`text-[10px] font-black tracking-widest uppercase mb-1 ${isOvervalued ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOvervalued ? 'Overvalued Target' : 'Undervalued Alpha'}
                  </h4>
                  <div className="text-lg font-mono font-black text-slate-300">
                    Cap: {formatCurrency(parsedMarketCap)}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`text-xl font-black font-mono flex items-center gap-1 ${isOvervalued ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOvervalued ? <TrendingDown size={18}/> : <TrendingUp size={18}/>}
                    {diffPercent}%
                  </div>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">Valuation Delta</span>
                </div>
              </div>
            ) : (
              <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 flex items-center justify-center">
                <span className="text-xs text-slate-500 font-medium">Market Cap data unavailable for diff analysis.</span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Paywall Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center bg-slate-950/60 backdrop-blur-[2px]">
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm w-[90%] transform transition-transform hover:scale-105">
            <Lock size={32} className="text-emerald-500 mb-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <h3 className="text-white font-black text-lg mb-2">rNPV Model Locked</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-5">
              Live DCF execution, clinical probability models, and M&A pricing targets are restricted to BioQuantix Pro institutions.
            </p>
            <button
              onClick={() => { setView && setView('upgrade'); }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xs px-4 py-3 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              UPGRADE PRO
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ValuationEngine;

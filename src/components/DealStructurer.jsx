import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Landmark, Percent, Layers, ShieldAlert, BadgeInfo } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[180px]">
        <p className="font-bold text-white text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between text-xs mb-1">
             <span className="text-slate-400 capitalize">{entry.name}</span>
             <span className="font-mono font-black" style={{ color: entry.color }}>${entry.value}M</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DealStructurer = ({ activeAsset, userRole }) => {
  const [upfront, setUpfront] = useState(150);
  const [biobucks, setBiobucks] = useState(850);
  const [royalty, setRoyalty] = useState(12);

  const phaseMatch = activeAsset?.latest_news_headline?.toLowerCase().match(/phase (1|2|3|2a|2b|pre)/) || ['phase 2'];
  const inferredPhase = phaseMatch[0] || 'phase 2';

  // Dynamic distribution curve based on Phase
  const getCurve = (phase) => {
    if (phase.includes('3')) return { devMax: 2, commStart: 2 };
    if (phase.includes('1')) return { devMax: 5, commStart: 6 };
    // Phase 2 fallback
    return { devMax: 4, commStart: 4 };
  };

  const { devMax, commStart } = getCurve(inferredPhase);

  const plotData = useMemo(() => {
    const data = [];
    let baselineSls = 200; // arbitrary base sales for royalty calc

    for (let yr = 1; yr <= 10; yr++) {
       // Milestones trigger mostly during development years
       let milestoneGen = 0;
       if (yr <= devMax) {
         milestoneGen = Math.round((biobucks * 0.3) / devMax); // development biobucks
       } else if (yr === commStart) {
         milestoneGen = Math.round(biobucks * 0.4); // Approval blockbuster payout
       } else if (yr > commStart && yr <= commStart + 3) {
         milestoneGen = Math.round((biobucks * 0.3) / 3); // Commercial milestones
       }

       // Royalties ramp up post commercial start
       let royaltyGen = 0;
       if (yr >= commStart) {
         const ramp = Math.pow(1.5, yr - commStart);
         royaltyGen = Math.round((baselineSls * ramp) * (royalty / 100));
       }

       data.push({
         name: `Year ${yr}`,
         Upfront: yr === 1 ? upfront : 0,
         Milestones: milestoneGen,
         Royalties: royaltyGen
       });
    }
    return data;
  }, [upfront, biobucks, royalty, devMax, commStart]);

  const isLocked = userRole !== 'admin' && userRole !== 'pro';

  return (
    <div className="bg-slate-900 border border-slate-700/80 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm rounded-3xl">
           <ShieldAlert className="w-10 h-10 text-amber-500 mb-4" />
           <p className="text-white font-black uppercase tracking-widest text-sm">PRO DEAL STRUCTURER LOCKED</p>
        </div>
      )}
      
      <div className={`transition-all ${isLocked ? 'blur-sm opacity-50 select-none pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Landmark className="text-amber-400 w-4 h-4" />
             </div>
             <div>
               <h3 className="text-sm font-black text-white tracking-widest uppercase">Deal Term Structurer</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">MNC Licensing Cash Flow Map • {inferredPhase.toUpperCase()}</p>
             </div>
           </div>
           <div className="px-2 py-1 bg-slate-800 rounded font-mono text-[10px] text-slate-400 border border-slate-700 flex items-center gap-2">
             <span>Total Deal Value:</span>
             <span className="text-amber-400 font-black">${upfront + biobucks}M</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders */}
          <div className="space-y-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs mb-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><DollarSign size={12}/> Upfront Cash</span>
                <span className="font-mono text-white font-black">${upfront}M</span>
              </div>
              <input type="range" min="10" max="500" value={upfront} onChange={(e) => setUpfront(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"/>
            </div>
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs mb-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Layers size={12}/> Biobucks (Milestones)</span>
                <span className="font-mono text-cyan-400 font-black">${biobucks}M</span>
              </div>
              <input type="range" min="100" max="2500" step="50" value={biobucks} onChange={(e) => setBiobucks(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
              <p className="text-[8px] text-slate-600 mt-2 italic flex gap-1 items-center"><BadgeInfo size={10}/> Dynamic trigger curve based on {inferredPhase}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs mb-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Percent size={12}/> Royalty Tier</span>
                <span className="font-mono text-purple-400 font-black">{royalty}%</span>
              </div>
              <input type="range" min="2" max="30" value={royalty} onChange={(e) => setRoyalty(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 h-[280px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={plotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorU" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                     <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                     <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                 <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                 <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}M`} />
                 <RechartsTooltip content={<CustomTooltip />} />
                 <Area type="monotone" dataKey="Upfront" stackId="1" stroke="#f59e0b" fill="url(#colorU)" strokeWidth={2} />
                 <Area type="monotone" dataKey="Milestones" stackId="1" stroke="#06b6d4" fill="url(#colorM)" strokeWidth={2} />
                 <Area type="monotone" dataKey="Royalties" stackId="1" stroke="#a855f7" fill="url(#colorR)" strokeWidth={2} />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealStructurer;

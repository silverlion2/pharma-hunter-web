import React from 'react';
import { Globe, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[200px]">
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-white text-lg">{data.name}</span>
          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-600">
            {data.targetArea}
          </span>
        </div>
        <div className="space-y-1 mb-3 pb-3 border-b border-slate-800">
           <div className="flex justify-between text-xs">
             <span className="text-slate-500 font-bold uppercase tracking-wider">Quant Score</span>
             <span className="text-cyan-400 font-mono font-black">{data.x}</span>
           </div>
           <div className="flex justify-between text-xs">
             <span className="text-slate-500 font-bold uppercase tracking-wider">Val Discount</span>
             <span className="text-amber-400 font-mono font-black">-{data.y}%</span>
           </div>
        </div>
        <div className="text-[10px] text-slate-400 italic leading-snug">
          {data.note}
        </div>
      </div>
    );
  }
  return null;
};

const CrossBorderHeatmap = ({ setView }) => {
  // Demo dataset focused on cross-border out-licensing alpha
  const licensingData = [
    { x: 92, y: 85, z: 200, name: 'Terns (TERN)', targetArea: 'Metabolic', fill: '#0ea5e9', note: 'Prime CN->US Oral GLP out-licensing candidate.' },
    { x: 88, y: 70, z: 150, name: 'ImmuV (IMVT)', targetArea: 'Autoimmune', fill: '#8b5cf6', note: 'Heavy CN/EU licensing potential for FcRn.' },
    { x: 95, y: 65, z: 250, name: 'Altimmune (ALT)', targetArea: 'Metabolic', fill: '#0ea5e9', note: 'Dual-agonist demands global partnership.' },
    { x: 74, y: 90, z: 120, name: 'Cabaletta (CABA)', targetArea: 'Autoimmune', fill: '#8b5cf6', note: 'Severe cash strain creates distressed licensing setup.' },
    { x: 82, y: 50, z: 180, name: '89bio (ETNB)', targetArea: 'Metabolic', fill: '#0ea5e9', note: 'Strong FGF21 IP but premium valuation.' },
    { x: 65, y: 40, z: 100, name: 'Madrigal (MDGL)', targetArea: 'Metabolic', fill: '#64748b', note: 'Fully commercialized; low licensing probability.' }
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setView('dashboard')} className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
          <ArrowRight className="rotate-180 w-4 h-4" /> Return to Terminal
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mb-8 border-b border-slate-800/50 pb-8">
        <div className="p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20 mb-4 shadow-lg shadow-teal-500/10">
          <Globe className="w-8 h-8 text-teal-400" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Cross-Border Licensing Heatmap</h2>
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mt-2 max-w-xl text-center leading-relaxed">
          Aggregating deeply discounted ex-US biotech assets against MNC pipeline demand. Highlights structural arbitrage opportunities in the current geopolitical climate.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 lg:p-10 shadow-2xl relative">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
           <h3 className="text-sm font-black text-slate-300 tracking-widest uppercase">Valuation Arbitrage Matrix</h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                 <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div> Metabolic Target
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                 <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Autoimmune Target
              </div>
           </div>
        </div>

        <div className="w-full h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="BioQuantix Score" 
                domain={[50, 100]} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                label={{ value: "Quant Conviction Score (Higher = Better)", position: 'bottom', offset: -10, fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
                stroke="#334155"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Discount %" 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                label={{ value: "Valuation Discount (%) vs Historical M&A", angle: -90, position: 'left', offset: 0, fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                stroke="#334155"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} />
              
              {/* Arbitrage Sweet Spot */}
              <ReferenceArea x1={85} x2={100} y1={70} y2={100} fill="#10b981" fillOpacity={0.05} />
              
              <Scatter name="Assets" data={licensingData} fill="#0ea5e9" opacity={0.8} />
              
              <ReferenceLine x={85} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} />
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Sweet spot label */}
        <div className="absolute top-28 right-16 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 pointer-events-none">
           <ShieldCheck className="w-5 h-5 text-emerald-400" />
           <div>
             <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">Primary Hit Zone</div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CrossBorderHeatmap;

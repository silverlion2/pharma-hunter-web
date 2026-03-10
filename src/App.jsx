import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  AlertCircle, 
  Clock, 
  Zap, 
  Lock, 
  ShieldCheck, 
  Activity,
  ArrowUpRight,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Scale,
  Crosshair,
  Database,
  TerminalSquare
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard' | 'upgrade'
  const [selectedTicker, setSelectedTicker] = useState('VKTX');

  // Core Data Mapping
  const ambushData = {
    'ALT': {
      ticker: 'ALT',
      name: 'Altimmune',
      score: 94.5,
      time: '14-45 Days',
      status: 'IMMINENT',
      upside: '+65% ~ +85%',
      locked: true,
      category: 'Metabolic / GLP-1',
      factors: [
        { label: 'Cash Runway', score: 82, color: 'from-blue-500 to-cyan-400', desc: 'Operating runway < 6 months' },
        { label: 'Asset Scarcity', score: 85, color: 'from-cyan-500 to-teal-400', desc: 'Rare Dual-Agonist profile' },
        { label: 'Catalyst Timing', score: 100, color: 'from-indigo-500 to-blue-500', desc: 'Peak S&E interest post-PH2' },
        { label: 'Value Gap', score: 75, color: 'from-sky-400 to-cyan-300', desc: 'Market cap vs NPV misalignment' }
      ],
      digest: "Altimmune (ALT) represents a high-conviction acquisition target as it reaches a critical juncture in its corporate lifecycle. The lead asset, Pemvidutide, has delivered compelling clinical efficacy in MASH, particularly in liver fat fraction reduction, while maintaining a competitive profile against incumbent GLP-1 therapies. Strategically, the company is 'trapped' by its own success; while the science is validated, the capital requirements for Phase III trials are immense. With a current cash runway estimated at just 0.55 years, management is under significant pressure to secure a buyer before a dilutive capital raise becomes inevitable. \n\nRecent intelligence suggests that several top-tier MNCs (Multi-National Corporations) have initiated deep-dive technical due diligence. Our algorithm has detected a confluence of 'Shadow Intelligence,' including unusual registration of joint venture digital assets and a specific hiring surge in the acquirer's metabolic integration team. Furthermore, the directional sweep in the options market—specifically in deep out-of-the-money calls—indicates institutional positioning ahead of an imminent announcement. We project that a deal, structured either as a full buyout or a multi-billion dollar co-development license, is in the final stages of documentation. Analysts anticipate a premium in the range of 65-85% based on comparable sector transactions."
    },
    'ETNB': {
      ticker: 'ETNB',
      name: '89bio',
      score: 82.3,
      time: '90-150 Days',
      status: 'IN-FOCUS',
      upside: '+45% ~ +60%',
      locked: true,
      category: 'Liver / FGF21',
      factors: [
        { label: 'Cash Runway', score: 58, color: 'from-blue-500 to-cyan-400', desc: 'Runway > 12 months' },
        { label: 'Asset Scarcity', score: 92, color: 'from-cyan-500 to-teal-400', desc: 'Cornerstone FGF21 asset' },
        { label: 'Catalyst Timing', score: 100, color: 'from-indigo-500 to-blue-500', desc: 'PH3 interim read-out' },
        { label: 'Value Gap', score: 65, color: 'from-sky-400 to-cyan-300', desc: 'Asset-rich vs Enterprise Value' }
      ],
      digest: "89bio is currently positioned as the premier independent FGF21 specialist in a market undergoing rapid consolidation. Their asset, Pegozafermin, is a fundamental building block for MASH treatment, and the 'scarcity premium' for such high-quality clinical data is rising. While 89bio has a more robust balance sheet than smaller peers, the strategic imperative for Big Pharma to secure metabolic dominance makes ETNB a prime 'bolt-on' candidate. We have observed strategic domain alignments and patent 'cleansing' activities that traditionally precede a major transaction. The 90-150 day window reflects the expected alignment with upcoming Phase III interim data, which will serve as the final valuation trigger for a buyer like Novartis or Eli Lilly."
    },
    'VKTX': {
      ticker: 'VKTX',
      name: 'Viking Tx',
      score: 61.2,
      time: '180 Days+',
      status: 'LONG-RANGE',
      upside: '+30% ~ +50%',
      locked: false,
      category: 'Oral GLP-1',
      factors: [
        { label: 'Cash Runway', score: 45, color: 'from-blue-600 to-blue-400', desc: 'High R&D burn for PH3' },
        { label: 'Asset Scarcity', score: 90, color: 'from-cyan-500 to-teal-500', desc: 'Top-tier oral delivery' },
        { label: 'Catalyst Timing', score: 50, color: 'from-indigo-600 to-indigo-400', desc: 'Extended trial window' },
        { label: 'Value Gap', score: 40, color: 'from-sky-500 to-sky-300', desc: 'Premium market cap' }
      ],
      digest: "Viking Therapeutics remains the strategic prize of the oral metabolic space, though its current valuation presents a significant hurdle for an immediate buyout. The company’s oral VK2735 formulation is a potential game-changer for GLP-1 maintenance therapy, but the high enterprise value means potential acquirers (Roche, Pfizer) are likely to wait for more long-term durability data before committing to a multi-billion dollar bid. Our Shadow Intelligence metrics remain neutral in the short term, though ongoing high-level discussions are confirmed through institutional flow. VKTX is a high-conviction long-term acquisition candidate, but the 'Imminent' trigger has not yet been pulled. Patience is required as the sector valuation stabilizes."
    }
  };

  const list = Object.values(ambushData).sort((a, b) => b.score - a.score);
  const activeAsset = ambushData[selectedTicker] || ambushData['VKTX'];

  const handleSelect = (ticker) => {
    if (ambushData[ticker].locked) {
      setView('upgrade');
    } else {
      setSelectedTicker(ticker);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. Landing Page
  const LandingPage = () => (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs font-black uppercase tracking-widest mb-8">
          <TerminalSquare size={14} className="text-cyan-400" /> BioQuantix Model 2.0 Active
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
          Algorithmic Bio-Pharma <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Market Intelligence.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          Institutional research requires armies of analysts. <strong className="text-white">BioQuantix uses machine learning.</strong> We track clinical milestones, pipeline gaps, and alternative data to quantify bio-pharma M&A trends and provide objective, data-driven market insights.
        </p>
        <button 
          onClick={() => setView('dashboard')}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-lg px-10 py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/20 flex items-center gap-3 mx-auto"
        >
          <Database size={24} />
          ENTER TERMINAL
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12 relative z-10">
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-600 transition-colors">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
            <Cpu className="text-cyan-400" size={28} />
          </div>
          <h3 className="text-xl font-black text-white mb-3">1. Pipeline Gap Analysis</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We continuously map impending patent cliffs of major pharmaceutical companies against thousands of biotech pipelines to identify synergistic targets.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-600 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
            <Activity className="text-cyan-400" size={28} />
          </div>
          <h3 className="text-xl font-black text-white mb-3">2. Shadow Intelligence</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our algorithms detect pre-deal footprints including directional options volume anomalies, strategic domain registrations, and corporate hiring trends.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-600 transition-colors">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
            <Clock className="text-blue-400" size={28} />
          </div>
          <h3 className="text-xl font-black text-white mb-3">3. Quantitative Modeling</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Stop guessing the timing. BioQuantix calculates probabilistic deal execution windows, allowing researchers to objectively navigate market volatility.
          </p>
        </div>
      </div>
    </div>
  );

  // 2. Pricing & Upgrade Page (Paddle Compliant Standalone Section)
  const UpgradePage = () => (
    <div id="upgrade" className="max-w-5xl mx-auto py-12 px-6">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-all font-bold text-xs">
        <ArrowLeft size={14} /> BACK TO TERMINAL
      </button>
      
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Unlock Institutional Intelligence</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Targets with Scores {'>'} 80 and Live Shadow Intelligence feeds are restricted to Pro members.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Single Scan Plan */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col hover:border-slate-700 transition-all">
          <h3 className="text-lg font-bold mb-1">Single Report</h3>
          <div className="text-3xl font-black mb-6 text-white">$9.90 <span className="text-xs font-normal text-slate-500">/ scan</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-cyan-500 shrink-0" /> One-time Full Asset Audit</li>
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-cyan-500 shrink-0" /> Predictive Upside Modeling</li>
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-cyan-500 shrink-0" /> Downloadable PDF Digest</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs">BUY SINGLE REPORT</button>
        </div>

        {/* Pro Plan (Monthly) */}
        <div className="bg-gradient-to-b from-cyan-500/10 to-[#0A0C10] border-2 border-cyan-500/50 p-8 rounded-3xl flex flex-col shadow-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full shadow-lg">MOST POPULAR</div>
          <h3 className="text-lg font-bold mb-1 text-white">Pro Monthly</h3>
          <div className="text-3xl font-black mb-6 text-white">$49.00 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-xs">
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Full Alpha Radar Access</li>
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Live Shadow Intelligence Feed</li>
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Option Greeks Intent Detection</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs transition-transform active:scale-95">UPGRADE PRO</button>
        </div>

        {/* Elite Plan (Annual) */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col hover:border-slate-700 transition-all">
          <h3 className="text-lg font-bold mb-1">Elite Annual</h3>
          <div className="text-3xl font-black mb-6 text-white">$499.00 <span className="text-xs font-normal text-slate-500">/ yr</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-xs">
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> 15% Savings vs Monthly</li>
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> Developer API Access</li>
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> Priority Support</li>
          </ul>
          <button className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 font-black text-xs hover:bg-slate-800 transition-colors">GET ELITE PASS</button>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase mb-2">
          <Scale size={14} /> Information Disclaimer
        </div>
        <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mx-auto">
          BioQuantix is a data analytics tool, not a registered investment advisor. The intelligence and metrics provided are for informational and research purposes only and do not constitute financial advice. Use of this platform is subject to our Terms of Service.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 font-sans tracking-tight selection:bg-cyan-500 selection:text-slate-900">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-800/60 pb-8">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setView('landing')}
          >
            <div className="p-2.5 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/10 group-hover:bg-cyan-400 transition-colors">
              <TerminalSquare className="text-slate-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                BioQuantix 
                {view !== 'landing' && <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-700 uppercase">Terminal</span>}
              </h1>
              <p className="text-slate-500 text-[11px] font-medium mt-0.5">Quantitative Bio-Pharma Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto text-xs">
            {view !== 'landing' && (
              <div className="relative flex-1 md:w-64 group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search Ticker..." 
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 w-full outline-none focus:border-cyan-500/40 transition-all text-sm"
                />
              </div>
            )}
            
            <button 
              onClick={() => setView('upgrade')}
              className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 hover:bg-cyan-500/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              UPGRADE PRO
            </button>
          </div>
        </header>

        {view === 'landing' && <LandingPage />}
        {view === 'upgrade' && <UpgradePage />}
        
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
                  <h2 className="font-bold text-xs text-slate-400 tracking-widest uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Quant Radar
                  </h2>
                  <span className="text-[9px] text-slate-600 font-mono italic flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" /> LIVE
                  </span>
                </div>
                
                <div className="divide-y divide-slate-800/30">
                  {list.map((item) => (
                    <div 
                      key={item.ticker}
                      onClick={() => handleSelect(item.ticker)}
                      className={`group px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all ${item.locked ? 'hover:bg-cyan-500/[0.02]' : 'hover:bg-white/[0.02]'} ${selectedTicker === item.ticker && !item.locked ? 'bg-white/[0.04]' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs border ${item.locked ? 'bg-black text-slate-800 border-slate-800' : 'bg-slate-800/50 text-cyan-400 border-slate-700/50'}`}>
                          {item.locked ? <Lock size={14} /> : item.ticker}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {item.locked ? 'Premium Hidden' : item.name}
                          </div>
                          <div className={`text-[9px] font-black tracking-widest mt-0.5 ${item.status === 'IMMINENT' ? 'text-blue-500' : 'text-slate-500'}`}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-mono font-black ${item.locked ? 'text-slate-800' : 'text-slate-300'}`}>
                        {item.locked ? '?.?' : item.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <h3 className="text-slate-400 text-xs font-black tracking-widest mb-5 uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Pipeline Gap Map
                </h3>
                <div className="space-y-6">
                  {[
                    { name: 'PFE', target: 'MASH / Obesity', level: 92, color: 'bg-blue-500' },
                    { name: 'NVS', target: 'RNA / CV', level: 78, color: 'bg-cyan-500' },
                    { name: 'GSK', target: 'Respiratory', level: 65, color: 'bg-teal-500' }
                  ].map((m) => (
                    <div key={m.name} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-white text-[11px] font-black">{m.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">Urgency: {m.level}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color}`} style={{ width: `${m.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="lg:col-span-9 space-y-6">
              <section className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-900 shadow-lg shadow-cyan-500/10 shrink-0">
                      {activeAsset.ticker[0]}
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                        {activeAsset.name} 
                        <span className="text-slate-500 font-mono text-xl ml-3">[{activeAsset.ticker}]</span>
                      </h2>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] rounded-md font-bold uppercase">{activeAsset.category}</span>
                        <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] rounded-md font-bold uppercase">S-Class Target</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 shrink-0">
                    <div className="px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                      <div className="text-[9px] text-slate-600 font-black uppercase mb-1">Quant Score</div>
                      <div className="text-3xl font-mono font-black text-cyan-400 leading-none">{activeAsset.score}</div>
                    </div>
                    <div className="px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                      <div className="text-[9px] text-slate-600 font-black uppercase mb-1">Model Premium</div>
                      <div className="text-3xl font-mono font-black text-white leading-none">{activeAsset.upside}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                  {activeAsset.factors.map((f, i) => (
                    <div key={i} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl px-4 py-3 hover:bg-white/[0.04] transition-all flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{f.label}</span>
                        <span className="text-lg font-mono font-black text-white leading-none">{f.score}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden mb-2">
                        <div className={`h-full bg-gradient-to-r ${f.color}`} style={{ width: `${f.score}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-600 font-medium uppercase leading-tight truncate">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-slate-950 rounded-2xl border border-slate-800/60">
                  <div className="flex-1">
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Predicted Execution Window</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-md italic">Calculated based on institutional BD benchmarks and current Shadow Intelligence intensity.</p>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl shrink-0">
                    <Clock className="text-cyan-400" size={20} />
                    <div className="text-xl font-mono font-black text-cyan-400">{activeAsset.time}</div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative">
                   <h3 className="text-sm font-black text-cyan-400 uppercase flex items-center gap-2 mb-6">
                     <Database className="w-4 h-4 text-cyan-400" /> Model Data Digest
                   </h3>
                   <article className="space-y-6 text-slate-400 text-sm leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      <div className="space-y-2">
                        <h4 className="text-white font-black text-[11px] uppercase border-l-2 border-cyan-400 pl-3">Strategic Rationale</h4>
                        <p>{activeAsset.digest.split('\n\n')[0]}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-white font-black text-[11px] uppercase border-l-2 border-slate-700 pl-3">Market Intelligence</h4>
                        <p>{activeAsset.digest.split('\n\n')[1] || "Current data indicates peak-interest from strategic acquirers. Asset validation is complete, pending final commercial due diligence."}</p>
                      </div>
                      <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-xs">
                        <span className="text-cyan-400 font-black block mb-1">MODEL VERDICT:</span>
                        Asymmetrical risk-reward profile confirmed. Institutional accumulation suggests pre-deal positioning.
                      </div>
                   </article>
                </section>

                <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[2rem] p-8">
                  <h3 className="text-sm font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Shadow Intelligence Feed
                  </h3>
                  <div className="space-y-8 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-800" />
                    {[
                      { type: 'OPTIONS', date: '3D AGO', desc: 'OTM Call Sweep: Net Premium $2.5M+', mood: 'HIGH-INTENT' },
                      { type: 'DOMAIN', date: '11D AGO', desc: 'Joint-Venture Digital Assets Registered', mood: 'STRATEGIC' },
                      { type: 'TALENT', date: '22D AGO', desc: 'Pre-Acquisition Integration Specialist Hired', mood: 'PHASE-4' }
                    ].map((s, idx) => (
                      <div key={idx} className="flex gap-6 relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-700 z-10 shrink-0 mt-1 flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-cyan-400' : 'bg-slate-800'}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono font-bold">{s.date}</span>
                            <span className="text-[9px] font-black tracking-widest bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{s.mood}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-200">{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </main>
          </div>
        )}

        {/* Global Footer with Policy Links */}
        <footer className="mt-20 py-10 border-t border-slate-900">
          <div className="grid md:grid-cols-2 gap-8 items-start mb-10">
            <div>
              <div className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-slate-600" />
                Institutional-Grade Quantitative Intelligence
              </div>
              <p className="text-[11px] text-slate-700 font-bold uppercase tracking-widest">
                Model v2.5.9-LTS • Datacenter: US-East
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                <AlertCircle size={14} /> Information Analytics Disclaimer
              </div>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                BioQuantix provides algorithmic data aggregation and market intelligence for informational purposes only. We are not a registered investment advisor. The intelligence provided does not constitute financial advice. Past data is not indicative of future results.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <span>© 2026 BioQuantix Digital Terminal • Data Intelligence</span>
            <div className="flex gap-6">
               <a href="/terms.html" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
               <a href="/privacy.html" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
               <a href="/refund.html" className="hover:text-cyan-400 transition-colors">Refund Policy</a>
            </div>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700;800&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;
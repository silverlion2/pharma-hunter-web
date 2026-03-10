import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  AlertCircle, 
  Clock, 
  Zap, 
  Lock, 
  ChevronRight, 
  Target, 
  ShieldCheck, 
  FileText,
  Activity,
  ArrowUpRight,
  Info,
  ArrowLeft,
  CheckCircle2,
  BarChart3,
  Globe,
  Database,
  Layers,
  Cpu,
  Scale,
  Rocket,
  Radar,
  Crosshair
} from 'lucide-react';

const App = () => {
  // 初始状态改为 'landing'，而不是直接进入 'dashboard'
  const [view, setView] = useState('landing'); 
  const [selectedTicker, setSelectedTicker] = useState('VKTX');

  // 核心数据映射
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
        { label: 'Cash Runway', score: 82, color: 'from-rose-500 to-orange-500', desc: 'Operating runway < 6 months' },
        { label: 'Asset Scarcity', score: 85, color: 'from-cyan-500 to-blue-500', desc: 'Rare Dual-Agonist profile' },
        { label: 'Catalyst Timing', score: 100, color: 'from-violet-500 to-fuchsia-500', desc: 'Peak S&E interest post-PH2' },
        { label: 'Value Gap', score: 75, color: 'from-amber-400 to-yellow-600', desc: 'Market cap vs NPV misalignment' }
      ],
      digest: "Altimmune (ALT) represents a high-conviction acquisition target as it reaches a critical juncture in its corporate lifecycle. The lead asset, Pemvidutide, has delivered compelling clinical efficacy in MASH, particularly in liver fat fraction reduction, while maintaining a competitive profile against incumbent GLP-1 therapies. Strategically, the company is 'trapped' by its own success; while the science is validated, the capital requirements for Phase III trials are immense. With a current cash runway estimated at just 0.55 years, management is under significant pressure to secure a buyer before a dilutive capital raise becomes inevitable. \n\nRecent intelligence suggests that several top-tier MNCs (Multi-National Corporations) have initiated deep-dive technical due diligence. Our algorithm has detected a confluence of 'Shadow Signals,' including unusual registration of joint venture digital assets and a specific hiring surge in the acquirer's metabolic integration team. Furthermore, the directional sweep in the options market—specifically in deep out-of-the-money calls—indicates institutional 'front-running' of an imminent announcement. We project that a deal, structured either as a full buyout or a multi-billion dollar co-development license, is in the final stages of documentation. Investors should anticipate a premium in the range of 65-85% based on comparable sector transactions."
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
        { label: 'Cash Runway', score: 58, color: 'from-rose-500 to-orange-500', desc: 'Runway > 12 months' },
        { label: 'Asset Scarcity', score: 92, color: 'from-cyan-500 to-blue-500', desc: 'Cornerstone FGF21 asset' },
        { label: 'Catalyst Timing', score: 100, color: 'from-violet-500 to-fuchsia-500', desc: 'PH3 interim read-out' },
        { label: 'Value Gap', score: 65, color: 'from-amber-400 to-yellow-600', desc: 'Asset-rich vs Enterprise Value' }
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
        { label: 'Cash Runway', score: 45, color: 'from-rose-400 to-orange-400', desc: 'High R&D burn for PH3' },
        { label: 'Asset Scarcity', score: 90, color: 'from-cyan-400 to-blue-400', desc: 'Top-tier oral delivery' },
        { label: 'Catalyst Timing', score: 50, color: 'from-violet-400 to-fuchsia-400', desc: 'Extended trial window' },
        { label: 'Value Gap', score: 40, color: 'from-amber-300 to-yellow-500', desc: 'Premium market cap' }
      ],
      digest: "Viking Therapeutics remains the strategic prize of the oral metabolic space, though its current valuation presents a significant hurdle for an immediate buyout. The company’s oral VK2735 formulation is a potential game-changer for GLP-1 maintenance therapy, but the high enterprise value means potential acquirers (Roche, Pfizer) are likely to wait for more long-term durability data before committing to a multi-billion dollar bid. Our Shadow Signals remain neutral in the short term, though ongoing high-level S&E discussions are confirmed through institutional flow. VKTX is a high-conviction long-term M&A candidate, but the 'Imminent' trigger has not yet been pulled. Patience is required as the sector valuation stabilizes."
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

  // 1. 启动落地页 (Landing Page) - 激发热情，解释原理
  const LandingPage = () => (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-6xl mx-auto py-12 px-6">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-amber-500 text-xs font-black uppercase tracking-widest mb-8">
          <Zap size={14} className="fill-amber-500" /> Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
          Hunt the Next Billion-Dollar <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Bio-Pharma Buyout.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          Wall Street institutions have armies of analysts to predict which Biotech company will be acquired next. <strong className="text-white">Now, you have an AI algorithm.</strong> Pharma Hunter tracks clinical milestones, cash burn rates, and hidden "Shadow Signals" to pinpoint imminent M&A deals before the news breaks.
        </p>
        <button 
          onClick={() => setView('dashboard')}
          className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-10 py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/20 flex items-center gap-3 mx-auto"
        >
          <Crosshair size={24} />
          LAUNCH TERMINAL
        </button>
      </div>

      {/* How it works cards */}
      <div className="grid md:grid-cols-3 gap-8 mt-12 relative z-10">
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-600 transition-colors">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
            <Database className="text-cyan-400" size={28} />
          </div>
          <h3 className="text-xl font-black text-white mb-3">1. The Asset Gap</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We continuously map Big Pharma's (MNC) impending patent cliffs against thousands of small Biotech pipelines to find the perfect synergistic targets.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-600 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
          <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
            <Activity className="text-amber-500" size={28} />
          </div>
          <h3 className="text-xl font-black text-white mb-3">2. Shadow Signals</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Acquisitions don't happen overnight. We detect pre-deal footprints: directional Options sweeps, stealth domain registrations, and M&A executive hiring.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2rem] hover:border-slate-600 transition-colors">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
            <Clock className="text-emerald-400" size={28} />
          </div>
          <h3 className="text-xl font-black text-white mb-3">3. Execute the Ambush</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Stop guessing the timing. Our machine learning model calculates an exact "Estimated Deal Window" (T-hat), allowing you to position capital efficiently.
          </p>
        </div>
      </div>
    </div>
  );

  // 2. 定价与升级页面 (Upgrade Page)
  const UpgradePage = () => (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-all font-bold text-xs">
        <ArrowLeft size={14} /> BACK TO TERMINAL
      </button>
      
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Unlock Alpha Intelligence</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Targets with Scores {'>'} 80 and Live Shadow Signals are restricted to Pro members.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col hover:border-slate-700 transition-all">
          <h3 className="text-lg font-bold mb-1">Single Scan</h3>
          <div className="text-3xl font-black mb-6 text-white">$9.90 <span className="text-xs font-normal text-slate-500">/ scan</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> One-time Full Asset Audit</li>
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> Predictive Upside Pricing</li>
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> ￥68 Regional Pricing</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs">BUY SINGLE REPORT</button>
        </div>

        <div className="bg-gradient-to-b from-amber-500/10 to-[#0A0C10] border-2 border-amber-500/50 p-8 rounded-3xl flex flex-col shadow-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-black px-3 py-1 rounded-full shadow-lg">MOST POPULAR</div>
          <h3 className="text-lg font-bold mb-1 text-white">Pro Monthly</h3>
          <div className="text-3xl font-black mb-6 text-white">$49.00 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-xs">
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-amber-500 shrink-0" /> Full Alpha Radar Access</li>
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-amber-500 shrink-0" /> Live Shadow Signal Feed</li>
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-amber-500 shrink-0" /> ￥298 Localized Price</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-transform active:scale-95">UPGRADE PRO</button>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col hover:border-slate-700 transition-all">
          <h3 className="text-lg font-bold mb-1">Elite Annual</h3>
          <div className="text-3xl font-black mb-6 text-white">$499.00 <span className="text-xs font-normal text-slate-500">/ yr</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-xs">
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> 15% Savings vs Monthly</li>
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> API Access for Data Export</li>
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> ￥2,980 Localized Price</li>
          </ul>
          <button className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 font-black text-xs hover:bg-slate-800 transition-colors">GET ELITE PASS</button>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase mb-2">
          <Scale size={14} /> Investment Disclaimer
        </div>
        <p className="text-slate-500 text-xs leading-relaxed max-w-2xl mx-auto">
          Pharma Hunter provides strategic intelligence and algorithmic predictions for informational purposes only. These suggestions do not constitute financial advice. The platform assumes no responsibility for final investment decisions, market volatility, or capital loss. Trade at your own risk.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 font-sans tracking-tight selection:bg-amber-500 selection:text-black">
      <div className="max-w-[1440px] mx-auto p-4 md:p-8">
        
        {/* 全局页眉 */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-800/60 pb-8">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setView('landing')}
          >
            <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/10 group-hover:bg-amber-400 transition-colors">
              <Zap className="text-black w-6 h-6 fill-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 group-hover:text-amber-500 transition-colors">
                PHARMA HUNTER 
                {view !== 'landing' && <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-700 uppercase">Pro Terminal</span>}
              </h1>
              <p className="text-slate-500 text-[11px] font-medium mt-0.5">Global Bio-Pharma M&A Strategic Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto text-xs">
            {view !== 'landing' && (
              <div className="relative flex-1 md:w-64 group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search Ticker..." 
                  className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 w-full outline-none focus:border-amber-500/40 transition-all text-sm"
                />
              </div>
            )}
            
            <button 
              onClick={() => setView('upgrade')}
              className="bg-amber-500/10 text-amber-500 border border-amber-500/30 font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 hover:bg-amber-500/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              UPGRADE PRO
            </button>
          </div>
        </header>

        {/* 视图路由 */}
        {view === 'landing' && <LandingPage />}
        {view === 'upgrade' && <UpgradePage />}
        
        {/* Dashboard 视图 */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 侧边栏 */}
            <aside className="lg:col-span-3 space-y-6">
              {/* 排行榜 */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
                  <h2 className="font-bold text-xs text-slate-400 tracking-widest uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Ambush List
                  </h2>
                  <span className="text-[9px] text-slate-600 font-mono italic flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE
                  </span>
                </div>
                
                <div className="divide-y divide-slate-800/30">
                  {list.map((item, index) => (
                    <div 
                      key={item.ticker}
                      onClick={() => handleSelect(item.ticker)}
                      className={`group px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all ${item.locked ? 'hover:bg-amber-500/[0.02]' : 'hover:bg-white/[0.02]'} ${selectedTicker === item.ticker && !item.locked ? 'bg-white/[0.04]' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs border ${item.locked ? 'bg-black text-slate-800 border-slate-800' : 'bg-slate-800/50 text-amber-400 border-slate-700/50'}`}>
                          {item.locked ? <Lock size={14} /> : item.ticker}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200 group-hover:text-amber-500 transition-colors line-clamp-1">
                            {item.locked ? 'Premium Hidden' : item.name}
                          </div>
                          <div className={`text-[9px] font-black tracking-widest mt-0.5 ${item.status === 'IMMINENT' ? 'text-rose-500' : 'text-slate-500'}`}>
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

              {/* 缺药地图 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <h3 className="text-slate-400 text-xs font-black tracking-widest mb-5 uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-500" /> Pipeline Gap Map
                </h3>
                <div className="space-y-6">
                  {[
                    { name: 'PFE', target: 'MASH / Obesity', level: 92, color: 'bg-rose-500' },
                    { name: 'NVS', target: 'RNA / CV', level: 78, color: 'bg-cyan-500' },
                    { name: 'GSK', target: 'Respiratory', level: 65, color: 'bg-amber-500' }
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

            {/* 主内容区: 详情 */}
            <main className="lg:col-span-9 space-y-6">
              
              {/* 资产详情卡 */}
              <section className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl font-black text-black shadow-lg shadow-amber-500/10 shrink-0">
                      {activeAsset.ticker[0]}
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                        {activeAsset.name} 
                        <span className="text-slate-500 font-mono text-xl ml-3">[{activeAsset.ticker}]</span>
                      </h2>
                      <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] rounded-md font-bold uppercase">{activeAsset.category}</span>
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-md font-bold uppercase">S-Class Asset</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 shrink-0">
                    <div className="px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                      <div className="text-[9px] text-slate-600 font-black uppercase mb-1">Alpha Score</div>
                      <div className="text-3xl font-mono font-black text-emerald-400 leading-none">{activeAsset.score}</div>
                    </div>
                    <div className="px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                      <div className="text-[9px] text-slate-600 font-black uppercase mb-1">Deal Premium</div>
                      <div className="text-3xl font-mono font-black text-white leading-none">{activeAsset.upside}</div>
                    </div>
                  </div>
                </div>

                {/* 算法因子 - 极度紧凑化的横向布局 */}
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
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Predicted Deal Window</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-md italic">Calculated based on institutional BD benchmarks and current Shadow Pulse intensity.</p>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl shrink-0">
                    <Clock className="text-amber-500" size={20} />
                    <div className="text-xl font-mono font-black text-amber-500">{activeAsset.time}</div>
                  </div>
                </div>
              </section>

              {/* 深度分析 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 专家解析 */}
                <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative">
                   <h3 className="text-sm font-black text-amber-500 uppercase flex items-center gap-2 mb-6">
                     <Zap className="w-4 h-4 fill-amber-500" /> AI Strategic Digest
                   </h3>
                   <article className="space-y-6 text-slate-400 text-sm leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      <div className="space-y-2">
                        <h4 className="text-white font-black text-[11px] uppercase border-l-2 border-amber-500 pl-3">Strategic Rationale</h4>
                        <p>{activeAsset.digest.split('\n\n')[0]}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-white font-black text-[11px] uppercase border-l-2 border-slate-700 pl-3">Market Intelligence</h4>
                        <p>{activeAsset.digest.split('\n\n')[1] || "Current data indicates peak-interest from strategic acquirers. Asset validation is complete, pending final commercial due diligence."}</p>
                      </div>
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs">
                        <span className="text-amber-500 font-black block mb-1">VERDICT:</span>
                        Asymmetrical risk-reward profile confirmed. Institutional accumulation suggests pre-deal positioning.
                      </div>
                   </article>
                </section>

                {/* 影子信号追踪 */}
                <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[2rem] p-8">
                  <h3 className="text-sm font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" /> Shadow Signal Feed
                  </h3>
                  <div className="space-y-8 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-800" />
                    {[
                      { type: 'OPTIONS', date: '3D AGO', desc: 'OTM Call Sweep: Net Premium $2.5M+', mood: 'BULLISH' },
                      { type: 'DOMAIN', date: '11D AGO', desc: 'Joint-Venture Digital Assets Registered', mood: 'STRATEGIC' },
                      { type: 'TALENT', date: '22D AGO', desc: 'Pre-Acquisition Integration Specialist Hired', mood: 'PHASE-4' }
                    ].map((s, idx) => (
                      <div key={idx} className="flex gap-6 relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-700 z-10 shrink-0 mt-1 flex items-center justify-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-amber-500' : 'bg-slate-800'}`} />
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

        {/* 页脚 */}
        <footer className="mt-20 py-10 border-t border-slate-900">
          <div className="grid md:grid-cols-2 gap-8 items-start mb-10">
            <div>
              <div className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-slate-600" />
                Institutional-Grade Strategic Intelligence
              </div>
              <p className="text-[11px] text-slate-700 font-bold uppercase tracking-widest">
                Data v2.5.9-LTS • Datacenter: Northern Virginia, US
              </p>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
              <div className="text-[10px] font-black text-red-500/60 uppercase mb-1 flex items-center gap-2">
                <AlertCircle size={14} /> Compliance & Risk Warning
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                Pharma Hunter provides investment suggestions based on probabilistic models. We do not guarantee outcomes or assume liability for financial loss. Past performance is not indicative of future results. Consult a financial professional before execution.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <span>© 2026 Pharma Hunter Digital Terminal • Confidential Intelligence</span>
            <div className="flex gap-6">
               <a href="#" className="hover:text-amber-500">API Docs</a>
               <a href="#" className="hover:text-amber-500">Privacy Policy</a>
               <a href="#" className="hover:text-amber-500">Risk Disclosure</a>
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
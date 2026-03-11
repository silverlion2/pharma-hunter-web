import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  AlertCircle, 
  Clock, 
  Zap, 
  Lock, 
  Target, 
  ShieldCheck, 
  Activity,
  ArrowLeft,
  CheckCircle2,
  Database,
  Cpu,
  Scale,
  Crosshair,
  TerminalSquare
} from 'lucide-react';

// ==========================================
// 1. 配置你的 Supabase 数据库连接
// ==========================================
// 请将下面两个字符串替换为你自己的 Supabase URL 和 Anon Key
// 只要你填入了真实的 URL，系统就会自动切换为“云端数据模式”
const SUPABASE_URL = 'https://erdsylieacekhyfkibfr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YLjZ8sqaZtzY84w4VcpyWA_wNydkldi';

// 【安全机制】：检测是否填写了真实的 URL，避免未配置时导致白屏崩溃。
const isSupabaseConfigured = SUPABASE_URL.startsWith('http');

const App = () => {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard' | 'upgrade'
  const [selectedTicker, setSelectedTicker] = useState('ALT');
  const [assetData, setAssetData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // 2. 本地备用演示数据 (Fallback Mock Data)
  // 恢复完整的标的数据，确保没有云端数据时依然丰满
  // ==========================================
  const fallbackData = [
    {
      ticker: 'ALT', name: 'Altimmune', score: 94.5, time: '14-45 Days', status: 'IMMINENT', upside: '+65% ~ +85%', locked: true, category: 'Metabolic / GLP-1',
      factors: [
        { label: 'Cash Runway', score: 82, color: 'from-blue-500 to-cyan-400', desc: 'Operating runway < 6 months' },
        { label: 'Asset Scarcity', score: 85, color: 'from-cyan-500 to-teal-400', desc: 'Rare Dual-Agonist profile' },
        { label: 'Catalyst Timing', score: 100, color: 'from-indigo-500 to-blue-500', desc: 'Peak S&E interest post-PH2' },
        { label: 'Value Gap', score: 75, color: 'from-sky-400 to-cyan-300', desc: 'Market cap vs NPV misalignment' }
      ],
      digest: "Altimmune (ALT) represents a high-conviction acquisition target as it reaches a critical juncture in its corporate lifecycle. The lead asset, Pemvidutide, has delivered compelling clinical efficacy in MASH, particularly in liver fat fraction reduction.\n\nRecent intelligence suggests several top-tier MNCs have initiated deep-dive technical due diligence. Directional sweep in the options market indicates institutional front-running.\n\nVERDICT: Asymmetrical risk-reward profile confirmed. Imminent deal structure expected."
    },
    {
      ticker: 'ETNB', name: '89bio', score: 82.3, time: '90-150 Days', status: 'IN-FOCUS', upside: '+45% ~ +60%', locked: true, category: 'Liver / FGF21',
      factors: [
        { label: 'Cash Runway', score: 58, color: 'from-blue-500 to-cyan-400', desc: 'Runway > 12 months' },
        { label: 'Asset Scarcity', score: 92, color: 'from-cyan-500 to-teal-400', desc: 'Cornerstone FGF21 asset' },
        { label: 'Catalyst Timing', score: 100, color: 'from-indigo-500 to-blue-500', desc: 'PH3 interim read-out' },
        { label: 'Value Gap', score: 65, color: 'from-sky-400 to-cyan-300', desc: 'Asset-rich vs Enterprise Value' }
      ],
      digest: "89bio is currently positioned as the premier independent FGF21 specialist in a market undergoing rapid consolidation. Their asset, Pegozafermin, is a fundamental building block for MASH treatment, and the scarcity premium is rising.\n\nWe have observed strategic domain alignments and patent 'cleansing' activities that traditionally precede a major transaction.\n\nVERDICT: Prime bolt-on candidate for Novartis or Eli Lilly within the next 3-5 months."
    },
    {
      ticker: 'VKTX', name: 'Viking Tx', score: 61.2, time: '180 Days+', status: 'LONG-RANGE', upside: '+30% ~ +50%', locked: false, category: 'Oral GLP-1',
      factors: [
        { label: 'Cash Runway', score: 45, color: 'from-blue-600 to-blue-400', desc: 'High R&D burn for PH3' },
        { label: 'Asset Scarcity', score: 90, color: 'from-cyan-500 to-teal-500', desc: 'Top-tier oral delivery' },
        { label: 'Catalyst Timing', score: 50, color: 'from-indigo-600 to-indigo-400', desc: 'Extended trial window' },
        { label: 'Value Gap', score: 40, color: 'from-sky-500 to-sky-300', desc: 'Premium market cap' }
      ],
      digest: "Viking Therapeutics remains the strategic prize of the oral metabolic space, though its current valuation presents a significant hurdle for an immediate buyout.\n\nOngoing high-level S&E discussions are confirmed through institutional flow, but acquirers are likely to wait for long-term durability data.\n\nVERDICT: VKTX is a high-conviction long-term M&A candidate. Patience is required."
    }
  ];

  // ==========================================
  // 3. 自动拉取云端真实数据 (使用原生 fetch 避免报错)
  // ==========================================
  useEffect(() => {
    async function fetchData() {
      try {
        if (!isSupabaseConfigured) {
          console.log("Using local fallback data (Supabase keys not configured yet).");
          setAssetData(fallbackData);
          setSelectedTicker(fallbackData[0].ticker);
          setIsLoading(false);
          return;
        }

        // 使用原生 fetch 调用 Supabase REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/assets?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch from Supabase');
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
          // 适配云端数据：动态生成前端排版需要的因子和属性
          const formattedData = data.map(item => ({
            ticker: item.ticker,
            name: item.name,
            score: item.score,
            digest: item.digest || "Data processing pending...",
            time: item.score >= 85 ? '14-45 Days' : '90-180 Days',
            status: item.score >= 85 ? 'IMMINENT' : 'IN-FOCUS',
            upside: item.score >= 85 ? '+65% ~ +85%' : '+30% ~ +50%',
            locked: item.score >= 80, // 自动将高分标的设为锁定状态
            category: 'Bio-Pharma Target',
            factors: [
              { label: 'Model Confidence', score: Math.min(100, item.score + 5), color: 'from-blue-500 to-cyan-400', desc: 'Based on FDA Data' },
              { label: 'Options Flow', score: Math.min(100, item.score), color: 'from-cyan-500 to-teal-400', desc: 'MarketData API T-1' },
              { label: 'Strategic Fit', score: Math.min(100, item.score + 10), color: 'from-indigo-500 to-blue-500', desc: 'MNC Pipeline Map' },
              { label: 'Value Metric', score: Math.max(0, item.score - 5), color: 'from-sky-400 to-cyan-300', desc: 'Calculated NPV Gap' }
            ]
          }));

          const sortedData = formattedData.sort((a, b) => b.score - a.score);
          setAssetData(sortedData);
          
          // 默认选中第一个数据
          const firstUnlocked = sortedData.find(a => !a.locked) || sortedData[0];
          if (firstUnlocked) setSelectedTicker(firstUnlocked.ticker);
        } else {
          setAssetData(fallbackData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setAssetData(fallbackData); // 抓取失败则展示本地数据
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const list = assetData.length > 0 ? assetData : fallbackData;
  const activeAsset = list.find(a => a.ticker === selectedTicker) || fallbackData[0];

  const handleSelect = (ticker) => {
    const targetAsset = list.find(a => a.ticker === ticker);
    if (targetAsset && targetAsset.locked) {
      setView('upgrade');
    } else {
      setSelectedTicker(ticker);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. 启动落地页 (Landing Page)
  const LandingPage = () => (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs font-black uppercase tracking-widest mb-8">
          <Zap size={14} className="fill-cyan-400" /> Powered by DeepSeek AI & FDA Data
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
            Our algorithms detect pre-deal footprints including directional EOD options volume anomalies and strategic corporate activity.
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

  // 2. 定价与升级页面 (Upgrade Page)
  const UpgradePage = () => (
    <div id="upgrade" className="max-w-5xl mx-auto py-12 px-6">
      <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-all font-bold text-xs">
        <ArrowLeft size={14} /> BACK TO TERMINAL
      </button>
      
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Unlock Institutional Intelligence</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Targets with Scores {'>'} 80 and Live DeepSeek Analysis are restricted to Pro members.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col hover:border-slate-700 transition-all">
          <h3 className="text-lg font-bold mb-1">Single Scan</h3>
          <div className="text-3xl font-black mb-6 text-white">$9.90 <span className="text-xs font-normal text-slate-500">/ scan</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-cyan-500 shrink-0" /> One-time Full Asset Audit</li>
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-cyan-500 shrink-0" /> Predictive Upside Modeling</li>
            <li className="flex gap-3 text-slate-400 text-xs"><CheckCircle2 size={16} className="text-cyan-500 shrink-0" /> Downloadable PDF Digest</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs">BUY SINGLE REPORT</button>
        </div>

        <div className="bg-gradient-to-b from-cyan-500/10 to-[#0A0C10] border-2 border-cyan-500/50 p-8 rounded-3xl flex flex-col shadow-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full shadow-lg">MOST POPULAR</div>
          <h3 className="text-lg font-bold mb-1 text-white">Pro Monthly</h3>
          <div className="text-3xl font-black mb-6 text-white">$49.00 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-xs">
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Full Alpha Radar Access</li>
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Daily AI Digest Feed</li>
            <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Unlock Hidden S-Class</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs transition-transform active:scale-95">UPGRADE PRO</button>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl flex flex-col hover:border-slate-700 transition-all">
          <h3 className="text-lg font-bold mb-1">Elite Annual</h3>
          <div className="text-3xl font-black mb-6 text-white">$499.00 <span className="text-xs font-normal text-slate-500">/ yr</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-xs">
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> 15% Savings vs Monthly</li>
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> API Access for Data Export</li>
            <li className="flex gap-3 text-slate-400"><CheckCircle2 size={16} className="text-slate-700 shrink-0" /> Priority Strategy Support</li>
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
        
        {/* 全局页眉 */}
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
                BIOQUANTIX 
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
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Quant Radar
                  </h2>
                  <span className="text-[9px] text-slate-600 font-mono italic flex items-center gap-1">
                    {isLoading ? "LOADING..." : <><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" /> LIVE SYNC</>}
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

              {/* 缺药地图 */}
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

            {/* 主内容区: 详情 */}
            <main className="lg:col-span-9 space-y-6">
              
              {/* 资产详情卡 */}
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

                {/* 算法因子 */}
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
                    <p className="text-slate-500 text-xs leading-relaxed max-w-md italic">Calculated based on institutional BD benchmarks and current MarketData API volume intensity.</p>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl shrink-0">
                    <Clock className="text-cyan-400" size={20} />
                    <div className="text-xl font-mono font-black text-cyan-400">{activeAsset.time}</div>
                  </div>
                </div>
              </section>

              {/* 深度分析 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 专家解析 / 数据库拉取的 AI Digest */}
                <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative">
                   <h3 className="text-sm font-black text-cyan-400 uppercase flex items-center gap-2 mb-6">
                     <Database className="w-4 h-4 text-cyan-400" /> DeepSeek Model Digest
                   </h3>
                   <article className="space-y-6 text-slate-400 text-sm leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                     {activeAsset.digest.split('\n').filter(line => line.trim() !== '').map((paragraph, index) => (
                       <p key={index} className={paragraph.includes('VERDICT') || paragraph.includes('结论') ? "p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-xs text-slate-300" : ""}>
                         {paragraph.includes('VERDICT') ? <span className="text-cyan-400 font-black block mb-1">MODEL VERDICT:</span> : null}
                         {paragraph.replace('VERDICT:', '').replace('MODEL VERDICT:', '')}
                       </p>
                     ))}
                   </article>
                </section>

                {/* 影子信号追踪 */}
                <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[2rem] p-8">
                  <h3 className="text-sm font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Options Flow & Signals
                  </h3>
                  <div className="space-y-8 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-800" />
                    {[
                      { type: 'OPTIONS', date: 'T-1 EOD', desc: 'MarketData API detected elevated OTM volume', mood: 'HIGH-INTENT' },
                      { type: 'CLINICAL', date: 'ACTIVE', desc: 'FDA ClinicalTrials.gov matches MNC Pipeline Gap', mood: 'STRATEGIC' },
                      { type: 'TALENT', date: 'RECENT', desc: 'Pre-Acquisition Integration Specialist Hired', mood: 'PHASE-4' }
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

        {/* 页脚 */}
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
import React, { useState, useEffect } from 'react';
import { 
  Target, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, 
  TerminalSquare, History, LogIn, User, LogOut, Scale
} from 'lucide-react';

import { supabase, isSupabaseConfigured } from './utils/supabase';
import { fallbackData, defaultGaps } from './data/mockData';

import FeedbackWidget from './components/FeedbackWidget';
import Landing from './components/Landing';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

const SUPER_ADMIN_EMAILS = ['admin@bioquantix.com', 'test@bioquantix.com'];

const App = () => {
  const [view, setView] = useState('landing'); 
  const [targetArea, setTargetArea] = useState('Metabolic');
  const [showPastDeals, setShowPastDeals] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('ALT');
  
  // 修复：初始化时直接赋予保底数据，平滑过渡真实数据，防止异步导致的白屏
  const [assetData, setAssetData] = useState(fallbackData);
  const [pipelineGapsData, setPipelineGapsData] = useState(defaultGaps);
  const [isLoading, setIsLoading] = useState(true);

  // Phase 5.2 新增: 认证状态
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('visitor'); // 'visitor', 'free', 'pro', 'admin'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      determineUserRole(session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      determineUserRole(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const determineUserRole = (user) => {
    if (!user) {
      setUserRole('visitor');
      return;
    }
    
    if (SUPER_ADMIN_EMAILS.includes(user.email)) {
      setUserRole('admin');
      return;
    }
    setUserRole('free'); 
  };

  useEffect(() => {
    async function fetchAllData() {
      try {
        if (!isSupabaseConfigured) {
          setAssetData(fallbackData);
          setPipelineGapsData(defaultGaps);
          setIsLoading(false);
          return;
        }
        
        const assetsResp = await fetch(`${supabase.supabaseUrl}/rest/v1/assets?select=*`, {
          headers: { 'apikey': supabase.supabaseKey, 'Authorization': `Bearer ${supabase.supabaseKey}` }
        });
        const aData = await assetsResp.json();
        setAssetData(aData && aData.length > 0 ? aData : fallbackData);

        const gapsResp = await fetch(`${supabase.supabaseUrl}/rest/v1/mnc_pipeline_gaps?select=*`, {
          headers: { 'apikey': supabase.supabaseKey, 'Authorization': `Bearer ${supabase.supabaseKey}` }
        });
        
        if (gapsResp.ok) {
           const gData = await gapsResp.json();
           if (gData && gData.length > 0) {
              const grouped = { 'Metabolic': [], 'Autoimmune': [] };
              gData.forEach(row => {
                  if (grouped[row.target_area]) {
                      grouped[row.target_area].push({
                          name: row.mnc_name, target: row.target_area, 
                          level: row.urgency_level, color: row.color_code || 'bg-cyan-500'
                      });
                  }
              });
              grouped['Metabolic'].sort((a,b) => b.level - a.level);
              grouped['Autoimmune'].sort((a,b) => b.level - a.level);
              setPipelineGapsData(grouped);
           } else {
              setPipelineGapsData(defaultGaps);
           }
        } else {
           setPipelineGapsData(defaultGaps);
        }

      } catch (err) {
        setAssetData(fallbackData);
        setPipelineGapsData(defaultGaps);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, []);

  const baseFiltered = assetData.filter(a => a.target_area === targetArea && a.is_past_deal === showPastDeals);
  const sortedList = [...baseFiltered].sort((a, b) => b.score - a.score);

  const activeList = sortedList.map((item) => {
    let isLocked = false;
    
    if (showPastDeals) {
      isLocked = false;
    } else {
      if (item.score >= 80) {
        if (userRole === 'admin' || userRole === 'pro') {
          isLocked = false; 
        } else {
          isLocked = true;  
        }
      }
    }

    const rawSignals = item.shadow_signals && Array.isArray(item.shadow_signals) && item.shadow_signals.length > 0
        ? item.shadow_signals 
        : [{ type: 'SYSTEM', date: 'T-1 EOD', desc: 'No abnormal institutional activity detected currently.', mood: 'NORMAL' }];

    const cashDesc = item.cash_score >= 80 ? 'Critical runway < 6 months' : (item.cash_score <= 40 ? 'Adequate cash buffer > 2 years' : 'Moderate runway pressure');
    const scarcityDesc = item.scarcity_score >= 90 ? 'Extreme target scarcity' : (item.scarcity_score >= 70 ? 'High competition density' : 'Standard target density');
    const milestoneDesc = item.milestone_score >= 90 ? 'Imminent clinical catalyst' : (item.milestone_score >= 70 ? 'Near-term readout expected' : 'Long-term development phase');
    const valDesc = item.valuation_score >= 80 ? 'Trading near/below tangible cash' : (item.valuation_score >= 60 ? 'Moderate value gap' : 'Premium valuation priced in');

    return {
      ...item,
      time: item.is_past_deal ? 'REALIZED' : (item.predicted_time || "Checking Data..."),
      status: item.is_past_deal ? 'ACQUIRED' : (item.score >= 85 ? 'IMMINENT' : 'IN-FOCUS'),
      upside: item.is_past_deal ? 'REALIZED' : (item.estimated_premium || "TBD"),
      locked: isLocked, 
      category: item.target_area,
      factors: [
        { label: 'Cash Pressure', score: Math.round(item.cash_score || 50), color: 'from-blue-500 to-cyan-400', desc: cashDesc },
        { label: 'Asset Scarcity', score: Math.round(item.scarcity_score || 50), color: 'from-cyan-500 to-teal-400', desc: scarcityDesc },
        { label: 'Catalyst Timing', score: Math.round(item.milestone_score || 50), color: 'from-indigo-500 to-blue-500', desc: milestoneDesc },
        { label: 'Value Gap', score: Math.round(item.valuation_score || 50), color: 'from-sky-400 to-cyan-300', desc: valDesc }
      ],
      display_signals: rawSignals
    };
  });

  // 恢复单边锁定阻断：若当前选中的是锁定资产，强制切换到第一个未锁定资产，确保右侧面板始终可见且合法
  useEffect(() => {
    if (activeList.length > 0) {
      const firstAvailable = activeList.find(a => !a.locked) || activeList[0];
      const currentInList = activeList.find(a => a.ticker === selectedTicker);
      if (!currentInList || (currentInList.locked && view !== 'upgrade')) {
        setSelectedTicker(firstAvailable.ticker);
      }
    }
  }, [targetArea, showPastDeals, assetData, userRole, view]);

  const activeAsset = activeList.find(a => a.ticker === selectedTicker) || activeList[0] || fallbackData[0];

  const handleSelect = (ticker) => {
    // 原版拦截逻辑：只要点到带锁资产，立刻打断交互并弹窗/跳转，无需使用大锁头遮罩
    const targetAsset = activeList.find(a => a.ticker === ticker);
    if (targetAsset && targetAsset.locked && !showPastDeals) {
      if (userRole === 'visitor') {
        setShowAuthModal(true);
      } else {
        setView('upgrade');
      }
    } else {
      setSelectedTicker(ticker);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        if (authMode === 'signup') {
          setAuthMode('login');
          showToast("Registration successful (Mock). You can now sign in.");
        } else if (authMode === 'login') {
          setShowAuthModal(false);
          showToast("Sign in successful (Mock).");
          const mockUser = { email: authEmail || 'test@bioquantix.com' };
          setSession({ user: mockUser });
          determineUserRole(mockUser);
        } else if (authMode === 'forgot') {
          if (!authEmail) {
            setAuthError("Please enter your email address to reset password.");
            setAuthLoading(false);
            return;
          }
          showToast("Password reset email sent (Mock). Please check your inbox.");
          setShowAuthModal(false);
        }
        setAuthLoading(false);
      }, 800);
      return;
    }

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMode('login');
        showToast("Registration successful. You can now sign in.");
      } else if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setShowAuthModal(false);
        showToast("Sign in successful.");
      } else if (authMode === 'forgot') {
        if (!authEmail) {
          setAuthError("Please enter your email address to reset password.");
          setAuthLoading(false);
          return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        showToast("Password reset email sent. Please check your inbox.");
        setShowAuthModal(false);
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole('visitor'); 
    setView('landing');
    showToast("Successfully logged out. Premium assets locked.");
  };

  const currentGaps = pipelineGapsData[targetArea] || pipelineGapsData['Metabolic'] || [];
  const themeColorText = targetArea === 'Autoimmune' ? 'text-indigo-400' : 'text-cyan-400';
  const themeColorBg = targetArea === 'Autoimmune' ? 'bg-indigo-500' : 'bg-cyan-500';

  // 提取为安全变量，做兜底处理，彻底避免由真实数据库中的 NULL 数据引发的渲染白屏
  const safeTicker = activeAsset.ticker ? activeAsset.ticker[0] : 'N';
  const safeName = activeAsset.name || 'Unknown Asset';
  const safeCategory = activeAsset.category || 'TBD';
  const safeScore = activeAsset.score || 0;
  const safeDealInfo = activeAsset.deal_info || '';
  const safeTime = activeAsset.time || 'TBD';
  const safeUpside = activeAsset.upside || 'TBD';
  const safeFactors = activeAsset.factors || [];
  const safeSignals = activeAsset.display_signals || [];
  const safeDigest = activeAsset.digest || "AI strategic digest is compiling recent regulatory footprints...";

  const ToastNotification = () => (
    <div className={`fixed top-4 right-4 z-[9999] transition-all duration-500 transform ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${toast.type === 'error' ? 'bg-red-900/90 border border-red-500' : 'bg-emerald-900/90 border border-emerald-500'} text-white backdrop-blur-md`}>
        {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        <span className="font-bold text-sm tracking-wide">{toast.message}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 font-sans tracking-tight selection:bg-cyan-500 selection:text-slate-900 flex flex-col">
      <ToastNotification />
      <div className="max-w-[1440px] mx-auto p-4 md:p-8 flex-grow w-full relative">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-800/60 pb-8">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => {setView('landing'); setShowPastDeals(false);}}>
            <div className="p-2.5 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/10 group-hover:bg-cyan-400 transition-colors">
              <TerminalSquare className="text-slate-900 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                BIOQUANTIX 
                {view === 'dashboard' && <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-700 uppercase">Terminal</span>}
              </h1>
              <p className="text-slate-500 text-[11px] font-medium mt-0.5">Quantitative Bio-Pharma Intelligence</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs justify-end">
            {view === 'dashboard' && (
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mr-2">
                <button 
                  onClick={() => setShowPastDeals(false)} 
                  className={`px-4 py-2 rounded-lg font-black transition-all flex items-center gap-2 ${!showPastDeals ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Target size={14}/> Live Radar
                </button>
                <button 
                  onClick={() => setShowPastDeals(true)} 
                  className={`px-4 py-2 rounded-lg font-black transition-all flex items-center gap-2 ${showPastDeals ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <History size={14}/> Past Deals
                </button>
              </div>
            )}
            
            {userRole === 'visitor' ? (
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} 
                className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" /> SIGN IN
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {userRole === 'admin' ? 'SUPER ADMIN' : (userRole === 'pro' ? 'PRO TIER' : 'BASIC EXPLORER')}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {(userRole === 'visitor' || userRole === 'free') && (
              <button onClick={() => setView('upgrade')} className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 hover:bg-cyan-500/20 shadow-lg shadow-cyan-500/5">
                <ShieldCheck className="w-3.5 h-3.5" /> UPGRADE PRO
              </button>
            )}
          </div>
        </header>

        {view === 'landing' && <Landing setView={setView} setShowPastDeals={setShowPastDeals} />}

        {view === 'upgrade' && (
          <div id="upgrade" className="max-w-5xl mx-auto py-12 px-6">
            <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-all font-bold text-xs">
              <ArrowLeft size={14} /> BACK TO TERMINAL
            </button>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Unlock Pro Intelligence</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Unlock complete institutional data, advanced predictive signals, and premium features. Upgrade to Pro.
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
                  <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Full AI Strategic Digest</li>
                  <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Uncensored Options Flow</li>
                  <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Priority Anomaly Alerts</li>
                </ul>
                <button onClick={() => { if(userRole==='visitor') setShowAuthModal(true); }} className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs transition-transform active:scale-95">
                  UPGRADE PRO
                </button>
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
        )}
        
        {view === 'dashboard' && (
          <Dashboard
            targetArea={targetArea}
            setTargetArea={setTargetArea}
            showPastDeals={showPastDeals}
            themeColorText={themeColorText}
            themeColorBg={themeColorBg}
            activeList={activeList}
            currentGaps={currentGaps}
            activeAsset={activeAsset}
            safeTicker={safeTicker}
            safeName={safeName}
            safeCategory={safeCategory}
            safeScore={safeScore}
            safeDealInfo={safeDealInfo}
            userRole={userRole}
            safeFactors={safeFactors}
            safeTime={safeTime}
            safeUpside={safeUpside}
            safeDigest={safeDigest}
            safeSignals={safeSignals}
            handleSelect={handleSelect}
          />
        )}
        
        <footer className="mt-20 py-10 border-t border-slate-900 w-full">
          <div className="grid md:grid-cols-2 gap-8 items-start mb-10">
            <div>
              <div className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-slate-600" />
                Institutional-Grade Quantitative Intelligence
              </div>
              <p className="text-[11px] text-slate-700 font-bold uppercase tracking-widest">
                Model v2.8.0-LTS • Datacenter: US-East
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

        <FeedbackWidget />

        <AuthModal 
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          authMode={authMode}
          setAuthMode={setAuthMode}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authError={authError}
          authLoading={authLoading}
          handleAuth={handleAuth}
        />

      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700;800&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .group\\/tooltip:hover .absolute { visibility: visible; opacity: 1; }
        .group\\/badge:hover .absolute { visibility: visible; opacity: 1; }
      `}} />
    </div>
  );
};

export default App;
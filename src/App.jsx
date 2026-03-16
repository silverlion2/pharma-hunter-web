import React, { useState, useEffect } from 'react';
import { 
  Target, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, 
  TerminalSquare, History, LogIn, User, LogOut, Scale,
  Star, TrendingUp, Clock, DollarSign, Activity
} from 'lucide-react';

import { supabase, isSupabaseConfigured } from './utils/supabase';
import { fallbackData, defaultGaps } from './data/mockData';
import posthog from 'posthog-js';

// IMPORTANT: Initialize PostHog (Make sure to set VITE_POSTHOG_KEY in your .env eventually)
if (typeof window !== 'undefined') {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_dummy_key_replace_me', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: true,
  });
}


import Landing from './components/Landing';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';

const App = () => {
  const [view, setView] = useState('landing');
  const [targetArea, setTargetArea] = useState('All');
  const [showPastDeals, setShowPastDeals] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('ALT');
  
  // 修复：初始化时直接赋予保底数据，平滑过渡真实数据，防止异步导致的白屏
  const [assetData, setAssetData] = useState(fallbackData);
  const [pipelineGapsData, setPipelineGapsData] = useState(defaultGaps);
  const [usingMockData, setUsingMockData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchDataRef = React.useRef(null);

  // Phase 5.2 新增: 认证状态
  const [userRole, setUserRole] = useState('visitor'); // 'visitor', 'free', 'pro', 'admin'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // New Phase: Tracked Tickers
  const [trackedTickers, setTrackedTickers] = useState([]);
  const [showOnlyTracked, setShowOnlyTracked] = useState(false);

  // New Phase: Market Analytics Modal
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    fastestMovers: [],
    topScarcity: [],
    topCashPressure: [],
    topClinical: [],
    topCatalysts: [],
    topValue: []
  });

  // Admin: Smart Money Consensus
  const [showSmartMoneyModal, setShowSmartMoneyModal] = useState(false);
  const [smartMoneyData, setSmartMoneyData] = useState([]);
  const [smartMoneyLoading, setSmartMoneyLoading] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      determineUserRole(session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      determineUserRole(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const determineUserRole = async (user) => {
    if (!user) {
      setUserRole('visitor');
      setTrackedTickers([]);
      return;
    }
    
    // Identifies user for PostHog analytics
    posthog.identify(user.id, { email: user.email });

    let role = user?.user_metadata?.role || 'free';

    try {
      const { data, error } = await supabase.rpc('get_user_role', { user_id: user.id });
      if (!error && data && data.length > 0) {
        role = data[0].role;
      }
    } catch (error) {
      // Gracefully fallback if the get_user_role RPC hasn't been created in Supabase yet
    }
    
    setUserRole(role);
    fetchTrackedTickers();
  };

  const fetchTrackedTickers = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.from('user_tracked_tickers').select('ticker');
      if (error) throw error;
      if (data) {
        setTrackedTickers(data.map(t => t.ticker));
      }
    } catch (err) {
      console.error("Failed to fetch tracked tickers", err);
    }
  };

  const fetchAnalyticsData = async () => {
    if (!isSupabaseConfigured) {
      showToast("Cannot load analytics: Database not connected.", "error");
      return;
    }
    
    setAnalyticsLoading(true);
    try {
      // Execute all 6 queries concurrently for speed using Promise.all
      const [
        { data: scarcityData, error: scarcityErr },
        { data: cashData, error: cashErr },
        { data: velocityData, error: velocityErr },
        { data: clinicalData, error: clinicalErr },
        { data: catalystData, error: catalystErr },
        { data: valueData, error: valueErr }
      ] = await Promise.all([
        supabase.from('assets').select('ticker, name, scarcity_score, target_area, is_past_deal').eq('is_past_deal', false).order('scarcity_score', { ascending: false }).limit(5),
        supabase.from('assets').select('ticker, name, cash_score, target_area, is_past_deal').eq('is_past_deal', false).order('cash_score', { ascending: false }).limit(5),
        supabase.rpc('get_7d_fastest_movers'),
        supabase.from('assets').select('ticker, name, clinical_score, target_area, is_past_deal').eq('is_past_deal', false).order('clinical_score', { ascending: false }).limit(5),
        supabase.from('assets').select('ticker, name, milestone_score, target_area, is_past_deal, predicted_time').eq('is_past_deal', false).order('milestone_score', { ascending: false }).limit(5),
        supabase.from('assets').select('ticker, name, valuation_score, target_area, is_past_deal').eq('is_past_deal', false).order('valuation_score', { ascending: false }).limit(5)
      ]);
        
      if (scarcityErr) throw scarcityErr;
      if (cashErr) throw cashErr;
      if (velocityErr) throw velocityErr;
      if (clinicalErr) throw clinicalErr;
      if (catalystErr) throw catalystErr;
      if (valueErr) throw valueErr;

      setAnalyticsData({
        topScarcity: scarcityData || [],
        topCashPressure: cashData || [],
        fastestMovers: velocityData ? velocityData.slice(0, 5) : [],
        topClinical: clinicalData || [],
        topCatalysts: catalystData || [],
        topValue: valueData || []
      });
      
      setShowAnalyticsModal(true);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      showToast("Error loading analytics data.", "error");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSmartMoneyData = async () => {
    if (userRole !== 'admin') return;
      
    setSmartMoneyLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_smart_money_consensus');
      if (error) throw error;
      setSmartMoneyData(data || []);
      setShowSmartMoneyModal(true);
    } catch (err) {
      console.error("Failed to fetch smart money consensus:", err);
      showToast("Error loading smart money data.", "error");
    } finally {
      setSmartMoneyLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm && searchTerm.trim() !== '') {
      const ticker = searchTerm.toUpperCase();
      posthog.capture('searched_ticker', { ticker, role: userRole });
      
      const exists = assetData.find(a => a.ticker === ticker);
      if (exists) {
         handleSelect(ticker);
      } else {
         showToast(`Scan initiated for ${ticker}. Added to next automated Python crawler loop.`, "success");
      }
    }
  };

  const toggleTrackTicker = async (ticker) => {
    if (userRole === 'visitor') {
      showToast("Please log in to track assets.", "error");
      setShowAuthModal(true);
      return;
    }

    try {
      if (trackedTickers.includes(ticker)) {
        // Untrack
        posthog.capture('untracked_ticker', { ticker });
        const { error } = await supabase.from('user_tracked_tickers').delete().eq('ticker', ticker);
        if (error) throw error;
        setTrackedTickers(prev => prev.filter(t => t !== ticker));
        showToast(`Untracked ${ticker}`);
      } else {
        // Track
        posthog.capture('tracked_ticker', { ticker });
        const { error } = await supabase.from('user_tracked_tickers').insert([{ ticker }]);
        if (error) throw error;
        setTrackedTickers(prev => [...prev, ticker]);
        showToast(`Now tracking ${ticker}`);
      }
    } catch (err) {
      console.error("Error toggling track state", err);
      showToast("Failed to update tracking.", "error");
    }
  };

  useEffect(() => {
    async function fetchAllData(manual = false) {
      if (manual) setIsRefreshing(true);
      try {
        if (!isSupabaseConfigured) {
          setAssetData(fallbackData);
          setPipelineGapsData(defaultGaps);
          setUsingMockData(true);
          return;
        }
        
        const assetsResp = await fetch(`${supabase.supabaseUrl}/rest/v1/assets?select=*`, {
          headers: { 'apikey': supabase.supabaseKey, 'Authorization': `Bearer ${supabase.supabaseKey}` }
        });
        const aData = await assetsResp.json();
        const usingRealAssets = aData && aData.length > 0;
        setAssetData(usingRealAssets ? aData : fallbackData);
        setUsingMockData(!usingRealAssets);

        const gapsResp = await fetch(`${supabase.supabaseUrl}/rest/v1/mnc_pipeline_gaps?select=*`, {
          headers: { 'apikey': supabase.supabaseKey, 'Authorization': `Bearer ${supabase.supabaseKey}` }
        });
        
        if (gapsResp.ok) {
           const gData = await gapsResp.json();
           if (gData && gData.length > 0) {
              // Calculate average scarcity per area dynamically to use as urgency
              const scarcityByArea = {};
              assetData.forEach(asset => {
                let area = 'Others';
                if (asset.target_area && asset.target_area.trim() !== '' && asset.target_area.toLowerCase() !== 'none') {
                    area = asset.target_area.trim();
                }
                
                if (!scarcityByArea[area]) scarcityByArea[area] = { total: 0, count: 0 };
                // Default to 50 if no score exists
                scarcityByArea[area].total += (asset.scarcity_score || 50);
                scarcityByArea[area].count += 1;
              });
              
              const averageScarcityByArea = {};
              Object.keys(scarcityByArea).forEach(area => {
                averageScarcityByArea[area] = Math.round(scarcityByArea[area].total / scarcityByArea[area].count);
              });

              const grouped = {};
              gData.forEach(row => {
                  let area = 'Others';
                  if (row.target_area && row.target_area.trim() !== '' && row.target_area.toLowerCase() !== 'none') {
                      area = row.target_area.trim();
                  }
                  
                  if (!grouped[area]) {
                      grouped[area] = [];
                  }
                  
                  // Override database urgency level with dynamically calculated average asset scarcity
                  const unifiedUrgency = averageScarcityByArea[area] || row.urgency_level || 50;
                  
                  grouped[area].push({
                      name: row.mnc_name, target: area, 
                      level: unifiedUrgency, color: row.color_code || 'bg-cyan-500'
                  });
              });
              Object.keys(grouped).forEach(k => {
                  grouped[k].sort((a,b) => b.level - a.level);
              });
              setPipelineGapsData(grouped);
           } else {
              setPipelineGapsData(defaultGaps);
           }
        } else {
           setPipelineGapsData(defaultGaps);
        }

      } catch {
        setAssetData(fallbackData);
        setPipelineGapsData(defaultGaps);
        setUsingMockData(true);
      } finally {
        setIsRefreshing(false);
      }
    }
    fetchDataRef.current = fetchAllData;
    fetchAllData();
    // Auto-refresh every 30 seconds when Supabase is configured, to pick up live data as soon as it becomes available
    const refreshInterval = isSupabaseConfigured ? setInterval(fetchAllData, 30_000) : null;
    return () => { if (refreshInterval) clearInterval(refreshInterval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetData]);

  const pipelineMaxUrgencies = React.useMemo(() => {
    const urgencies = {};
    Object.keys(pipelineGapsData).forEach(area => {
      const maxLevel = pipelineGapsData[area].length > 0 ? pipelineGapsData[area][0].level : 0;
      urgencies[area] = maxLevel;
    });
    return urgencies;
  }, [pipelineGapsData]);

  const availableAreas = React.useMemo(() => {
    const rawAreas = assetData.map(a => {
      if (!a.target_area || a.target_area.trim() === '' || a.target_area.toLowerCase() === 'none') {
          return 'Others';
      }
      return a.target_area.trim();
    });
    const uniqueAreas = Array.from(new Set(rawAreas));
    
    uniqueAreas.sort((a, b) => {
      // "Others" always goes last
      if (a === 'Others') return 1;
      if (b === 'Others') return -1;
      
      const urgencyA = pipelineMaxUrgencies[a] || 0;
      const urgencyB = pipelineMaxUrgencies[b] || 0;
      
      return urgencyB - urgencyA; // Descending by urgency
    });
    // Prepend 'All' to the front
    return ['All', ...uniqueAreas];
  }, [assetData, pipelineMaxUrgencies]);

  useEffect(() => {
    if (availableAreas.length > 0 && !availableAreas.includes(targetArea)) {
      setTargetArea(availableAreas[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableAreas, targetArea]);

  const baseFiltered = assetData.filter(a => {
      let areaForAsset = 'Others';
      if (a.target_area && a.target_area.trim() !== '' && a.target_area.toLowerCase() !== 'none') {
          areaForAsset = a.target_area.trim();
      }
      const areaMatch = targetArea === 'All' ? Object.is(a.is_past_deal, showPastDeals) : (areaForAsset === targetArea && a.is_past_deal === showPastDeals);
      const trackMatch = showOnlyTracked ? trackedTickers.includes(a.ticker) : true;
      return areaMatch && trackMatch;
  });
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
    const clinDesc = item.clinical_score >= 80 ? 'Superior efficacy/safety vs SoC' : (item.clinical_score <= 40 ? 'Me-too profile or safety signals' : 'Standard incremental benefit');

    return {
      ...item,
      time: item.is_past_deal ? 'REALIZED' : (item.predicted_time || "Checking Data..."),
      status: item.is_past_deal ? 'ACQUIRED' : (item.score >= 90 ? 'S-CLASS' : (item.score >= 80 ? 'A-CLASS' : 'B-CLASS')),
      upside: item.is_past_deal ? 'REALIZED' : (item.estimated_premium || "TBD"),
      locked: isLocked, 
      category: item.target_area,
      factors: [
        { label: 'Clinical Edge', score: Math.round(item.clinical_score || 50), color: 'from-emerald-500 to-teal-400', desc: clinDesc, raw: !item.clinical_score ? 'Pending AI Data' : (item.clinical_score >= 80 ? 'Superior to SoC' : (item.clinical_score >= 60 ? 'Non-Inferior' : 'High Risk')) },
        { label: 'Target Scarcity', score: Math.round(item.scarcity_score || 50), color: 'from-purple-500 to-indigo-400', desc: scarcityDesc, raw: item.scarcity_score >= 90 ? 'Tier 1 Target' : (item.scarcity_score >= 75 ? 'Tier 2 Target' : (item.scarcity_score >= 60 ? 'Tier 3 Target' : 'Tier 4 Target')) },
        { label: 'Cash Pressure', score: Math.round(item.cash_score || 50), color: 'from-blue-500 to-cyan-400', desc: cashDesc, raw: item.cash_amount || '—' },
        { label: 'Catalyst Timing', score: Math.round(item.milestone_score || 50), color: 'from-indigo-500 to-blue-500', desc: milestoneDesc, raw: item.predicted_time || 'TBD' },
        { label: 'Value Gap', score: Math.round(item.valuation_score || 50), color: 'from-sky-400 to-cyan-300', desc: valDesc, raw: item.runway_years || '—' }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      posthog.capture('selected_asset', { ticker });
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
          const mockUser = { 
            email: authEmail || 'test@bioquantix.com',
            user_metadata: { role: authEmail === 'admin@bioquantix.com' || authEmail === 'test@bioquantix.com' ? 'admin' : 'free' }
          };
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
    posthog.reset(); // Reset analytics on logout
    await supabase.auth.signOut();
    setUserRole('visitor'); 
    setTrackedTickers([]);
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
  const safeCashAmount = activeAsset.cash_amount || '—';
  const safeNewsHeadline = activeAsset.latest_news_headline || 'No recent news';
  const safeMarketCap = activeAsset.market_cap || '—';

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
      <Layout 
        view={view}
        setView={setView}
        showPastDeals={showPastDeals}
        setShowPastDeals={setShowPastDeals}
        userRole={userRole}
        setShowAuthModal={setShowAuthModal}
        setAuthMode={setAuthMode}
        handleLogout={handleLogout}
      >

        {usingMockData && (view === 'dashboard' || view === 'landing' || view === 'upgrade') && (
          <div className="mb-6 flex items-center justify-between gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
              Displaying offline context. Waiting for live data refresh from server...
            </div>
            <button 
              onClick={() => fetchDataRef.current && fetchDataRef.current(true)}
              disabled={isRefreshing}
              className="ml-4 px-3 py-1 rounded-lg border border-amber-500/40 hover:bg-amber-500/20 transition-colors font-black tracking-widest text-[9px] disabled:opacity-50 shrink-0"
            >
              {isRefreshing ? 'REFRESHING...' : '↻ REFRESH NOW'}
            </button>
          </div>
        )}

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
            availableAreas={availableAreas}
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
            safeCashAmount={safeCashAmount}
            safeNewsHeadline={safeNewsHeadline}
            safeMarketCap={safeMarketCap}
            handleSelect={handleSelect}
            fetchAnalyticsData={fetchAnalyticsData}
            handleSearch={handleSearch}
            showSmartMoneyModal={showSmartMoneyModal}
            setShowSmartMoneyModal={setShowSmartMoneyModal}
            smartMoneyData={smartMoneyData}
            smartMoneyLoading={smartMoneyLoading}
            fetchSmartMoneyData={fetchSmartMoneyData}
            trackedTickers={trackedTickers}
            toggleTrackTicker={toggleTrackTicker}
            showOnlyTracked={showOnlyTracked}
            setShowOnlyTracked={setShowOnlyTracked}
          />
        )}
        
      </Layout>

        {showAnalyticsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0C10]/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                    <Activity size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white tracking-widest uppercase">Market Analytics</h2>
                    <p className="text-[10px] text-slate-400">Real-time BioPharma leaderboards</p>
                  </div>
                </div>
                <button onClick={() => setShowAnalyticsModal(false)} className="text-slate-500 hover:text-white transition-colors p-2">
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0A0C10]/50">
                {analyticsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-bold tracking-widest animate-pulse">COMPILING INTELLIGENCE...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Scarcity */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
                      <h3 className="text-[10px] font-black tracking-widest text-purple-400 uppercase mb-4 flex items-center gap-2">
                        <Star size={12} /> Top Asset Scarcity
                      </h3>
                      <div className="flex flex-col gap-2">
                        {analyticsData.topScarcity.map((item, idx) => (
                          <div key={idx} onClick={() => { setShowAnalyticsModal(false); handleSelect(item.ticker); }} className="flex justify-between items-center bg-slate-800/20 hover:bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 cursor-pointer transition-colors group">
                            <div className="flex flex-col max-w-[70%]">
                              <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors truncate">{item.ticker} - {item.name}</span>
                              <span className="text-[9px] text-slate-500 truncate">{item.target_area}</span>
                            </div>
                            <span className="font-mono text-sm font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{Math.round(item.scarcity_score)}</span>
                          </div>
                        ))}
                        {analyticsData.topScarcity.length === 0 && <span className="text-xs text-slate-500">No data available</span>}
                      </div>
                    </div>

                    {/* Top Cash Pressure */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
                      <h3 className="text-[10px] font-black tracking-widest text-rose-400 uppercase mb-4 flex items-center gap-2">
                        <AlertCircle size={12} /> Critical Cash Pressure
                      </h3>
                      <div className="flex flex-col gap-2">
                        {analyticsData.topCashPressure.map((item, idx) => (
                          <div key={idx} onClick={() => { setShowAnalyticsModal(false); handleSelect(item.ticker); }} className="flex justify-between items-center bg-slate-800/20 hover:bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 cursor-pointer transition-colors group">
                            <div className="flex flex-col max-w-[70%]">
                              <span className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate">{item.ticker} - {item.name}</span>
                              <span className="text-[9px] text-slate-500 truncate">{item.target_area}</span>
                            </div>
                            <span className="font-mono text-sm font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{Math.round(item.cash_score)}</span>
                          </div>
                        ))}
                        {analyticsData.topCashPressure.length === 0 && <span className="text-xs text-slate-500">No data available</span>}
                      </div>
                    </div>

                    {/* 7D Fastest Movers */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
                      <h3 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-2">
                        <TrendingUp size={12} /> 7D Fastest Movers
                      </h3>
                      <div className="flex flex-col gap-2">
                        {analyticsData.fastestMovers.map((item, idx) => (
                          <div key={idx} onClick={() => { setShowAnalyticsModal(false); handleSelect(item.ticker); }} className="flex justify-between items-center bg-slate-800/20 hover:bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 cursor-pointer transition-colors group">
                            <div className="flex flex-col max-w-[60%]">
                              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{item.ticker}</span>
                              <span className="text-[9px] text-slate-500">Curr: {Math.round(item.current_score)}</span>
                            </div>
                            <span className="font-mono text-sm font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">+{Math.round(item.velocity)}</span>
                          </div>
                        ))}
                        {analyticsData.fastestMovers.length === 0 && <span className="text-xs text-slate-500 text-center py-4">Waiting for historical snapshot<br/>(Check back tomorrow)</span>}
                      </div>
                    </div>

                    {/* Top Clinical Alpha */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
                      <h3 className="text-[10px] font-black tracking-widest text-teal-400 uppercase mb-4 flex items-center gap-2">
                        <Activity size={12} /> Top Clinical Alpha
                      </h3>
                      <div className="flex flex-col gap-2">
                        {analyticsData.topClinical.map((item, idx) => (
                          <div key={idx} onClick={() => { setShowAnalyticsModal(false); handleSelect(item.ticker); }} className="flex justify-between items-center bg-slate-800/20 hover:bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 cursor-pointer transition-colors group">
                            <div className="flex flex-col max-w-[70%]">
                              <span className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors truncate">{item.ticker} - {item.name}</span>
                              <span className="text-[9px] text-slate-500 truncate">{item.target_area}</span>
                            </div>
                            <span className="font-mono text-sm font-black text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">{Math.round(item.clinical_score)}</span>
                          </div>
                        ))}
                        {analyticsData.topClinical.length === 0 && <span className="text-xs text-slate-500">No data available</span>}
                      </div>
                    </div>

                    {/* Imminent Catalysts */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
                      <h3 className="text-[10px] font-black tracking-widest text-blue-400 uppercase mb-4 flex items-center gap-2">
                        <Clock size={12} /> Imminent Catalysts
                      </h3>
                      <div className="flex flex-col gap-2">
                        {analyticsData.topCatalysts.map((item, idx) => (
                          <div key={idx} onClick={() => { setShowAnalyticsModal(false); handleSelect(item.ticker); }} className="flex justify-between items-center bg-slate-800/20 hover:bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 cursor-pointer transition-colors group">
                            <div className="flex flex-col max-w-[70%]">
                              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{item.ticker} - {item.name}</span>
                              <span className="text-[9px] text-slate-500 truncate">{item.predicted_time || 'TBD'}</span>
                            </div>
                            <span className="font-mono text-sm font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{Math.round(item.milestone_score)}</span>
                          </div>
                        ))}
                        {analyticsData.topCatalysts.length === 0 && <span className="text-xs text-slate-500">No data available</span>}
                      </div>
                    </div>

                    {/* Deep Value Gaps */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
                      <h3 className="text-[10px] font-black tracking-widest text-sky-400 uppercase mb-4 flex items-center gap-2">
                        <DollarSign size={12} /> Deep Value Gaps
                      </h3>
                      <div className="flex flex-col gap-2">
                        {analyticsData.topValue.map((item, idx) => (
                          <div key={idx} onClick={() => { setShowAnalyticsModal(false); handleSelect(item.ticker); }} className="flex justify-between items-center bg-slate-800/20 hover:bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 cursor-pointer transition-colors group">
                            <div className="flex flex-col max-w-[70%]">
                              <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors truncate">{item.ticker} - {item.name}</span>
                              <span className="text-[9px] text-slate-500 truncate">{item.target_area}</span>
                            </div>
                            <span className="font-mono text-sm font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">{Math.round(item.valuation_score)}</span>
                          </div>
                        ))}
                        {analyticsData.topValue.length === 0 && <span className="text-xs text-slate-500">No data available</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showSmartMoneyModal && userRole === 'admin' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0C10]/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                    <User size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-amber-400 tracking-widest uppercase">Smart Money Consensus</h2>
                    <p className="text-[10px] text-slate-400">Assets tracked by Pro tier users</p>
                  </div>
                </div>
                <button onClick={() => setShowSmartMoneyModal(false)} className="text-slate-500 hover:text-white transition-colors p-2">
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0A0C10]/50">
                {smartMoneyLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-bold tracking-widest animate-pulse">EXTRACTING WHALE DATA...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {smartMoneyData.map((item, idx) => (
                      <div key={idx} onClick={() => { setShowSmartMoneyModal(false); handleSelect(item.ticker); }} className="flex justify-between items-center bg-slate-800/20 hover:bg-slate-800/50 p-4 rounded-xl border border-slate-800 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-black text-xs text-amber-400 border border-slate-700/50 group-hover:border-amber-500/50 transition-colors">
                             #{idx + 1}
                           </div>
                           <span className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">{item.ticker}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Pro Watchers</span>
                          <span className="font-mono text-xl font-black text-amber-400">{item.pro_count}</span>
                        </div>
                      </div>
                    ))}
                    {smartMoneyData.length === 0 && <span className="text-sm text-slate-500 text-center py-10">No assets currently tracked by Pro users.</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


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
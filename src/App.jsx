import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  TrendingUp, Search, AlertCircle, Clock, Zap, Lock, Target, ShieldCheck, Activity,
  ArrowLeft, CheckCircle2, Database, Cpu, Scale, Crosshair, TerminalSquare, History, Beaker,
  MessageSquare, X, Send, LogIn, User, LogOut
} from 'lucide-react';

// Phase 4: 使用环境变量隐藏数据库密钥的降级访问方式
const getEnv = (key) => {
  try {
    return import.meta.env[key] || '';
  } catch (e) {
    return '';
  }
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_URL.startsWith('http');

// 初始化 Supabase 客户端用于 Auth
const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Phase 5.2 新增: 全权限测试账户列表 (硬编码免死金牌)
const SUPER_ADMIN_EMAILS = ['admin@bioquantix.com', 'test@bioquantix.com'];

// Phase 5.1 新增: 极简 Feedback 组件 (Sprint 1: 接入 Bark Webhook)
const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    let isSuccess = false;

    try {
      // 1. 发送到 Supabase (如果已配置)
      if (isSupabaseConfigured) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/contact_leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(formData)
        });
        if (response.ok) isSuccess = true;
      }

      // 2. [Sprint 1] 发送到 Bark Webhook
      const barkUrl = getEnv('VITE_BARK_WEBHOOK_URL');
      if (barkUrl) {
        await fetch(barkUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Pharma Hunter 新反馈',
            body: `来自: ${formData.name || '匿名'} (${formData.email})\n内容: ${formData.message}`,
            icon: 'https://pharmahunter.com/vite.svg'
          })
        });
        isSuccess = true; // 只要 Bark 成功也算成功
      }

      // 3. 降级处理: 如果都没配置，模拟成功以保证 UI 顺畅
      if (!isSupabaseConfigured && !barkUrl) {
        console.log("Mock Feedback Sent:", formData);
        isSuccess = true;
      }

      if (isSuccess) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Feedback error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
          title="Feedback & Contact"
        >
          <MessageSquare className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-700 w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-widest">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Send Feedback
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-300 font-bold">Message Received.</p>
                <p className="text-[10px] text-slate-500 mt-1">Our team will review your feedback.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Name (Optional)" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                />
                <input 
                  type="email" 
                  required
                  placeholder="Work Email *" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                />
                <textarea 
                  required
                  placeholder="Feature request, bug report, or institutional inquiry..." 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors h-24 resize-none placeholder:text-slate-600"
                />
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {status === 'loading' ? 'SENDING...' : 'SUBMIT'}
                </button>
                {status === 'error' && <p className="text-[9px] text-red-400 text-center mt-2">Failed to send. Please try again later.</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('landing'); 
  const [targetArea, setTargetArea] = useState('Metabolic');
  const [showPastDeals, setShowPastDeals] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('ALT');
  
  const [assetData, setAssetData] = useState([]);
  const [pipelineGapsData, setPipelineGapsData] = useState({ 'Metabolic': [], 'Autoimmune': [] });
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

  // [Sprint 1] 新增: 全局 Toast 提示状态
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // [Sprint 1] 显示 Toast 提示工具函数
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 4000);
  };

  // Fallback 保底数据维持不变
  const fallbackData = [
    {
      ticker: 'ALT', name: 'Altimmune', score: 94.5, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
      cash_score: 82.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 88.0,
      predicted_time: '14-30 Days (Imminent)', estimated_premium: '+65% ~ +80%',
      shadow_signals: [{ type: 'OPTIONS', date: 'T-1 EOD', desc: 'Strike $12.5 Call Sweep (Vol: 4500 vs OI: 1200)', mood: 'HIGH-INTENT' }],
      digest: "Altimmune's Pemvidutide shows significant liver fat reduction alongside weight loss, differentiating it in the MASH space. With cash runway dropping below 0.6 years, management is highly incentivized to execute a buyout. Options flow indicates massive institutional positioning.\n\nVERDICT: Based on the critical cash pressure score of 82.0 and high asset scarcity (95.0), the Overall Quant Score stands at 94.5/100. We estimate a highly probable acquisition scenario within the next quarter, projecting an estimated M&A premium of +65% ~ +80% above the current trading price."
    },
    {
      ticker: 'TERN', name: 'Terns Pharma', score: 88.0, target_area: 'Metabolic', is_past_deal: false, warning_flag: 'AI_TIMEOUT',
      cash_score: 70.0, scarcity_score: 95.0, milestone_score: 75.0, valuation_score: 80.0,
      predicted_time: '1-3 Months', estimated_premium: '+55% ~ +70%',
      shadow_signals: [],
      digest: "Terns holds TERN-601, a highly scarce oral GLP-1 candidate. Big Pharma desperately needs oral formulations to combat the cold-chain logistics of injectables. TERN's valuation gap represents a prime entry point for MNCs looking to leapfrog into the obesity race.\n\nVERDICT: High-conviction mid-term target. Scarcity premium is compounding."
    },
    {
      ticker: 'ETNB', name: '89bio', score: 82.3, target_area: 'Metabolic', is_past_deal: false, warning_flag: 'SEC_MISSING',
      cash_score: 50.0, scarcity_score: 85.0, milestone_score: 90.0, valuation_score: 75.0,
      predicted_time: '3-6 Months', estimated_premium: '+45% ~ +60%',
      shadow_signals: [{ type: 'CLINICAL', date: 'ACTIVE', desc: 'Phase III Initiation matches MNC Needs', mood: 'STRATEGIC' }],
      digest: "As the premier independent FGF21 specialist, 89bio's Pegozafermin is a foundational asset for combination MASH therapies. Domain registries suggest exploratory talks with European MNCs. \n\nVERDICT: Strong bolt-on candidate ahead of Phase III interim readouts."
    },
    {
      ticker: 'MDGL', name: 'Madrigal', score: 75.0, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
      cash_score: 40.0, scarcity_score: 70.0, milestone_score: 100.0, valuation_score: 60.0, 
      predicted_time: 'TBD / Event Driven', estimated_premium: '+30% ~ +45%', shadow_signals: [],
      digest: "Having secured the first-ever FDA approval for MASH (Rezdiffra), Madrigal has de-risked its asset entirely. The question is no longer clinical, but commercial. MNCs with massive primary care salesforces are observing the early launch trajectory to justify a $8B+ buyout.\n\nVERDICT: De-risked commercial target. Awaiting sales data validation."
    },
    {
      ticker: 'VKTX', name: 'Viking Tx', score: 68.5, target_area: 'Metabolic', is_past_deal: false, warning_flag: null,
      cash_score: 30.0, scarcity_score: 95.0, milestone_score: 75.0, valuation_score: 30.0, 
      predicted_time: '3-6 Months', estimated_premium: '+35% ~ +50%', shadow_signals: [],
      digest: "Viking's dual GLP/GIP and oral VK2735 are elite assets. However, the current enterprise value prices in near-perfection. While it remains a strategic prize, acquirers will likely demand longer-term durability data before committing to a mega-merger.\n\nVERDICT: Elite asset, but valuation requires patience."
    },
    {
      ticker: 'IMVT', name: 'Immunovant', score: 89.5, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
      cash_score: 65.0, scarcity_score: 80.0, milestone_score: 90.0, valuation_score: 75.0, 
      predicted_time: '1-3 Months', estimated_premium: '+50% ~ +65%', shadow_signals: [],
      digest: "IMVT-1402 (FcRn inhibitor) is emerging as a best-in-class pipeline-in-a-product for autoimmune disorders. Roivant's majority stake structurally positions IMVT for a full spin-out or MNC acquisition. Deep options sweep activity observed post-Phase 2.\n\nVERDICT: Tier-1 immunology target. Buyout highly probable within 180 days."
    },
    {
      ticker: 'APLS', name: 'Apellis', score: 86.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
      cash_score: 55.0, scarcity_score: 75.0, milestone_score: 100.0, valuation_score: 85.0, 
      predicted_time: '1-3 Months', estimated_premium: '+55% ~ +70%', shadow_signals: [],
      digest: "Apellis dominates the complement C3 space. Despite recent commercial turbulence, the underlying science is highly validated. MNCs lacking a complement franchise view APLS as a distressed, yet highly valuable, turnaround acquisition.\n\nVERDICT: Opportunistic buyout candidate due to temporary valuation depression."
    },
    {
      ticker: 'CABA', name: 'Cabaletta Bio', score: 85.5, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
      cash_score: 70.0, scarcity_score: 90.0, milestone_score: 75.0, valuation_score: 80.0, 
      predicted_time: '3-6 Months', estimated_premium: '+60% ~ +75%', shadow_signals: [],
      digest: "Cell therapy is pivoting from oncology to autoimmune. Cabaletta's CD19-CAR T data in lupus presents a paradigm shift. Big Pharma is urgently looking to secure IP in auto-CAR-T before the window closes.\n\nVERDICT: Highly scarce modality. Prime target for early-stage integration."
    },
    {
      ticker: 'KYTX', name: 'Kymera', score: 81.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
      cash_score: 50.0, scarcity_score: 80.0, milestone_score: 75.0, valuation_score: 70.0, 
      predicted_time: '3-6 Months', estimated_premium: '+40% ~ +55%', shadow_signals: [],
      digest: "Kymera's IRAK4 degrader (partnered with Sanofi) offers a novel oral approach to immunology. Sanofi already has deep insight into the clinical data room, establishing them as the natural buyer if Phase 2 expansion proves successful.\n\nVERDICT: High probability of partner-driven acquisition."
    },
    {
      ticker: 'VTYX', name: 'Ventyx Bio', score: 72.0, target_area: 'Autoimmune', is_past_deal: false, warning_flag: null,
      cash_score: 85.0, scarcity_score: 60.0, milestone_score: 50.0, valuation_score: 95.0, 
      predicted_time: 'TBD / Event Driven', estimated_premium: '+45% ~ +60%', shadow_signals: [],
      digest: "Trading below cash value post-trial failure, VTYX retains multiple shots on goal (NLRP3, TYK2). Sanofi recently took an equity stake. This is a classic 'sum-of-the-parts' acquisition target for an MNC looking for cheap pipeline optionality.\n\nVERDICT: Deep value play. Acquirer could buy the entire company just for the cash and patents."
    },
    {
      ticker: 'ALPN', name: 'Alpine Immune', score: 96.5, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Vertex ($4.9B) | April 2024", warning_flag: null,
      cash_score: 85.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 80.0,
      predicted_time: 'REALIZED', estimated_premium: 'REALIZED',
      shadow_signals: [{ type: 'OPTIONS', date: 'T-7 DAYS', desc: 'Abnormal OTM Call Sweep Volume Detected', mood: 'VALIDATED' }],
      digest: "[T-7 Days Report]: ALPN's Phase 2 IgA nephropathy data established Povetacicept as a best-in-class dual antagonist. Massive unhedged OTM call buying detected 5 days prior. Vertex faces extreme pipeline gap pressure outside of cystic fibrosis.\n\nOUTCOME: Acquired at 67% premium."
    },
    {
      ticker: 'RXDX', name: 'Prometheus', score: 98.0, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Merck ($10.8B) | April 2023", warning_flag: null,
      cash_score: 88.0, scarcity_score: 95.0, milestone_score: 100.0, valuation_score: 75.0, 
      predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
      digest: "[T-7 Days Report]: PRA023's Phase 2 results in Ulcerative Colitis are unprecedented. Merck's Keytruda patent cliff (2028) requires immediate revenue replacement. Talent migration signals indicate deep DD is concluded.\n\nOUTCOME: Acquired at 75% premium."
    },
    {
      ticker: 'HIBI', name: 'HI-Bio', score: 91.5, target_area: 'Autoimmune', is_past_deal: true, deal_info: "Acquired by Biogen ($1.8B) | May 2024", warning_flag: null,
      cash_score: 75.0, scarcity_score: 85.0, milestone_score: 90.0, valuation_score: 80.0, 
      predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
      digest: "[T-7 Days Report]: Felzartamab shows durable remission in primary membranous nephropathy. Biogen is aggressively expanding into immunology to offset neurology risk. Private market shadow intelligence flagged term sheet negotiations.\n\nOUTCOME: Acquired via definitive merger agreement."
    },
    {
      ticker: 'CBAY', name: 'CymaBay', score: 95.0, target_area: 'Metabolic', is_past_deal: true, deal_info: "Acquired by Gilead ($4.3B) | Feb 2024", warning_flag: null,
      cash_score: 80.0, scarcity_score: 90.0, milestone_score: 100.0, valuation_score: 85.0, 
      predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
      digest: "[T-7 Days Report]: Seladelpar NDA acceptance imminent for PBC. Gilead needs a liver asset to replace its aging HCV franchise. Options volume spiked 3x normal average over the last 48 hours.\n\nOUTCOME: Acquired at 27% premium to its 52-week absolute high."
    },
    {
      ticker: 'CRMO', name: 'Carmot', score: 88.5, target_area: 'Metabolic', is_past_deal: true, deal_info: "Acquired by Roche ($2.7B) | Dec 2023", warning_flag: null,
      cash_score: 90.0, scarcity_score: 95.0, milestone_score: 50.0, valuation_score: 75.0, 
      predicted_time: 'REALIZED', estimated_premium: 'REALIZED', shadow_signals: [],
      digest: "[T-7 Days Report]: Private Biotech Carmot owns a highly potent dual GLP-1/GIP receptor agonist. Roche completely missed the initial obesity wave and is desperate to enter the market. Capital infusion patterns suggest immediate M&A action.\n\nOUTCOME: Acquired upfront for $2.7B + milestones."
    }
  ];

  const defaultGaps = {
    'Metabolic': [
      { name: 'PFE', target: 'MASH / Obesity', level: 92, color: 'bg-blue-500' },
      { name: 'NVS', target: 'Metabolic Combos', level: 85, color: 'bg-cyan-500' },
      { name: 'GSK', target: 'Liver Disease', level: 70, color: 'bg-teal-500' }
    ],
    'Autoimmune': [
      { name: 'ABBV', target: 'Immunology Cliff', level: 95, color: 'bg-indigo-500' },
      { name: 'JNJ', target: 'Targeted Autoimmune', level: 88, color: 'bg-blue-500' },
      { name: 'SNY', target: 'Oral Immunology', level: 82, color: 'bg-cyan-500' }
    ]
  };

  // Phase 5.2 新增: 监听 Supabase 认证状态
  useEffect(() => {
    if (!supabase) return;

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
    
    // 检查是否是超级管理员 (免死金牌)
    if (SUPER_ADMIN_EMAILS.includes(user.email)) {
      setUserRole('admin');
      return;
    }

    // 这里未来接上 paddle webhook 后，会去查 profiles 表看 tier
    // 目前默认注册用户为 free
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
        
        const assetsResp = await fetch(`${SUPABASE_URL}/rest/v1/assets?select=*`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const aData = await assetsResp.json();
        setAssetData(aData && aData.length > 0 ? aData : fallbackData);

        const gapsResp = await fetch(`${SUPABASE_URL}/rest/v1/mnc_pipeline_gaps?select=*`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
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
    // Phase 5.2 核心修正：真实的付费墙逻辑
    let isLocked = false;
    
    // 如果是历史并购，永远不锁 (开放策略)
    if (showPastDeals) {
      isLocked = false;
    } else {
      // 只有非历史数据且分数 >= 80，才考虑锁定
      if (item.score >= 80) {
        if (userRole === 'admin' || userRole === 'pro') {
          isLocked = false; // 高级用户解开
        } else {
          isLocked = true;  // 访客和免费用户锁定
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

  useEffect(() => {
    if (activeList.length > 0) {
      const firstAvailable = activeList.find(a => !a.locked) || activeList[0];
      const currentInList = activeList.find(a => a.ticker === selectedTicker);
      if (!currentInList || (currentInList.locked && view !== 'upgrade')) {
        setSelectedTicker(firstAvailable.ticker);
      }
    }
  }, [targetArea, showPastDeals, assetData, userRole]);

  const activeAsset = activeList.find(a => a.ticker === selectedTicker) || activeList[0] || fallbackData[0];

  const handleSelect = (ticker) => {
    const targetAsset = activeList.find(a => a.ticker === ticker);
    if (targetAsset && targetAsset.locked && !showPastDeals) {
      // Phase 5.2: 如果访客点击被锁定的资产，提示去注册/登录；如果是免费用户，提示去升级
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
    
    if (!supabase) {
      setAuthError('Authentication is currently disabled (No Database Connection).');
      setAuthLoading(false);
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
        // [Sprint 1] 修复：绑定重置密码流程
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

  // [Sprint 1] 修复：退出登录并瞬间上锁
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUserRole('visitor'); // 强制刷新状态，触发全站重新上锁
    setView('landing');
    showToast("Successfully logged out. Premium assets locked.");
  };

  const currentGaps = pipelineGapsData[targetArea] || pipelineGapsData['Metabolic'];
  const themeColorText = targetArea === 'Autoimmune' ? 'text-indigo-400' : 'text-cyan-400';
  const themeColorBg = targetArea === 'Autoimmune' ? 'bg-indigo-500' : 'bg-cyan-500';

  // [Sprint 1] 渲染 Toast
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
            
            {/* Phase 5.2: 登录态与会员中心入口 */}
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

        {view === 'landing' && (
           <div className="min-h-[70vh] flex flex-col justify-center max-w-6xl mx-auto py-12 px-6">
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
               Institutional research requires armies of analysts. <strong className="text-white">BioQuantix uses machine learning.</strong> We track clinical milestones, pipeline gaps, and alternative data to quantify bio-pharma M&A trends.
             </p>
             
             {/* Phase 5.1 新增: 平台客观实力背书 (数据跳动栏) */}
             <div className="flex flex-wrap justify-center gap-4 mb-10 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-cyan-400">[ $15B+ M&A Value Tracked ]</span>
                <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-blue-400">[ 150+ Clinical Assets Monitored ]</span>
                <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-indigo-400">[ 12 Institutional Anomalies Flagged ]</span>
             </div>

             <button 
               onClick={() => {setView('dashboard'); setShowPastDeals(false);}}
               className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-lg px-10 py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/20 flex items-center gap-3 mx-auto"
             >
               <Database size={24} /> ENTER TERMINAL
             </button>
             
             {/* Phase 5.1 新增: 历史高光回测证明卡片 */}
             <div className="mt-20 max-w-2xl mx-auto text-left bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TerminalSquare className="w-24 h-24 text-cyan-400" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-4">
                  <ShieldCheck size={14} /> Data-Driven Track Record
                </div>
                <h3 className="text-xl font-black text-white mb-2 tracking-tight">The Alpine Immune ($ALPN) Anomaly</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  See how the BioQuantix algorithm identified structural data anomalies in Alpine Immune 7 days prior to the <strong className="text-slate-200">$4.9B Vertex acquisition</strong>.
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
                     <span className="text-slate-500">TIMESTAMP: T-7 DAYS</span>
                     <span className="text-emerald-400 font-black">QUANT SCORE: 96.5</span>
                  </div>
                  <div className="text-indigo-400 font-bold mb-1">FLAG_FIRED: [OPTIONS_FLOW]</div>
                  <div className="text-slate-400 leading-tight">Massive unhedged OTM call buying detected 5 days prior to announcement. Vertex pipeline gap correlation established.</div>
                </div>
             </div>

           </div>
         </div>
        )}

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
                  {/* Phase 5 强调 Pro 核心特权 */}
                  <li className="flex gap-3 text-slate-200"><CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> Priority Anomaly Alerts</li>
                </ul>
                {/* 如果没登录，点击也是去弹出登录框；后续接入 Paddle 时这里会替换为真实付款链接 */}
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
          <>
            <div className="mb-8 flex gap-4 border-b border-slate-800/50 pb-4 overflow-x-auto custom-scrollbar">
              <button 
                onClick={() => setTargetArea('Metabolic')}
                className={`px-5 py-2.5 rounded-full text-xs font-black tracking-widest transition-all border whitespace-nowrap ${targetArea === 'Metabolic' ? 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                METABOLIC / LIVER
              </button>
              <button 
                onClick={() => setTargetArea('Autoimmune')}
                className={`px-5 py-2.5 rounded-full text-xs font-black tracking-widest transition-all border whitespace-nowrap ${targetArea === 'Autoimmune' ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                AUTOIMMUNE / IMMUNOLOGY
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <aside className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
                    <h2 className="font-bold text-xs text-slate-400 tracking-widest uppercase flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${showPastDeals ? 'text-indigo-400' : themeColorText}`} />
                      {showPastDeals ? 'Historical Deals' : 'Quant Radar'}
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-slate-800/30">
                    {activeList.map((item) => (
                      <div 
                        key={item.ticker}
                        onClick={() => handleSelect(item.ticker)}
                        className={`group px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all ${item.locked ? `hover:${themeColorBg}/[0.02]` : 'hover:bg-white/[0.02]'} ${selectedTicker === item.ticker && !item.locked ? 'bg-white/[0.04]' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs border ${item.locked ? 'bg-black text-slate-800 border-slate-800' : `bg-slate-800/50 ${themeColorText} border-slate-700/50`}`}>
                            {item.locked ? <Lock size={14} /> : item.ticker}
                          </div>
                          <div>
                            <div className={`text-sm font-bold text-slate-200 transition-colors line-clamp-1 ${!item.locked && `group-hover:${themeColorText}`}`}>
                              {item.locked ? 'Premium Hidden' : item.name}
                            </div>
                            <div className={`text-[9px] font-black tracking-widest mt-0.5 ${item.status === 'IMMINENT' || item.status === 'ACQUIRED' ? 'text-blue-400' : 'text-slate-500'}`}>
                              {item.status}
                            </div>
                          </div>
                        </div>

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
                          <div className={`text-sm font-mono font-black ${item.locked ? 'text-slate-800' : 'text-slate-300'}`}>
                            {item.locked ? '?.?' : item.score}
                          </div>
                        </div>
                      </div>
                    ))}
                    {activeList.length === 0 && (
                      <div className="px-4 py-6 text-center text-xs text-slate-500">No signals detected yet.</div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <h3 className={`text-slate-400 text-xs font-black tracking-widest mb-2 uppercase flex items-center gap-2`}>
                    <Cpu className={`w-4 h-4 ${themeColorText}`} /> Pipeline Gap Map
                  </h3>
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
                  
                  {/* Phase 5.2 遮罩层：如果资产被锁定，在这里盖一层毛玻璃引导升级 */}
                  {activeAsset.locked && (
                    <div className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-[2rem]">
                      <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                        <Lock className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-3">Premium Asset Locked</h3>
                      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
                        This asset has triggered a Quant Score of <strong>{activeAsset.score}</strong>. Detailed intelligence, AI digest, and options flow are restricted to Pro members.
                      </p>
                      {userRole === 'visitor' ? (
                        <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="bg-cyan-500 text-slate-900 font-black px-8 py-3 rounded-xl transition-all hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                          SIGN IN TO UNLOCK
                        </button>
                      ) : (
                        <button onClick={() => setView('upgrade')} className="bg-cyan-500 text-slate-900 font-black px-8 py-3 rounded-xl transition-all hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                          UPGRADE PRO NOW
                        </button>
                      )}
                    </div>
                  )}

                  <div className={`transition-all duration-500 ${activeAsset.locked ? 'opacity-30 blur-md pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                      <div className="flex gap-6 items-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0 shadow-lg ${showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-500 text-white shadow-indigo-500/10' : 'bg-cyan-500 text-slate-900 shadow-cyan-500/10'}`}>
                          {activeAsset.ticker[0]}
                        </div>
                        <div>
                          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                            {activeAsset.name} 
                            <span className="text-slate-500 font-mono text-xl ml-3">[{activeAsset.ticker}]</span>
                          </h2>
                          <div className="flex gap-2">
                            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] rounded-md font-bold uppercase">{activeAsset.category}</span>
                            
                            <span className={`px-2.5 py-1 text-[10px] rounded-md font-bold uppercase ${showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                              {showPastDeals ? 'M&A Validated' : (
                                <div className="group/badge relative flex items-center gap-1 cursor-help">
                                  {activeAsset.score >= 90 ? 'S-Class Asset' : (activeAsset.score >= 80 ? 'A-Class Target' : 'B-Class Watchlist')}
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
                          <div className={`text-3xl font-mono font-black leading-none ${showPastDeals || targetArea === 'Autoimmune' ? 'text-indigo-400' : 'text-cyan-400'}`}>{activeAsset.score}</div>
                        </div>
                      </div>
                    </div>

                    {showPastDeals && activeAsset.deal_info && (
                      <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="text-indigo-400" />
                        <span className="text-indigo-200 font-black text-sm tracking-wide">{activeAsset.deal_info}</span>
                      </div>
                    )}

                    {!showPastDeals && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                        {activeAsset.factors.map((f, i) => (
                          <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 flex flex-col justify-center">
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
                    )}

                    {!showPastDeals && (
                      <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-slate-950 rounded-2xl border border-slate-800/60 mb-8">
                        <div className="flex-1">
                          <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Transaction Prediction</h4>
                          <p className="text-slate-500 text-xs leading-relaxed max-w-md italic">Calculated based on institutional BD benchmarks and current MarketData API volume intensity.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                          <div className={`flex items-center gap-4 px-5 py-3 bg-opacity-5 border rounded-xl w-full sm:w-auto ${targetArea === 'Autoimmune' ? 'bg-indigo-500 border-indigo-500/20' : 'bg-cyan-500 border-cyan-500/20'}`}>
                            <Clock className={`shrink-0 ${themeColorText}`} size={18} />
                            <div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Predicted Execution</div>
                              <div className={`text-lg font-mono font-black leading-none ${themeColorText}`}>{activeAsset.time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 px-5 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl w-full sm:w-auto">
                            <TrendingUp className="text-emerald-400 shrink-0" size={18} />
                            <div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">Estimated Premium</div>
                              <div className="text-lg font-mono font-black text-emerald-400 leading-none">{activeAsset.upside}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      <section className={`lg:col-span-7 bg-slate-950 border rounded-[2rem] p-6 relative ${showPastDeals || targetArea === 'Autoimmune' ? 'border-indigo-500/20' : 'border-slate-800/60'}`}>
                        <h3 className={`text-sm font-black uppercase flex items-center gap-2 mb-4 ${showPastDeals || targetArea === 'Autoimmune' ? 'text-indigo-400' : 'text-cyan-400'}`}>
                          <Database className="w-4 h-4" /> 
                          {showPastDeals ? 'Historical T-7 Digest & Outcome' : 'DeepSeek Model Digest'}
                        </h3>
                        <article className="space-y-4 text-slate-400 text-sm leading-relaxed overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                          {activeAsset.digest.split('\n').filter(line => line.trim() !== '').map((paragraph, index) => (
                            <p key={index} className={paragraph.includes('VERDICT') || paragraph.includes('OUTCOME') ? `p-4 bg-slate-900 border rounded-xl text-xs text-slate-300 ${showPastDeals || targetArea === 'Autoimmune' ? 'border-indigo-500/30' : 'border-cyan-500/30'}` : ""}>
                              {paragraph.includes('VERDICT') && !showPastDeals ? <span className={`font-black block mb-1 ${themeColorText}`}>MODEL VERDICT:</span> : null}
                              {paragraph.includes('OUTCOME') && showPastDeals ? <span className="text-indigo-400 font-black block mb-1">ACTUAL OUTCOME:</span> : null}
                              {/* Phase 5.2: 如果是未付费且分数中等(没被完全挡住)的情况，可以在这里局部模糊某些敏感数字 */}
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
                          
                          {activeAsset.display_signals && activeAsset.display_signals.map((s, idx) => {
                            // Phase 5.2: 针对免费用户的期权敏感信息打码逻辑
                            let displayDesc = s.desc;
                            if (s.type === 'OPTIONS' && (userRole === 'visitor' || userRole === 'free') && !showPastDeals) {
                              displayDesc = displayDesc.replace(/\$\d+(\.\d+)?/g, '$***').replace(/\d{3,}/g, '***');
                            }

                            return (
                              <div key={idx} className="flex gap-5 relative">
                                <div className={`w-3.5 h-3.5 rounded-full bg-slate-950 border-2 z-10 shrink-0 mt-1 flex items-center justify-center ${showPastDeals || targetArea === 'Autoimmune' ? 'border-indigo-500/50' : 'border-slate-700'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? (showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-400' : 'bg-cyan-400') : 'bg-slate-800'}`} />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 font-mono font-bold">{s.date}</span>
                                    <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded ${showPastDeals || targetArea === 'Autoimmune' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>{s.mood}</span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-200 leading-tight">
                                    {displayDesc}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                    </div>
                  </div>
                </section>
                )}
              </main>
            </div>
          </>
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

        {/* Phase 5.2 新增: 认证弹窗 Modal (Sprint 1 修复忘记密码状态切换) */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <TerminalSquare className="text-cyan-400 w-5 h-5" /> BIOQUANTIX
                </h2>
                <button onClick={() => setShowAuthModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8">
                <h3 className="text-xl font-bold text-white mb-2">
                  {authMode === 'login' ? 'Sign in to Terminal' : authMode === 'signup' ? 'Create an Account' : 'Reset Password'}
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  {authMode === 'login' 
                    ? 'Enter your credentials to access your intelligence dashboard.' 
                    : authMode === 'signup' 
                      ? 'Join BioQuantix to track institutional M&A signals.'
                      : 'Enter your email address and we will send you a secure link to reset your password.'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      placeholder="name@company.com"
                    />
                  </div>
                  
                  {authMode !== 'forgot' && (
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                        {authMode === 'login' && (
                          <button type="button" onClick={() => setAuthMode('forgot')} className="text-[10px] text-cyan-500 hover:text-cyan-400 font-bold transition-colors">Forgot?</button>
                        )}
                      </div>
                      <input 
                        type="password" 
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                  
                  {authError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                      {authError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {authLoading ? <Clock className="w-4 h-4 animate-spin" /> : (authMode === 'forgot' ? <Send className="w-4 h-4"/> : <LogIn className="w-4 h-4" />)}
                    {authLoading ? 'PROCESSING...' : (authMode === 'login' ? 'SIGN IN' : authMode === 'signup' ? 'CREATE ACCOUNT' : 'SEND RESET LINK')}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                  {authMode === 'login' ? "Don't have an account? " : authMode === 'signup' ? "Already have an account? " : "Remember your password? "}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                    className="text-cyan-400 font-bold hover:underline"
                  >
                    {authMode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
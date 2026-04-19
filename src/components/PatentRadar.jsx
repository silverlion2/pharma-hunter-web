import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, FileText, Search, Lock, ChevronRight, BarChart3, Fingerprint
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

// Mock DB data for FTO matrix if backend query fails
const defaultAssets = [
  { name: 'SGEN', ip_score: 98, fto_risk: 'LOW', defensive_strategy: 'Gold-standard ADC technology.' },
  { name: 'HRMY', ip_score: 68, fto_risk: 'HIGH', defensive_strategy: 'Generic challenges.' },
];

export default function PatentRadar({ userRole }) {
  const [activeTab, setActiveTab] = useState('cliff');
  const [assets, setAssets] = useState(defaultAssets);
  const [patentCliffTimeline, setPatentCliffTimeline] = useState([]);
  const [cnipaScoutSignals, setCnipaScoutSignals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFtoNode, setActiveFtoNode] = useState(null);
  
  // Hardcoded synergy data for the MVP view
  const synergyData = [
    { subject: 'Geographic US/EU', mnc: 90, target: 40, fullMark: 100 },
    { subject: 'New Geographies (CN/JP)', mnc: 30, target: 80, fullMark: 100 },
    { subject: 'Mechanism Expiry', mnc: 40, target: 95, fullMark: 100 },
    { subject: 'Formulation Moat', mnc: 85, target: 60, fullMark: 100 },
    { subject: 'Combination IP', mnc: 50, target: 85, fullMark: 100 },
    { subject: 'Process / Mfg', mnc: 95, target: 50, fullMark: 100 },
  ];

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured) return;
      
      const { data: assetData, error: assetErr } = await supabase
        .from('assets')
        .select('ticker, name, ip_score, fto_risk, defensive_strategy, target_area, patent_families')
        .order('ip_score', { ascending: false });
      if (!assetErr && assetData && assetData.length > 0) {
        setAssets(assetData);
      }

      const { data: cliffData, error: cliffErr } = await supabase
        .from('patent_cliff_timeline')
        .select('*');
      if (!cliffErr && cliffData) {
        setPatentCliffTimeline(cliffData);
      }

      const { data: cnipaData, error: cnipaErr } = await supabase
        .from('cnipa_scout_signals')
        .select('*')
        .order('id', { ascending: true });
      if (!cnipaErr && cnipaData) {
        setCnipaScoutSignals(cnipaData);
      }
    }
    fetchData();
  }, []);

  // Lock behind 'pro' or 'admin' only
  if (userRole !== 'pro' && userRole !== 'admin') {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-0"></div>
        <Lock className="w-16 h-16 text-cyan-500 mb-6 z-10" />
        <h2 className="text-2xl font-bold text-white mb-2 z-10">Pro Access Required</h2>
        <p className="text-slate-300 max-w-md mx-auto mb-8 z-10">
          The Patent Radar Intelligence Module provides pre-emptive IP scouting, CNIPA filing telemetry, and FTO Risk matrices to guide cross-border M&A strategies before the 2026-2030 patent cascade.
        </p>
        <button className="z-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition duration-300">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  // Format data for Patent Cliff Chart
  // X = Year, Y = aggregated Revenue at Risk, Stacked by Severity
  const years = [...new Set(patentCliffTimeline.map(item => item.year))].sort();
  const cliffData = years.map(year => {
    const records = patentCliffTimeline.filter(item => item.year === year);
    return {
      year,
      CRITICAL: records.filter(r => r.severity === 'CRITICAL').reduce((sum, r) => sum + r.revenue_at_risk, 0),
      HIGH: records.filter(r => r.severity === 'HIGH').reduce((sum, r) => sum + r.revenue_at_risk, 0),
      MODERATE: records.filter(r => r.severity === 'MODERATE').reduce((sum, r) => sum + r.revenue_at_risk, 0),
      LOW: records.filter(r => r.severity === 'LOW').reduce((sum, r) => sum + r.revenue_at_risk, 0),
    };
  });

  // Prepare Scatter data for FTO Risk vs IP Score
  // X = Risk (1=Low, 2=Mod, 3=High), Y = IP Score
  const ftoScatterData = assets.filter(a => a.ip_score && a.fto_risk).map(a => {
    let xRisk = 1;
    if (a.fto_risk === 'MODERATE') xRisk = 2;
    if (a.fto_risk === 'HIGH') xRisk = 3;
    return {
      x: xRisk,
      y: a.ip_score,
      name: a.ticker,
      families: a.patent_families || 5, // size dot by families
      fto_risk: a.fto_risk,
      strategy: a.defensive_strategy
    };
  });

  const getSeverityBadge = (severity) => {
    const maps = {
      CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
      HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return `px-2.5 py-1 rounded-full text-xs font-medium border ${maps[severity] || maps.LOW}`;
  };

  const getSignalBadge = (type) => {
    return <span className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full text-xs font-medium">{type}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Patent Radar Intelligence</h1>
            </div>
            <p className="text-slate-400 mt-2 text-sm max-w-3xl">
              Track the upcoming 2026-2030 MNC exclusivity cascade. Monitor real-time CNIPA IP expansions and map target FTO (Freedom to Operate) defensibility to predict borderless asset acquisition flow.
            </p>
          </div>
          <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700/50">
            <button 
              onClick={() => setActiveTab('cliff')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'cliff' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MNC Patent Cliff
            </button>
            <button 
              onClick={() => setActiveTab('cnipa')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'cnipa' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CNIPA Scout
            </button>
            <button 
              onClick={() => setActiveTab('fto')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'fto' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FTO Matrices
            </button>
            <button 
              onClick={() => setActiveTab('synergy')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'synergy' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IP Synergy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'cliff' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Exclusivity Loss: Revenue At Risk by Year ($B)
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cliffData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="CRITICAL" stackId="a" fill="#ef4444" name="Critical Risk" />
                  <Bar dataKey="HIGH" stackId="a" fill="#f97316" name="High Risk" />
                  <Bar dataKey="MODERATE" stackId="a" fill="#eab308" name="Moderate Risk" />
                  <Bar dataKey="LOW" stackId="a" fill="#10b981" name="Low Risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table of specific cliff assets */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Core Vulnerability Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">MNC</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Expiry Year</th>
                    <th className="px-4 py-3">Rev at Risk ($B)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {patentCliffTimeline.map((item, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-750 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{item.mnc}</td>
                      <td className="px-4 py-3 text-emerald-400">{item.asset}</td>
                      <td className="px-4 py-3">{item.therapeutic_area}</td>
                      <td className="px-4 py-3 font-semibold">{item.year}</td>
                      <td className="px-4 py-3">${item.revenue_at_risk.toFixed(1)}B</td>
                      <td className="px-4 py-3 text-xs">{item.successor_status}</td>
                      <td className="px-4 py-3">{getSeverityBadge(item.severity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cnipa' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-cyan-400" />
                Live CNIPA Patent Filing Signals
              </h3>
              <input 
                type="text" 
                placeholder="Search by MNC, Company, Tech..." 
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {cnipaScoutSignals.filter(s => 
                s.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.patent_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.implications.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((signal, idx) => (
                <div key={idx} className="bg-slate-900/40 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{signal.company}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-sm text-slate-400">{signal.date}</span>
                      </div>
                      <h4 className="text-md font-medium text-cyan-300">{signal.patent_title}</h4>
                    </div>
                    {getSeverityBadge(signal.severity)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {getSignalBadge(signal.signal_type)}
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{signal.cnipa_number}</span>
                    <span className="text-xs text-slate-500 ml-2">Filed: {signal.jurisdictions_filed.join(', ')}</span>
                  </div>
                  
                  <div className="bg-slate-800/50 p-3 rounded-md text-sm text-slate-300 border border-slate-700/50">
                    <span className="text-indigo-400 font-medium tracking-wide text-xs uppercase mb-1 block">Strategic Implications</span>
                    {signal.implications}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-xs border-t border-slate-700/50 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Related MNC Cliff Risk:</span>
                      <div className="flex gap-1">
                        {signal.related_mnc_interest.map((mnc, i) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-900/30 text-indigo-300 rounded border border-indigo-500/20">{mnc}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fto' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                FTO Risk vs IP Defensibility
              </h3>
              <p className="text-sm text-slate-400 mb-6 font-medium">Scattered mapping of IP Moat Score (Y) against Freedom To Operate Risk (X). Larger nodes denote more patent families.</p>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="x" name="FTO Risk (1=Low, 3=High)" domain={[0, 4]} ticks={[1,2,3]} stroke="#94a3b8" />
                    <YAxis type="number" dataKey="y" name="IP Score" domain={[50, 100]} stroke="#94a3b8" />
                    <ZAxis type="number" dataKey="families" range={[50, 400]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-800 p-3 border border-slate-600 rounded-lg shadow-xl outline-none">
                              <p className="font-bold text-white mb-1">{data.name}</p>
                              <p className="text-sm text-emerald-400">IP Score: {data.y}</p>
                              <p className="text-sm text-slate-300">FTO Risk: {data.fto_risk}</p>
                              <p className="text-sm text-slate-300">Families: {data.families}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Assets" 
                      data={ftoScatterData} 
                      fill="#0ea5e9" 
                      shape="circle" 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        const payload = e && e.payload ? e.payload : e;
                        setActiveFtoNode(payload);
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {activeFtoNode && (
                <div className="mt-6 bg-slate-900/60 rounded-xl p-4 border border-cyan-500/30 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-bold text-lg">{activeFtoNode.name} Deep Dive</h4>
                    <button onClick={() => setActiveFtoNode(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{activeFtoNode.strategy}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-800 text-cyan-300 px-2 py-1 rounded border border-slate-700">IP Score: {activeFtoNode.y}</span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">FTO Risk: {activeFtoNode.fto_risk}</span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{activeFtoNode.families} Families</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
               <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Asset Defensive Strategies
              </h3>
              <div className="overflow-y-auto h-[400px] pr-2 space-y-3 custom-scrollbar">
                {ftoScatterData.sort((a,b) => b.y - a.y).map((d, index) => (
                  <div key={index} className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white tracking-wider">{d.name}</span>
                      <div className="flex gap-2 text-xs">
                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-medium">IP {d.y}</span>
                        <span className={`px-2 py-0.5 rounded font-medium ${d.fto_risk === 'LOW' ? 'text-emerald-400 bg-emerald-400/10' : d.fto_risk === 'MODERATE' ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>FTO {d.fto_risk}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                      {d.strategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'synergy' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              MNC Whitespace / Synergy Map
            </h3>
            <p className="text-sm text-slate-400 mb-6 font-medium max-w-3xl">
              Evaluating if a target asset extends an acquirer's patent moat or overlaps with existing IP. A larger, complementary shape indicates high acquisition synergy. Current view: Simulated Pfizer vs Seagen.
            </p>
            
            <div className="h-[450px] w-full flex justify-center items-center">
              <ResponsiveContainer width={600} height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={synergyData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Radar name="Acquiring MNC" dataKey="mnc" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
                  <Radar name="Target Asset" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

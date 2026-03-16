import React, { useState } from 'react';
import { BookOpen, Target, ChevronDown, ChevronUp, Zap, ShieldCheck, Activity, BarChart2 } from 'lucide-react';

const Guidance = ({ setView }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is BioQuantix?",
      answer: "BioQuantix is an institutional-grade quantitative intelligence platform designed for the Bio-Pharma sector. We aggregate and analyze data to provide predictive signals and strategic insights for biotech assets."
    },
    {
      question: "How often are the databases updated?",
      answer: "Our core data models and fundamental metrics are updated daily. Real-time market data, news, and \"Shadow Signals\" are continually refreshed via our AI crawler systems to ensure you have the most up-to-date intelligence."
    },
    {
      question: "What is the Alpha Radar?",
      answer: "Alpha Radar is our priority detection system that identifies high-potential assets before they become mainstream news. It evaluates early clinical data, insider movement, and subtle market shifts to highlight emerging opportunities."
    },
    {
      question: "How are the Asset Scores calculated?",
      answer: "Our scoring algorithm (0-100) utilizes five core pillars: Clinical Edge, Target Scarcity, Cash Pressure, Catalyst Timing, and Value Gap. Each pillar is weighted dynamically based on the specific therapeutic area and current market conditions."
    },
    {
      question: "What is the difference between the Free and Pro tiers?",
      answer: "Free tier users gain access to our basic intelligence layer, viewing fundamental metrics and past deals. Pro users unlock restricted high-score assets (Score ≥ 80), predictive upside modeling, detailed AI digests, and our real-time Shadow Signal feed."
    },
    {
      question: "What are 'Shadow Signals'?",
      answer: "Shadow Signals are subtle, often overlooked institutional footprints—such as unannounced clinical trial site expansions, sudden spikes in specialized hiring, or uncharacteristic options flow—that our AI flags as leading indicators of major catalysts."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-cyan-500/10 rounded-2xl mb-6 border border-cyan-500/20">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Manual</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Master the BioQuantix terminal. Understand our proprietary metrics, navigate the data model, and maximize your strategic advantage.
        </p>
      </div>

      {/* Core Metrics Grid */}
      <div className="mb-20">
        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <Activity className="text-cyan-500" /> Defining the Metrics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <ShieldCheck className="text-emerald-400 w-5 h-5" />
            </div>
            <h3 className="text-white font-bold mb-2">Clinical Edge</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Evaluates efficacy and safety profiles against the current Standard of Care (SoC). Scores &gt;80 indicate potential best-in-class or first-in-class assets.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Target className="text-purple-400 w-5 h-5" />
            </div>
            <h3 className="text-white font-bold mb-2">Target Scarcity</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Measures competition density. High scores dictate few competitors targeting the specific mechanism of action or indication.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <BarChart2 className="text-blue-400 w-5 h-5" />
            </div>
            <h3 className="text-white font-bold mb-2">Cash Pressure</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analyzes runway velocity. Extreme scores (&gt;80) highlight distress (runway &lt; 6 months), creating potential distressed M&A opportunities.
            </p>
          </div>

        </div>
      </div>

      {/* Workflow Section */}
      <div className="mb-20 bg-gradient-to-br from-slate-900 to-slate-900/40 p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
          <Zap className="text-cyan-500" /> Optimal Workflow
        </h2>
        
        <div className="space-y-6 relative z-10">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center shrink-0 border border-cyan-500/30 mt-1">1</div>
            <div>
              <h4 className="text-white font-bold text-lg mb-1">Filter by Indication</h4>
              <p className="text-slate-400 text-sm">Use the top navigation bar to isolate specific therapeutic areas (e.g., Oncology, CNS) that align with your mandate.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center shrink-0 border border-cyan-500/30 mt-1">2</div>
            <div>
              <h4 className="text-white font-bold text-lg mb-1">Identify Asymmetries</h4>
              <p className="text-slate-400 text-sm">Scan the leaderboard for assets with aggregate scores &gt;75 but low current market capitalization.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center shrink-0 border border-cyan-500/30 mt-1">3</div>
            <div>
              <h4 className="text-white font-bold text-lg mb-1">Analyze the Digest</h4>
              <p className="text-slate-400 text-sm">Select a ticker to open the detailed right-panel view. Review the Strategic AI Digest and Shadow Signals for catalyst timing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-black text-white mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl transition-all duration-300 overflow-hidden ${openFaq === index ? 'border-cyan-500/50 bg-slate-800/50 shadow-lg shadow-cyan-500/5' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'}`}
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-2xl"
              >
                <span className={`font-bold text-sm sm:text-base ${openFaq === index ? 'text-white' : 'text-slate-300'}`}>
                  {faq.question}
                </span>
                <span className="shrink-0 text-slate-500">
                  {openFaq === index ? <ChevronUp size={20} className="text-cyan-400" /> : <ChevronDown size={20} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center pb-12">
        <button 
          onClick={() => setView('dashboard')}
          className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-1"
        >
          RETURN TO TERMINAL
        </button>
      </div>

    </div>
  );
};

export default Guidance;

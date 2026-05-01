import React, { useState } from 'react';
import { Database, Send, Sparkles, FileText, AlertTriangle, User } from 'lucide-react';

const VDRCopilot = ({ activeAsset }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: `Ingested VDR files for ${activeAsset?.ticker || 'ASSET'}. Ready for Due Diligence extraction.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const predefinedPrompts = [
    "Extract Phase 2 safety flags",
    "Any CMC scale-up risks?",
    "Identify FDA bridging risks"
  ];

  const mockResponses = {
    "safety": "ANALYSIS COMPLETED: Phase 2 safety profile exhibits 8.4% GI-related discontinuation, which is highly competitive vs SoC (16%). No Black Box warning triggers detected in SAE logs. However, note 3 isolated cases of elevated liver enzymes (Grade 1) in cohort B.",
    "cmc": "ANALYSIS COMPLETED: VDR Document 'Manufacturing_Protocol_V3.pdf' indicates reliance on WuXi AppTec for API synthesis. This presents a high-severity BIOSECURE Act compliance risk for any US-based licensee. Tech transfer to an alternate CDMO is estimated at 12-18 months.",
    "fda": "ANALYSIS COMPLETED: The primary dataset is derived exclusively from Chinese clinical sites. VDR correspondence log with FDA (Meeting Minutes Nov 2025) strongly suggests an additional MRCT (Multi-Regional Clinical Trial) will be mandated for US approval, delaying NDA by approx 2.5 years."
  };

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    const newMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "Agent searching VDR indexing... No specific anomalies found for that query.";
      const lowerReq = text.toLowerCase();
      if (lowerReq.includes('safety') || lowerReq.includes('phase 2')) responseText = mockResponses.safety;
      else if (lowerReq.includes('cmc') || lowerReq.includes('manufacturing')) responseText = mockResponses.cmc;
      else if (lowerReq.includes('fda') || lowerReq.includes('bridging')) responseText = mockResponses.fda;

      setMessages(prev => [...prev, { role: 'agent', content: responseText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col h-[450px]">
      <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/50">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Database className="text-blue-400 w-4 h-4" />
           </div>
           <div>
             <h3 className="text-sm font-black text-white tracking-widest uppercase">VDR DD Copilot</h3>
             <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Automated Data Room Extraction</p>
           </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#0A0C10]/30">
         {messages.map((msg, idx) => (
           <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role !== 'user' && (
               <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30 mt-1">
                 {msg.role === 'system' ? <Database size={10} className="text-cyan-400" /> : <Sparkles size={10} className="text-cyan-400" />}
               </div>
             )}
             <div className={`p-3 rounded-xl max-w-[85%] text-[11px] leading-relaxed relative ${
               msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 
               msg.role === 'system' ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50 rounded-tl-sm' :
               'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm shadow-lg'
             }`}>
               {msg.role === 'agent' && msg.content.includes('HIGH-SEVERITY') && <AlertTriangle className="inline w-3 h-3 text-amber-500 mr-1 -mt-0.5" />}
               {msg.content}
             </div>
           </div>
         ))}
         {isTyping && (
           <div className="flex gap-3 justify-start">
             <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/30 mt-1">
               <Sparkles size={10} className="text-cyan-400 animate-pulse" />
             </div>
             <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs flex gap-1 items-center">
               <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
           </div>
         )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <div className="flex gap-2 mb-3 overflow-x-auto custom-scrollbar pb-1">
          {predefinedPrompts.map((p, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(p)}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-[9px] font-bold text-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <FileText size={10} className="text-cyan-500" /> {p}
            </button>
          ))}
        </div>
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Query VDR protocols and readouts..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button 
            onClick={() => handleSend(input)}
            className="absolute right-2 top-2 bottom-2 w-8 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VDRCopilot;

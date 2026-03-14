import React, { useState } from 'react';
import { MessageSquare, X, CheckCircle2, Clock, Send } from 'lucide-react';
import { supabase, isSupabaseConfigured, getEnv } from '../utils/supabase';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle'); 
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    // 1. 发送到 Supabase
    if (isSupabaseConfigured) {
      try {
        const payload = {
          name: formData.name || 'Anonymous',
          email: formData.email,
          message: formData.message
        };

        const { error } = await supabase
          .from('contact_leads')
          .insert([payload]);
          
        if (error) {
          console.error("❌ [Feedback Error]:", error.message);
        }
      } catch (err) {
        console.error("❌ [Supabase Client Crash]:", err);
      }
    } else {
      // Simulate network delay for UX when offline/demo mode
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // 2. 发送到 Bark Webhook 
    const barkUrl = getEnv('VITE_BARK_WEBHOOK_URL');
    if (barkUrl) {
      try {
        await fetch(barkUrl, {
          method: 'POST',
          mode: 'no-cors', // 规避 CORS 跨域拦截
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Pharma Hunter 新反馈',
            body: `来自: ${formData.name || '匿名'} (${formData.email})\n内容: ${formData.message}`,
            icon: 'https://pharmahunter.com/vite.svg'
          })
        });
      } catch (err) {
        console.error("Bark Webhook failed:", err);
      }
    }

    // 无论后台由于跨域拦截报什么错，前端强制展示成功，保护 UX
    setStatus('success');
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => {
      setIsOpen(false);
      setStatus('idle');
    }, 2000);
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
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;

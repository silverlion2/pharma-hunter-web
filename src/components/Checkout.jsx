import React, { useState, useEffect, useCallback } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { ArrowLeft, ShieldCheck, CheckCircle2, Zap, Sparkles, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const PADDLE_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '';
const PADDLE_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID || '';
const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV || 'sandbox'; // 'sandbox' or 'production'

const SALE_PRICE = '19.90';
const ORIGINAL_PRICE = '49.90';

const Checkout = ({ setView, userRole, showToast, onUpgradeSuccess }) => {
  const [paddle, setPaddle] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Paddle SDK
  useEffect(() => {
    if (!PADDLE_TOKEN) {
      setIsLoading(false);
      return;
    }

    initializePaddle({
      environment: PADDLE_ENV,
      token: PADDLE_TOKEN,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          handleCheckoutComplete(event.data);
        }
        if (event.name === 'checkout.closed') {
          if (paymentStatus !== 'success') {
            // User closed without completing
          }
        }
      },
    }).then((paddleInstance) => {
      setPaddle(paddleInstance);
      setIsLoading(false);
    }).catch((err) => {
      console.error('Paddle init error:', err);
      setIsLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckoutComplete = useCallback(async (data) => {
    setPaymentStatus('processing');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        showToast('Session expired. Please log in again.', 'error');
        setPaymentStatus('error');
        return;
      }

      // Record payment in Supabase
      if (isSupabaseConfigured) {
        await supabase.from('payments').insert([{
          user_id: session.user.id,
          provider: 'paddle',
          transaction_id: data?.transaction_id || data?.id || '',
          customer_email: data?.customer?.email || '',
          amount: parseFloat(SALE_PRICE),
          currency: 'USD',
          status: 'completed',
          plan: 'pro_monthly',
        }]);

        // Upgrade user role to pro
        await supabase.from('user_profiles').upsert({
          id: session.user.id,
          role: 'pro',
          upgraded_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }

      setPaymentStatus('success');
      showToast('Payment successful! Welcome to Pro.', 'success');
      
      if (onUpgradeSuccess) onUpgradeSuccess();
    } catch (err) {
      console.error('Post-payment error:', err);
      showToast('Payment received, but account upgrade failed. Please contact support.', 'error');
      setPaymentStatus('error');
    }
  }, [showToast, onUpgradeSuccess]);

  const openCheckout = async () => {
    if (!paddle) {
      showToast('Payment system is loading. Please try again.', 'error');
      return;
    }

    // Get user email to pre-fill
    let customerEmail = '';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      customerEmail = session?.user?.email || '';
    } catch { /* ignore */ }

    paddle.Checkout.open({
      items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
      ...(customerEmail && { customer: { email: customerEmail } }),
    });
  };

  // Success state
  if (paymentStatus === 'success') {
    return (
      <div className="max-w-lg mx-auto py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">You're Pro Now!</h2>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
          Full access to all intelligence features has been activated. Welcome to the inner circle.
        </p>
        <button 
          onClick={() => setView('dashboard')} 
          className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-sm rounded-xl transition-all transform active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          ENTER PRO TERMINAL
        </button>
      </div>
    );
  }

  const hasPaddleConfig = PADDLE_TOKEN && PADDLE_PRICE_ID;

  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      {/* Back button */}
      <button 
        onClick={() => setView('upgrade')} 
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-all font-bold text-xs"
      >
        <ArrowLeft size={14} /> BACK TO PLANS
      </button>

      {/* Checkout card */}
      <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
            <Zap size={10} /> Launch Sale — 60% Off
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Upgrade to Pro</h2>
          <div className="flex items-center justify-center gap-3">
            <span className="text-slate-500 line-through text-lg font-bold">${ORIGINAL_PRICE}</span>
            <span className="text-4xl font-black text-white">${SALE_PRICE}</span>
            <span className="text-slate-400 text-sm font-medium">/ mo</span>
          </div>
        </div>

        {/* What you get */}
        <div className="mb-8 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Included in Pro:</p>
          {[
            'Full Alpha Radar Access',
            'Full AI Strategic Digest',
            '7D Market Analytics',
            'Pipeline Gap Map',
            'Uncensored Options Flow',
            'Priority Anomaly Alerts',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
              {feature}
            </div>
          ))}
        </div>

        {/* Checkout Button */}
        <div className="mb-6">
          {hasPaddleConfig ? (
            <button
              onClick={openCheckout}
              disabled={isLoading || paymentStatus === 'processing'}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black text-sm transition-all transform active:scale-95 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> LOADING...</>
              ) : paymentStatus === 'processing' ? (
                <><Loader2 size={16} className="animate-spin" /> ACTIVATING PRO...</>
              ) : (
                <>COMPLETE PURCHASE — ${SALE_PRICE}</>
              )}
            </button>
          ) : (
            <div className="text-center py-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <Sparkles size={24} className="text-amber-400 mx-auto mb-3" />
              <p className="text-xs text-slate-400 mb-1">Paddle is not configured yet.</p>
              <p className="text-[10px] text-slate-500">
                Add <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">VITE_PADDLE_CLIENT_TOKEN</code> and{' '}
                <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">VITE_PADDLE_PRICE_ID</code> to your{' '}
                <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">.env</code> file.
              </p>
            </div>
          )}
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4 pt-4 border-t border-slate-800/60">
          <ShieldCheck size={14} className="text-slate-600" />
          Secured by Paddle • Cancel anytime
        </div>
      </div>
    </div>
  );
};

export default Checkout;

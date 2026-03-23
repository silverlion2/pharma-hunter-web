import React from 'react';
import { TerminalSquare, X, Clock, Send, LogIn } from 'lucide-react';

const AuthModal = ({
  showAuthModal, setShowAuthModal, authMode, setAuthMode,
  authEmail, setAuthEmail, authPassword, setAuthPassword,
  authError, authLoading, handleAuth
}) => {
  if (!showAuthModal) return null;

  return (
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
                ? 'Join BioQuantix today to claim your 15-Day Free Pro Access.'
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
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
              className="text-cyan-400 font-bold hover:underline"
            >
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

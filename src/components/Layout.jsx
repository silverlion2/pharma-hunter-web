import React, { useState, useRef, useEffect } from 'react';
import { TerminalSquare, Target, History, LogIn, User, LogOut, ShieldCheck, AlertCircle, MessageSquare, Star, BookOpen, Bell, Check, Cpu, FileText, ShieldAlert, Globe, Brain, Menu, X, ChevronDown } from 'lucide-react';
import Button from './ui/Button';

const NAV_ITEMS = [
  { key: 'blog', label: 'Blog', icon: FileText },
  { key: 'deal-tracker', label: 'Deal Tracker', icon: Globe },
  { key: 'ai-biotech', label: 'AI × Bio', icon: Brain },
  { key: 'gap-map', label: 'Gap Map', icon: Cpu },
  { key: 'guidance', label: 'Guide & FAQ', icon: BookOpen },
];

const Layout = ({ 
  children, 
  view, 
  setView, 
  showPastDeals, 
  setShowPastDeals, 
  userRole, 
  setShowAuthModal, 
  setAuthMode, 
  handleLogout,
  notifications = [],
  unreadCount = 0,
  markNotificationRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on view change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [view]);

  const navigateTo = (v) => {
    setView(v);
    setShowPastDeals(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-8 flex-grow w-full relative">
      
      {/* Header */}
      <header className="mb-10 border-b border-slate-800/60 pb-6">
        {/* Top Row: Logo + Actions */}
        <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => {setView('landing'); setShowPastDeals(false);}}>
            <div className="p-2 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/10 group-hover:bg-cyan-400 transition-colors">
              <TerminalSquare className="text-slate-900 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                BIOQUANTIX 
                {view === 'dashboard' && <span className="bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-mono border border-slate-700 uppercase">Terminal</span>}
              </h1>
              <p className="text-slate-600 text-[10px] font-medium hidden sm:block">Quantitative Bio-Pharma Intelligence</p>
            </div>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Nav — hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-1 mr-2">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  onClick={() => navigateTo(item.key)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    view === item.key 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <item.icon size={12} />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Divider */}
            <div className="hidden lg:block w-px h-6 bg-slate-800 mx-1"></div>

            {/* Admin BD Button */}
            {userRole === 'admin' && (
              <button
                onClick={() => navigateTo('biosecure')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  view === 'biosecure' 
                    ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                    : 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border-slate-800'
                }`}
              >
                <ShieldAlert size={12} /> BD
              </button>
            )}

            {/* Watchlist (logged in) */}
            {userRole !== 'visitor' && (
              <button
                onClick={() => navigateTo('watchlist')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${
                  view === 'watchlist'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Star size={12} /> Watchlist
              </button>
            )}

            {/* Upgrade */}
            {(userRole === 'visitor' || userRole === 'free') && (
              <button
                onClick={() => navigateTo('upgrade')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 transition-all whitespace-nowrap"
              >
                <ShieldCheck size={12} /> Pro
              </button>
            )}

            {/* Auth */}
            {userRole === 'visitor' ? (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} 
                icon={LogIn}
              >
                <span className="hidden sm:inline">SIGN IN</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    {userRole === 'admin' ? 'ADMIN' : (userRole === 'pro' ? 'PRO' : 'FREE')}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            {/* Notifications (Logged in only) */}
            {userRole !== 'visitor' && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg transition-all ${showNotifications ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 font-mono text-[8px] font-bold text-white shadow border-2 border-slate-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slideDown">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-800/20">
                      <h3 className="font-black text-xs tracking-widest text-slate-300">ALERTS</h3>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{unreadCount} UNREAD</span>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-bold tracking-widest">NO ALERTS YET</p>
                          <p className="text-[10px] mt-1">Configure alerts in your Watchlist</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 transition-colors hover:bg-slate-800/40 relative group ${!notif.is_read ? 'bg-slate-800/20' : ''}`}
                          >
                            {!notif.is_read && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
                            )}
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <h4 className={`text-xs font-bold mb-1 ${!notif.is_read ? 'text-white' : 'text-slate-400'}`}>
                                  {notif.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                                  {notif.message}
                                </p>
                                <p className="text-[9px] font-mono text-slate-600 block">
                                  {new Date(notif.created_at).toLocaleString()}
                                </p>
                              </div>
                              {!notif.is_read && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 h-fit rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all border border-slate-700"
                                  title="Mark as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-slate-800/60 bg-slate-900/50">
                      <button 
                        onClick={() => { setShowNotifications(false); setView('watchlist'); }}
                        className="w-full py-2 text-[10px] font-bold tracking-widest text-slate-400 hover:text-white transition-colors"
                      >
                        MANAGE ALERT SETTINGS
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Dashboard sub-nav (Live Radar / Past Deals) */}
        {view === 'dashboard' && (
          <div className="flex items-center gap-2 mt-4 animate-fadeIn">
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button 
                onClick={() => setShowPastDeals(false)} 
                className={`px-4 py-2 rounded-lg font-black text-xs transition-all flex items-center gap-2 ${!showPastDeals ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Target size={14}/> Live Radar
              </button>
              <button 
                onClick={() => setShowPastDeals(true)} 
                className={`px-4 py-2 rounded-lg font-black text-xs transition-all flex items-center gap-2 ${showPastDeals ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <History size={14}/> Past Deals
              </button>
            </div>
          </div>
        )}

        {/* Mobile slide-out menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 space-y-1 animate-slideDown shadow-2xl">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => navigateTo(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  view === item.key 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
            
            <div className="border-t border-slate-800 my-2 pt-2">
              {userRole !== 'visitor' && (
                <button onClick={() => navigateTo('watchlist')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'watchlist' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/70'}`}>
                  <Star size={16} /> My Watchlist
                </button>
              )}
              {userRole === 'admin' && (
                <button onClick={() => navigateTo('biosecure')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'biosecure' ? 'bg-red-500/10 text-red-400' : 'text-red-400/70 hover:text-red-400 hover:bg-slate-800/70'}`}>
                  <ShieldAlert size={16} /> Pharma BD
                </button>
              )}
              {(userRole === 'visitor' || userRole === 'free') && (
                <button onClick={() => navigateTo('upgrade')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 transition-all">
                  <ShieldCheck size={16} /> Upgrade to Pro
                </button>
              )}
            </div>

            {/* Discord in mobile menu */}
            <a 
              href="https://discord.gg/your-invite-link-here" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#5865F2] hover:bg-[#5865F2]/10 transition-all"
            >
              <MessageSquare size={16} /> Discord Community
            </a>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="min-h-[60vh] animate-fadeIn">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-slate-800/50 w-full">
        <div className="grid md:grid-cols-3 gap-8 items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <TerminalSquare className="w-4 h-4 text-cyan-500" />
              </div>
              <span className="text-sm font-black text-white tracking-tight">BIOQUANTIX</span>
            </div>
            <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase mb-1">
              Model v2.8.0-LTS • US-East
            </p>
            <p className="text-[9px] text-slate-500 leading-relaxed max-w-xs">
              Intelligence sourced via SEC Edgar, OCC, FDA endpoints, and proprietary API networks.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Navigate</span>
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => navigateTo(item.key)} className="text-[11px] text-slate-500 hover:text-cyan-400 transition-colors text-left font-medium">{item.label}</button>
            ))}
            <a href="https://discord.gg/your-invite-link-here" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#5865F2] hover:text-[#4752C4] transition-colors text-left font-medium flex items-center gap-1.5">
              <MessageSquare size={10} /> Discord Community
            </a>
          </div>

          <div className="p-4 bg-slate-800/20 border border-slate-800/50 rounded-xl">
            <div className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
              <AlertCircle size={12} /> Disclaimer
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              BioQuantix provides algorithmic data aggregation for informational purposes only. Not a registered investment advisor. Past data is not indicative of future results.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-6 border-t border-slate-800/30">
          <span>© 2026 BioQuantix Digital Terminal</span>
          <div className="flex gap-6">
             <button onClick={() => navigateTo('guidance')} className="hover:text-cyan-400 transition-colors cursor-pointer">Help Center</button>
             <a href="/terms.html" className="hover:text-cyan-400 transition-colors">Terms</a>
             <a href="/privacy.html" className="hover:text-cyan-400 transition-colors">Privacy</a>
             <a href="/refund.html" className="hover:text-cyan-400 transition-colors">Refunds</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

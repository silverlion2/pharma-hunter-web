import React, { useState, useRef, useEffect } from 'react';
import { TerminalSquare, Target, History, LogIn, User, LogOut, ShieldCheck, AlertCircle, MessageSquare, Star, BookOpen, Bell, Check, Cpu } from 'lucide-react';
import Button from './ui/Button';

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
  return (
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
            <Button 
              variant="secondary" 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} 
              icon={LogIn}
            >
              SIGN IN
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {userRole === 'admin' ? 'SUPER ADMIN' : (userRole === 'pro' ? 'PRO TIER' : 'BASIC EXPLORER')}
                </span>
              </div>
              <Button 
                variant="danger" 
                size="icon" 
                onClick={handleLogout}
                title="Sign Out"
                icon={LogOut}
              />
            </div>
          )}

          {userRole !== 'visitor' && (
            <div className="flex items-center gap-2">
              <Button 
                variant={view === 'watchlist' ? 'primary' : 'secondary'}
                onClick={() => setView('watchlist')} 
                icon={Star}
              >
                MY WATCHLIST
              </Button>
            </div>
          )}

          {(userRole === 'visitor' || userRole === 'free') && (
            <Button 
              variant="outline"
              onClick={() => setView('upgrade')} 
              icon={ShieldCheck}
            >
              UPGRADE PRO
            </Button>
          )}

          {userRole !== 'visitor' && (
            <div className="flex items-center gap-2">
              <Button 
                variant={view === 'gap-map' ? 'primary' : 'outline'}
                onClick={() => { setView('gap-map'); setShowPastDeals(false); }} 
                icon={Cpu}
              >
                GAP MAP
              </Button>
            </div>
          )}

          <Button 
            variant={view === 'guidance' ? 'primary' : 'outline'}
            onClick={() => { setView('guidance'); setShowPastDeals(false); }} 
            icon={BookOpen}
          >
            GUIDE & FAQ
          </Button>

          {/* Discord Native Button */}
          <a 
            href="https://discord.gg/your-invite-link-here" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-black transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg transform active:scale-95 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2.5 text-sm"
            title="Join our Discord Community"
          >
            <MessageSquare className="w-4 h-4" />
            DISCORD
          </a>

          {/* Notifications Dropdown (Logged in only) */}
          {userRole !== 'visitor' && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-slate-800 text-white' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'} border border-slate-800`}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-mono text-[9px] font-bold text-white shadow-lg border-2 border-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
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

        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-h-[60vh]">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-slate-900 w-full">
        <div className="grid md:grid-cols-2 gap-8 items-start mb-10">
          <div>
            <div className="text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-slate-600" />
              Institutional-Grade Quantitative Intelligence
            </div>
            <p className="text-[11px] text-slate-700 font-bold uppercase tracking-widest mb-4">
              Model v2.8.0-LTS • Datacenter: US-East
            </p>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium max-w-sm">
              Intelligence sourced via SEC Edgar, Options Clearing Corporation (OCC), FDA endpoints, and proprietary API networks.<br/>
              <span className="text-cyan-500 font-bold mt-1 inline-block">Transparent inputs equal trusted outputs.</span>
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
             <button onClick={() => { setView('guidance'); setShowPastDeals(false); }} className="hover:text-cyan-400 transition-colors uppercase font-black cursor-pointer">Help Center</button>
             <a href="/terms.html" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
             <a href="/privacy.html" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
             <a href="/refund.html" className="hover:text-cyan-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

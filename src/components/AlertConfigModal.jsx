import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Bell, ShieldAlert } from 'lucide-react';
import { supabase } from '../utils/supabase';

const AlertConfigModal = ({ isOpen, onClose, ticker }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [alertType, setAlertType] = useState('QUANT_DROP');
  const [threshold, setThreshold] = useState('');

  const ALERT_TYPES = [
    { value: 'QUANT_DROP', label: 'Quant Score Drops Below' },
    { value: 'QUANT_RISE', label: 'Quant Score Rises Above' },
    { value: 'SCARCITY_RISE', label: 'Target Scarcity Rises Above' },
    { value: 'CASH_STRAIN', label: 'Cash Strain Rises Above' },
    { value: 'STATUS_CHANGE', label: 'Clinical Status Changes To' },
  ];

  useEffect(() => {
    if (isOpen && ticker) fetchAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ticker]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('ticker', ticker)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!threshold) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const payload = {
        user_id: session.user.id,
        ticker,
        alert_type: alertType,
        is_active: true
      };
      
      if (alertType === 'STATUS_CHANGE') {
        payload.threshold_text = threshold;
      } else {
        payload.threshold_value = Number(threshold);
      }
      
      const { error } = await supabase.from('user_alerts').insert([payload]);
      if (error) throw error;
      
      setThreshold('');
      fetchAlerts();
    } catch (err) {
      console.error("Failed to add alert:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supabase.from('user_alerts').delete().eq('id', id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Alert Settings</h3>
              <p className="text-[10px] text-slate-500 font-medium">Tracking rules for {ticker}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleAddAlert} className="p-4 border-b border-slate-800 bg-slate-900/50 space-y-3">
          <h4 className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Create New Rule</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-slate-300 focus:outline-none focus:border-cyan-500"
              value={alertType}
              onChange={(e) => {
                setAlertType(e.target.value);
                setThreshold('');
              }}
            >
              {ALERT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            {alertType === 'STATUS_CHANGE' ? (
              <select
                required
                className="w-full sm:w-28 bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-slate-300 focus:outline-none focus:border-cyan-500"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              >
                <option value="" disabled>Status...</option>
                <option value="IMMINENT">IMMINENT</option>
                <option value="ACQUIRED">ACQUIRED</option>
                <option value="DEAD">DEAD</option>
              </select>
            ) : (
              <input 
                type="number"
                required
                placeholder="Value"
                className="w-full sm:w-24 bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-slate-300 focus:outline-none focus:border-cyan-500"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            )}
            
            <button 
              type="submit"
              disabled={submitting}
              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-lg font-black transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </form>

        {/* Existing Alerts List */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <h4 className="text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3">Active Rules ({alerts.length})</h4>
          
          {loading ? (
            <div className="text-center text-slate-600 text-xs py-4">Loading rules...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <ShieldAlert className="w-6 h-6 object-center mx-auto mb-2 text-slate-700" />
              <p className="text-xs text-slate-500">No alerts configured for {ticker}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className="flex flex-row items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-800/20 group">
                  <div>
                    <span className="text-xs font-bold text-slate-300">
                      {ALERT_TYPES.find(t => t.value === alert.alert_type)?.label || alert.alert_type}
                    </span>
                    <span className="text-xs font-black text-cyan-400 ml-2">
                      {alert.alert_type === 'STATUS_CHANGE' ? alert.threshold_text : alert.threshold_value}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(alert.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                    title="Delete Rule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertConfigModal;

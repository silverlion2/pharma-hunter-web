import React from 'react';

const Card = ({ children, className = '', variant = 'default', padding = 'default' }) => {
  const variants = {
    default: "bg-slate-900 border border-slate-800",
    glass: "bg-slate-900/60 border border-slate-800 backdrop-blur-sm",
    highlight: "bg-slate-950 border border-cyan-500/30 shadow-2xl shadow-cyan-500/5",
    accent: "bg-indigo-500/10 border border-indigo-500/30",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${variants[variant]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;

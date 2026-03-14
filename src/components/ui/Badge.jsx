import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '', icon: Icon }) => {
  const variants = {
    default: "bg-slate-800 border border-slate-700 text-slate-400",
    primary: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    accent: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[9px]",
    md: "px-2.5 py-1 text-[10px]",
    lg: "px-4 py-2 text-xs",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-widest rounded-md ${variants[variant]} ${sizes[size]} ${className}`}>
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {children}
    </span>
  );
};

export default Badge;

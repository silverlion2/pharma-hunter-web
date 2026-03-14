import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  disabled = false,
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-black transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-cyan-500/20 focus:ring-cyan-500",
    secondary: "bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700 focus:ring-slate-700",
    danger: "text-slate-500 hover:text-red-400 hover:bg-red-500/10 focus:ring-red-500",
    ghost: "bg-transparent text-slate-500 hover:text-white focus:ring-slate-500",
    outline: "bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 focus:ring-cyan-500",
    accent: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20 focus:ring-indigo-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-10 py-5 text-lg rounded-2xl",
    icon: "p-2.5",
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={size === 'icon' || size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
      {children}
    </button>
  );
};

export default Button;

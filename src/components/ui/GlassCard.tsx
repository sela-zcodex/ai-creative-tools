import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`relative bg-[#16161a]/80 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl shadow-black/40 ${className}`}
    >
      {children}
    </div>
  );
};

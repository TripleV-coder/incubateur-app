import React from 'react';

interface EliteCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

export const EliteCard = ({ children, className = '', title, style }: EliteCardProps) => {
  return (
    <div className={`glass relative rounded-3xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(212,175,55,0.2)] hover:border-gold/30 group ${className}`} style={style}>
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_90%_15%,rgba(212,175,55,0.09),transparent_42%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {title && (
        <h3 className="font-elite text-2xl mb-5 gold-text-gradient font-semibold">
          {title}
        </h3>
      )}
      <div className="relative text-snow/80 group-hover:text-snow transition-colors">
        {children}
      </div>
    </div>
  );
};

export default EliteCard;

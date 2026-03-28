import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

export const StatCard = ({ label, value, icon, trend }: StatCardProps) => {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl glass hover:border-gold/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gold/10 rounded-xl text-gold group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-snow/40 text-sm font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-elite font-bold text-snow mt-1">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;

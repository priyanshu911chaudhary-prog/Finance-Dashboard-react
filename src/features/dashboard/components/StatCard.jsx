import { formatCurrency } from '../../../utils/currency';

// eslint-disable-next-line no-unused-vars
export function StatCard({ title, amount, icon: Icon, trend, trendLabel }) {
  const isPositive = trend >= 0;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{title}</p>
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent/10 transition-colors">
          <Icon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
        </div>
      </div>
      
      <div>
        {/* REPLACED: Use the new utility here */}
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {formatCurrency(amount)}
        </h2>
        
        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold ${isPositive ? 'text-accent' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-muted">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
import { AlertCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

export function BudgetProgressCard({ budget, spent, onDelete }) {
  const { category, limit } = budget;

  // STRICTLY USE STANDARD UNITS
  const safeLimit = Number(limit) || 0;
  const safeSpent = Number(spent) || 0;
  
  const rawPercentage = safeLimit > 0 ? (safeSpent / safeLimit) * 100 : 0;
  const percentage = Math.min(Math.max(rawPercentage, 0), 100);
  const isOverBudget = safeLimit > 0 && safeSpent > safeLimit;
  const isNearLimit = percentage >= 85 && !isOverBudget;

  let progressColor = 'bg-accent'; 
  if (isNearLimit) progressColor = 'bg-yellow-400'; 
  if (isOverBudget) progressColor = 'bg-destructive'; 

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4 transition-all hover:bg-white/5 relative overflow-hidden group">
      
      {/* Delete Button */}
      <button 
        onClick={() => onDelete(budget.id)}
        className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
        title="Delete Budget"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex flex-col gap-2 pr-10 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-white">{category}</h3>
        <span className="text-xs sm:text-sm font-medium text-muted leading-tight sm:leading-normal">
          <span>{formatCurrency(safeSpent)}</span>
          <span className="hidden sm:inline"> / </span>
          <span className="block sm:inline">{formatCurrency(safeLimit)}</span>
        </span>
      </div>

      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">
          {rawPercentage.toFixed(1)}% used
        </span>
        
        {isOverBudget && (
          <span className="text-destructive flex items-center gap-1 font-medium">
            <AlertCircle className="w-4 h-4" /> Over by {formatCurrency(safeSpent - safeLimit)}
          </span>
        )}
        
        {isNearLimit && (
          <span className="text-yellow-400 flex items-center gap-1 font-medium">
            <AlertCircle className="w-4 h-4" /> Nearing limit
          </span>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Sparkles, Trash2, Plus, ShieldAlert, Plane, Laptop, Home, Car } from 'lucide-react';
import { useGoalStore } from '../../../store/useGoalStore';
import { formatCurrency } from '../../../utils/currency';
import { ConfirmationDialog } from '../../../shared/components/ui/ConfirmationDialog';
import { AmountPromptDialog } from '../../../shared/components/ui/AmountPromptDialog';

const ICON_MAP = {
  ShieldAlert, Plane, Laptop, Home, Car
};

export function GoalCard({ goal }) {
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { name, icon } = goal;
  const { deleteGoal, contributeToGoal } = useGoalStore();
  
  const IconComponent = ICON_MAP[icon] || Home;
  
  // STRICTLY USE STANDARD UNITS
  const safeTarget = Number(goal.target) || 0;
  const safeCurrent = Number(goal.current) || 0;
  
  const percentage = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;
  const isCompleted = safeTarget > 0 && safeCurrent >= safeTarget;

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-5 relative overflow-hidden group transition-all hover:bg-white/5">
      {isCompleted && <div className="absolute inset-0 bg-accent/5 pointer-events-none" />}

      {/* Action Buttons (Hover) */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {!isCompleted && (
          <button onClick={() => setIsContributeOpen(true)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-accent hover:text-background transition-colors" title="Add Funds">
            <Plus className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => setIsDeleteOpen(true)} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-white transition-colors" title="Delete Goal">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start justify-between relative z-10 pr-16">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isCompleted ? 'bg-accent/20 text-accent' : 'bg-white/5 text-muted'}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{name}</h3>
            <p className="text-sm text-muted">
              {formatCurrency(safeCurrent)} / {formatCurrency(safeTarget)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-xs font-medium text-muted">
          <span>{isCompleted ? <span className="text-accent flex items-center gap-1"><Sparkles className="w-3 h-3"/> Reached</span> : 'Progress'}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
        
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            key={safeCurrent} // Forces re-animation when current amount changes
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`h-full rounded-full ${isCompleted ? 'bg-accent' : 'bg-white'}`}
          />
        </div>
      </div>

      <AmountPromptDialog
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        onSubmit={(amount) => {
          contributeToGoal(goal.id, amount);
          setIsContributeOpen(false);
        }}
        title={`Add funds to ${name}`}
        label="Contribution amount"
        submitLabel="Add Funds"
      />

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          deleteGoal(goal.id);
          setIsDeleteOpen(false);
        }}
        title="Delete Goal"
        message="Delete this goal? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
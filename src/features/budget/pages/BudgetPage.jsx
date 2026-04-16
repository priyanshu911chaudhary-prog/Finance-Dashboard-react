import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Plus } from 'lucide-react';
import { useBudgetStore } from '../../../store/useBudgetStore';
import { transactionApi } from '../../../services/api/transactions';
import { BudgetProgressCard } from '../components/BudgetProgressCard';
import { Modal } from '../../../shared/components/ui/Modal';
import { ConfirmationDialog } from '../../../shared/components/ui/ConfirmationDialog';
import { BudgetForm } from '../components/BudgetForm';

export function BudgetPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetPendingDelete, setBudgetPendingDelete] = useState(null);
  const { budgets, addBudget, deleteBudget } = useBudgetStore();

  // 1. Fetch all transactions from our global React Query cache
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getTransactions,
  });

  // 2. Derive spending per category dynamically
  const categorySpending = useMemo(() => {
    const spending = {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Only look at expenses from the current month
    const monthlyExpenses = transactions.filter(tx => {
      const txDate = new Date(`${tx.date}T00:00:00`);
      return tx.type === 'expense' && 
             txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear;
    });
    
    monthlyExpenses.forEach(tx => {
      // STRICTLY USE STANDARD UNITS
      const safeAmount = Math.abs(Number(tx.amount) || 0); 
      spending[tx.category] = (spending[tx.category] || 0) + safeAmount;
    });
    
    return spending;
  }, [transactions]);

  // 3. Recalculate health score using STANDARD UNITS
  const totalLimit = budgets.reduce((acc, curr) => acc + (Number(curr.limit) || 0), 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + (categorySpending[curr.category] || 0), 0);
  const healthScore = totalLimit > 0 ? Math.max(100 - ((totalSpent / totalLimit) * 100), 0).toFixed(0) : 100;

  const handleAddBudget = (data) => {
    addBudget(data);
    setIsModalOpen(false);
  };

  const handleDeleteBudget = (id) => {
    setBudgetPendingDelete(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Budgets</h1>
          <p className="text-muted mt-1">Monitor your spending limits across categories.</p>
        </div>
        
        <div className="self-start sm:self-auto flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border-accent/20 hidden sm:flex">
            <div className="p-2 bg-accent/10 rounded-lg">
              <PieChart className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Health Score</p>
              <p className="text-xl font-bold text-white">{healthScore}/100</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 sm:gap-2 bg-accent text-background px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            New Budget
          </button>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <p className="text-muted">No budgets configured. Set your first limit!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetProgressCard 
              key={budget.id} 
              budget={budget} 
              spent={categorySpending[budget.category] || 0} 
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Budget Limit">
        <BudgetForm onSubmit={handleAddBudget} />
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(budgetPendingDelete)}
        onClose={() => setBudgetPendingDelete(null)}
        onConfirm={() => {
          if (budgetPendingDelete) {
            deleteBudget(budgetPendingDelete);
          }
          setBudgetPendingDelete(null);
        }}
        title="Delete Budget"
        message="Are you sure you want to delete this budget category?"
        confirmLabel="Delete"
      />
    </div>
  );
}
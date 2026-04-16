import { lazy, Suspense, useMemo } from 'react';
import { Loader } from '../../../shared/components/ui/Loader';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { transactionApi } from '../../../services/api/transactions';
import { useWalletStore } from '../../../store/useWalletStore';
import { useGoalStore } from '../../../store/useGoalStore';

const OverviewChart = lazy(() =>
  import('../components/OverviewChart').then((module) => ({ default: module.OverviewChart }))
);
const RunningBalanceChart = lazy(() =>
  import('../components/RunningBalanceChart').then((module) => ({ default: module.RunningBalanceChart }))
);
const UpcomingBills = lazy(() =>
  import('../components/UpcomingBills').then((module) => ({ default: module.UpcomingBills }))
);
const ExpenseDonutChart = lazy(() =>
  import('../components/ExpenseDonutChart').then((module) => ({ default: module.ExpenseDonutChart }))
);

function ChartLoader({ className = 'h-[400px]' }) {
  return <div className={`glass-panel rounded-2xl animate-pulse ${className}`} />;
}

export function DashboardPage() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getTransactions,
  });

  const { wallets } = useWalletStore();
  const { goals } = useGoalStore();

  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0; 
    const walletBalances = {};

    // 1. CRITICAL FIX: Initialize with standard openingBalance
    // This ensures your 1.7 Crore opening capital is included in the Total Balance.
    wallets.forEach(w => {
      walletBalances[w.id] = Number(w.openingBalance) || 0; 
    });

    transactions.forEach(tx => {
      const amount = Number(tx.amount) || 0;

      // Update individual wallet totals
      if (walletBalances[tx.walletId] !== undefined) {
        walletBalances[tx.walletId] += amount;
      }

      // Ignore transfers for aggregate Income/Expense totals
      if (tx.type === 'transfer') return;

      // Track all-time totals
      if (tx.type === 'income') totalIncome += Math.abs(amount);
      if (tx.type === 'expense') totalExpenses += Math.abs(amount);
    });

    // Sum up all wallets to get Net Worth
    const totalBalance = Object.values(walletBalances).reduce((acc, val) => acc + val, 0);

    // Goal Logic
    const totalGoalTarget = goals.reduce((sum, g) => sum + (Number(g.target) || 0), 0);
    const totalGoalCurrent = goals.reduce((sum, g) => sum + (Number(g.current) || 0), 0);
    const goalProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

    return { 
      totalBalance, 
      totalIncome, 
      totalExpenses, 
      totalGoalTarget, 
      goalProgress 
    };
  }, [transactions, wallets, goals]);

  if (isLoading) {
    return <Loader className="h-[60vh]" size={48} />;
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-muted mt-1">Here is your financial overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" amount={stats.totalBalance} icon={Wallet} />
        <StatCard title="Total Income" amount={stats.totalIncome} icon={TrendingUp} />
        <StatCard title="Total Expenses" amount={stats.totalExpenses} icon={TrendingDown} />
        <StatCard 
          title="Savings Goals" 
          amount={stats.totalGoalTarget} 
          icon={Target} 
          trend={parseFloat(stats.goalProgress.toFixed(1))} 
          trendLabel="completed overall" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartLoader />}>
            <OverviewChart transactions={transactions} />
          </Suspense>
        </div>
        <div className="h-[400px]">
          <Suspense fallback={<ChartLoader className="h-full" />}>
            <ExpenseDonutChart transactions={transactions} isLoading={isLoading} />
          </Suspense>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 h-[400px]">
          <Suspense fallback={<ChartLoader className="h-full" />}>
            <UpcomingBills transactions={transactions} isLoading={isLoading} />
          </Suspense>
        </div>
        <div className="lg:col-span-2 h-[400px]">
          <Suspense fallback={<ChartLoader className="h-full" />}>
            <RunningBalanceChart transactions={transactions} wallets={wallets} goals={goals} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
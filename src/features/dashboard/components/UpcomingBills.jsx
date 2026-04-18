import { CalendarClock } from 'lucide-react';
import { useMemo } from 'react';
import { calculateUpcomingBills } from '../../../utils/recurringEngine';
import { formatCurrency } from '../../../utils/currency';

export function UpcomingBills({ transactions, isLoading }) {
  // Memoize the engine calculation so it only runs when transactions change
  const upcomingBills = useMemo(() => calculateUpcomingBills(transactions), [transactions]);

  if (isLoading) {
    return <div className="glass-panel p-6 rounded-2xl h-full animate-pulse" />;
  }

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-white">Upcoming Bills</h3>
      </div>
      
      {upcomingBills.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted text-sm rounded-xl">
          No upcoming bills detected.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {upcomingBills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div>
                <p className="font-medium text-white">{bill.description}</p>
                <p className="text-xs text-muted">Due: {bill.dueDate}</p>
              </div>
              <p className="font-bold text-white">
                {formatCurrency(bill.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
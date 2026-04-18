import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../utils/currency';

// Color palette matching our dark/neon aesthetic
const COLORS = ['#00f0ff', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

function renderLegendContent({ payload = [] }) {
  return (
    <ul className="flex w-full flex-wrap gap-x-3 gap-y-1.5 pt-2 text-xs text-muted">
      {payload.map((entry, index) => {
        const label = entry?.value || '';
        const compactLabel = label.length > 18 ? `${label.slice(0, 18)}...` : label;

        return (
          <li key={`${label}-${index}`} className="flex max-w-[48%] items-center gap-1.5 min-w-0">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry?.color || '#a1a1aa' }}
            />
            <span className="truncate">{compactLabel}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ExpenseDonutChart({ transactions, isLoading }) {
  // Derive category data dynamically from the transactions cache
  const data = useMemo(() => {
    if (!transactions) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. STRICT TIME FILTER: Only grab expenses from the current month
    const monthlyExpenses = transactions.filter(tx => {
      const txDate = new Date(`${tx.date}T00:00:00`);
      return tx.type === 'expense' && 
             txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear;
    });

    const categoryMap = {};

    monthlyExpenses.forEach(tx => {
      // 2. Strict unit filter: use standard tx.amount
      const amount = Math.abs(Number(tx.amount) || 0);
      
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + amount;
    });

    // Convert to array format required by Recharts
    return Object.keys(categoryMap)
      .map(name => ({ name, value: categoryMap[name] }))
      .sort((a, b) => b.value - a.value); // Largest slices first
  }, [transactions]);

  if (isLoading) {
    return <div className="glass-panel p-6 rounded-2xl h-[400px] animate-pulse" />;
  }

  if (!data.length) {
    return (
      <div className="glass-panel p-6 rounded-2xl h-[400px] flex items-center justify-center">
        <p className="text-muted">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col gap-2">
      <div>
        <h3 className="text-lg font-bold text-white">Expenses by Category</h3>
        <p className="text-sm text-muted">Where your money went this month</p>
      </div>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              activeShape={null}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              // 3. Since we removed minor units, formatCurrency works perfectly here!
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: '#09090b', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff', border: 'none' }}
            />
            <Legend verticalAlign="bottom" content={renderLegendContent} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
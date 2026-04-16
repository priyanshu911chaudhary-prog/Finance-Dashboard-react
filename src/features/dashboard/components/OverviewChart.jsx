import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../utils/currency';

export function OverviewChart({ transactions = [] }) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = {};

    transactions.forEach(tx => {
      if (tx.type === 'transfer') return;

      const date = new Date(`${tx.date}T00:00:00`);
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { 
          name: `${month} '${year.toString().slice(-2)}`, 
          income: 0, 
          expense: 0, 
          sortOrder: (year * 12) + date.getMonth() 
        };
      }

      // FIX: We rely solely on tx.amount since our JSON uses standard units natively
      if (tx.type === 'income') monthlyData[key].income += Math.abs(tx.amount);
      if (tx.type === 'expense') monthlyData[key].expense += Math.abs(tx.amount);
    });

    return Object.values(monthlyData).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-white mb-2">Cash Flow Overview</h3>
        <p className="text-sm text-muted">No transaction data available yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold text-white">Cash Flow Overview</h3>
        <p className="text-sm text-muted">Income vs Expenses tracking</p>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            
            {/* FIX: Formats the Y-Axis to look professional (e.g., "₹60k") */}
            <YAxis 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => {
                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                return `₹${value}`;
              }} 
            />
            
            {/* FIX: Passes the raw value straight into formatCurrency with no division! */}
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              formatter={(value) => formatCurrency(value)}
            />
            
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="income" name="Income" fill="#00f0ff" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

export function TransactionTable({ transactions, isLoading, onDelete }) {
  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
        <div className="h-10 bg-white/5 rounded-lg w-full"></div>
        <div className="h-14 bg-white/5 rounded-lg w-full"></div>
        <div className="h-14 bg-white/5 rounded-lg w-full"></div>
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl">
        <p className="text-muted">No transactions found. Add your first one!</p>
      </div>
    );
  }

  const renderAmount = (tx, alignClass = 'justify-end') => {
    // STRICTLY USE STANDARD UNITS
    const safeAmount = Number(tx.amount) || 0;

    if (tx.type === 'transfer') {
      const isIncomingTransfer = safeAmount > 0;
      return (
        <span className={`flex items-center gap-1 ${alignClass} ${isIncomingTransfer ? 'text-blue-300' : 'text-blue-200'}`}>
          <ArrowRightLeft className="w-4 h-4" />
          {isIncomingTransfer ? '+' : '-'}{formatCurrency(Math.abs(safeAmount))}
        </span>
      );
    }

    if (tx.type === 'income') {
      return (
        <span className={`text-accent flex items-center gap-1 ${alignClass}`}>
          <ArrowUpRight className="w-4 h-4" />
          {formatCurrency(Math.abs(safeAmount))}
        </span>
      );
    }

    return (
      <span className={`text-white flex items-center gap-1 ${alignClass}`}>
        <ArrowDownRight className="w-4 h-4 text-muted" />
        {formatCurrency(Math.abs(safeAmount))}
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="md:hidden divide-y divide-white/10">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white break-words">{tx.description}</p>
                <p className="text-xs text-muted mt-0.5">{tx.date}</p>
              </div>
              <button
                onClick={() => onDelete(tx.id)}
                className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete Transaction"
                aria-label="Delete transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-muted truncate max-w-[55%]">
                {tx.category}
              </span>
              <div className="text-sm font-medium">{renderAmount(tx, 'justify-end')}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-muted text-xs uppercase tracking-wider font-medium">
              <th className="p-4">Date</th>
              <th className="p-4">Description</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 w-12"></th> {/* Actions column */}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 text-sm text-muted">{tx.date}</td>
                <td className="p-4 font-medium text-white">{tx.description}</td>
                <td className="p-4 text-sm">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-muted group-hover:text-white transition-colors">
                    {tx.category}
                  </span>
                </td>
                <td className="p-4 text-right font-medium">
                  {renderAmount(tx)}
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
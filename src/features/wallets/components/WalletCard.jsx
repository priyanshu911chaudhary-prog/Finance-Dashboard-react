import { Building2, CreditCard, Wallet as WalletIcon, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

const WALLET_ICONS = {
  bank: Building2,
  credit: CreditCard,
  cash: WalletIcon,
};

export function WalletCard({ wallet, balance, onDelete }) {
  const Icon = WALLET_ICONS[wallet.type] || WalletIcon;
  const isCredit = wallet.type === 'credit';
  
  // Balance is passed down from WalletsPage (which we already fixed to be standard units)
  const displayBalance = isCredit ? Math.abs(balance) : balance;
  
  // STRICTLY USE STANDARD UNITS for the opening balance text
  const openingBalance = Number(wallet.openingBalance) || 0;

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col gap-4 sm:gap-6 group hover:bg-white/5 transition-colors relative overflow-hidden">
      
      {/* Delete Button - Appears on hover */}
      <button 
        onClick={() => onDelete(wallet.id)}
        className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
        title="Delete Wallet"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-white/5 rounded-xl group-hover:bg-accent/10 transition-colors">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-muted group-hover:text-accent transition-colors" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white pr-8">{wallet.name}</h3>
            <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider">{wallet.type}</p>
          </div>
        </div>
      </div>
      
      <div>
        <p className="text-xs sm:text-sm text-muted mb-1">
          {isCredit ? 'Current Balance (Owed)' : 'Available Balance'}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {formatCurrency(displayBalance)}
        </h2>
        <p className="text-[11px] sm:text-xs text-muted mt-2">
          Opening balance: {formatCurrency(isCredit ? Math.abs(openingBalance) : openingBalance)}
        </p>
      </div>
    </div>
  );
}
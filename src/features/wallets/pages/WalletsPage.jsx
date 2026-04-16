import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { transactionApi } from '../../../services/api/transactions';
import { useWalletStore } from '../../../store/useWalletStore';
import { WalletCard } from '../components/WalletCard';
import { Modal } from '../../../shared/components/ui/Modal';
import { ConfirmationDialog } from '../../../shared/components/ui/ConfirmationDialog';
import { WalletForm } from '../components/WalletForm';
import { formatCurrency } from '../../../utils/currency';

export function WalletsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blockedDeleteMessage, setBlockedDeleteMessage] = useState('');
  const [walletPendingDelete, setWalletPendingDelete] = useState(null);
  
  // Pull Zustand state AND actions
  const { wallets, addWallet, deleteWallet } = useWalletStore();
  
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getTransactions,
  });

  /**
   * PERFORMANCE STRATEGY: Calculate all wallet balances in a single pass.
   * We initialize with the opening balance and then replay the transaction ledger.
   */
  const walletBalances = useMemo(() => {
    const balances = {};
    
    // 1. Initialize balances with the starting opening balance from the wallet metadata
    wallets.forEach(w => {
      balances[w.id] = Number(w.openingBalance) || 0;
    });
    
    // 2. Iterate through all transactions once
    transactions.forEach(tx => {
      const amount = Number(tx.amount) || 0;
      
      // Update the balance of the wallet assigned to this transaction.
      // NOTE: We do not manually handle 'transferWalletId' here because the 
      // system generates a matching deposit/withdrawal transaction pair.
      if (balances[tx.walletId] !== undefined) {
        balances[tx.walletId] += amount;
      }
    });
    
    return balances;
  }, [transactions, wallets]);

  // Derive total net worth from the calculated balances
  const totalNetWorth = Object.values(walletBalances).reduce((acc, val) => acc + val, 0);

  // Quality of Life: Check for transactions referencing deleted/missing wallets
  const orphanedTransactionCount = transactions.filter(
    (tx) => !wallets.some((wallet) => wallet.id === tx.walletId)
  ).length;

  const handleAddWallet = (data) => {
    addWallet(data);
    setIsModalOpen(false);
  };

  const handleDeleteWallet = (id) => {
    const linkedTransactionCount = transactions.filter((tx) => tx.walletId === id).length;
    
    if (linkedTransactionCount > 0) {
      setBlockedDeleteMessage(
        `Security Alert: This wallet cannot be deleted because ${linkedTransactionCount} transaction(s) are still linked to it. Please reassign or delete the transactions first.`
      );
      return;
    }

    setWalletPendingDelete(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Wallets</h1>
          <p className="text-muted mt-1">Manage your accounts and track your real-time net worth.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1 sm:gap-2 bg-accent text-background px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          Add Wallet
        </button>
      </div>

      {isLoading ? (
        <div className="h-32 glass-panel rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Net Worth Overview Card */}
          <div className="glass-panel p-8 rounded-2xl border-accent/20 bg-accent/5">
            <p className="text-sm font-medium text-muted mb-2">Total Net Worth</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-tight font-bold text-white tracking-tight break-words">
              {formatCurrency(totalNetWorth)}
            </h2>
            {orphanedTransactionCount > 0 && (
              <p className="mt-3 text-sm text-yellow-400">
                Notice: {orphanedTransactionCount} transaction(s) are excluded from this total because they reference missing wallets.
              </p>
            )}
          </div>

          {/* Wallets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <WalletCard 
                key={wallet.id} 
                wallet={wallet} 
                balance={walletBalances[wallet.id]} 
                onDelete={handleDeleteWallet}
              />
            ))}
          </div>
        </>
      )}

      {/* Shared Modal for Creating Wallets */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Wallet"
      >
        <WalletForm onSubmit={handleAddWallet} />
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(blockedDeleteMessage)}
        onClose={() => setBlockedDeleteMessage('')}
        onConfirm={() => setBlockedDeleteMessage('')}
        title="Wallet Protected"
        message={blockedDeleteMessage}
        confirmLabel="Okay"
        cancelLabel="Close"
        confirmClassName="bg-accent text-background hover:opacity-90"
      />

      <ConfirmationDialog
        isOpen={Boolean(walletPendingDelete)}
        onClose={() => setWalletPendingDelete(null)}
        onConfirm={() => {
          if (walletPendingDelete) {
            deleteWallet(walletPendingDelete);
          }
          setWalletPendingDelete(null);
        }}
        title="Delete Wallet"
        message="Are you sure you want to delete this wallet? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
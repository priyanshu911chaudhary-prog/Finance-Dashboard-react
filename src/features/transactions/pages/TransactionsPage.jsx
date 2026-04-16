import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { transactionApi } from '../../../services/api/transactions';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionFilters } from '../components/TransactionFilters';
import { Modal } from '../../../shared/components/ui/Modal';
import { ConfirmationDialog } from '../../../shared/components/ui/ConfirmationDialog';
import { TransactionForm } from '../components/TransactionForm';

export function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionPendingDelete, setTransactionPendingDelete] = useState(null);
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // 1. Fetching Data
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getTransactions,
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: transactionApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: transactionApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // 3. Derived Filtered State (Performance Strategy)
  // We compute the filtered list purely on the client side without refetching.
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    const typeFilter = searchParams.get('type');
    const categoryFilter = searchParams.get('category');

    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    return transactions.filter(tx => {
      const matchesType = typeFilter ? tx.type === typeFilter : true;
      const matchesCategory = categoryFilter ? tx.category === categoryFilter : true;

      const matchesSearch=searchQuery
        ? tx.description.toLowerCase().includes(searchQuery)
        : true;

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [transactions, searchParams]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="text-muted mt-1">Manage and track your income and expenses.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1 sm:gap-2 bg-accent text-background px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          Add Transaction
        </button>
      </div>

      {/* New Filter Component */}
      <TransactionFilters />

      <TransactionTable 
        transactions={filteredTransactions} 
        isLoading={isLoading} 
        onDelete={(id) => setTransactionPendingDelete(id)}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !createMutation.isPending && setIsModalOpen(false)}
        title="New Transaction"
      >
        <TransactionForm 
          onSubmit={(data) => createMutation.mutate({
            ...data,
            recurrence: data.type === 'transfer' ? 'none' : data.recurrence,
            category: data.type === 'transfer' ? 'Transfer' : data.category,
          })} 
          isPending={createMutation.isPending} 
        />
      </Modal>

      <ConfirmationDialog
        isOpen={Boolean(transactionPendingDelete)}
        onClose={() => setTransactionPendingDelete(null)}
        onConfirm={() => {
          if (transactionPendingDelete) {
            deleteMutation.mutate(transactionPendingDelete);
          }
          setTransactionPendingDelete(null);
        }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        confirmLabel="Delete"
      />
    </div>
  );
}
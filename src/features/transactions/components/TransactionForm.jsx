import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '../schemas/transactionSchema';
import { TRANSACTION_CATEGORIES } from '../constants';
import { useWalletStore } from '../../../store/useWalletStore';

export function TransactionForm({ onSubmit, isPending }) {
  const wallets = useWalletStore(state => state.wallets);
  
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      recurrence: 'none',
      date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
    }
  });

  const selectedType = useWatch({ control, name: 'type' });
  const selectedWalletId = useWatch({ control, name: 'walletId' });
  const selectedCategory = useWatch({ control, name: 'category' });
  const destinationWallets = wallets.filter((wallet) => wallet.id !== selectedWalletId);

  useEffect(() => {
    if (selectedType === 'transfer') {
      setValue('category', 'Transfer', { shouldValidate: true });
      setValue('recurrence', 'none', { shouldValidate: true });
    } else if (selectedCategory === 'Transfer') {
      setValue('category', '', { shouldValidate: true });
    }
  }, [selectedType, selectedCategory, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type Toggle */}
      <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl">
        <label className="cursor-pointer">
          <input type="radio" value="expense" {...register('type')} className="peer sr-only" />
          <div className="text-center py-2 rounded-lg text-sm font-medium text-muted peer-checked:bg-white/10 peer-checked:text-white transition-all">
            Expense
          </div>
        </label>
        <label className="cursor-pointer">
          <input type="radio" value="income" {...register('type')} className="peer sr-only" />
          <div className="text-center py-2 rounded-lg text-sm font-medium text-muted peer-checked:bg-accent/20 peer-checked:text-accent transition-all">
            Income
          </div>
        </label>
        <label className="cursor-pointer">
          <input type="radio" value="transfer" {...register('type')} className="peer sr-only" />
          <div className="text-center py-2 rounded-lg text-sm font-medium text-muted peer-checked:bg-blue-500/20 peer-checked:text-blue-300 transition-all">
            Transfer
          </div>
        </label>
      </div>

      {/* Description & Amount */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">Description</label>
          <input 
            {...register('description')} 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
            placeholder="e.g., Groceries"
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">Amount</label>
          <input 
            type="number"
            step="0.01"
            min="0.01"
            {...register('amount', { valueAsNumber: true })} 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
            placeholder="0.00"
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
      </div>

      {/* Category & Wallet */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">Category</label>
          {selectedType === 'transfer' ? (
            <input
              value="Transfer"
              readOnly
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-muted focus:outline-none"
            />
          ) : (
            <select
              {...register('category')}
              className="app-select"
            >
              <option value="">Select...</option>
              {TRANSACTION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">{selectedType === 'transfer' ? 'From Wallet' : 'Wallet'}</label>
          <select
            {...register('walletId')}
            className="app-select"
          >
            <option value="">Select...</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId && <p className="text-xs text-destructive">{errors.walletId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {selectedType === 'transfer' ? (
          <div className="space-y-1">
            <label className="text-xs text-muted font-medium">To Wallet</label>
            <select
              {...register('transferWalletId')}
              className="app-select"
            >
              <option value="">Select...</option>
              {destinationWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            {errors.transferWalletId && <p className="text-xs text-destructive">{errors.transferWalletId.message}</p>}
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs text-muted font-medium">Recurrence</label>
            <select
              {...register('recurrence')}
              className="app-select"
            >
              <option value="none">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">Date</label>
          <input 
            type="date"
            {...register('date')} 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors custom-calendar-icon"
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-white text-background hover:bg-white/90 font-bold py-3 rounded-xl mt-6 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save Transaction'}
      </button>
    </form>
  );
}
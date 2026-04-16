import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomSelect } from '../../../shared/components/ui/CustomSelect';

const walletSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(30, 'Name is too long'),
  type: z.enum(['bank', 'cash', 'credit'], { required_error: 'Please select a wallet type' }),
  openingBalance: z.number({ invalid_type_error: 'Opening balance must be a number' }).finite('Opening balance must be valid'),
});

export function WalletForm({ onSubmit }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(walletSchema),
    defaultValues: { type: 'bank', openingBalance: 0 }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Wallet Name</label>
        <input 
          {...register('name')} 
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
          placeholder="e.g., Chase Sapphire"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Account Type</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <CustomSelect
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'bank', label: 'Bank Account' },
                { value: 'credit', label: 'Credit Card' },
                { value: 'cash', label: 'Cash / Digital' },
              ]}
            />
          )}
        />
        {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Opening Balance</label>
        <input
          type="number"
          step="0.01"
          {...register('openingBalance', { valueAsNumber: true })}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
          placeholder="0.00"
        />
        <p className="text-xs text-muted">Use a negative opening balance for outstanding credit card debt.</p>
        {errors.openingBalance && <p className="text-xs text-destructive">{errors.openingBalance.message}</p>}
      </div>

      <button 
        type="submit" 
        className="w-full bg-white text-background hover:bg-white/90 font-bold py-3 rounded-xl mt-6 transition-colors"
      >
        Add Wallet
      </button>
    </form>
  );
}
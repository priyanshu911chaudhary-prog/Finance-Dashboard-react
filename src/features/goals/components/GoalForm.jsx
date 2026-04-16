import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomSelect } from '../../../shared/components/ui/CustomSelect';

const goalSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  target: z.number({ invalid_type_error: 'Target must be a number' }).positive('Target must be greater than 0'),
  current: z.number({ invalid_type_error: 'Current amount must be a number' }).min(0, 'Cannot be negative'),
  icon: z.enum(['ShieldAlert', 'Plane', 'Laptop', 'Home', 'Car'], { required_error: 'Please select an icon' }),
});

export function GoalForm({ onSubmit }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: { current: 0, icon: 'Home' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Goal Name</label>
        <input 
          {...register('name')} 
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
          placeholder="e.g., House Downpayment"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">Target Amount</label>
          <input 
            type="number" step="0.01" {...register('target', { valueAsNumber: true })} 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="0.00"
          />
          {errors.target && <p className="text-xs text-destructive">{errors.target.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted font-medium">Initial Deposit</label>
          <input 
            type="number" step="0.01" {...register('current', { valueAsNumber: true })} 
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="0.00"
          />
          {errors.current && <p className="text-xs text-destructive">{errors.current.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Icon Category</label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <CustomSelect
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'Home', label: 'Home' },
                { value: 'Car', label: 'Car' },
                { value: 'Plane', label: 'Travel' },
                { value: 'Laptop', label: 'Technology' },
                { value: 'ShieldAlert', label: 'Emergency / Savings' },
              ]}
            />
          )}
        />
        {errors.icon && <p className="text-xs text-destructive">{errors.icon.message}</p>}
      </div>

      <button type="submit" className="w-full bg-white text-background hover:bg-white/90 font-bold py-3 rounded-xl mt-6 transition-colors">
        Create Goal
      </button>
    </form>
  );
}
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TRANSACTION_CATEGORIES } from '../../transactions/constants';

// PRO TIP: Filter out Income/Transfer so users can't budget for them
const BUDGET_CATEGORIES = TRANSACTION_CATEGORIES.filter(
  (cat) => !['Salary', 'Income', 'Transfer'].includes(cat)
);

// We tell Zod to ONLY accept the filtered expense categories
const budgetSchema = z.object({
  category: z.enum(BUDGET_CATEGORIES, { required_error: 'Please select a category' }),
  limit: z.number({ invalid_type_error: 'Limit must be a number' }).positive('Limit must be greater than 0'),
});

export function BudgetForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: BUDGET_CATEGORIES[0] // Automatically defaults to 'Food & Dining'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Budget Category</label>
        <select
          {...register('category')}
          className="app-select"
        >
          {BUDGET_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted font-medium">Monthly Limit (₹)</label>
        <input 
          type="number"
          step="0.01"
          {...register('limit', { valueAsNumber: true })} 
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
          placeholder="0.00"
        />
        {errors.limit && <p className="text-xs text-destructive">{errors.limit.message}</p>}
      </div>

      <button 
        type="submit" 
        className="w-full bg-white text-background hover:bg-white/90 font-bold py-3 rounded-xl mt-6 transition-colors"
      >
        Create Budget
      </button>
    </form>
  );
}
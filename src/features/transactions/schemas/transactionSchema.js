import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters').max(50, 'Description is too long'),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense', 'transfer'], { required_error: 'Please select a type' }),
  category: z.string().min(1, 'Category is required'),
  walletId: z.string().min(1, 'Please select a wallet'),
  transferWalletId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  recurrence: z.enum(['none', 'weekly', 'monthly', 'yearly']).optional().default('none'),
}).superRefine((data, ctx) => {
  if (data.type === 'transfer') {
    if (!data.transferWalletId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a destination wallet',
        path: ['transferWalletId'],
      });
    }

    if (data.transferWalletId && data.transferWalletId === data.walletId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transfer destination must be different from the source wallet',
        path: ['transferWalletId'],
      });
    }
  }
});
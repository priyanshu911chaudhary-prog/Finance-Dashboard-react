import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');
const dateTimeSchema = z.string().datetime({ offset: true });

const userSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
});

const walletSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100),
  type: z.enum(['bank', 'cash', 'credit']),
  openingBalance: z.number().finite().optional().default(0),
});

const budgetSchema = z.object({
  id: z.string().trim().min(1),
  category: z.string().trim().min(1).max(100),
  limit: z.number().finite().positive(),
  spent: z.number().finite().nonnegative().optional().default(0),
});

const goalSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100),
  target: z.number().finite().positive(),
  current: z.number().finite().nonnegative(),
  icon: z.string().trim().min(1),
});

const transactionSchema = z.object({
  id: z.string().trim().min(1),
  date: dateSchema,
  createdAt: dateTimeSchema.optional(),
  description: z.string().trim().min(1).max(200),
  amount: z.number().finite().refine((amount) => amount !== 0, 'Amount cannot be zero'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().trim().min(1).max(100),
  walletId: z.string().trim().min(1),
  transferWalletId: z.string().trim().min(1).optional(),
  transferPairId: z.string().trim().min(1).optional(),
  recurrence: z.enum(['none', 'weekly', 'monthly', 'yearly']).optional().default('none'),
}).superRefine((tx, ctx) => {
  if (tx.type === 'income' && tx.amount < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Income transactions must have a positive amount',
      path: ['amount'],
    });
  }

  if (tx.type === 'expense' && tx.amount > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Expense transactions must have a negative amount',
      path: ['amount'],
    });
  }

  if (tx.type === 'transfer') {
    if (!tx.transferWalletId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transfer transactions must include a destination wallet',
        path: ['transferWalletId'],
      });
    }

    if (!tx.transferPairId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transfer transactions must include a transfer pair ID',
        path: ['transferPairId'],
      });
    }

    if (tx.transferWalletId && tx.transferWalletId === tx.walletId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Transfer destination must be different from the source wallet',
        path: ['transferWalletId'],
      });
    }
  }
});

const backupSchema = z.object({
  version: z.string().optional(),
  timestamp: z.string().optional(),
  user: userSchema.optional().default({ name: 'Guest User', email: 'guest@findash.local' }),
  wallets: z.array(walletSchema),
  budgets: z.array(budgetSchema),
  goals: z.array(goalSchema).optional().default([]),
  transactions: z.array(transactionSchema),
});

const ensureUniqueIds = (items, label) => {
  const ids = items.map((item) => item.id);
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    throw new Error(`Duplicate ${label} IDs detected in backup`);
  }
};

export function validateBackupData(rawData) {
  const parsed = backupSchema.parse(rawData);

  ensureUniqueIds(parsed.wallets, 'wallet');
  ensureUniqueIds(parsed.budgets, 'budget');
  ensureUniqueIds(parsed.goals, 'goal');
  ensureUniqueIds(parsed.transactions, 'transaction');

  const walletIds = new Set(parsed.wallets.map((wallet) => wallet.id));
  const invalidTransaction = parsed.transactions.find((tx) => !walletIds.has(tx.walletId));

  if (invalidTransaction) {
    throw new Error(`Transaction "${invalidTransaction.description}" references an unknown wallet`);
  }

  const invalidTransferWallet = parsed.transactions.find(
    (tx) => tx.type === 'transfer' && tx.transferWalletId && !walletIds.has(tx.transferWalletId)
  );

  if (invalidTransferWallet) {
    throw new Error(`Transfer "${invalidTransferWallet.description}" references an unknown destination wallet`);
  }

  return parsed;
}

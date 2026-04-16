import { describe, expect, it } from 'vitest';
import { validateBackupData } from '../backupValidation';

describe('backup validation', () => {
  it('accepts a structurally valid backup', () => {
    const backup = {
      user: { name: 'Priya', email: 'priya@example.com' },
      wallets: [{ id: 'w1', name: 'Main Account', type: 'bank', openingBalance: 5000 }],
      budgets: [{ id: 'b1', category: 'Food & Dining', limit: 1000, spent: 0 }],
      goals: [{ id: 'g1', name: 'Emergency Fund', target: 5000, current: 1000, icon: 'ShieldAlert' }],
      transactions: [
        {
          id: 't1',
          date: '2026-04-16',
          description: 'Salary',
          amount: 1000,
          type: 'income',
          category: 'Salary',
          walletId: 'w1',
          recurrence: 'monthly',
        },
      ],
    };

    expect(validateBackupData(backup)).toMatchObject(backup);
  });

  it('rejects transactions that reference unknown wallets', () => {
    const backup = {
      wallets: [{ id: 'w1', name: 'Main Account', type: 'bank', openingBalance: 0 }],
      budgets: [],
      goals: [],
      transactions: [
        {
          id: 't1',
          date: '2026-04-16',
          description: 'Groceries',
          amount: -50,
          type: 'expense',
          category: 'Food & Dining',
          walletId: 'missing-wallet',
          recurrence: 'none',
        },
      ],
    };

    expect(() => validateBackupData(backup)).toThrow(/unknown wallet/i);
  });

  it('rejects sign and type mismatches', () => {
    const backup = {
      wallets: [{ id: 'w1', name: 'Main Account', type: 'bank', openingBalance: 0 }],
      budgets: [],
      goals: [],
      transactions: [
        {
          id: 't1',
          date: '2026-04-16',
          description: 'Broken Expense',
          amount: 50,
          type: 'expense',
          category: 'Food & Dining',
          walletId: 'w1',
          recurrence: 'none',
        },
      ],
    };

    expect(() => validateBackupData(backup)).toThrow(/negative amount/i);
  });

  it('accepts balanced transfer records with destination wallets', () => {
    const backup = {
      wallets: [
        { id: 'w1', name: 'Main Account', type: 'bank', openingBalance: 0 },
        { id: 'w2', name: 'Emergency Wallet', type: 'cash', openingBalance: 0 },
      ],
      budgets: [],
      goals: [],
      transactions: [
        {
          id: 't1',
          date: '2026-04-16',
          description: 'Move to savings',
          amount: -250,
          type: 'transfer',
          category: 'Transfer',
          walletId: 'w1',
          transferWalletId: 'w2',
          transferPairId: 'pair-1',
          recurrence: 'none',
        },
        {
          id: 't2',
          date: '2026-04-16',
          description: 'Move to savings',
          amount: 250,
          type: 'transfer',
          category: 'Transfer',
          walletId: 'w2',
          transferWalletId: 'w1',
          transferPairId: 'pair-1',
          recurrence: 'none',
        },
      ],
    };

    expect(validateBackupData(backup)).toMatchObject(backup);
  });
});

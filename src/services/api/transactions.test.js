import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { transactionApi } from './transactions';

describe('transactionApi ordering', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T10:00:00.000Z'));
  });

  it('sorts same-day transactions by createdAt descending', async () => {
    const replacePromise = transactionApi.replaceTransactions([
      {
        id: 'older',
        date: '2026-04-16',
        createdAt: '2026-04-16T08:00:00.000Z',
        description: 'Earlier same-day expense',
        amount: -100,
        type: 'expense',
        category: 'Food & Dining',
        walletId: 'w1',
        recurrence: 'none',
      },
      {
        id: 'newer',
        date: '2026-04-16',
        createdAt: '2026-04-16T09:00:00.000Z',
        description: 'Later same-day expense',
        amount: -50,
        type: 'expense',
        category: 'Food & Dining',
        walletId: 'w1',
        recurrence: 'none',
      },
    ]);
    await vi.advanceTimersByTimeAsync(200);
    await replacePromise;

    const getPromise = transactionApi.getTransactions();
    await vi.advanceTimersByTimeAsync(400);
    const transactions = await getPromise;

    expect(transactions.map((tx) => tx.id)).toEqual(['newer', 'older']);
  });

  it('backfills createdAt for legacy imported transactions', async () => {
    const replacePromise = transactionApi.replaceTransactions([
      {
        id: 'legacy',
        date: '2026-04-15',
        description: 'Legacy income',
        amount: 1000,
        type: 'income',
        category: 'Salary',
        walletId: 'w1',
        recurrence: 'none',
      },
    ]);
    await vi.advanceTimersByTimeAsync(200);
    const transactions = await replacePromise;

    expect(transactions[0].createdAt).toBe('2026-04-15T00:00:00.000Z');
  });
});

afterEach(() => {
  vi.useRealTimers();
});

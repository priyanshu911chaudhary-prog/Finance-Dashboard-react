import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateUpcomingBills } from '../recurringEngine';

describe('Recurring Transactions Engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-16T00:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return an empty array if no transactions are provided', () => {
    const result = calculateUpcomingBills([]);
    expect(result).toEqual([]);
  });

  it('should identify monthly recurring expenses and project the next date', () => {
    const mockTransactions = [
      { id: '1', date: '2026-04-01', description: 'Netflix', amount: -1599, type: 'expense', recurrence: 'monthly' },
      { id: '2', date: '2026-04-05', description: 'Coffee', amount: -500, type: 'expense' }, // Not recurring
    ];

    const result = calculateUpcomingBills(mockTransactions);
    
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Netflix');
    expect(result[0].amount).toBe(1599);
    
    // If paid on April 1st, next due date is May 1st
    expect(result[0].dueDate).toBe('2026-05-01'); 
  });

  it('should only use the most recent payment to project the next date', () => {
    const mockTransactions = [
      { id: '1', date: '2026-03-01', description: 'Rent', amount: -100000, type: 'expense', recurrence: 'monthly' },
      { id: '2', date: '2026-04-01', description: 'Rent', amount: -100000, type: 'expense', recurrence: 'monthly' },
    ];

    const result = calculateUpcomingBills(mockTransactions);
    
    expect(result).toHaveLength(1);
    // Projection should be based on the April payment, making the next due date May 1st
    expect(result[0].dueDate).toBe('2026-05-01');
  });

  it('should clamp month-end recurrences and roll them forward to the next future due date', () => {
    const mockTransactions = [
      { id: '1', date: '2026-01-31', description: 'Rent', amount: -100000, type: 'expense', recurrence: 'monthly' },
    ];

    const result = calculateUpcomingBills(mockTransactions);

    expect(result[0].dueDate).toBe('2026-04-28');
  });

  it('should keep recurring items with the same description separate across wallets', () => {
    const mockTransactions = [
      { id: '1', date: '2026-04-01', description: 'Netflix', amount: -49900, type: 'expense', walletId: 'w1', category: 'Subscriptions', recurrence: 'monthly' },
      { id: '2', date: '2026-04-03', description: 'Netflix', amount: -64900, type: 'expense', walletId: 'w2', category: 'Subscriptions', recurrence: 'monthly' },
    ];

    const result = calculateUpcomingBills(mockTransactions);

    expect(result).toHaveLength(2);
    expect(result.map((bill) => bill.amount).sort((a, b) => a - b)).toEqual([49900, 64900]);
  });
});
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBudgetStore = create(
  persist(
    (set) => ({
      budgets: [], // Set to completely empty
      
      updateBudgetLimit: (id, newLimit) => 
        set((state) => ({
          budgets: state.budgets.map((budget) => 
            budget.id === id
              ? {
                  ...budget,
                  limit: Number(newLimit) || 0,
                }
              : budget
          ),
        })),

      addBudget: (budgetData) => set((state) => ({
        budgets: [...state.budgets, {
          ...budgetData,
          limit: Number(budgetData.limit) || 0,
          id: Math.random().toString(36).substr(2, 9),
          spent: 0, 
        }]
      })),

      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter(b => b.id !== id)
      })),
    }),
    { name: 'findash-budgets' }
  )
);
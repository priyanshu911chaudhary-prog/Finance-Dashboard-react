import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGoalStore = create(
  persist(
    (set) => ({
      goals: [], // Set to completely empty
      
      addGoal: (goalData) => set((state) => ({
        goals: [...state.goals, {
          ...goalData,
          target: Number(goalData.target) || 0,
          current: Number(goalData.current) || 0,
          id: Math.random().toString(36).substr(2, 9),
        }]
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      contributeToGoal: (id, amount) => set((state) => ({
        goals: state.goals.map(goal => 
          goal.id === id
            ? {
                ...goal,
                current: Math.min(
                  (Number(goal.current) || 0) + (Number(amount) || 0),
                  Number(goal.target) || 0
                ),
              }
            : goal
        )
      })),
    }),
    { name: 'findash-goals' }
  )
);
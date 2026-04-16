import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 100% User-driven profile state
export const useUserStore = create(
  persist(
    (set) => ({
      // Default fallback state for a new user
      user: {
        name: 'Guest User',
        email: 'guest@findash.local',
      },
      
      updateUser: (name, email) => set(() => ({
        user: { name, email }
      })),
    }),
    { name: 'findash-user' }
  )
);
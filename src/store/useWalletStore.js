import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWalletStore = create(
  persist(
    (set) => ({
      wallets: [], // Set to completely empty
      
      addWallet: (walletData) => set((state) => ({
        wallets: [...state.wallets, {
          ...walletData,
          openingBalance: Number(walletData.openingBalance) || 0,
          id: Math.random().toString(36).substr(2, 9)
        }]
      })),

      deleteWallet: (id) => set((state) => ({
        wallets: state.wallets.filter(w => w.id !== id)
      })),
    }),
    { name: 'findash-wallets' }
  )
);
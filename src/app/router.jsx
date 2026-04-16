import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../shared/components/layout/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import('../features/dashboard/pages/DashboardPage');
          return { Component: module.DashboardPage };
        },
      },
      {
        path: 'transactions',
        lazy: async () => {
          const module = await import('../features/transactions/pages/TransactionsPage');
          return { Component: module.TransactionsPage };
        },
      },
      {
        path: 'budget',
        lazy: async () => {
          const module = await import('../features/budget/pages/BudgetPage');
          return { Component: module.BudgetPage };
        },
      },
      {
        path: 'goals',
        lazy: async () => {
          const module = await import('../features/goals/pages/GoalsPage');
          return { Component: module.GoalsPage };
        },
      },
      {
        path: 'wallets',
        lazy: async () => {
          const module = await import('../features/wallets/pages/WalletsPage');
          return { Component: module.WalletsPage };
        },
      },
      {
        path: 'settings',
        lazy: async () => {
          const module = await import('../features/settings/pages/SettingsPage');
          return { Component: module.SettingsPage };
        },
      },
    ],
  },
]);
import seedData from '../../data.json';

const STORAGE_KEYS = {
  wallets: 'findash-wallets',
  budgets: 'findash-budgets',
  goals: 'findash-goals',
  user: 'findash-user',
  transactions: 'findash-transactions',
};

const DEFAULT_USER = { name: 'Guest User', email: 'guest@findash.local' };

const setPersistedStore = (key, state) => {
  if (localStorage.getItem(key) !== null) return;
  localStorage.setItem(
    key,
    JSON.stringify({
      state,
      version: 0,
    })
  );
};

const writePersistedStore = (key, state) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      state,
      version: 0,
    })
  );
};

const setTransactions = (transactions) => {
  if (localStorage.getItem(STORAGE_KEYS.transactions) !== null) return;

  const normalized = Array.isArray(transactions)
    ? transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount) || 0,
        recurrence: tx.recurrence || 'none',
      }))
    : [];

  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(normalized));
};

const writeTransactions = (transactions) => {
  const normalized = Array.isArray(transactions)
    ? transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount) || 0,
        recurrence: tx.recurrence || 'none',
      }))
    : [];

  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(normalized));
};

export const bootstrapAppData = () => {
  setPersistedStore(STORAGE_KEYS.wallets, {
    wallets: Array.isArray(seedData.wallets) ? seedData.wallets : [],
  });

  setPersistedStore(STORAGE_KEYS.budgets, {
    budgets: Array.isArray(seedData.budgets) ? seedData.budgets : [],
  });

  setPersistedStore(STORAGE_KEYS.goals, {
    goals: Array.isArray(seedData.goals) ? seedData.goals : [],
  });

  setPersistedStore(STORAGE_KEYS.user, {
    user: seedData.user || DEFAULT_USER,
  });

  setTransactions(seedData.transactions);
};

export const resetAppData = () => {
  writePersistedStore(STORAGE_KEYS.wallets, { wallets: [] });
  writePersistedStore(STORAGE_KEYS.budgets, { budgets: [] });
  writePersistedStore(STORAGE_KEYS.goals, { goals: [] });
  writePersistedStore(STORAGE_KEYS.user, { user: DEFAULT_USER });
  writeTransactions([]);
};

export const clearSeededAppData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};
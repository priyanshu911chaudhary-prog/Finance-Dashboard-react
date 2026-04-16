const STORAGE_KEY = 'findash-transactions';
const TRANSFER_CATEGORY = 'Transfer';
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const buildFallbackCreatedAt = (tx) => `${tx.date}T00:00:00.000Z`;

const parseStoredTransactions = (saved) => {
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isValidTransaction = (tx) => {
  if (!tx || typeof tx !== 'object') return false;
  if (typeof tx.id !== 'string' || !tx.id.trim()) return false;
  if (typeof tx.description !== 'string' || !tx.description.trim()) return false;
  if (typeof tx.category !== 'string' || !tx.category.trim()) return false;
  if (typeof tx.walletId !== 'string' || !tx.walletId.trim()) return false;
  if (!['income', 'expense', 'transfer'].includes(tx.type)) return false;
  if (typeof tx.amount !== 'number' || !Number.isFinite(tx.amount) || tx.amount === 0) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) return false;
  if (typeof tx.createdAt !== 'string' || !ISO_DATETIME_REGEX.test(tx.createdAt)) return false;
  if (tx.type === 'income' && tx.amount < 0) return false;
  if (tx.type === 'expense' && tx.amount > 0) return false;
  if (tx.type === 'transfer') {
    if (typeof tx.transferWalletId !== 'string' || !tx.transferWalletId.trim()) return false;
    if (tx.transferWalletId === tx.walletId) return false;
    if (typeof tx.transferPairId !== 'string' || !tx.transferPairId.trim()) return false;
    if (tx.category !== TRANSFER_CATEGORY) return false;
  }
  return true;
};

const normalizeTransaction = (tx) => ({
  ...tx,
  amount: Number(tx.amount) || 0,
  createdAt: typeof tx.createdAt === 'string' && ISO_DATETIME_REGEX.test(tx.createdAt)
    ? tx.createdAt
    : buildFallbackCreatedAt(tx),
  recurrence: tx.recurrence || 'none',
});

const sortTransactions = (transactions) =>
  [...transactions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    const createdAtCompare = b.createdAt.localeCompare(a.createdAt);
    if (createdAtCompare !== 0) return createdAtCompare;
    return b.id.localeCompare(a.id);
  });

const loadTransactions = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = parseStoredTransactions(saved)
      .map(normalizeTransaction)
      .filter(isValidTransaction);
    const sortedTransactions = sortTransactions(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedTransactions));
    return sortedTransactions;
  }

  const initialData = []; // True Zero State
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// FIX: Renamed from MOCK_TRANSACTIONS to reflect its real role
let TRANSACTIONS_DB = loadTransactions();

const persistData = (data) => {
  TRANSACTIONS_DB = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const transactionApi = {
  getTransactions: async () => {
    await delay(400); 
    return sortTransactions(TRANSACTIONS_DB);
  },
  
  createTransaction: async (data) => {
    await delay(600); 

    if (data.type === 'transfer') {
      const transferCreatedAt = new Date().toISOString();
      const transferPairId = Math.random().toString(36).substr(2, 9);
      const outgoingId = Math.random().toString(36).substr(2, 9);
      const incomingId = Math.random().toString(36).substr(2, 9);
      const amount = Math.abs(Number(data.amount) || 0);
      const baseTransferData = {
        description: data.description,
        type: 'transfer',
        category: TRANSFER_CATEGORY,
        date: data.date,
        recurrence: 'none',
        transferPairId,
        createdAt: transferCreatedAt,
      };
      const newTransactions = [
        {
          ...baseTransferData,
          id: outgoingId,
          walletId: data.walletId,
          transferWalletId: data.transferWalletId,
          amount: -amount,
        },
        {
          ...baseTransferData,
          id: incomingId,
          walletId: data.transferWalletId,
          transferWalletId: data.walletId,
          amount,
        },
      ];

      persistData(sortTransactions([...newTransactions, ...TRANSACTIONS_DB]));
      return newTransactions;
    }

    const rawAmount = Math.abs(Number(data.amount) || 0);
    const newTx = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      amount: data.type === 'expense' ? -rawAmount : rawAmount,
    };
    
    persistData(sortTransactions([newTx, ...TRANSACTIONS_DB]));
    return newTx;
  },

  replaceTransactions: async (transactions) => {
    await delay(200);
    const sanitizedTransactions = transactions
      .map(normalizeTransaction)
      .filter(isValidTransaction);
    persistData(sortTransactions(sanitizedTransactions));
    return [...TRANSACTIONS_DB];
  },

  deleteTransaction: async (id) => {
    await delay(400);
    const transactionToDelete = TRANSACTIONS_DB.find((tx) => tx.id === id);

    if (transactionToDelete?.type === 'transfer' && transactionToDelete.transferPairId) {
      persistData(TRANSACTIONS_DB.filter((tx) => tx.transferPairId !== transactionToDelete.transferPairId));
      return id;
    }

    persistData(TRANSACTIONS_DB.filter(tx => tx.id !== id));
    return id;
  }
};
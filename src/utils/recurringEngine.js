/**
 * Analyzes recurring transaction history and projects the next future due date.
 * Uses local calendar arithmetic to avoid timezone-related date drift.
 */
const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addMonthsClamped = (date, monthsToAdd) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const targetMonthIndex = month + monthsToAdd;
  const lastDayOfTargetMonth = new Date(year, targetMonthIndex + 1, 0).getDate();
  return new Date(year, targetMonthIndex, Math.min(day, lastDayOfTargetMonth));
};

const addYearsClamped = (date, yearsToAdd) => {
  const year = date.getFullYear() + yearsToAdd;
  const month = date.getMonth();
  const day = date.getDate();
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfTargetMonth));
};

const advanceRecurringDate = (date, recurrence) => {
  if (recurrence === 'weekly') {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }

  if (recurrence === 'monthly') {
    return addMonthsClamped(date, 1);
  }

  if (recurrence === 'yearly') {
    return addYearsClamped(date, 1);
  }

  return new Date(date);
};

export function calculateUpcomingBills(transactions) {
  if (!transactions || transactions.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Define the window: Today until 30 days from now
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // 1. Filter for all recurring items (Income and Expense)
  const recurringTransactions = transactions.filter(
    (tx) => tx.recurrence && tx.recurrence !== 'none'
  );

  const latestPayments = new Map();

  recurringTransactions.forEach((tx) => {
    const recurringKey = [tx.description, tx.walletId ?? '', tx.category ?? '', tx.recurrence].join('::');
    const existing = latestPayments.get(recurringKey);

    if (!existing || tx.date > existing.date) {
      latestPayments.set(recurringKey, tx);
    }
  });

  const upcoming = [];

  latestPayments.forEach((tx) => {
    let nextDueDate = advanceRecurringDate(parseLocalDate(tx.date), tx.recurrence);

    // 2. Project forward until the date is in the future
    while (nextDueDate < today) {
      nextDueDate = advanceRecurringDate(nextDueDate, tx.recurrence);
    }

    // 3. FINAL FIX: Only include if the due date is within the next 30 days
    // This correctly hides the Jan 2027 Health Insurance bill.
    if (nextDueDate <= thirtyDaysFromNow) {
      upcoming.push({
        id: `upcoming-${tx.id}`,
        description: tx.description,
        amount: Math.abs(Number(tx.amount) || 0),
        dueDate: formatLocalDate(nextDueDate),
        category: tx.category,
        type: tx.type 
      });
    }
  });

  // Sort chronologically (soonest first)
  return upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
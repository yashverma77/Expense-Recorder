export const sampleTransactions = [
  { id: crypto.randomUUID(), title: 'Salary', amount: 4200, type: 'income', category: 'Salary', date: '2026-02-01', notes: '' },
  { id: crypto.randomUUID(), title: 'Groceries', amount: 210, type: 'expense', category: 'Food', date: '2026-02-06', notes: 'Weekly food' },
  { id: crypto.randomUUID(), title: 'Rent', amount: 1200, type: 'expense', category: 'Housing', date: '2026-02-03', notes: '' },
  { id: crypto.randomUUID(), title: 'Freelance', amount: 680, type: 'income', category: 'Freelance', date: '2026-02-14', notes: '' }
];

export const defaultCategories = ['Salary', 'Freelance', 'Food', 'Housing', 'Transport', 'Entertainment'];

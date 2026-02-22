import { sampleTransactions, defaultCategories } from '../../data/sampleData.js';

const KEYS = {
  tx: 'expensepro.transactions',
  categories: 'expensepro.categories',
  theme: 'expensepro.theme'
};

const parse = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};

export const store = {
  keys: KEYS,
  getTransactions: () => parse(KEYS.tx, sampleTransactions),
  saveTransactions: (data) => localStorage.setItem(KEYS.tx, JSON.stringify(data)),
  getCategories: () => parse(KEYS.categories, defaultCategories),
  saveCategories: (data) => localStorage.setItem(KEYS.categories, JSON.stringify(data)),
  getTheme: () => localStorage.getItem(KEYS.theme) || 'dark',
  saveTheme: (theme) => localStorage.setItem(KEYS.theme, theme)
};

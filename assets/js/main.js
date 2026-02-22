import { store } from './storage.js';
import { ChartManager } from './charts.js';
import { money, fmtDate, sanitize, debounce } from '../../utils/format.js';

const state = {
  transactions: store.getTransactions(),
  categories: store.getCategories(),
  editingId: null,
  query: '',
  range: 'all',
  fromDate: '',
  toDate: '',
  sortBy: 'newest'
};

const chartManager = new ChartManager();
const $ = (id) => document.getElementById(id);
const els = {
  cards: $('overview'), tbody: $('transaction-body'), empty: $('empty-state'), form: $('transaction-form'),
  categorySelect: $('category-select'), categoryList: $('category-list'), categoryForm: $('category-form'),
  toast: $('toast'), modal: $('confirm-modal'), confirmMessage: $('confirm-message'), confirmOk: $('confirm-ok'), confirmCancel: $('confirm-cancel')
};

const showToast = (msg) => {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 2000);
};

const openConfirm = (message, onConfirm) => {
  els.confirmMessage.textContent = message;
  els.modal.classList.remove('hidden');
  els.confirmOk.onclick = () => { onConfirm(); els.modal.classList.add('hidden'); };
  els.confirmCancel.onclick = () => els.modal.classList.add('hidden');
};

const summary = (rows) => {
  const income = rows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  return { income, expense, balance, count: rows.length };
};

const inRange = (date) => {
  const d = new Date(date);
  const now = new Date();
  if (state.range === 'day') return d.toDateString() === now.toDateString();
  if (state.range === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (state.range === 'year') return d.getFullYear() === now.getFullYear();
  if (state.range === 'custom') {
    if (!state.fromDate || !state.toDate) return true;
    return d >= new Date(state.fromDate) && d <= new Date(state.toDate);
  }
  return true;
};

const filteredRows = () => {
  const q = state.query.toLowerCase();
  return state.transactions
    .filter((t) => `${t.title} ${t.category} ${t.type}`.toLowerCase().includes(q))
    .filter((t) => inRange(t.date))
    .sort((a, b) => {
      if (state.sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (state.sortBy === 'amount-desc') return b.amount - a.amount;
      if (state.sortBy === 'amount-asc') return a.amount - b.amount;
      return new Date(b.date) - new Date(a.date);
    });
};

const renderCards = (rows) => {
  const s = summary(rows);
  els.cards.innerHTML = `
    <article class="card"><h3>Total Balance</h3><div class="amount">${money(s.balance)}</div></article>
    <article class="card"><h3>Total Income</h3><div class="amount">${money(s.income)}</div></article>
    <article class="card"><h3>Total Expense</h3><div class="amount">${money(s.expense)}</div></article>
    <article class="card"><h3>Transactions</h3><div class="amount">${s.count}</div></article>`;
};

const renderTable = (rows) => {
  els.empty.classList.toggle('hidden', rows.length > 0);
  const frag = document.createDocumentFragment();
  rows.forEach((tx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${sanitize(tx.title)}</td><td>${sanitize(tx.category)}</td><td>${tx.type}</td><td>${fmtDate(tx.date)}</td><td>${money(tx.amount)}</td>
      <td><button class="ghost" data-act="edit" data-id="${tx.id}">Edit</button><button class="danger" data-act="delete" data-id="${tx.id}">Delete</button></td>`;
    frag.appendChild(tr);
  });
  els.tbody.innerHTML = '';
  els.tbody.appendChild(frag);
};

const renderCategories = () => {
  els.categorySelect.innerHTML = state.categories.map((c) => `<option value="${sanitize(c)}">${sanitize(c)}</option>`).join('');
  els.categoryList.innerHTML = state.categories.map((c) => `<li class="category-item">${sanitize(c)} <button class="danger" data-category="${sanitize(c)}">Delete</button></li>`).join('');
};

const persistAndRender = () => {
  store.saveTransactions(state.transactions);
  store.saveCategories(state.categories);
  const rows = filteredRows();
  renderCards(rows);
  renderTable(rows);
  renderCategories();
  chartManager.render(rows);
};

const validatePayload = (payload) => {
  if (!payload.title || payload.amount <= 0 || !payload.date) return 'Please complete valid required fields.';
  if (!Number.isFinite(payload.amount)) return 'Amount must be numeric.';
  return '';
};

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const payload = {
    id: state.editingId || crypto.randomUUID(),
    title: sanitize(data.get('title')),
    amount: Number(data.get('amount')),
    type: data.get('type'),
    category: sanitize(data.get('category')),
    date: data.get('date'),
    notes: sanitize(data.get('notes'))
  };
  const error = validatePayload(payload);
  if (error) return showToast(error);
  if (state.editingId) state.transactions = state.transactions.map((t) => t.id === payload.id ? payload : t);
  else state.transactions.push(payload);
  state.editingId = null;
  e.currentTarget.reset();
  persistAndRender();
  showToast('Transaction saved.');
});

els.tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const tx = state.transactions.find((t) => t.id === id);
  if (btn.dataset.act === 'delete') {
    openConfirm('Delete this transaction?', () => {
      state.transactions = state.transactions.filter((t) => t.id !== id);
      persistAndRender();
      showToast('Transaction deleted.');
    });
  }
  if (btn.dataset.act === 'edit' && tx) {
    const fields = els.form.elements;
    fields.namedItem('title').value = tx.title;
    fields.namedItem('amount').value = tx.amount;
    fields.namedItem('type').value = tx.type;
    fields.namedItem('category').value = tx.category;
    fields.namedItem('date').value = tx.date;
    fields.namedItem('notes').value = tx.notes;
    state.editingId = tx.id;
    showToast('Editing transaction.');
  }
});

els.categoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = sanitize(new FormData(e.currentTarget).get('categoryName')).trim();
  if (!name) return;
  if (state.categories.includes(name)) return showToast('Category already exists.');
  state.categories.push(name);
  e.currentTarget.reset();
  persistAndRender();
});

els.categoryList.addEventListener('click', (e) => {
  const name = e.target.dataset.category;
  if (!name) return;
  openConfirm(`Delete category ${name}?`, () => {
    state.categories = state.categories.filter((c) => c !== name);
    persistAndRender();
  });
});

$('search').addEventListener('input', debounce((e) => { state.query = e.target.value; persistAndRender(); }));
$('range-filter').addEventListener('change', (e) => { state.range = e.target.value; persistAndRender(); });
$('from-date').addEventListener('change', (e) => { state.fromDate = e.target.value; persistAndRender(); });
$('to-date').addEventListener('change', (e) => { state.toDate = e.target.value; persistAndRender(); });
$('sort-by').addEventListener('change', (e) => { state.sortBy = e.target.value; persistAndRender(); });

$('export-csv').addEventListener('click', () => {
  const rows = [['id', 'title', 'amount', 'type', 'category', 'date', 'notes'], ...state.transactions.map((t) => [t.id, t.title, t.amount, t.type, t.category, t.date, t.notes])];
  const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'transactions.csv';
  a.click();
  showToast('CSV exported.');
});

$('import-json').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error('Invalid file');
    state.transactions = data.filter((d) => d.id && d.title && Number(d.amount) > 0);
    persistAndRender();
    showToast('Data imported.');
  } catch {
    showToast('Import failed.');
  }
});

$('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  store.saveTheme(next);
  persistAndRender();
});

$('clear-all').addEventListener('click', () => openConfirm('Clear all transactions?', () => {
  state.transactions = [];
  persistAndRender();
}));

$('mobile-nav-open').addEventListener('click', () => $('sidebar').classList.add('open'));
$('mobile-nav-close').addEventListener('click', () => $('sidebar').classList.remove('open'));

document.documentElement.dataset.theme = store.getTheme();
persistAndRender();
setTimeout(() => $('app-loader').classList.add('hidden'), 700);

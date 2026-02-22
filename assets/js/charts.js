import { money } from '../../utils/format.js';

const palette = ['#06b6d4', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#6366f1'];

export class ChartManager {
  constructor() { this.charts = {}; }

  destroyAll() { Object.values(this.charts).forEach((ch) => ch.destroy()); this.charts = {}; }

  render(transactions) {
    this.destroyAll();
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');
    const categoryTotals = expenses.reduce((acc, t) => ((acc[t.category] = (acc[t.category] || 0) + t.amount), acc), {});
    const monthly = transactions.reduce((acc, t) => {
      const key = t.date.slice(0, 7);
      acc[key] = (acc[key] || 0) + (t.type === 'income' ? t.amount : -t.amount);
      return acc;
    }, {});
    const incomeTotal = income.reduce((s, t) => s + t.amount, 0);
    const expenseTotal = expenses.reduce((s, t) => s + t.amount, 0);

    this.charts.pie = new Chart(document.getElementById('pieChart'), {
      type: 'pie', data: { labels: Object.keys(categoryTotals), datasets: [{ data: Object.values(categoryTotals), backgroundColor: palette }] }
    });

    this.charts.line = new Chart(document.getElementById('lineChart'), {
      type: 'line', data: { labels: Object.keys(monthly), datasets: [{ label: 'Monthly trend', data: Object.values(monthly), borderColor: '#06b6d4' }] }
    });

    this.charts.bar = new Chart(document.getElementById('barChart'), {
      type: 'bar', data: { labels: ['Income', 'Expense'], datasets: [{ data: [incomeTotal, expenseTotal], backgroundColor: ['#22c55e', '#ef4444'] }] }
    });

    this.charts.donut = new Chart(document.getElementById('donutChart'), {
      type: 'doughnut', data: { labels: ['Savings', 'Spent'], datasets: [{ data: [Math.max(incomeTotal - expenseTotal, 0), expenseTotal], backgroundColor: ['#6366f1', '#f97316'] }] },
      options: { plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${money(ctx.raw)}` } } } }
    });
  }
}

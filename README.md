# Expense Tracker Pro

A modern, responsive fintech-style expense dashboard built with HTML, CSS, and modular JavaScript.

## Features
- Interactive dashboard cards (balance, income, expense, count)
- Category management (add/delete)
- Search, range filter, and sort controls
- Transaction CRUD with validation and confirmation modal
- Analytics charts (pie, line, bar, donut) with Chart.js
- Dark/light theme toggle with persistence
- Export CSV and import JSON
- Toasts, loader, empty states, responsive sidebar

## Project structure

```
.
├── index.html
├── dashboard.html
├── assets
│   ├── css/main.css
│   └── js
│       ├── main.js
│       ├── storage.js
│       └── charts.js
├── data/sampleData.js
└── utils/format.js
```

## Run
Open `index.html` directly, or serve the folder using any static server (recommended).

Example:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000/` (root path).

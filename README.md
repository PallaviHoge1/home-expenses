# Home Expense Tracker

Personal expense tracker for Vignesh & Pallavi.
20 categories with cascading sub-categories, monthly audit views, trend reports.

---

## What's New in v2

Fixes from the v1 code review:

- **Timezone-correct dates** — `today()` now uses local date, not UTC (was wrong for IST users after 6:30 PM)
- **Mobile-friendly actions** — three-dot menu replaces hover-only edit/delete buttons
- **Validation feedback** — inline error messages on every form field
- **Negative-amount prevention** — typing `-` is stripped at input level
- **Consistent refund accounting** — pie chart and breakdown agree on percentages
- **Toast notifications** — success, error, and undo-on-delete (5-second window)
- **Resilient API layer** — returns `{ok, data, error}`, falls back to local on failure
- **Tab persistence** — last-viewed tab restored on reload
- **"Today" jump button** — tap the month label to jump to current month
- **Correct FAB centering** — uses `max-w-lg` math properly on tablets
- **Type-safe IDs in Sheets** — backend casts all IDs to strings (was breaking edit/delete for numeric-looking IDs)
- **Sheet UX polish** — Escape key closes, body scroll locks, slide-up animation
- **Import validation** — checks structure before replacing data

---

## Architecture

```
Your Phone / Browser
        ↓
  Netlify (free hosting)
        ↓
  Google Apps Script (free API)
        ↓
  Google Sheet (your data)
```

Total monthly cost: ₹0

---

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`. Works immediately with localStorage.

---

## Full Setup with Google Sheets Backend

### Step 1: Create the Sheet
1. Go to [Google Sheets](https://sheets.google.com) → blank sheet
2. Rename it to "Home Expenses"

### Step 2: Add the Apps Script
1. Extensions → Apps Script
2. Paste everything from `backend/Code.gs`
3. Save (💾)
4. Deploy → New Deployment
5. Type: **Web app**, Execute as: **Me**, Access: **Anyone**
6. Copy the deployment URL

### Step 3: Connect the Frontend
Create `frontend/.env`:
```
VITE_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
```
Restart `npm run dev`.

### Step 4: Deploy to Netlify
```bash
cd frontend
npm run build
```
Drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop).

---

## Project Structure

```
home-expenses/
├── frontend/
│   ├── src/
│   │   ├── config/categories.js    ← all 20 categories, colors, subs
│   │   ├── components/
│   │   │   ├── ui/                 ← 11 reusable primitives
│   │   │   ├── CascadingCategorySelect.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   └── ExpenseRow.jsx
│   │   ├── pages/                  ← 3 main views
│   │   ├── utils/                  ← helpers, api
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   └── Code.gs                     ← Google Apps Script
└── README.md
```

---

## Features

- 20 categories with cascading sub / sub-sub selection
- Meal tags (Breakfast/Lunch/Dinner/Snacks) for Outside Food
- Refund toggle for Travel
- Notes on every entry
- Search + filter by category and person
- Monthly summary with pie chart and person split
- 6-month trends — category, person, total
- Export/Import JSON
- Undo on delete (5-second window)
- Optimistic UI with local fallback
- Mobile-first responsive layout

---

## Adding or Editing Categories

Everything lives in `frontend/src/config/categories.js`.

```js
// Flat (no sub-categories):
"Flat Category": { color: "#hex", subs: null }

// One level (sub only):
"Simple Category": {
  color: "#hex",
  subs: { _flat: ["Sub1", "Sub2", "Others"] },
}

// Two levels (sub → sub-sub):
"Deep Category": {
  color: "#hex",
  subs: {
    "Group A": ["Item 1", "Item 2"],
    "Group B": ["Item 3", "Item 4"],
  },
}

// Optional flags:
hasMealTag: true   // shows Breakfast/Lunch/Dinner/Snacks
hasRefund: true    // shows refund checkbox
```

The form auto-adapts. No other file needs changes.

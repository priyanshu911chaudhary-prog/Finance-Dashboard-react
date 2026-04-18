# Finance Dashboard

A modern personal finance dashboard built with React, Vite, Zustand, React Query, and Recharts.

The app helps you manage wallets, transactions, budgets, and savings goals, while providing clear visual analytics and local-first backup/restore tooling.

## Highlights

- Dashboard with key metrics:
	- Total Balance
	- Total Income
	- Total Expenses
	- Savings Goal Progress
- Advanced charts and analytics:
	- Cash Flow Overview (income vs expense)
	- Expenses by Category (donut)
	- Running Balance (ledger-style trend)
	- Upcoming Bills panel
- Full transaction lifecycle:
	- Create income, expense, and transfer entries
	- Transfer logic creates debit/credit pair automatically
	- Filter by type/category
	- Search from navbar
	- Delete with confirmation
- Wallet management:
	- Opening balances
	- Real-time net worth calculation
	- Safe delete guard for linked transactions
- Budget tracking:
	- Category limits
	- Health score and progress cards
- Savings goals:
	- Goal creation and progress tracking
- Settings and data controls:
	- JSON backup export
	- JSON backup restore with schema validation
	- CSV transaction export
- Responsive UI and dedicated loading states:
	- App boot loader
	- Page loader
	- Graph/chart loader

## Tech Stack

- React 19
- Vite 8
- React Router 7 (hash routing)
- Zustand (persisted local state)
- TanStack React Query
- Recharts
- Tailwind CSS 4
- Zod
- Vitest + Testing Library

## Project Structure

```text
src/
	app/
		provider.jsx            # Query client and global providers
		router.jsx              # App routes
	features/
		dashboard/              # Analytics cards/charts
		transactions/           # Transaction form, filters, table
		wallets/                # Wallet management
		budget/                 # Budget creation/progress
		goals/                  # Savings goals
		settings/               # Backup/restore + CSV export
		assistant/              # Assistant widget + mock engine
	services/
		api/transactions.js     # Local API layer and transaction rules
	shared/
		components/layout/      # Navbar, sidebar, app layout
		components/ui/          # Shared UI primitives + loaders
	store/
		useWalletStore.js
		useBudgetStore.js
		useGoalStore.js
		useUserStore.js
	utils/
		currency.js
		recurringEngine.js
		csvExport.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview built app locally |
| `npm run lint` | Run ESLint across project |
| `npm test` | Run Vitest test suite |

## Testing

The project includes unit and behavior tests for key logic:

- Transaction API behavior
- Recurrence engine
- Backup validation
- Dashboard state card rendering

Run tests:

```bash
npm test
```

## Data Persistence

This app is local-first and persists data in browser localStorage.

Main storage keys:

- findash-transactions
- findash-wallets
- findash-budgets
- findash-goals
- findash-user

Transactions are validated and normalized before persistence. Backup restore additionally validates schema and ID uniqueness to reduce data corruption risk.

## Routing and Refresh Behavior

The app currently uses hash-based routing to avoid static-host refresh 404 issues.

Example route:

- `/#/transactions`

This ensures direct reload works even without server-side rewrite rules.

## Accessibility and UX Notes

- Native select elements are used for reliability across devices.
- Chart focus ring artifacts are disabled for cleaner interaction visuals.
- Mobile filter layout is optimized to prevent control overflow.

## Deployment

This is a static frontend and can be deployed to Netlify, Vercel, GitHub Pages, or any static host.

General deployment flow:

1. `npm run build`
2. Deploy the `dist` folder

## Roadmap Ideas

- Optional cloud sync
- Multi-currency support with exchange rates
- PDF exports and richer reports
- Category-level trend forecasting
- End-to-end tests for critical flows

## License

No license file is currently included.
Add a license (for example MIT) before public/open-source distribution.

# FlowSpace Order Management System

A Vue 3 + Vite order management system built as a dark-first operations workspace for tracking orders, fulfillment progress, activity notifications, and team coordination.

This project is designed to feel like a small product demo rather than a plain CRUD app. It includes route-level loading states, persistent local data, status-driven metrics, and an India-focused sample dataset with INR pricing.

## What This App Does

FlowSpace helps a team manage order operations in one place.

You can:
- View a dashboard with live order metrics and recent orders
- Browse and filter orders by status, priority, and date
- Open an individual order to inspect customer details, progress, notes, and timeline
- Create a new order with a multi-step form
- Edit an existing order and change its status dynamically
- See activity/notification updates when orders are created or changed
- Mark notifications as read individually or all at once
- Keep data saved in the browser with `localStorage`

## Main Features

### 1. Dashboard
The dashboard shows:
- Total orders
- Pending, in-progress, completed, and cancelled counts
- Total booked value in INR
- Average completion score
- Recent orders

These values are not hardcoded in the UI. They are derived from the central order store.

### 2. Orders Listing
The orders page supports:
- Search by order id, customer, or contact
- Filter by status
- Filter by priority
- Filter by date
- Grid/list layout toggle
- Quick preview modal

### 3. Order Detail
Each order detail page shows:
- Core customer information
- Order value, due date, and priority
- Completion ring
- Timeline/progress steps
- Alerts and notes

### 4. Create and Edit Order
The form is a guided 3-step flow:
- Basics
- Scheduling
- Ownership

When a user creates or updates an order:
- The central store is updated
- Dashboard metrics update automatically
- Order listings update automatically
- Activity feed entries are generated dynamically
- Data is persisted to `localStorage`

### 5. Activity / Notification Center
The activity page groups items into:
- Updates
- Status changes
- Alerts

It also supports:
- Unread count
- Mark one item as read
- Mark all items as read
- Persisting read/unread state in `localStorage`

### 6. Shared Loading State
Every major route shows a loading state for about 2 seconds when navigating between pages.

This is implemented centrally so the loading UX is consistent across the app.

## How It Works

### Data Layer
The main data flow lives in the Pinia order store:
- `src/stores/orders.js`

Responsibilities of this store:
- Load seeded order/activity data
- Read saved data from `localStorage`
- Persist updates back to `localStorage`
- Create new orders
- Update existing orders
- Generate activity items
- Recalculate metrics and revenue
- Keep unread notification count in sync

### UI Layer
The UI state lives in:
- `src/stores/ui.js`

Responsibilities of this store:
- Dark mode toggle
- Manual preview states (`live`, `loading`, `empty`, `error`)
- Route-based loading state for page transitions

### Routing
The app routes are defined in:
- `src/router/index.js`

Available screens:
- `/` Dashboard
- `/orders` Orders listing
- `/orders/new` Create order
- `/orders/:id` Order detail
- `/orders/:id/edit` Edit order
- `/activity` Activity center

### Reusable Components
Shared UI components are in:
- `src/components/BaseBadge.vue`
- `src/components/BaseButton.vue`
- `src/components/BaseCard.vue`
- `src/components/BaseInput.vue`
- `src/components/BaseModal.vue`
- `src/components/StateDisplay.vue`

`StateDisplay.vue` is used for loading, empty, and error states across multiple screens.

## Local Persistence
This app does not require a backend.

Instead, it stores user-created and user-edited data in browser `localStorage`.

Current keys used:
- `flowspace.orders.india.v2`
- `flowspace.activities.india.v2`

This means:
- Your changes survive page refreshes
- New orders remain visible after reload
- Notification read/unread state remains saved

## India-Focused Setup
This project has been adapted for an Indian order management context.

It includes:
- INR currency formatting
- `en-IN` date formatting
- India-based sample customers and cities
- India-style phone numbers
- India-relevant order channels such as Distributor Portal, Field Sales, Hospital Desk, and WhatsApp Commerce

## Tech Stack
- Vue 3
- Vite
- Vue Router
- Pinia
- Plain CSS

## Node Version
Use **Node.js 20**.

Recommended:
- Node `20.19+`

Important:
- This project uses Vite 8
- Vite 8 requires Node `20.19+` or `22.12+`
- Node 18 will fail during build

If you use `nvm`, you can do:

```bash
nvm install 20
nvm use 20
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

## Project Structure

```text
src/
  components/     Reusable UI building blocks
  data/           Seed data and formatting helpers
  router/         Route definitions
  stores/         Pinia stores for business/UI state
  views/          Main application screens
  App.vue         Application shell
  main.js         App bootstrap
  style.css       Global styling
```

## Interview / Explanation Guide

If you need to explain this project in an interview, focus on these points:

### 1. This is more than a static UI
Explain that the app is not just a styled frontend. It includes:
- Shared state management with Pinia
- Dynamic derived metrics
- Persistent browser storage
- Route-based loading feedback
- Status-driven updates across multiple screens

### 2. Centralized business logic
Point out that order creation, editing, metrics, revenue, timeline generation, and activity generation are handled in one store instead of being duplicated inside each view.

Why this is good:
- Easier to maintain
- Easier to test
- UI stays simple
- Data remains consistent across pages

### 3. Derived UI updates automatically
A strong demo point is:
- Change an order status
- Save it
- Show that dashboard counts, order detail, order listing, and activity feed all update automatically

This demonstrates reactive state management clearly.

### 4. No backend, but realistic frontend behavior
Even without an API, the app behaves like a real product because it has:
- Local persistence
- Loading states
- Empty/error views
- Modal flows
- Editable records
- Notification management

### 5. Reusable architecture
You can explain the separation like this:
- Views render business data
- Stores manage business state
- Components provide reusable UI pieces
- Helpers handle formatting and derived utility logic

## Suggested Demo Flow

If you want to show the app quickly:

1. Open Dashboard and explain live metrics
2. Go to Orders and use filters/search
3. Open an order detail page
4. Edit the order and change its status
5. Save and show that metrics and activity update automatically
6. Create a brand new order
7. Open Activity and mark notifications as read
8. Refresh the page and show that data is still saved

## Challenges Faced

### 1. Keeping all screens in sync after an order update
One of the biggest challenges was making sure that when an order status changes, every related screen updates correctly.

For example:
- Dashboard counts should update
- Order list filters should reflect the new status
- Order detail should show the updated progress
- Activity feed should create a new status/update entry

Solution:
- Moved the main business logic into a centralized Pinia store
- Derived metrics from store state instead of hardcoding them in views
- Triggered activity generation from create/update store actions

### 2. Persisting data without a backend
The project does not use an API, but it still needed to behave like a real product.

Challenge:
- New orders, edited orders, and notification read state should remain after refresh

Solution:
- Added `localStorage` persistence in the order store
- Loaded seeded data only as fallback
- Stored orders and activities under versioned keys

### 3. Making loading states feel realistic across pages
A static loading component was not enough for a product-style demo.

Challenge:
- Every major screen should feel responsive when navigating
- Loading should be shared and consistent

Solution:
- Added a centralized route-loading flag in the UI store
- Triggered a 2-second loading state on route changes
- Improved the shared loading component so it works across all pages

### 4. Managing derived workflow data from status changes
Status updates affect more than one field.

Challenge:
- A status change should also affect completion and timeline behavior
- Existing seeded records should keep their richer timelines

Solution:
- Added status-based workflow generation in the store
- Refreshed workflow data only when needed
- Preserved richer seeded timeline data for existing records

### 5. Adapting the product for an India-focused use case
The original sample data and formatting were more generic or US-oriented.

Challenge:
- Make the app feel relevant for an Indian business context

Solution:
- Switched formatting to `en-IN` and INR
- Updated cities, phone numbers, customers, and channels
- Versioned the local storage keys so old saved sample data would not conflict with the new dataset

### 6. Keeping the code reusable instead of duplicating logic in views
It is easy in Vue apps to place too much logic directly inside page components.

Challenge:
- Avoid repeating filtering, update, formatting, and activity logic across multiple views

Solution:
- Kept business rules in stores and helpers
- Kept views focused on rendering and user interaction
- Reused shared components like `StateDisplay`, `BaseCard`, `BaseInput`, and `BaseModal`

### How to Explain These in an Interview
A simple way to explain the project is:
- The main challenge was not building pages, but keeping the entire workflow consistent across the app
- I solved that by centralizing business state in Pinia and deriving UI from that source of truth
- I also added persistence, route-based loading, and reusable shared UI so the app behaves more like a real product than a static frontend demo

## Notes
- This project currently uses browser storage instead of a backend/API
- Data is seeded on first load, then persisted locally
- The design is intentionally dark-first and product-oriented for portfolio/interview presentation

## Future Improvements
Possible next steps:
- Add a real backend API
- Add authentication and role-based access
- Add validation schemas with a library
- Add unit and component tests
- Add charts for delivery and fulfillment trends
- Add server-side persistence and sync across devices

# HostelHub - Hostel Management System

A complete hostel management solution built with React, Next.js, Tailwind CSS, Radix UI, and MySQL.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Next.js (App Router, API Routes)
- **Database:** MySQL
- **State:** Zustand, TanStack Query
- **Forms:** React Hook Form, Zod, @hookform/resolvers

## Features

- **Login** - Admin authentication (admin@hostel.com / admin123)
- **Dashboard** - Overview with metrics, revenue chart, room distribution, recent payments, complaints, residents
- **Residents** - Resident management with room allocation
- **Rooms** - Room cards with status, occupancy, rent
- **Payments** - Payment tracking and records
- **Complaints** - Complaint management (open, in-progress, resolved)
- **Food Menu** - Weekly meal schedule with today's highlight
- **Change Password** - Admin password update

## Getting Started

### Prerequisites

- Node.js >= 18.18 (Next.js 14 compatible)
- MySQL server

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from example:
   ```bash
   cp .env.example .env.local
   ```

3. Configure MySQL in `.env.local`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hostelhub
   ```

4. Initialize the database:
   ```bash
   mysql -u root -p < scripts/init-db.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Run the subscription migration (required for subscription enforcement):
   ```bash
   mysql -u root -p hostelhub < scripts/migrate-subscriptions.sql
   ```

7. Open [http://localhost:3000](http://localhost:3000)

Login with:
- **Email:** admin@hostel.com
- **Password:** admin123

## Project Structure

```
hostelhub/
├── app/
│   ├── api/           # API routes (auth, students, rooms, etc.)
│   ├── dashboard/     # Dashboard pages
│   ├── layout.tsx
│   └── page.tsx       # Login page
├── components/
│   ├── layout/        # Sidebar, Header
│   └── ui/            # Radix UI components
├── lib/
│   ├── db.ts          # MySQL connection pool
│   ├── utils.ts
│   └── auth-store.ts
└── scripts/
    └── init-db.sql    # Database schema
```

## License

MIT

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema Contable is an accounting management application built with Next.js 16, React 19, and TypeScript. The application manages financial movements (transactions) with authentication and server-side data fetching.

**Critical Convention:** All code (variables, functions, types, comments) must be written in **English**. All UI text (labels, buttons, messages) must be in **Spanish**.

## Development Commands

```bash
# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

**Note:** Development and build commands use `--turbopack` for faster compilation.

## High-Level Architecture

### Next.js 16 App Router

This project uses the App Router (not Pages Router):

- **React Server Components (RSC)** by default - mark client components with `'use client'`
- **Server Actions** for mutations (`/lib/actions.ts`)
- **Server-side data fetching** in page components
- **Middleware authentication** via `src/proxy.ts` (exports `proxy` function and matcher config)

**Middleware setup (Next.js 15+ convention):**

The middleware is defined in `src/proxy.ts` (not `middleware.ts` - Next.js now supports custom middleware file locations):

- Must export a function named `proxy` (the middleware handler)
- Must export a `config` object with `matcher` pattern
- Current matcher: `/panel/:path*` (protects all panel routes)

To use this middleware, Next.js requires it to be imported in your app. The framework automatically detects the export pattern.

### Authentication Flow

1. User logs in at `/ingresar` → POST to `/api/users/login` (proxied to backend)
2. Backend sets httpOnly session cookie
3. Middleware (`src/proxy.ts`) intercepts protected routes (`/panel/:path*`)
4. Middleware validates session via GET `/api/session` (proxied to backend)
5. If invalid → redirect to `/` (root)
6. If valid → allow access

**Protected routes:** Any path starting with `/panel`

**Client-side session:** `RouteFetchProvider` wraps the app and fetches session data on every route change, providing user context to all client components via `useSession()` hook.

### API Backend Integration

**API Proxy Architecture:** All client requests go through Next.js API routes (`/api/*`) which proxy to the backend. This keeps cookies on the same domain and hides backend URLs from the client.

- **Client code** uses `API_BASE = '/api'` from `/lib/endpoint.ts`
- **API proxy** at `/src/app/api/[...path]/route.ts` forwards requests to backend
- **Backend URL** determined by environment (server-side only):
  - Development: `BACKEND_API_DEV` (e.g., `http://localhost:4000/api/v1`)
  - Production: `BACKEND_API`

**Request flow:**

```
Client → /api/session → API proxy → http://localhost:4000/api/v1/session → Backend
```

**Key endpoints:**

- `POST /api/users/login` - Authentication (returns user and token)
- `GET /api/session` - Session validation and user data (includes accounts)
- `POST /api/users/change-password` - Change user password
- `POST /api/movements` - Create new movement
- `GET /api/movements` - Fetch all movements (admin only)
- `POST /api/movements/update` - Update existing movement
- `POST /api/movements/delete` - Delete movement
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/{userId}` - Get specific user with accounts
- `POST /api/users/create` - Create new user (admin only)
- `GET /api/movements/exchange-rate` - Get current exchange rates
- `POST /api/movements/swap` - Create currency swap transaction
- `GET /api/filter?target={userId}&from={date}&to={date}` - Get filtered movements for date range

### Data Flow Pattern

**Current architecture:** The app primarily uses client-side data fetching via `RouteFetchProvider` rather than server components for data fetching.

**Client-side data (via context):**

```typescript
'use client';
import { useSession } from '@/providers/RouteFetchProvider';

export default function Dashboard() {
  const { user, loading } = useSession();
  // user includes accounts and movements
  return <div>{user?.movements?.map(...)}</div>;
}
```

**Server Components (minimal usage):**

```typescript
// src/app/panel/page.tsx
export default async function Page() {
  return <HomeClient />; // Client component handles data via context
}
```

**Mutations (via context providers):**

```typescript
'use client';
import { useAdminContext } from '@/providers/AdminFetchProvider';

export default function NewMovementPage() {
  const { createMovement } = useAdminContext();

  const handleSubmit = async (data) => {
    await createMovement(data); // Automatically refreshes context
  };
}
```

Or direct fetch for other mutations:

```typescript
'use client';
const res = await fetch(`${API_BASE}/movements`, {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify(data),
});
router.refresh(); // Triggers RouteFetchProvider to refetch
```

## Code Organization

### `/src/app` - App Router Structure

- **`/ingresar`** - Login page (public)
- **`/panel`** - Main dashboard (protected)
  - `page.tsx` - Dashboard page
  - `/perfil` - User profile page
  - **`/admin`** - Admin section (protected, nested routes, uses `AdminFetchProvider`)
    - `page.tsx` - Admin dashboard
    - `/nuevo-movimiento` - New movement creation page
    - `/nuevo-miembro` - New member creation page
    - `/cambiar-moneda` - Currency exchange page (admin only)
  - **`/ultimos-movimientos`** - Recent movements page
- **`/api/[...path]`** - API proxy route (forwards all requests to backend)
- **`layout.tsx`** - Root layout with `RouteFetchProvider`
- **`page.tsx`** - Root page (redirects to `/ingresar` or `/panel`)

### `/src/lib` - Business Logic

Currently flat structure containing:

- **`actions.ts`** - Server actions (currently minimal, only login action)
- **`movements.ts`** - Server-side movement fetching (legacy, unused)
- **`user.ts`** - Server-side user fetching (legacy, unused)
- **`schemas.ts`** - Zod validation schemas and TypeScript types
- **`endpoint.ts`** - API base URL (exports `'/api'` for client-side proxy)
- **`global_variables.ts`** - UI option constants (payment methods, statuses, types, currencies, roles, locale settings)
- **`utils.ts`** - Currency formatting, masking, parsing, and label getter utilities
- **`date_utils.ts`** - Date formatting and validation utilities (dd/MM/yyyy format, ISO conversion)
- **`roles.ts`** - Role-related utilities and constants

**Important:** Files with server-only imports must include `import 'server-only'` at the top.

### `/src/components`

- **`/ui`** - Shadcn UI primitives (button, form, input, table, etc.)
- **`/custom`** - Business components:
  - `FormNewMovement.tsx` - Form to create movements with Spanish currency masking
  - `FormNewMember.tsx` - Form to create new users/members
  - `FormNewSwap.tsx` - Form to create currency swaps
  - `ListMovements.tsx` - Table displaying movements with edit/delete actions
  - `ListUsers.tsx` - Table displaying users
  - `CardAccount.tsx` - Account balance card with currency display
  - `CardBalance.tsx` - Balance display card
  - `ChartBar.tsx` - Bar chart component for movement visualization
  - `InputCalendar.tsx` - Date picker with dd/MM/yy input support
  - `InputCurrency.tsx` - Currency input with masking
  - `InputUser.tsx` - User selection combobox
  - `Login.tsx` - Login form component
  - `Loading.tsx` - Loading spinner component
  - `Splitter.tsx` - Visual divider
- **`/screen`** - Page-level components:
  - `Home.tsx` - Main dashboard screen

### `/src/providers`

- **`RouteFetchProvider.tsx`** - Client-side session management (wraps entire app)
  - Fetches user data on route changes via `/api/session`
  - Provides `useSession()` hook with user, movements data, and loading/error states
  - Provides `getMovements()`, `refresh()`, and `changePassword()` methods
  - Shows spinner during initial load
- **`AdminFetchProvider.tsx`** - Admin context provider (wraps `/panel/admin` routes)
  - Fetches all movements and users for admin views
  - Provides `useAdminContext()` hook with:
    - `createMember()`, `createMovement()`, `updateMovement()`, `deleteMovement()` methods
    - `getExchangeRates()`, `getUserToCurrencySwap()`, `postCurrencySwap()` methods
    - `requestMovements()` for filtered movement queries
    - `refresh()` to manually refetch all data
  - Shows spinner during initial load

### `/src/types`

- **`movement.ts`** - TypeScript types for Movement and User entities (extends Zod schemas from `/lib/schemas.ts`)
- **`invoice.ts`** - Unused legacy type (can be safely removed)

## Form Handling with React Hook Form + Zod

All forms use React Hook Form with Zod resolver:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  /* ... */
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    /* ... */
  },
});
```

Zod schemas are defined in `/lib/schemas.ts` for server validation.

**Currency input handling:** Custom masking logic in `FormNewMovement.tsx` handles Spanish number format (e.g., "1.420,50"):

- Thousands separator: `.` (dot)
- Decimal separator: `,` (comma)
- Helper functions in `/lib/utils.ts`: `maskCurrencyInput()`, `parseMoneyInput()`, `toPlainAmount()`

## UI Components with Shadcn

This project uses [Shadcn UI](https://ui.shadcn.com/) components:

- Components are in `/components/ui/`
- **Do not modify** UI components directly - they're auto-generated
- Customize via Tailwind classes or create wrappers in `/components/custom/`

**Component library:**

- Radix UI primitives (@radix-ui/react-\*)
- Tailwind CSS for styling
- `class-variance-authority` for variant management
- `tailwind-merge` + `clsx` via `cn()` utility

## Spanish UI Localization

All user-facing text is hardcoded in Spanish:

- Form labels: "Nombre del cliente", "Método de transacción", etc.
- Buttons: "Guardar", "Cancelar", "Editar", "Borrar"
- Messages: "Credenciales inválidas", "No se pudo conectar con el servidor"
- Options in `/lib/global_variables.ts`:
  - Payment methods: "Efectivo", "Depósito", "Transferencia Bancaria"
  - Payment statuses: "Pago", "No pago", "Pendiente"
  - Payment types: "Ingreso", "Egreso"

**Accents matter:** Use "Depósito", "Últimos", "Método" (not "Deposito", "Ultimos", "Metodo").

No i18n library is currently implemented - all text is inline JSX.

## TypeScript Paths

Absolute imports configured via `tsconfig.json`:

```typescript
import { Button } from '@/components/ui/button';
import { createMovement } from '@/lib/actions';
import type { ServerMovement } from '@/types/movement';
```

`@/*` maps to `./src/*`.

## State Management

**Currently:**

- Local React state (`useState`) for UI state
- Context API via `RouteFetchProvider` for global session/user state
- **Installed but unused:** Zustand (v5.0.8)

Data fetching pattern:

- `RouteFetchProvider` fetches session on route changes (client-side)
- `useSession()` hook provides user data to components
- `router.refresh()` after mutations to trigger refetch
- Next.js caching in server-side fetchers (`movements.ts`, `user.ts`) with `revalidateTag()`

## Known Issues

**IMPORTANT:** Be aware of the following:

1. **Console logs** - Multiple `console.error()` statements in production code (primarily in providers and API proxy)
2. **Unused files** - `types/invoice.ts`, `mock/invoices.ts`, `lib/movements.ts`, `lib/user.ts` are legacy and not currently used (can be safely removed)
3. **Development mode** - `next.config.ts` disables React StrictMode in development for convenience
4. **Zustand not in use** - The project has Zustand installed but doesn't use it; all state is managed via Context API

## Environment Variables

Required variables (`.env` file):

```bash
# Backend API URLs (server-side only - used by Next.js API proxy)
BACKEND_API_DEV=http://localhost:4000/api/v1
BACKEND_API=https://sistema-contable-backend.onrender.com/api/v1
```

**How it works:**

- Next.js automatically sets `NODE_ENV` based on the command you run:
  - `npm run dev` → `NODE_ENV=development` → uses `BACKEND_API_DEV` (localhost)
  - `npm run build` / `npm start` → `NODE_ENV=production` → uses `BACKEND_API` (Render)
- These are **server-side only** variables (no `NEXT_PUBLIC_` prefix) - never exposed to client
- Backend URLs are only accessed by the API proxy at `/src/app/api/[...path]/route.ts`
- Client code always uses `API_BASE = '/api'` which routes through the Next.js proxy

## Important Architectural Patterns

### Locale and Number Formatting

This app uses **Argentine Spanish** (`es-AR`) locale:

- Currency formatting: ARS (Pesos Argentinos) or USD
- Date formatting: `dd/MM/yyyy` or `dd/MM/yy` (custom utilities in `date_utils.ts`)
- Date input supports short format: `dd/MM/yy` with smart year resolution (20-year window)
- Number input format: `1.420,50` (dot for thousands, comma for decimal)
- Timezone: `America/Argentina/Buenos_Aires`

**Date handling:**

- `formatISODate()` - Convert Date to `yyyy-MM-dd` string
- `formatShortDate()` - Convert Date to `dd/MM/yy` string
- `maskShortDateInput()` - Format user input as `dd/MM/yy`
- `shortDateToISO()` - Convert `dd/MM/yy` to ISO format with smart year resolution

### Type Safety

- Zod schemas in `/lib/schemas.ts` define the contract with backend
- TypeScript types in `/types/movement.ts` extend Zod inferred types
- Form validation uses `zodResolver` from `@hookform/resolvers/zod`
- Server-only code uses `import 'server-only'` directive

### Session Management

The app uses cookie-based sessions:

1. Backend sets httpOnly session cookie on login
2. All fetch requests include `credentials: 'include'`
3. Middleware validates session cookie for protected routes
4. `RouteFetchProvider` maintains client-side user state
5. No JWT tokens or localStorage - pure cookie-based auth

### Currency Exchange

The app supports currency swaps between ARS and USD:

1. Exchange rates fetched from backend via `/api/movements/exchange-rate`
2. Rates include `buy` and `sell` prices with metadata (market, updatedAt)
3. Currency swaps created via `/api/movements/swap` endpoint
4. `AdminFetchProvider` provides `getExchangeRates()`, `getUserToCurrencySwap()`, and `postCurrencySwap()` methods
5. After a successful swap, both admin context and user-specific data refresh automatically to update balances

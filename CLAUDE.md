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

**Middleware note:** The middleware is defined in `src/proxy.ts` and exports:

- `proxy()` function - the middleware handler
- `config` object with matcher pattern `/panel/:path*`

### Authentication Flow

1. User logs in at `/ingresar` → POST to `${API_BASE}/users/login`
2. Backend sets session cookie (`credentials: 'include'`)
3. Middleware (`src/proxy.ts`) intercepts protected routes (`/panel/:path*`)
4. Middleware validates session via GET `${API_BASE}/session`
5. If invalid → redirect to `/` (root)
6. If valid → allow access

**Protected routes:** Any path starting with `/panel`

**Client-side session:** `RouteFetchProvider` wraps the app and fetches session data on every route change, providing user context to all client components via `useSession()` hook.

### API Backend Integration

Backend API base URL is determined by environment:

- **Development:** `NEXT_PUBLIC_BACKEND_API_DEV`
- **Production:** `NEXT_PUBLIC_BACKEND_API`

Logic in `/lib/endpoint.ts` - exports `API_BASE`.

**Key endpoints:**

- `POST /users/login` - Authentication (returns user and token)
- `GET /session` - Session validation and user data (includes accounts and movements)
- `GET /movements` - Fetch user movements (unused - session endpoint provides this)
- `POST /movements` - Create new movement
- `GET /users` - Get user information

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

**Mutations:**

```typescript
'use client';
// Client components call backend directly or use server actions
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
  - `Login.tsx` - Login form component
- **`/panel`** - Main dashboard (protected)
  - `page.tsx` - Server component wrapper
  - **`/admin`** - Admin section (protected, nested routes)
    - `page.tsx` - Admin dashboard
    - `/nuevo-movimiento` - New movement page
- **`Dashboard.tsx`** - Main dashboard client component (in `/src/app`)
- **`layout.tsx`** - Root layout with metadata
- **`page.tsx`** - Root page (redirects to `/ingresar` or `/panel`)

### `/src/lib` - Business Logic

Currently flat structure containing:

- **`actions.ts`** - Server actions (mutations)
- **`movements.ts`** - Server-side movement fetching
- **`user.ts`** - Server-side user fetching
- **`schemas.ts`** - Zod validation schemas
- **`endpoint.ts`** - API base URL resolution
- **`global_variables.ts`** - UI option constants (payment methods, statuses, types)
- **`utils.ts`** - Currency formatting, label getters
- **`date_utils.ts`** - Date formatting with `date-fns`

**Important:** Files with server-only imports must include `import 'server-only'` at the top.

### `/src/components`

- **`/ui`** - Shadcn UI primitives (button, form, input, table, etc.)
- **`/custom`** - Business components:
  - `FormNewMovement.tsx` - Form to create movements
  - `MovementsList.tsx` - Table displaying movements
  - `CardAccount.tsx` - Account balance card
  - `CardBalance.tsx` - Balance display card
  - `InputCalendar.tsx` - Date picker
  - `InputUser.tsx` - User selection input
  - `ButtonLogout.tsx` - Logout button
  - `Splitter.tsx` - Visual divider

### `/src/providers`

- **`RouteFetchProvider.tsx`** - Client-side session management
  - Fetches user data on route changes
  - Provides `useSession()` hook
  - Shows spinner during initial load

### `/src/types`

- **`movement.ts`** - Movement and User TypeScript types
- **`invoice.ts`** - Unused legacy type

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

1. **Console logs** - Multiple `console.log()` and `console.warn()` statements in production code (`RouteFetchProvider.tsx:57`, `FormNewMovement.tsx:102`)
2. **Unused files** - `types/invoice.ts`, `mock/invoices.ts` are not currently used
3. **Legacy route** - `/app/(ingresar)/Login.tsx` appears to be unused duplicate of `/app/ingresar/Login.tsx`

## Environment Variables

Required variables:

```bash
# Node environment
NODE_ENV=development

# Development API endpoint (used when NODE_ENV=development)
NEXT_PUBLIC_BACKEND_API_DEV=http://localhost:4000/api/v1

# Production API endpoint (used when NODE_ENV=production)
NEXT_PUBLIC_BACKEND_API=https://api.example.com
```

**Note:**

- These are client-side variables (`NEXT_PUBLIC_*`) accessible in browser
- The `/lib/endpoint.ts` automatically selects the correct URL based on `NODE_ENV`
- Development URL should include `/api/v1` path prefix

## Important Architectural Patterns

### Locale and Number Formatting

This app uses **Argentine Spanish** (`es-AR`) locale:

- Currency formatting: ARS (Pesos Argentinos) or USD
- Date formatting: `dd/MM/yyyy` (via `date-fns`)
- Number input format: `1.420,50` (dot for thousands, comma for decimal)
- Timezone: `America/Argentina/Buenos_Aires`

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

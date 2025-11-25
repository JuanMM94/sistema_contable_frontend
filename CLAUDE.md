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

**Note:** All Next.js commands use `--webpack` flag for compatibility.

## High-Level Architecture

### Next.js 16 App Router

This project uses the App Router (not Pages Router):
- **React Server Components (RSC)** by default - mark client components with `'use client'`
- **Server Actions** for mutations (`/lib/actions.ts`)
- **Server-side data fetching** in page components
- **Middleware authentication** via `proxy.ts`

### Authentication Flow

1. User logs in at `/ingresar` → POST to `${API_BASE}/users/login`
2. Backend sets session cookie
3. Middleware (`proxy.ts`) intercepts protected routes (`/panel/:path*`)
4. Middleware validates session via GET `${API_BASE}/session`
5. If invalid → redirect to `/ingresar`
6. If valid → allow access

**Protected routes:** Any path starting with `/panel`

### API Backend Integration

Backend API base URL is determined by environment:
- **Development:** `NEXT_PUBLIC_BACKEND_API_DEV`
- **Production:** `NEXT_PUBLIC_BACKEND_API`

Logic in `/lib/endpoint.ts` - exports `API_BASE`.

**Key endpoints:**
- `POST /users/login` - Authentication
- `GET /session` - Session validation
- `GET /movements` - Fetch user movements
- `POST /movements` - Create new movement
- `GET /users` - Get user information (currently buggy - fetches from `/movements`)

### Data Flow Pattern

**Server Components (data fetching):**
```typescript
// src/app/panel/page.tsx
export default async function Page() {
  const movements = await getMovements();     // Server-side fetch
  const user = await getUserInformation();    // Server-side fetch
  return <Dashboard movements={movements} user={user} />;
}
```

**Client Components (mutations):**
```typescript
'use client';
// Components use server actions for mutations
import { createMovement } from '@/lib/actions';

const handleSubmit = async (data) => {
  await createMovement(data);
  router.refresh(); // Revalidate server data
};
```

## Code Organization

### `/src/app` - App Router Structure
- **`/ingresar`** - Login page (public)
- **`/panel`** - Dashboard page (protected by middleware)
- **`Dashboard.tsx`** - Main dashboard client component
- **`layout.tsx`** - Root layout with metadata
- **`RouteFetchProvider.tsx`** - Client-side session keepalive

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
  - `DrawerNewMovement.tsx` - Form to create movements
  - `MovementsList.tsx` - Table displaying movements
  - `CardBalance.tsx` - Balance display card
  - `InputCalendar.tsx` - Date picker

### `/src/types`
- **`movement.ts`** - Movement and User TypeScript types
- **`invoice.ts`** - Unused legacy type

## Form Handling with React Hook Form + Zod

All forms use React Hook Form with Zod resolver:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ /* ... */ });

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
});
```

Zod schemas are defined in `/lib/schemas.ts` for server validation.

**Currency input handling:** Custom masking logic in `DrawerNewMovement.tsx` handles Spanish number format (e.g., "1.420,50").

## UI Components with Shadcn

This project uses [Shadcn UI](https://ui.shadcn.com/) components:
- Components are in `/components/ui/`
- **Do not modify** UI components directly - they're auto-generated
- Customize via Tailwind classes or create wrappers in `/components/custom/`

**Component library:**
- Radix UI primitives (@radix-ui/react-*)
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

**Currently:** Local React state (`useState`) only
**Installed but unused:** Zustand (v5.0.8)

Server state is managed via:
- Server Components fetch on each navigation
- `router.refresh()` to revalidate after mutations
- Next.js caching with `revalidateTag()` in server actions

## Known Issues

**IMPORTANT:** The following bugs exist in the codebase:

1. **`/lib/user.ts:5`** - `getUserInformation()` fetches from `/movements` endpoint instead of `/users`
2. **Hardcoded Account ID** - `DrawerNewMovement.tsx:72` has hardcoded UUID that should come from authenticated user context
3. **Unused files** - `types/invoice.ts`, `mock/invoices.ts`, `components/server/Movements.tsx` are not used
4. **Console logs** - Multiple `console.log()` statements in production code (proxy.ts, actions.ts, movements.ts, Login.tsx)

## Environment Variables

Required variables:
```bash
# Development API endpoint
NEXT_PUBLIC_BACKEND_API_DEV=http://localhost:4000

# Production API endpoint
NEXT_PUBLIC_BACKEND_API=https://api.example.com
```

**Note:** These are client-side variables (`NEXT_PUBLIC_*`) accessible in browser.

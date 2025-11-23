# Sistema Contable Frontend - Análisis Inicial

**Fecha:** 23 de Noviembre 2025
**Branch:** `claude/spanish-ui-code-refactor-01LkxAUakLJzfWpkSLqBBLZ9`
**Objetivo:** Código en inglés, UI en castellano

---

## 📋 Resumen Ejecutivo

Este es un MVP funcional de un sistema contable construido con:
- **Stack:** Next.js 16 + React 19 + TypeScript
- **UI:** Shadcn UI + Radix UI + Tailwind CSS
- **Validación:** React Hook Form + Zod
- **Estado:** Zustand (instalado pero NO usado)
- **Tamaño:** ~804 líneas de código

**Estado General:** ⚠️ Funcional pero requiere refactorización estructural significativa antes de producción.

---

## 🏗️ Estructura del Proyecto

```
/src
├── /app                          # Next.js app directory
│   ├── layout.tsx               # Layout raíz
│   ├── Dashboard.tsx            # ❌ DUPLICADO (ver HomeClient.tsx)
│   ├── HomeClient.tsx           # ❌ DUPLICADO del Dashboard
│   ├── page.module.css
│   ├── /ingresar               # Página de login
│   │   ├── Login.tsx
│   │   └── page.tsx
│   └── /panel                   # Dashboard protegido
│       ├── page.tsx
│       └── Dashboard.tsx        # ❌ OTRO Dashboard (confuso)
├── /components
│   ├── /ui                      # Primitivas de Shadcn UI
│   ├── /custom                  # Componentes de negocio
│   │   ├── CardBalance.tsx      # ⚠️ TYPO: CardBalace
│   │   ├── DrawerNewMovement.tsx # ⚠️ Botón "Submit" en inglés
│   │   ├── InputCalendar.tsx
│   │   ├── MovementsList.tsx
│   │   └── Splitter.tsx
│   └── /server
│       └── Movements.tsx        # ❌ No usado
├── /lib                         # Lógica de negocio
│   ├── actions.ts               # Server actions
│   ├── endpoint.ts              # Configuración API
│   ├── date_utils.ts            # Utilidades de fecha
│   ├── global_variables.ts      # ⚠️ Constantes (TYPO: ENGRESS)
│   ├── movements.ts             # Fetch de movimientos
│   ├── schemas.ts               # Esquemas Zod
│   ├── user.ts                  # 🔴 BUG: endpoint incorrecto
│   └── utils.ts
├── /types
│   ├── invoice.ts               # ❌ No usado
│   └── movement.ts
├── /mock
│   └── invoices.ts              # ❌ No usado
├── /styles                      # ❌ DUPLICADO vacío
├── /styles.css                  # ❌ DUPLICADO vacío
├── proxy.ts                     # Middleware de autenticación
└── globals.css
```

---

## 🔴 PROBLEMAS CRÍTICOS (Prioridad 1)

### 1. Componentes Dashboard Duplicados

**Archivos afectados:**
- `/src/app/Dashboard.tsx`
- `/src/app/HomeClient.tsx` (casi idéntico)
- `/src/app/panel/Dashboard.tsx` (código muerto)

**Problema:**
- Nombres de app diferentes: "BananasPro" vs "Sistema Contable"
- Usuarios hardcodeados diferentes: "Pablo Gimenez" vs "PABLO PEREZ"
- Confusión sobre cuál componente se está usando

**Impacto:** Alto - Inconsistencia en la UI y mantenimiento duplicado

---

### 2. ID de Cuenta Hardcodeado

**Archivo:** `/src/components/custom/DrawerNewMovement.tsx:72`

```typescript
const ACCOUNT_ID = 'cmhmg8qtg0001w53gjg9vsjkn'; // Current user -- IMPORTANT CHANGE --
```

**Problema:** UUID hardcodeado con comentario "IMPORTANT CHANGE"
**Solución necesaria:** Obtener del contexto de usuario autenticado

---

### 3. BUG en Endpoint de Usuario

**Archivo:** `/src/lib/user.ts:5`

```typescript
export async function getUserInformation() {
  const res = await fetch(`${API_BASE}/movements`, {  // 🔴 Debería ser /users
    next: { revalidate: 60, tags: ['movements'] },
  });
  if (!res.ok) throw new Error('Failed to load movements');  // Mensaje incorrecto
  return res.json();
}
```

**Problema:** Hace fetch a `/movements` en vez de `/users`
**Impacto:** Crítico - Fallará en producción

---

## ⚠️ PROBLEMAS DE ALTA PRIORIDAD (Prioridad 2)

### 4. Inconsistencias de Idioma

| Ubicación | Línea | Problema | Debería ser |
|-----------|-------|----------|-------------|
| `DrawerNewMovement.tsx` | 351 | "Submit" (inglés) | "Guardar" |
| `global_variables.ts` | 17 | "Deposito" | "Depósito" (con tilde) |
| `Dashboard.tsx` | 68 | "Ultimos movimientos" | "Últimos movimientos" |
| `HomeClient.tsx` | 68 | "Ultimos movimientos" | "Últimos movimientos" |
| `CardBalance.tsx` | 13 | "Ultimos Movimientos" | "Últimos Movimientos" |
| `global_variables.ts` | 29 | Value: `'ENGRESS'` (typo) | `'EGRESS'` |
| `MovementsList.tsx` | 30 | "Metodo" | "Método" (con tilde) |

**Nota:** El schema en `schemas.ts:6` usa correctamente `'EGRESS'`, pero `global_variables.ts:29` tiene el typo `'ENGRESS'` como value del enum de UI.

---

### 5. Typo en Nombre de Componente

**Archivo:** `/src/components/custom/CardBalance.tsx`

**Problema:** El archivo se llama `CardBalace` (sin la segunda 'n')
**Impacto:** Medio - Se propaga por imports en todo el codebase

---

### 6. Datos de Usuario Hardcodeados

**Ubicaciones:**

```typescript
// HomeClient.tsx:35
<h1>BananasPro</h1>
<p>PABLO PEREZ</p>

// Dashboard.tsx:35
<h1>Sistema Contable</h1>

// Dashboard.tsx:59
<h3>Hola, Pablo Gimenez! (Admin)</h3>

// CardBalance.tsx
<CardTitle>$556.058</CardTitle>  // Balance hardcodeado
```

**Problema:** Todos los datos deberían venir del contexto de usuario autenticado

---

### 7. Código No Usado

**Archivos/dependencias sin usar:**
- `/src/types/invoice.ts` - Tipo Invoice no importado en ningún lado (solo en mock)
- `/src/mock/invoices.ts` - Mock data no usado
- `/src/components/server/Movements.tsx` - Componente servidor no usado
- `/src/app/panel/Dashboard.tsx` - Archivo vacío (código muerto)
- `/src/app/HomeClient.tsx` - Versión antigua del Dashboard (no se usa)
- `/src/styles/button.module.css` - Archivo vacío
- `/src/styles.css/button.module.css` - Archivo vacío (duplicado)
- Zustand (v5.0.8) - Instalado pero no implementado

**Archivos activos vs muertos:**
- ✅ **Usado:** `/src/app/Dashboard.tsx` (importado desde `/panel/page.tsx`)
- ❌ **Muerto:** `/src/app/HomeClient.tsx` (versión antigua con diferentes props)
- ❌ **Muerto:** `/src/app/panel/Dashboard.tsx` (archivo vacío)

---

## ⚡ PROBLEMAS DE PRIORIDAD MEDIA (Prioridad 3)

### 8. Console.log en Código de Producción

**10 instancias encontradas en:**

| Archivo | Línea | Código |
|---------|-------|--------|
| `proxy.ts` | 8 | `console.log("proxy run")` |
| `proxy.ts` | 15 | `console.log('middleware cookies:', cookieHeader)` |
| `proxy.ts` | 25 | `console.log(res)` |
| `actions.ts` | 32 | `console.log('Set-Cookie array:', setCookies)` |
| `movements.ts` | 5 | `console.log(API_BASE)` |
| `Login.tsx` | 41 | `console.log("After login")` |
| `Login.tsx` | 42 | `console.log(res)` |
| `DrawerNewMovement.tsx` | 98 | `console.warn('Submit blocked', errors)` |

**Acción:** Remover o reemplazar con logger apropiado

---

### 9. Manejo de Estado Deficiente

**Problemas identificados:**

```typescript
// HomeClient.tsx - Estado de solo lectura
const [movementsList] = useState(movements); // ❌ No hay setter

// Zustand instalado pero no usado
// ❌ No hay estado global para usuario
// ❌ No hay estados de loading/error
// ❌ No hay persistencia
```

---

### 10. Organización de CSS

**Problema:** Directorios duplicados
- `/src/styles/` → contiene `button.module.css` vacío
- `/src/styles.css/` → contiene `button.module.css` vacío (idéntico)

**Además:** CSS esparcido en múltiples lugares
- `page.module.css`
- Tailwind inline
- `globals.css`

---

### 11. Problemas de Type Safety y Duplicación de Tipos

**Duplicación de definiciones:**

```typescript
// schemas.ts - Línea 3 y línea 40
export const Role = z.enum(['MEMBER', 'ADMIN']);  // Línea 3
export const RoleSchema = z.enum(["ADMIN", "MEMBER"]);  // Línea 40 (duplicado)
export type Role = z.infer<typeof RoleSchema>;  // Línea 41 (duplicado)
```

**Inconsistencia entre types y schemas:**

```typescript
// types/movement.ts - Tipos simples
export type Movement = {
  exchangeRate: number;  // ⚠️ Simple type
  // ... más campos como strings simples
}

// schemas.ts - Zod schemas con validación
export const NewMovementInput = z.object({
  exchangeRate: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
  // ... validación estricta
});
```

**Problemas:**
- `types/movement.ts` define tipos simples sin validación
- `schemas.ts` define Zod schemas con validación estricta
- No hay sincronización entre ambos
- Invoice type contamina el codebase sin uso real

---

## 📁 PROBLEMAS DE ORGANIZACIÓN DE ARCHIVOS

### Preocupaciones Mezcladas

```
/lib actualmente contiene:
├── Server actions (actions.ts)
├── Utilidades (utils.ts, date_utils.ts)
├── Llamadas API (movements.ts, user.ts)
├── Esquemas de validación (schemas.ts)
├── Configuración (endpoint.ts)
└── Variables globales (global_variables.ts)

Debería separarse en:
├── /lib/api/          (cliente API + endpoints)
├── /lib/utils/        (utilidades generales)
├── /lib/schemas/      (Zod schemas)
├── /lib/actions/      (server actions)
├── /lib/config/       (configuración + endpoint)
└── /lib/constants/    (constantes globales)
```

### Carpetas Faltantes

- ❌ `/hooks` - Para custom React hooks
- ❌ `/constants` - Usando `global_variables.ts` en su lugar
- ❌ `/contexts` - Necesario para autenticación/usuario
- ❌ `/store` - Zustand no implementado
- ❌ `/lib/api` - Llamadas API esparcidas
- ❌ `/lib/formatters` - Formateadores mezclados con utils

### Archivos con Problemas de Formato

**RouteFetchProvider.tsx (línea 14):**
```typescript
return(<></>)  // ❌ Mal formato
```
Debería ser:
```typescript
return <></>;  // ✅ Correcto
```

---

## 🚫 CARACTERÍSTICAS CRÍTICAS FALTANTES

1. **Contexto de Autenticación** - Datos de usuario hardcodeados
2. **Error Boundaries** - Sin fallbacks de error
3. **Estados de Carga** - Sin skeleton screens o spinners
4. **Feedback de Validación de Formularios** - UX poco clara para errores
5. **Manejo de Errores de API** - Mensajes genéricos
6. **Validación de Entorno** - Sin checks de URLs de API faltantes
7. **Internacionalización (i18n)** - Todo el texto en español hardcodeado
8. **Llamadas API Type-safe** - Sin wrapper de fetch tipado

---

## 🌐 GESTIÓN DE TEXTO DE UI

### Estado Actual: HARDCODEADO (Sin i18n)

**❌ Sin biblioteca i18n**
- No hay next-i18n-router
- No hay archivos de traducción
- Todo el texto español directamente en JSX

**Strings de UI Hardcodeados Encontrados:**

**Login (`/src/app/ingresar/Login.tsx`):**
- "Ingresá a Sistema Contable"
- "Ingresá, maneja y mirá tus transacciones en el panel de admin"
- "Correo electrónico"
- "Contraseña"
- "Credenciales inválidas"
- "No se pudo conectar con el servidor."
- "Olvidé mi contraseña"
- "Necesito ayuda del soporte"

**Dashboard (`/src/app/Dashboard.tsx`):**
- "Sistema Contable" (nombre de app)
- "Hola, Pablo Gimenez! (Admin)" (hardcodeado)
- "Ultimos movimientos" (sin tilde) ❌
- "Ver Movimientos" (link de navegación)
- "Cambiar Moneda" (link de navegación)

**HomeClient.tsx (archivo muerto pero con texto):**
- "BananasPro" (nombre de app diferente!)
- "PABLO PEREZ" (usuario hardcodeado diferente!)

**CardBalance:**
- "Balance ARS"
- "$556.058" (valor hardcodeado)
- "Ultimos Movimientos" (sin tilde) ❌
- "Cambiar a peso"

**MovementsList (tabla):**
- "Id de factura" (debería ser "Id de movimiento")
- "Fecha", "Pagador", "Estado", "Metodo" ❌, "Tipo", "Cantidad", "Acciones"

**Formularios (DrawerNewMovement):**
- "Nuevo Movimiento"
- "Nombre del cliente"
- "Método de transacción"
- "Estado de transacción"
- "Tipo de transacción"
- "Concepto"
- "Monto total"
- "Nota" + "opcional"
- Placeholders: "ej. Pedro Martinez", "ej. Cobranza / Compra dolar a 1.420", "ej. 1.420,00", "Agrega información opcional a este movimiento"

**Options de selects:**
- Método: "Efectivo", "Deposito" ❌, "Transferencia Bancaria"
- Estado: "Pago", "No pago", "Pendiente"
- Tipo: "Ingreso", "Egreso"

**Botones:**
- "Submit" ⚠️ (INGLÉS - CRÍTICO)
- "Entrar"
- "Cancelar"
- "Editar" (sin funcionalidad)
- "Borrar" (sin funcionalidad)

**Metadata (panel/page.tsx):**
- title: "Panel de control"
- description: "Manejá y mirá todas tus transacciones."

---

## 🎯 VALORES HARDCODEADOS QUE DEBEN SER DINÁMICOS

| Ubicación | Valor Hardcodeado | Debe venir de |
|-----------|-------------------|---------------|
| `DrawerNewMovement.tsx:72` | `ACCOUNT_ID = 'cmhmg8qtg0001w53gjg9vsjkn'` | Contexto de usuario |
| `HomeClient.tsx:38` | `PABLO PEREZ` | Usuario autenticado |
| `Dashboard.tsx:59` | `Pablo Gimenez! (Admin)` | Usuario autenticado |
| `HomeClient.tsx:35` | `BananasPro` | Variable de entorno / config |
| `Dashboard.tsx:35` | `Sistema Contable` | Variable de entorno / config |
| `CardBalance.tsx` | `$556.058` | API de balance |

---

## 🔧 ESTRUCTURA DE API/SERVICIOS

### Estado Actual

```
Llamadas API en:
├── /lib/actions.ts         (Server actions para mutaciones)
│   ├── createMovement()    - POST /movements
│   └── userLogin()         - POST /users/login
├── /lib/movements.ts       (Server-side fetch)
│   └── getMovements()      - GET /movements
├── /lib/user.ts            (Server-side fetch - 🔴 TIENE BUG)
│   └── getUserInformation() - 🔴 GET /movements (debería ser /users)
├── Componentes directamente
│   ├── Login.tsx           - POST /users/login (duplicado)
│   └── RouteFetchProvider  - GET /session
└── Middleware
    └── proxy.ts            - GET /session (validación auth)
```

### Problemas

1. **Preocupaciones Mezcladas:** Llamadas API tanto en `/lib` COMO en componentes
2. **Login duplicado:** `Login.tsx` hace fetch directo, `actions.ts` tiene `userLogin()` (no usado)
3. **Sin Manejo de Errores:** Mensajes genéricos `throw new Error()`
4. **Sin Validación de Requests:** Endpoints del servidor no validados
5. **Variables de Entorno:** Depende de `NEXT_PUBLIC_BACKEND_API_DEV` y `NEXT_PUBLIC_BACKEND_API`
6. **Uso incorrecto de revalidateTag:** En `actions.ts:15` → `revalidateTag('movements', 'max')` - segundo parámetro incorrecto

---

## 📊 MÉTRICAS DE CALIDAD DE CÓDIGO

| Categoría | Estado | Detalles |
|-----------|--------|----------|
| **Estructura de Carpetas** | ⚠️ Desordenada | Dirs duplicados, preocupaciones mezcladas |
| **Mezcla Español/Inglés** | ⚠️ Moderada | Botón "Submit", tildes faltantes |
| **Texto Hardcodeado** | ❌ Malo | Nombres de usuario, app, balances |
| **Setup i18n** | ❌ Ninguno | Hardcoding completo del español |
| **Gestión de Estado** | ❌ Mínima | Zustand sin usar, solo estado local |
| **Estructura de API** | ⚠️ Pobre | Mezclada en lib y componentes |
| **Type Safety** | ✅ Buena | Zod + TypeScript + modo estricto |
| **Manejo de Errores** | ❌ Pobre | Mensajes genéricos, sin boundaries |
| **Calidad de Código** | ⚠️ Mixta | Typos, logs de debug, código sin usar |
| **Organización de Componentes** | ⚠️ Regular | Algo de lógica mezclada con UI |

---

## 🚀 PLAN DE REFACTORIZACIÓN RECOMENDADO

### ✅ Fase 1: Correcciones Inmediatas (Crítico)

1. ✅ Eliminar archivos Dashboard duplicados (`HomeClient.tsx`, `panel/Dashboard.tsx`)
2. ✅ Corregir bug de endpoint en `user.ts` (línea 5: `/movements` → `/users`)
3. ✅ Renombrar archivo `CardBalace.tsx` → `CardBalance.tsx` y export
4. ✅ Corregir typo de enum `ENGRESS` → `EGRESS` en `global_variables.ts:29`
5. ✅ Cambiar botón "Submit" → "Guardar" en `DrawerNewMovement.tsx:351`
6. ✅ Agregar tildes faltantes:
   - "Depósito" en `global_variables.ts:17`
   - "Últimos movimientos" en `Dashboard.tsx:68`, `CardBalance.tsx:13`
   - "Método" en `MovementsList.tsx:30`
7. ✅ Corregir formato de return en `RouteFetchProvider.tsx:14`
8. ✅ Corregir `revalidateTag` en `actions.ts:15` (remover segundo parámetro 'max')

### 🔄 Fase 2: Mejoras Estructurales (Alto)

9. Crear contexto de autenticación (AuthContext)
10. Extraer valores hardcodeados a contexto/store:
    - ACCOUNT_ID en DrawerNewMovement
    - Nombre de usuario (Sistema Contable vs BananasPro)
    - Balance actual ($556.058)
11. Implementar setup de i18n apropiado (next-intl o similar)
12. Centralizar llamadas API en `/lib/api/`
13. Eliminar directorios duplicados (`/src/styles` y `/src/styles.css`)
14. Remover todos los statements console.log (10 instancias)
15. Eliminar código muerto:
    - `/src/types/invoice.ts`
    - `/src/mock/invoices.ts`
    - `/src/components/server/Movements.tsx`
    - Archivos button.module.css vacíos
16. Resolver duplicación de Role schema en `schemas.ts`

### 🏗️ Fase 3: Optimizaciones (Medio)

17. Implementar Zustand para gestión de estado global
18. Agregar estados de loading/error en todos los componentes
19. Crear error boundaries para páginas principales
20. Reorganizar estructura `/lib`:
    - `/lib/api/` - Llamadas API centralizadas
    - `/lib/utils/` - Utilidades generales
    - `/lib/schemas/` - Zod schemas
    - `/lib/actions/` - Server actions
    - `/lib/config/` - Configuración
    - `/lib/constants/` - Constantes y opciones
    - `/lib/formatters/` - Formateadores de fecha/moneda
21. Agregar carpetas faltantes:
    - `/src/hooks/` - Custom React hooks
    - `/src/contexts/` - React contexts
    - `/src/constants/` - Constantes de app
    - `/src/store/` - Zustand stores
22. Implementar funcionalidad en botones "Editar" y "Borrar"
23. Cambiar "Id de factura" → "Id de movimiento" en tabla

### 🎨 Fase 4: Mejoras de UX (Bajo)

24. Agregar skeleton screens para estados de carga
25. Mejorar feedback de validación de formularios
26. Implementar manejo de errores consistente con toasts/notificaciones
27. Agregar confirmaciones para acciones destructivas (Borrar movimiento)
28. Implementar validación de variables de entorno en runtime
29. Agregar logger apropiado para reemplazar console.log
30. Sincronizar tipos entre `/types/movement.ts` y `/schemas.ts`

---

## 📝 NOTAS ADICIONALES

### Variables de Entorno Actuales

```env
NEXT_PUBLIC_BACKEND_API_DEV
NEXT_PUBLIC_BACKEND_API
```

**Falta:** Validación de que estas variables existan en runtime

### Dependencias Instaladas pero No Usadas

- `zustand` (v5.0.8) - Instalado en package.json pero sin implementar

### Convenciones de Nomenclatura

**✅ Código (debe estar en inglés):**
- Nombres de variables
- Nombres de funciones
- Nombres de tipos
- Comentarios de código

**✅ UI (debe estar en español):**
- Labels de formularios
- Mensajes de error
- Botones
- Títulos y headings
- Tooltips

---

## 🎯 CRITERIOS DE ÉXITO

Para considerar la refactorización completa:

- [ ] Sin archivos duplicados
- [ ] Sin texto hardcodeado para usuarios/balances
- [ ] Todo el texto de UI en español (con tildes correctas)
- [ ] Todo el código en inglés (variables, funciones)
- [ ] Sin console.log en código de producción
- [ ] Contexto de autenticación implementado
- [ ] Setup de i18n funcionando
- [ ] API calls centralizados en `/lib/api`
- [ ] Zustand implementado para estado global
- [ ] Error boundaries en lugares clave
- [ ] Estados de loading implementados
- [ ] Sin código sin usar

---

## 📚 RECURSOS Y REFERENCIAS

- **Framework:** [Next.js 16](https://nextjs.org/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Validación:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Estado (por implementar):** [Zustand](https://zustand-demo.pmnd.rs/)
- **i18n (por implementar):** [next-intl](https://next-intl-docs.vercel.app/)

---

**Última actualización:** 23 de Noviembre 2025
**Analizado por:** Claude (Sistema Contable Frontend Refactor)
**Total de archivos revisados:** Estructura completa del proyecto
**Total de líneas de código:** ~804 líneas

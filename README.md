# Amonet — Frontend

SPA para gestión de producción de cosméticos. Construida con Next.js 14 + React 18 + TypeScript.

## Arquitectura

```
src/
├── app/            # Páginas (App Router de Next.js)
├── components/     # UI components (shadcn-style) + forms + layout
├── contexts/       # AuthContext (login/logout, token management)
├── hooks/          # Custom hooks
├── lib/api/        # Cliente HTTP + módulos API por recurso
├── stores/         # Estado global con Zustand
└── types/          # Interfaces TypeScript + schemas Zod
```

- **App Router:** Páginas con `'use client'`. Layout global con AppShell + Sidebar.
- **Estado:** Zustand con stores por recurso (products, brands, raw-materials, etc.).
- **API Client:** Capa HTTP que inyecta token JWT automáticamente.
- **Formularios:** React Hook Form + Zod schemas.
- **Autenticación:** Contexto global que persiste token en localStorage.

## Tecnologías

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 14.2.5 | Framework React (App Router) |
| React | 18.3.1 | UI |
| TypeScript | 5.5.4 | Tipado |
| TailwindCSS | 3.4.7 | Estilos |
| Zustand | 4.5.4 | Estado global |
| Zod | 3.23.8 | Validación de formularios |
| React Hook Form | 7.52.1 | Manejo de formularios |
| mathjs | 12.4.3 | Evaluación de fórmulas |
| Radix UI | - | Componentes accesibles headless |
| Lucide React | 0.424.0 | Iconos |

## Funcionalidades

### Páginas y Módulos

| Ruta | Módulo | Descripción |
|---|---|---|
| `/login` | Login | Inicio de sesión |
| `/products` | Productos | CRUD con fórmulas matemáticas |
| `/brands` | Marcas | CRUD |
| `/raw-materials` | Materias Primas | CRUD con catálogos de tipos y unidades |
| `/product-variables` | Variables Globales | CRUD para uso en fórmulas |
| `/users` | Usuarios | CRUD (solo ADMIN) |
| `/inventario` | Inventario | Ingresos con evidencia, aprobación/rechazo |
| `/ordenes-produccion` | Órdenes de Producción | Wizard 4 pasos, cards, finalizar/cancelar |
| `/logs` | Logs | Auditoría con filtros y descarga |
| `/profile` | Perfil | Información del usuario autenticado |

### Características destacadas

- **Wizard de 4 pasos** para creación de órdenes de producción con cálculo de fórmulas en tiempo real vía `mathjs`.
- **Tabla de inventario expandible** con contenedores anidados, edición, aprobación/rechazo con motivo.
- **Selector de materias primas** con autocompletado de variables globales y validación de fórmulas.
- **Subida de archivos** como evidencia de inventario.
- **Sidebar con permisos:** módulos visibles según rol del usuario.
- **Paginación y filtros** en todas las tablas.

### Componentes UI

Biblioteca de componentes estilo shadcn con paleta de colores violeta personalizada:

- Button, Input, Label, Select, Badge (con variantes por estado)
- Card, Dialog (modal), Table, Toast, Tooltip
- PaginationBar, EmptyState, FilterContainer
- EntityTable (genérica con paginación + acciones CRUD)
- AppShell + Sidebar (layout principal con protección de rutas)

### Variables de Entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API backend |
| `PORT` | Puerto del servidor (default 3000) |

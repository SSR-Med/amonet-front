# Documentación Técnica — Sistema de Gestión de Productos

## 1. Visión General

Aplicación web para la gestión de productos industriales/manufactureros. Permite administrar productos, sus materias primas asociadas, marcas y variables globales de fórmulas. El usuario puede crear, leer, actualizar y eliminar (CRUD) cada entidad del sistema.

---

## 2. Modelo de Datos

### 2.1 Entidad: `Brand` (Marca)

| Campo  | Tipo     | Restricciones         | Descripción                  |
|--------|----------|-----------------------|------------------------------|
| `id`   | `string` | UUID v4, autogenerado | Identificador único           |
| `name` | `string` | Requerido, único      | Nombre de la marca            |

```ts
interface Brand {
  id: string;       // UUID v4
  name: string;     // Unique
}
```

---

### 2.2 Entidad: `RawMaterial` (Materia Prima)

| Campo  | Tipo                           | Restricciones         | Descripción                        |
|--------|--------------------------------|-----------------------|------------------------------------|
| `id`   | `string`                       | UUID v4, autogenerado | Identificador único                 |
| `name` | `string`                       | Requerido, único      | Nombre de la materia prima          |
| `type` | `"chemical" \| "packaging"`   | Requerido             | Tipo: químico o empaquetado         |

```ts
type RawMaterialType = "chemical" | "packaging";

interface RawMaterial {
  id: string;               // UUID v4
  name: string;             // Unique
  type: RawMaterialType;
}
```

---

### 2.3 Entidad: `ProductVariable` (Variable Global de Producto)

Variables globales reutilizables para construir fórmulas matemáticas dentro de los productos.

| Campo  | Tipo     | Restricciones         | Descripción              |
|--------|----------|-----------------------|--------------------------|
| `id`   | `string` | UUID v4, autogenerado | Identificador único       |
| `name` | `string` | Requerido, único      | Nombre de la variable     |

```ts
interface ProductVariable {
  id: string;    // UUID v4
  name: string;  // Unique — used as reference inside formulas
}
```

> **Nota de uso:** El `name` de la variable es el identificador que el usuario escribe dentro de las fórmulas. Por ejemplo, si existe una variable con nombre `peso_neto`, el usuario puede escribir `peso_neto * 0.05` como fórmula de una materia prima.

---

### 2.4 Sub-entidad: `ProductRawMaterial` (Relación Producto ↔ Materia Prima)

Esta sub-entidad representa la asociación entre un producto y una materia prima específica, incluyendo la fórmula que define la cantidad de dicha materia prima.

| Campo           | Tipo     | Restricciones                          | Descripción                                          |
|-----------------|----------|----------------------------------------|------------------------------------------------------|
| `rawMaterialId` | `string` | UUID v4, referencia a `RawMaterial`    | Materia prima asociada                               |
| `formula`       | `string` | Requerido                              | Expresión matemática en función de variables globales |

```ts
interface ProductRawMaterial {
  rawMaterialId: string;  // Reference to RawMaterial.id
  formula: string;        // Math expression, e.g. "peso_neto * 0.05 + volumen / 2"
}
```

> **Restricción:** Una misma materia prima no puede aparecer más de una vez dentro del mismo producto.

---

### 2.5 Entidad: `Product` (Producto)

| Campo         | Tipo                       | Restricciones              | Descripción                                  |
|---------------|----------------------------|----------------------------|----------------------------------------------|
| `id`          | `string`                   | UUID v4, autogenerado       | Identificador único                           |
| `name`        | `string`                   | Requerido                  | Nombre del producto                           |
| `code`        | `string`                   | Requerido, ingresado por el usuario | Código alfanumérico del producto       |
| `brandId`     | `string`                   | UUID v4, referencia a `Brand` | Marca asociada                             |
| `rawMaterials`| `ProductRawMaterial[]`     | Sin duplicados por `rawMaterialId` | Lista de materias primas con su fórmula |

```ts
interface Product {
  id: string;                            // UUID v4
  name: string;
  code: string;                          // User-defined, not auto-generated
  brandId: string;                       // Reference to Brand.id
  rawMaterials: ProductRawMaterial[];    // No duplicate rawMaterialId
}
```

---

## 3. Relaciones Entre Entidades

```
Brand (1) ────────────── (N) Product
                                │
                                │ contains
                                ▼
                    ProductRawMaterial[]
                         │          │
              rawMaterialId      formula (string)
                         │          │
                         ▼          └─ references ──► ProductVariable(s)
                    RawMaterial
```

- Un `Product` tiene **una sola** `Brand`.
- Un `Product` puede tener **muchas** `ProductRawMaterial` (sin repetir la misma materia prima).
- Cada `ProductRawMaterial` referencia una `RawMaterial` y contiene una fórmula que puede usar **cero o más** `ProductVariable`.
- `ProductVariable` es una entidad global: no pertenece a un producto específico, está disponible para todos.

---

## 4. Módulos / Secciones de la Aplicación

La aplicación se organiza en **4 módulos principales**, cada uno con su propio CRUD:

### 4.1 Módulo: Marcas (`/brands`)

| Operación | Descripción                                |
|-----------|--------------------------------------------|
| Listar    | Tabla con todas las marcas registradas      |
| Crear     | Formulario: `name`                          |
| Editar    | Mismo formulario con datos precargados      |
| Eliminar  | Confirmación antes de borrar                |

**Validaciones:**
- `name` no puede estar vacío.
- `name` debe ser único (case-insensitive recomendado).
- No se puede eliminar una marca si tiene productos asociados (o mostrar advertencia).

---

### 4.2 Módulo: Materias Primas (`/raw-materials`)

| Operación | Descripción                                              |
|-----------|----------------------------------------------------------|
| Listar    | Tabla con nombre y tipo de cada materia prima            |
| Crear     | Formulario: `name`, `type` (selector: Químico / Empaquetado) |
| Editar    | Mismo formulario con datos precargados                   |
| Eliminar  | Confirmación antes de borrar                             |

**Validaciones:**
- `name` no puede estar vacío y debe ser único.
- `type` debe ser uno de los valores permitidos: `chemical` o `packaging`.
- No se puede eliminar si está en uso dentro de algún producto.

---

### 4.3 Módulo: Variables Globales de Producto (`/product-variables`)

| Operación | Descripción                                          |
|-----------|------------------------------------------------------|
| Listar    | Tabla con el nombre de cada variable                 |
| Crear     | Formulario: `name`                                   |
| Editar    | Mismo formulario con datos precargados               |
| Eliminar  | Confirmación antes de borrar                         |

**Validaciones:**
- `name` no puede estar vacío y debe ser único.
- Solo se permiten nombres que sean identificadores válidos (sin espacios, sin caracteres especiales excepto `_`). Patrón sugerido: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`.
- No se puede eliminar si está referenciada en alguna fórmula activa (opcional: advertencia).

---

### 4.4 Módulo: Productos (`/products`)

#### 4.4.1 Listado de Productos

Vista de tabla/tarjetas mostrando: `name`, `code`, nombre de la `Brand`, cantidad de materias primas.

#### 4.4.2 Crear / Editar Producto

Formulario dividido en dos secciones:

**Sección 1 — Datos Generales:**
- `name` (texto)
- `code` (texto, ingresado manualmente por el usuario)
- `brandId` (selector con las marcas existentes)

**Sección 2 — Materias Primas:**
- Lista dinámica de filas. Cada fila contiene:
  - Selector de `RawMaterial` (solo muestra las que aún no han sido agregadas al producto)
  - Campo de texto para la `formula`
- Botón para agregar una nueva fila.
- Botón para eliminar una fila existente.

**Validaciones del Producto:**
- `name` y `code` requeridos.
- `brandId` requerido (debe seleccionarse una marca existente).
- No se puede repetir la misma materia prima en dos filas.
- Cada fila de materia prima debe tener una `formula` no vacía.
- La fórmula se valida como expresión matemática bien formada (ver sección 5).

#### 4.4.3 Eliminar Producto

Confirmación modal antes de borrar definitivamente.

---

## 5. Fórmulas Matemáticas

### 5.1 Definición

La fórmula es una expresión matemática en texto plano escrita por el usuario. Puede contener:

- **Operadores:** `+`, `-`, `*`, `/`, `^` (potencia), paréntesis `( )`
- **Números literales:** enteros o decimales (e.g. `0.5`, `100`)
- **Referencias a variables globales:** usando exactamente el `name` de un `ProductVariable` registrado (e.g. `peso_neto`, `volumen_total`)

**Ejemplos válidos:**
```
peso_neto * 0.05
(volumen_total + 10) / 2
altura * ancho * largo * densidad
100
peso_neto ^ 2 / volumen_total
```

### 5.2 Comportamiento Esperado en el Frontend

- El campo de fórmula es un `<input type="text">` o similar.
- Al escribir, se puede mostrar un autocomplete/sugerencia con las variables globales disponibles.
- Al guardar, se valida que la expresión sea matemáticamente parseable.
- No es necesario evaluar la fórmula en tiempo real; solo validar su sintaxis.

### 5.3 Librería Sugerida para Validación/Evaluación

Se recomienda usar **[mathjs](https://mathjs.org/)** en el frontend para:
- Parsear y validar la expresión.
- Evaluar la expresión dado un conjunto de valores para las variables (funcionalidad futura/opcional).

```ts
import { parse } from 'mathjs';

function validateFormula(formula: string, variableNames: string[]): boolean {
  try {
    const node = parse(formula);
    // Optionally check that all symbols used are in variableNames
    return true;
  } catch {
    return false;
  }
}
```

---

## 6. Estado Global / Gestión de Datos

Dado que es una demo sin backend real, se recomienda manejar el estado con una de las siguientes opciones:

| Opción                  | Descripción                                                  |
|-------------------------|--------------------------------------------------------------|
| **Zustand**             | Store global liviano, ideal para Next.js App Router          |
| **React Context + useReducer** | Solución nativa sin dependencias extra               |
| **localStorage**        | Persistencia entre recargas para la demo                    |

Se sugiere combinar **Zustand** con **localStorage** para persistencia simple en la demo.

### Stores sugeridos:

```ts
// Stores independientes por entidad
useBrandStore        // brands: Brand[]
useRawMaterialStore  // rawMaterials: RawMaterial[]
useProductVariableStore // productVariables: ProductVariable[]
useProductStore      // products: Product[]
```

Cada store expone: `getAll`, `getById`, `create`, `update`, `delete`.

---

## 7. Rutas de la Aplicación (Next.js App Router)

```
/                          → Redirect o dashboard resumen
/brands                    → Listado de marcas
/brands/new                → Crear marca
/brands/[id]/edit          → Editar marca

/raw-materials             → Listado de materias primas
/raw-materials/new         → Crear materia prima
/raw-materials/[id]/edit   → Editar materia prima

/product-variables         → Listado de variables globales
/product-variables/new     → Crear variable
/product-variables/[id]/edit → Editar variable

/products                  → Listado de productos
/products/new              → Crear producto
/products/[id]/edit        → Editar producto
/products/[id]             → Ver detalle de producto (opcional)
```

---

## 8. Componentes UI Clave

| Componente                  | Propósito                                                                 |
|-----------------------------|---------------------------------------------------------------------------|
| `EntityTable`               | Tabla genérica reutilizable con columnas configurables, botones Editar/Eliminar |
| `ConfirmDeleteModal`        | Modal de confirmación antes de borrar cualquier entidad                   |
| `BrandForm`                 | Formulario de creación/edición de marca                                   |
| `RawMaterialForm`           | Formulario de creación/edición de materia prima                           |
| `ProductVariableForm`       | Formulario de creación/edición de variable global                         |
| `ProductForm`               | Formulario principal de producto (datos generales + lista de materias primas) |
| `RawMaterialFormulaRow`     | Fila dentro de `ProductForm` para seleccionar materia prima + ingresar fórmula |
| `FormulaInput`              | Input especializado con validación de expresión matemática y autocomplete de variables |

---

## 9. Validaciones Transversales

| Regla                                    | Entidades afectadas                        |
|------------------------------------------|--------------------------------------------|
| `name` único (case-insensitive)          | `Brand`, `RawMaterial`, `ProductVariable`  |
| `name` no vacío                          | Todas                                      |
| `code` no vacío                          | `Product`                                  |
| `brandId` existente                      | `Product`                                  |
| No duplicar `rawMaterialId` en producto  | `Product.rawMaterials`                     |
| Fórmula matemática válida                | `ProductRawMaterial.formula`               |
| Variable: nombre tipo identificador      | `ProductVariable.name`                     |

---

## 10. Consideraciones de UX

- Al eliminar una `Brand` o `RawMaterial` que esté en uso, mostrar un **mensaje de error explicativo** en lugar de permitir el borrado silencioso.
- El selector de materias primas en el formulario de producto debe **excluir automáticamente** las materias primas ya agregadas al producto actual.
- El campo de fórmula debe mostrar un **hint** o tooltip listando las variables globales disponibles.
- Usar notificaciones (toast) para confirmar operaciones exitosas: "Marca creada", "Producto actualizado", etc.
- Navegación por sidebar o barra superior con acceso a los 4 módulos.

---

## 11. Tecnologías Recomendadas

| Categoría         | Tecnología                  |
|-------------------|-----------------------------|
| Framework         | Next.js 14+ (App Router)    |
| Lenguaje          | TypeScript                  |
| Estilos           | Tailwind CSS                |
| Componentes UI    | shadcn/ui                   |
| Estado global     | Zustand                     |
| Validación forms  | React Hook Form + Zod       |
| Fórmulas          | mathjs                      |
| UUID              | `crypto.randomUUID()` (nativo) o `uuid` npm |
| Persistencia demo | localStorage via Zustand middleware |

---

## 12. Resumen de Entidades y sus CRUDs

| Entidad            | Ruta base           | Campos del formulario                              |
|--------------------|---------------------|----------------------------------------------------|
| `Brand`            | `/brands`           | `name`                                             |
| `RawMaterial`      | `/raw-materials`    | `name`, `type`                                     |
| `ProductVariable`  | `/product-variables`| `name`                                             |
| `Product`          | `/products`         | `name`, `code`, `brandId`, `rawMaterials[]` (con fórmula) |

---

## 13. Identidad Visual y Sistema de Diseño

### 13.1 Concepto

La aplicación es una herramienta **interna de laboratorio cosmético**. El diseño debe transmitir tres valores simultáneamente:

- **Precisión técnica** — Los usuarios son empleados que trabajan con fórmulas y materias primas; la UI no debe distraer.
- **Limpieza** — Superficies blancas, bordes sutiles, sin gradientes ni efectos decorativos.
- **Identidad cosmética** — Un toque de color de marca que diferencia la aplicación sin caer en un estilo genérico o corporativo gris.

El resultado es una interfaz **flat, funcional y con carácter propio** basada en una paleta violeta–lavanda con acentos rosas.

---

### 13.2 Paleta de Colores

#### Colores primarios

| Token / Nombre     | Hex       | Uso principal                                      |
|--------------------|-----------|----------------------------------------------------|
| `Violeta Lab`      | `#7C4DCC` | Color de marca. Botón primario, ítem de nav activo, indicadores de progreso |
| `Lavanda Soft`     | `#F5F0FA` | Fondo del sidebar, fondos secundarios de sección   |
| `Lila 50`          | `#EDE9FB` | Chips, badges informativos, fondos de etiqueta     |
| `Rosa Polvo`       | `#D4A0C0` | Acento cosmético: hover sobre cards, dot de tipo empaquetado |

#### Escala del color primario (violeta)

| Stop  | Hex       | Uso                                  |
|-------|-----------|--------------------------------------|
| `50`  | `#EEEDFE` | Hover muy suave en filas de tabla    |
| `100` | `#CECBF6` | Bordes de focus, badges activos      |
| `400` | `#7F77DD` | Variante media (iconos activos)      |
| `600` | `#7C4DCC` | **Color primario principal**         |
| `800` | `#3C3489` | Texto sobre fondos lila claro        |
| `900` | `#26215C` | Texto de énfasis sobre lavanda       |

#### Colores semánticos

| Propósito      | Hex       | Uso                                             |
|----------------|-----------|-------------------------------------------------|
| Éxito / Verde  | `#1D9E75` | Toast de confirmación, badge "guardado"         |
| Alerta / Coral | `#D85A30` | Botón de eliminar, mensajes de error            |
| Advertencia    | `#BA7517` | Validaciones de formulario, dependencias activas|
| Neutro / Gris  | `#888780` | Texto secundario, bordes de tabla, placeholders |

---

### 13.3 Tipografía

| Elemento            | Tamaño | Peso | Color                  |
|---------------------|--------|------|------------------------|
| Título de página    | 22px   | 500  | `--color-text-primary` |
| Subtítulo / caption | 14px   | 400  | `--color-text-secondary` |
| Label de campo      | 13px   | 500  | `--color-text-primary` |
| Texto de tabla      | 13px   | 400  | `--color-text-primary` |
| Hint / ayuda        | 12px   | 400  | `--color-text-tertiary` |
| Badge / chip        | 11px   | 500  | Color del ramp (ver abajo) |

- Fuente: **Inter** o la sans-serif del sistema (sin fuente decorativa).
- Solo dos pesos: `400` (regular) y `500` (medium). Nunca `600` o `700`.
- Sentence case siempre. Sin ALL CAPS excepto en etiquetas de sección de sidebar (12px, `letter-spacing: 0.05em`).

---

### 13.4 Chips y Badges de Tipo de Materia Prima

El tipo de materia prima se representa visualmente con chips de color diferenciado:

| Tipo          | Fondo     | Texto     | Ejemplo visual                     |
|---------------|-----------|-----------|------------------------------------|
| `chemical`    | `#EDE9FB` | `#4A3099` | `● Químico` en pill violeta suave  |
| `packaging`   | `#FAE8F0` | `#8C2A50` | `● Empaquetado` en pill rosa suave |

Estos chips aparecen en: la tabla de materias primas, el detalle de producto, y las filas del formulario de producto.

---

### 13.5 Layout General

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px)  │  CONTENIDO PRINCIPAL             │
│  bg: #F5F0FA      │  bg: white                       │
│                   │                                  │
│  [Logo / Nombre]  │  ┌──────────────────────────┐   │
│                   │  │ Header de sección         │   │
│  MÓDULOS          │  │ Título + botón Crear       │   │
│  > Productos ●    │  └──────────────────────────┘   │
│    Marcas         │                                  │
│    Materias primas│  ┌──────────────────────────┐   │
│    Variables glob.│  │ Tabla / Formulario        │   │
│                   │  └──────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

- El sidebar tiene **ancho fijo de 240px** en desktop.
- El ítem activo se marca con fondo violeta (`#7C4DCC`) y texto blanco.
- Los ítems inactivos usan texto `#5B3FA0` sobre fondo lavanda.

---

### 13.6 Componentes de Interacción

#### Botones

| Variante    | Estilo                                                                 |
|-------------|------------------------------------------------------------------------|
| Primario    | `bg: #7C4DCC`, `color: white`, `border-radius: 8px`, `padding: 8px 18px` |
| Secundario  | `bg: transparent`, `border: 1.5px solid #7C4DCC`, `color: #7C4DCC`    |
| Peligro     | `bg: #D85A30`, `color: white` (solo para confirmación de eliminación)  |
| Ghost       | Sin borde ni fondo, `color: #7C4DCC` (acciones de baja jerarquía)     |

#### Inputs y Selects

- Altura: `36px`, `border-radius: 8px`.
- Borde en reposo: `0.5px solid #D3D1C7`.
- Borde en focus: `2px solid #7C4DCC` + sin `outline` del browser.
- Label flotante o label fija sobre el campo (no placeholder como único label).

#### Tabla de entidades

- Cabecera: `bg: #F5F0FA`, `font-size: 12px`, `font-weight: 500`, texto en gris.
- Filas alternas: blanco / muy ligero `#FAFAF9`.
- Hover de fila: `bg: #EEEDFE` (lila 50).
- Columna de acciones (derecha): iconos `Editar` (lápiz) y `Eliminar` (papelera), visible en hover.

#### Modal de confirmación de eliminación

- Overlay oscuro `rgba(0,0,0,0.45)`.
- Card centrado, `border-radius: 12px`, `max-width: 420px`.
- Título: "¿Eliminar [nombre de entidad]?"
- Texto explicativo si hay dependencias activas (e.g., "Esta marca está asignada a 3 productos").
- Dos botones: `Cancelar` (secundario) + `Eliminar` (peligro).

#### Toast / Notificaciones

- Posición: esquina inferior derecha.
- Duración: 3 segundos.
- Variantes: éxito (`#1D9E75`), error (`#D85A30`), advertencia (`#BA7517`).
- Formato: icono + mensaje corto. Ej.: `✓ Producto guardado correctamente`.

---

### 13.7 Iconografía

Usar **Tabler Icons** (outline) para consistencia. Asignación por módulo:

| Módulo / Elemento        | Icono Tabler          |
|--------------------------|-----------------------|
| Productos                | `ti-package`          |
| Marcas                   | `ti-trademark`        |
| Materias primas          | `ti-flask`            |
| Variables globales       | `ti-variable`         |
| Crear / Nuevo            | `ti-plus`             |
| Editar                   | `ti-pencil`           |
| Eliminar                 | `ti-trash`            |
| Confirmar / Guardar      | `ti-check`            |
| Fórmula / Expresión      | `ti-math-function`    |
| Tipo: Químico            | `ti-atom`             |
| Tipo: Empaquetado        | `ti-box`              |

---

### 13.8 Microinteracciones y UX

- **Autocomplete de variables en fórmula:** Al escribir en el campo de fórmula, mostrar un dropdown con las variables globales disponibles que coincidan con lo que se está escribiendo. Filtro en tiempo real.
- **Validación inline:** Los errores de formulario aparecen debajo del campo afectado, no en un banner global. Color `#D85A30`, tamaño 12px.
- **Selector de materia prima con búsqueda:** El dropdown para elegir materia prima en el formulario de producto incluye un campo de búsqueda integrado (combobox), dado que la lista puede ser larga.
- **Indicador de fórmula válida:** El campo de fórmula muestra un icono verde (`ti-check`) a la derecha cuando la expresión es matemáticamente válida, o un icono rojo (`ti-alert-circle`) si no lo es.
- **Contador de materias primas:** En el listado de productos, mostrar el número de materias primas como un badge numérico pequeño en violeta.
- **Estado vacío:** Cuando un módulo no tiene registros, mostrar una ilustración simple (SVG inline) con mensaje "Aún no hay [marcas / productos / ...]. Crea el primero." y un botón de acción directo.

---

### 13.9 Responsive

La aplicación es **desktop-first** (uso interno en computadores de laboratorio). No se requiere soporte móvil completo, pero se recomienda:

- En pantallas `< 1024px`: el sidebar se colapsa a iconos solamente (240px → 60px).
- En pantallas `< 768px`: sidebar se convierte en drawer con hamburger menu.
- Tablas: scroll horizontal en contenedor con `overflow-x: auto`.


---

# Anexo UX Complementario

> Este anexo consolida y refuerza algunas decisiones de UX/UI y lineamientos visuales adicionales definidos en el documento `UX.md`.

# Documentación Técnica — Sistema de Gestión de Productos

## 1. Visión General
Aplicación web para la gestión de productos industriales/manufactureros en el sector cosmético. El sistema permite administrar marcas, materias primas, variables globales y la creación de productos mediante fórmulas matemáticas.

* **Enfoque:** Interfaz limpia, técnica y funcional.
* **Tono:** Sistema interno para laboratorio cosmético. Foco en la precisión de los datos.

---

## 2. Identidad Visual (Design System)

### 2.1 Concepto
La interfaz debe transmitir **precisión técnica** y **limpieza**. Se utiliza el violeta como color de marca para aportar un carácter profesional y moderno, alejándose de estéticas puramente decorativas.

### 2.2 Paleta de Colores
| Categoría | Token / Nombre | Hex | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Primario** | **Violeta Lab** | `#7C4DCC` | Color de marca, botones primarios, estado activo. |
| **Fondo Nav** | **Lavanda Soft** | `#F5F0FA` | Fondo del sidebar y secciones secundarias. |
| **Suave** | **Lila 50** | `#EDE9FB` | Chips de tipo químico, badges, hovers suaves. |
| **Acento** | **Rosa Polvo** | `#D4A0C0` | Acento cosmético: Hover en cards, tipo empaquetado. |
| **Éxito** | **Verde Éxito** | `#1D9E75` | Confirmaciones y estados de guardado. |
| **Error** | **Coral Alerta** | `#D85A30` | Acciones de eliminar, errores críticos. |
| **Advertencia**| **Advertencia** | `#BA7517` | Validaciones de fórmulas y dependencias. |
| **Neutro** | **Gris Técnico** | `#888780` | Texto secundario, bordes y placeholders. |

### 2.3 Tipografía
* **Fuente:** Inter o Sans-serif del sistema.
* **Títulos:** 22px, Peso 500.
* **Cuerpo/Tablas:** 13px, Peso 400.
* **Restricción:** Solo se permiten pesos **400 (Regular)** y **500 (Medium)** para mantener la limpieza visual.

---

## 3. Arquitectura de Datos

### 3.1 Entidades Principales
* **Brand (Marca):** `id`, `name`.
* **RawMaterial (Materia Prima):** `id`, `name`, `type` (`chemical` | `packaging`).
* **ProductVariable:** `id`, `name` (formato identificador: `peso_neto`).
* **Product:** `id`, `name`, `code`, `brandId`, `rawMaterials[]`.

### 3.2 Lógica de Fórmulas
Cada producto asocia materias primas mediante una **fórmula matemática** (ej: `peso_neto * 0.15`). 
* Se utiliza **mathjs** para validar la sintaxis en el frontend.
* Las variables utilizadas en la fórmula deben existir en el módulo de Variables Globales.

---

## 4. Estructura de Módulos (Frontend)

### 4.1 Navegación (Sidebar)
* Ancho: **240px**.
* Fondo: `#F5F0FA`.
* Estilo: Los módulos se agrupan bajo el título "MÓDULOS" en *Sentence case*. El ítem activo utiliza fondo `#7C4DCC` con texto blanco.

### 4.2 Tablas de Gestión
* **Estética:** Bordes de `0.5px` en color `#D3D1C7`.
* **Interacción:** Hover de fila en `#EEEDFE`. Acciones (editar/eliminar) visibles solo al pasar el cursor.

### 4.3 Formularios
* **Inputs:** Altura 36px, border-radius 8px.
* **Validación Inline:** Los errores aparecen bajo el campo en `#D85A30` (12px).
* **Selector de Materias Primas:** Filtra automáticamente las materias primas ya agregadas al producto actual.

---

## 5. Componentes UI Clave
* **Status Badges:** * `Químico`: Fondo `#EDE9FB`, Texto `#4A3099`.
    * `Empaquetado`: Fondo `#FAE8F0`, Texto `#8C2A50`.
* **FormulaInput:** Campo de texto con validación en tiempo real e icono de estado (`ti-check` o `ti-alert-circle`).
* **Modales de Confirmación:** Overlay oscuro (`rgba(0,0,0,0.45)`) con foco en la acción de peligro en caso de eliminación.

---

## 6. Stack Tecnológico Recomendado
* **Framework:** Next.js 14+ (App Router).
* **UI/Estilos:** Tailwind CSS + shadcn/ui.
* **Estado:** Zustand con middleware de `persist` (localStorage).
* **Iconografía:** Tabler Icons (outline).
* **Validación:** Zod + React Hook Form.

---

## 7. Reglas de UX Transversales
1.  **Prevención de Errores:** No permitir eliminar Marcas o Materias Primas que estén actualmente en uso por un Producto.
2.  **Retroalimentación:** Uso de Toasts para cada acción exitosa (creación, edición, eliminación).
3.  **Búsqueda:** Los selectores con más de 10 elementos deben incluir un buscador interno (Combobox).

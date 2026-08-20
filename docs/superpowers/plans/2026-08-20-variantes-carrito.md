# Mostrar atributos de la variante en el carrito — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar los atributos de la variante debajo de la descripción en el carrito, y que el botón "Confirmar selección" del selector de variantes agregue cada variante al carrito con su `idproductovariante`, `sku`, `cantidad` y `atributos`.

**Architecture:** `SelectorVariantesProducto.vue` emite `confirmar` con atributos normalizados; `carritoVenta.vue` los recibe y agrega cada variante a `carritoPrueba` y `localStorage`; el slot `body-cell-descripcion` muestra badges; se ajusta el filtro de `cargarProductosDisponibles` para no bloquear segundas variantes.

**Tech Stack:** Vue 3 (script setup), Quasar 2 (q-table, q-badge), Axios, Pinia.

## Global Constraints

- El `idproductovariante` identifica la variante exacta → el item del carrito debe conservarlo y usarlo como parte de su clave.
- Los atributos provienen de la variante, no del producto general (`{ atributo, valor }`).
- No agregar columnas nuevas a la tabla del carrito; el SKU se muestra dentro de la celda de descripción.
- El botón "Añadir al carrito" (flujo manual) se deshabilita cuando existe al menos una variante en el selector.
- Reutilizar la lógica existente de construcción de item/factura de `agregarAlCarrito()` siempre que sea posible.

---

### Task 1: Emitir atributos y SKU desde SelectorVariantesProducto

**Files:**
- Modify: `src/components/venta/SelectorVariantesProducto.vue:288-299` (función `obtenerSeleccion`)

**Interfaces:**
- Consumes: estado interno `seleccionConfirmada` (variantes con `id_producto_variante`, `sku`, `cantidad_seleccionada`, `stock`, `atributos` como `[{ nombre, valor }]`).
- Produces: emit `'confirmar'` con `{ totalVariantes, cantidadTotal, variantes: [{ idVariante, sku, cantidad, stock, atributos: [{ atributo, valor }] }] }`.

- [ ] **Step 1: Modificar la función `obtenerSeleccion()`**

En `src/components/venta/SelectorVariantesProducto.vue`, reemplazar el cuerpo del `map` de variantes para incluir atributos normalizados:

```js
function obtenerSeleccion() {
  return {
    totalVariantes: totalVariantes.value,
    cantidadTotal: cantidadTotal.value,
    variantes: seleccionConfirmada.value.map((v) => ({
      idVariante: v.id_producto_variante,
      sku: v.sku,
      cantidad: v.cantidad_seleccionada,
      stock: v.stock, // opcional
      atributos: (v.atributos || []).map((a) => ({
        atributo: a.nombre,
        valor: a.valor,
      })),
    })),
  }
}
```

- [ ] **Step 2: Verificar el cambio**

Revisar visualmente que `obtenerSeleccion` y `confirmarSeleccion` seguían igual salvo el agregado de `atributos`. No hay test automatizado en el proyecto (`test` = echo). Verificar build: `npx quasar build` no debe arrojar errores de Vue/ESLint en este componente.

- [ ] **Step 3: Commit**

```bash
git add src/components/venta/SelectorVariantesProducto.vue
git commit -m "feat: emit variant attributes from SelectorVariantesProducto"
```

---

### Task 2: `recibirSeleccion` agrega variantes al carrito

**Files:**
- Modify: `src/components/venta/carritoVenta.vue:593-597` (función `recibirSeleccion`)
- Modify: `src/components/venta/carritoVenta.vue:1247-1312` (función `agregarAlCarrito`, se extrae lógica auxiliar)

**Interfaces:**
- Consumes: emit `'confirmar'` de `SelectorVariantesProducto` — `datos = { totalVariantes, cantidadTotal, variantes: [{ idVariante, sku, cantidad, stock, atributos: [{ atributo, valor }] }] }`; `productoSeleccionado.value.originalData` (producto base con `id`, `codigo`, `descripcion`, `precio`, `idstock`, `idporcentaje`, `stock`, `datosAdicionales`, `despachado`); `cantidad.value`, `precioUnitario.value`; funciones `formatear`, `decimas`, `redondear`.
- Produces: items en `carritoPrueba` y `localStorage.listaProductos`/`listaProductosFactura` con `idproductovariante`, `sku`, `atributos`; `subtotal` y `ventatotal` actualizados.

- [ ] **Step 1: Extraer la construcción de item y factura en una función auxiliar**

Refactorizar `agregarAlCarrito()` (líneas ~1247-1286) para que la creación de `nuevoProducto` y `nuevoProductoFactura` quede en una función `crearItemCarrito(producto, cantidad, precio, idproductovariante = null, sku = '', atributos = [])` que retorne ambos objetos. Mantener comportamiento idéntico para el flujo manual.

```js
function crearItemCarrito(producto, cantidadProd, precio, idproductovariante = null, sku = '', atributos = []) {
  const item = {
    idproductoalmacen: producto.id,
    cantidad: Number(cantidadProd),
    precio: formatear(precio),
    idstock: producto.idstock,
    idporcentaje: producto.idporcentaje,
    candiponible: Number(producto.stock),
    descripcion: producto.descripcion,
    descripcionAdicional: '',
    codigo: producto.codigo,
    id: Number(producto.id),
    subtotal: decimas(redondear(parseFloat(cantidadProd) * parseFloat(precio))),
    datosAdicionales: producto.datosAdicionales,
    despachado: Number(producto.stock) == 0 ? 2 : 1,
  }

  if (idproductovariante != null) {
    item.idproductovariante = Number(idproductovariante)
    item.sku = sku
    item.atributos = atributos
    item.id = Number(idproductovariante) // clave única de la variante
  }

  const itemFactura = {
    codigoProducto: producto.codigo,
    codigoActividadSin: producto.actividadsin,
    codigoProductoSin: producto.codigosin,
    descripcion: producto.descripcion,
    unidadMedida: producto.unidadsin,
    precioUnitario: formatear(precio),
    subTotal: decimas(redondear(parseFloat(cantidadProd) * parseFloat(precio))),
    cantidad: Number(cantidadProd),
    numeroSerie: '',
    montoDescuento: 0,
    numeroImei: '',
    codigoNandina: producto.codigonandina,
  }

  if (idproductovariante != null) {
    itemFactura.idproductovariante = Number(idproductovariante)
    itemFactura.sku = sku
  }

  return { item, itemFactura }
}
```

- [ ] **Step 2: Escribir la notificación para variantes**

Agregar función `notificarVariantesAgregadas(total)`, o usar `$q.notify` inline en `recibirSeleccion` con mensaje `'N variantes agregadas al carrito'`.

- [ ] **Step 3: Implementar `recibirSeleccion`**

Reemplazar la función actual (solo `console.log`) por:

```js
function recibirSeleccion(datos) {
  if (!datos || !Array.isArray(datos.variantes) || datos.variantes.length === 0) return

  const carrito = JSON.parse(localStorage.getItem('carrito'))
  const producto = productoSeleccionado.value?.originalData
  if (!producto) return
  carrito.idalmacen = almacenSeleccionado.value?.value

  let subtotalNuevo = parseFloat(carrito.subtotal || 0)

  for (const variante of datos.variantes) {
    const { item, itemFactura } = crearItemCarrito(
      producto,
      variante.cantidad,
      precioUnitario.value || producto.precio,
      variante.idVariante,
      variante.sku,
      variante.atributos || [],
    )

    subtotalNuevo += item.subtotal

    carrito.listaProductos.push(item)
    carrito.listaProductosFactura.push(itemFactura)
    carritoPrueba.value.push(item)
  }

  carrito.subtotal = subtotalNuevo.toFixed(2)
  carrito.ventatotal = (subtotalNuevo - parseFloat(carrito.descuento || 0)).toFixed(2)
  localStorage.setItem('carrito', JSON.stringify(carrito))

  $q.notify({
    type: 'positive',
    message: `${datos.variantes.length} ${datos.variantes.length === 1 ? 'variante agregada' : 'variantes agregadas'} al carrito`,
  })

  resetearCamposProducto()
  productoSeleccionado.value = null
  cargarProductosDisponibles()
}
```

- [ ] **Step 4: Verificar**

Build: `npx quasar build` sin errores. Revisar que el flujo manual (`agregarAlCarrito`) sigue funcionando (no rompió estructura del carrito).

- [ ] **Step 5: Commit**

```bash
git add src/components/venta/carritoVenta.vue
git commit -m "feat: add confirmed variants to cart from variant selector"
```

---

### Task 3: Mostrar badges de atributos en la celda de descripción

**Files:**
- Modify: `src/components/venta/carritoVenta.vue:358-395` (slot `body-cell-descripcion`)

**Interfaces:**
- Consumes: items del carrito con `descripcion` y opcionalmente `atributos: [{ atributo, valor }]`, `sku`.
- Produces: celda de descripción con descripción + badges de atributos y SKU de la variante.

- [ ] **Step 1: Modificar el slot `body-cell-descripcion`**

Dentro de `<q-td :props="props" style="background-color: #f9f9f9; vertical-align: top">`, después del `<div>{{ props.row.descripcion }}</div>` y antes del bloque de descripción adicional, insertar:

```vue
<!-- Atributos de la variante -->
<div
  v-if="props.row.atributos && props.row.atributos.length"
  class="q-mt-xs row q-gutter-xs items-center"
>
  <q-badge v-if="props.row.sku" outline color="primary" :label="props.row.sku" class="q-px-xs" />
  <q-badge
    v-for="attr in props.row.atributos"
    :key="attr.atributo"
    outline
    color="grey-7"
    :label="`${attr.atributo}: ${attr.valor}`"
    class="q-px-xs"
  />
</div>
```

- [ ] **Step 2: Verificar**

Build: `npx quasar build` sin errores. Inspección visual: con un item que tenga `atributos` se ven los badges debajo de la descripción; un item sin variantes no muestra el bloque.

- [ ] **Step 3: Commit**

```bash
git add src/components/venta/carritoVenta.vue
git commit -m "feat: show variant attributes as badges under product description in cart"
```

---

### Task 4: Deshabilitar flujo manual cuando el producto tiene variantes

**Files:**
- Modify: `src/components/venta/carritoVenta.vue:247-310` (panel de stock/cantidad/precio/añadir)
- Modify: `src/components/venta/carritoVenta.vue:646-663` (computed `puedeAgregarProducto`)

**Interfaces:**
- Consumes: selector `selectorRef` con método público `obtenerSeleccion()` que retorna `{ totalVariantes, variantes: [...] }`.
- Produces: computed `productoTieneVariantes`; botón/inputs deshabilitados cuando aplica.

- [ ] **Step 1: Agregar computed `productoTieneVariantes`**

Incluirla cerca de `puedeAgregarProducto`:

```js
const productoTieneVariantes = computed(() => {
  if (!productoSeleccionado.value || !selectorRef.value) return false
  const seleccion = selectorRef.value.obtenerSeleccion()
  return Array.isArray(seleccion.variantes) && seleccion.variantes.length > 0
})
```

- [ ] **Step 2: Actualizar `puedeAgregarProducto`**

Primera línea:

```js
if (productoTieneVariantes.value) return false
```

- [ ] **Step 3: Deshabilitar inputs/botón del flujo manual**

En el template, el `<q-btn id="agregarProductoVenta">` ya tiene `:disable="!puedeAgregarProducto"` → actualizado automáticamente. Verificar que el bloque `v-if="productoSeleccionado"` sigue visible (no se oculta el panel completo).

- [ ] **Step 4: Verificar**

Build sin errores. Con un producto de una sola variante (o sin variantes) el panel manual habilita el botón; con producto de múltiples variantes, el botón queda deshabilitado y se usa "Confirmar selección".

- [ ] **Step 5: Commit**

```bash
git add src/components/venta/carritoVenta.vue
git commit -m "feat: disable manual add to cart when product has variants"
```

---

### Task 5: Filtrar disponibles excluyendo solo la variante exacta ya agregada

**Files:**
- Modify: `src/components/venta/carritoVenta.vue:1127-1137` (filtro en `cargarProductosDisponibles`)

**Interfaces:**
- Consumes: `productosDisponibles` con `id` (idproductoalmacen); `datosCarrito.listaProductos` con `id`, opcional `idproductovariante`.
- Produces: lista de productos que aún se pueden seleccionar (excluye productos base ya agregados y variantes cuyo `idproductovariante` ya esté en el carrito).

- [ ] **Step 1: Ajustar el filtro**

Reemplazar el bloque de filtrado:

```js
if (datosCarrito.listaProductos.length > 0) {
  const idsProductoEnCarrito = new Set(
    datosCarrito.listaProductos
      .filter((u2) => u2.idproductovariante == null)
      .map((u2) => Number(u2.id)),
  )
  const idsVarianteEnCarrito = new Set(
    datosCarrito.listaProductos
      .filter((u2) => u2.idproductovariante != null)
      .map((u2) => Number(u2.idproductovariante)),
  )

  productosDisponibles = productosDisponibles.filter((u) => {
    if (idsProductoEnCarrito.has(Number(u.id))) return false
    // Si este producto tiene variantes registradas, el producto base puede
    // seguir apareciendo: solo se excluye si se coincide la variante exacta,
    // lo cual se valida en el selector contra la lista del carrito.
    return true
  })
}
```

Nota: la exclusión fina de variantes (que el selector no ofrezca una variante ya agregada) vive dentro de `SelectorVariantesProducto.vue`; en el listado de productos el producto base debe seguir disponible para poder seleccionar otras combinaciones.

- [ ] **Step 2: Excluir variantes ya agregadas en el selector**

En `src/components/venta/SelectorVariantesProducto.vue`, después de mapear `variantes.value`, filtrar las que ya estén en `localStorage.carrito.listaProductos` por `idproductovariante`:

```js
const carrito = JSON.parse(localStorage.getItem('carrito')) || { listaProductos: [] }
const idsVariantesUsadas = new Set(
  (carrito.listaProductos || [])
    .filter((p) => p.idproductovariante != null)
    .map((p) => Number(p.idproductovariante)),
)
variantes.value = variantes.value.map((v) => ({
  ...v,
  deshabilitada: idsVariantesUsadas.has(Number(v.id_producto_variante)),
}))
```

Y en el template de la columna selección, el `q-checkbox`:

```vue
<q-checkbox
  v-model="props.row.seleccionada"
  @update:model-value="onCheckboxChange(props.row)"
  :disable="props.row.stock <= 0 || props.row.deshabilitada"
/>
```

- [ ] **Step 3: Verificar**

Build sin errores. Flujo E2E manual: agregar "Camisa Oxford / Color Azul" al carrito → el producto sigue disponible para agregar "Camisa Oxford / Verde"; la variante Azul ya no es seleccionable en el selector.

- [ ] **Step 4: Commit**

```bash
git add src/components/venta/carritoVenta.vue src/components/venta/SelectorVariantesProducto.vue
git commit -m "feat: allow adding multiple variants of same product and exclude selected variant"
```

---

### Task 6: Verificación final y cierre

**Files:**
- None (verificación global)

- [ ] **Step 1: Revisar build completo**

Run: `npx quasar build` — sin errores.

- [ ] **Step 2: Prueba manual E2E**

1. Seleccionar almacén y categoría de precio.
2. Buscar un producto con variantes (ej. Camisa Oxford).
3. En el selector, marcar variantes y cantidades → "Confirmar selección".
4. Verificar en la tabla: descripción, SKU y badges de atributos debajo, cantidad por fila, subtotales correctos.
5. Agregar otra combinación del mismo producto → debe permitirse; la variante ya usada debe verse deshabilitada en el selector.
6. Flujo manual (producto sin variantes): sigue agregando con el botón "Añadir al carrito".
7. `localStorage.carrito.listaProductos` debe incluir `idproductovariante`, `sku`, `atributos`.

- [ ] **Step 3: Commit final de cierre (si queda algún ajuste)**

```bash
git add -A
git commit -m "chore: final verification fixes"
```
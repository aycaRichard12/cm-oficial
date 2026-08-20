# Mostrar atributos de la variante debajo de la descripción en el carrito

Fecha: 2026-08-20
Ámbito: `src/components/venta/carritoVenta.vue`, `src/components/venta/SelectorVariantesProducto.vue`

## Objetivo

Cuando un producto agregado al carrito corresponde a una variante, sus atributos deben mostrarse debajo de la descripción del producto (celda Descripción) mediante `q-badge`, y cada item del carrito debe conservar su `idproductovariante` para identificar la variante exacta.

Data flow: el SelectorVariantesProducto emite la confirmación de variantes y `carritoVenta` agrega cada variante confirmada al carrito.

## Flujo de variantes (decisión del usuario)

El botón **Confirmar selección** del selector agrega cada variante seleccionada como un item del carrito con su `idproductovariante`, `sku`, `cantidad` y `atributos`. El flujo manual (cantidad + precio + "Añadir al carrito") queda **deshabilitado** cuando el producto tiene variantes; solo aplica para productos sin variantes.

## 1. `SelectorVariantesProducto.vue` — emitir atributos

`obtenerSeleccion()` emite por variante `{ idVariante, sku, cantidad, stock }` sin atributos. Se agregará `atributos` normalizados al formato `[{ atributo, valor }]`:

```js
variantes: seleccionConfirmada.value.map((v) => ({
  idVariante: v.id_producto_variante,
  sku: v.sku,
  cantidad: v.cantidad_seleccionada,
  stock: v.stock,
  atributos: (v.atributos || []).map((a) => ({ atributo: a.nombre, valor: a.valor })),
}))
```

Los atributos provienen de la variante (no del producto general), permitiendo que el mismo producto aparezca varias veces con combinaciones distintas.

## 2. `carritoVenta.vue` — `recibirSeleccion()` agrega al carrito

Por cada variante confirmada:
- Crear un item con:
  - `idproductovariante` (map a `idVariante`)
  - `sku`
  - `cantidad` (cantidad seleccionada de la variante)
  - `atributos` (`[{ atributo, valor }]`)
  - Datos del producto base: `idproductoalmacen` (`productoSeleccionado.originalData.id`), `codigo`, `descripcion`, `precio`, `idporcentaje`, `idstock`, `candiponible`, `despachado`, `datosAdicionales`, `subtotal`
- `id` único del item basado en `idproductovariante` (para permitir el mismo producto con distintas combinaciones).
- Agregar a `carritoPrueba` y `localStorage.listaProductos` (+ `listaProductosFactura`), recalculando `subtotal` y `ventatotal`.
- Reutilizar la lógica existente de construcción de item y de factura (similar a `agregarAlCarrito`).

## 3. `carritoVenta.vue` — badges de atributos

En el slot `body-cell-descripcion`: la descripción primero y debajo los badges de atributos de la variante:

```vue
<div class="descripcion">{{ props.row.descripcion }}</div>
<div v-if="props.row.atributos && props.row.atributos.length" class="q-mt-xs row q-gutter-xs items-center">
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

## 4. `cargarProductosDisponibles()` — no bloquear variantes

El filtro actual excluye un producto del listado si su `id` ya está en el carrito (`Number(u.id) === Number(u2.id)`), lo que impediría agregar una segunda variante del mismo producto. Se ajustará para excluir por **combinación de variante**:
- Si el item del carrito tiene `idproductovariante`, excluir solo si coincide con el `idproductovariante` ya agregado.
- Si es producto sin variantes, mantener la exclusión por `id`.

## 5. Descuento de stock

Cada variante se procesa independientemente: la cantidad queda asociada a su `idproductovariante`, informada en `listaProductos` para afectar correctamente el stock.

## 6. Resultado visual en la tabla

```text
Camisa Oxford                       CAM-AZ-40        2
[Color: Azul] [Talla: 40]

Camisa Oxford                       CAM-VE-40        1
[Color: Verde] [Talla: 40]
```

Los atributos se muestran debajo de la descripción, no en columna adicional. La tabla actual no tiene columna SKU, por lo que el `sku` de la variante se muestra dentro de la celda de descripción (motivo técnico del diseño, evitando agregar columnas al layout existente).

## Consideraciones

- El botón "Añadir al carrito" (flujo manual) se deshabilita cuando el producto seleccionado tiene variantes.
- La funcionalidad del selector ya fue corregida previamente (watcher en `idProducto`), por lo que carga datos correctamente al seleccionar producto.
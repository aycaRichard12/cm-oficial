# Variantes en CotizacionPage — Plan de Implementación

## Estado actual (diagnóstico)

`CotizacionPage.vue` ya tiene esqueleto parcial de variantes, pero **incompleto**:

| Pieza | carritoVenta.vue | CotizacionPage.vue |
|---|---|---|
| `SelectorVariantesProducto` importado | ✅ | ✅ |
| `ConfiguracionProductoVariante` ref | ✅ | ✅ (siempre `false`) |
| `fetchEstadoActual` que la activa | ✅ (`fetchEstadoActualProductoVariante`) | ⚠️ Solo carga `soloAlmacen`, **no** `ConfiguracionProductoVariante` |
| `selectorRef` + `productoTieneVariantes` | ✅ | ✅ |
| `recibirSeleccionCotizacion` | ✅ (`recibirSeleccion`) | ⚠️ Existe (L2702) pero **el precio de variante se ignora** — usa `precioCO.value` sin leer `variante.precio` |
| `disabledVariantsCotizacion` computed | ✅ | ✅ |
| `calcularTotalesCarrito` usa precio correcto | ✅ | ⚠️ Solo lee `producto.precio` fijo, no por variante |
| `enviarDatos` incluye `idproductovariante` en payload | ✅ | ⚠️ Se serializa en `carritoCO` pero no explícito en `FormData` |
| Badge/chips de atributos en tabla | ✅ | ❌ Falta mostrar `sku` y `atributos` en la tabla de resumen |
| Reset inputs tras agregar variante | ✅ | ✅ (llama `resetProductoInputs`) |

## Cambios propuestos

---

### `CotizacionPage.vue`

#### [MODIFY] [CotizacionPage.vue](file:///g:/quasar/dess/comercial/cm-oficial/src/pages/cotizacion/CotizacionPage.vue)

**1. `fetchEstadoActual` — Activar `ConfiguracionProductoVariante`** (L2658–2666)

Agregar la llamada al endpoint de variantes dentro de `fetchEstadoActual` o en el `onMounted` justo después.

```diff
- const fetchEstadoActual = async () => {
-   try {
-     const { data } = await api.get(`configuracionclientesAlmacenEstadoActual/${idempresa}`)
-     soloAlmacen.value = data.clientesAlmacen ?? data ?? false
-   } catch (error) {
-     console.log(error)
-   }
- }
+ const fetchEstadoActual = async () => {
+   try {
+     const { data } = await api.get(`configuracionclientesAlmacenEstadoActual/${idempresa}`)
+     soloAlmacen.value = data.clientesAlmacen ?? data ?? false
+   } catch (error) {
+     console.log(error)
+   }
+   try {
+     const { data } = await api.get(`configuracionProductoVarianteEstadoActual/${idempresa}`)
+     ConfiguracionProductoVariante.value = data.ProductoVariante ?? data ?? false
+   } catch (error) {
+     console.log(error)
+   }
+ }
```

**2. `recibirSeleccionCotizacion` — Precio de variante** (L2714–2734)

El campo `variante.precio` viene del `SelectorVariantesProducto` (ver cómo lo emite). Actualmente `precio: precioCO.value || producto.precio` ignora el precio específico de la variante. Corregir:

```diff
- precio: precioCO.value || producto.precio,
+ precio: variante.precio ?? precioCO.value ?? producto.precio,
```

**3. Tabla de resumen — badges de atributos en columna `descripcion`** (L547–590)

Agregar chips de `sku` y `atributos` debajo de la descripción, idéntico al slot de carritoVenta:

```html
<!-- Dentro del q-td key="descripcion" -->
<div
  v-if="props.row.atributos?.length"
  class="q-mt-xs row q-gutter-xs items-center"
>
  <q-badge
    v-if="props.row.sku"
    outline color="primary"
    :label="props.row.sku"
    class="q-px-xs"
  />
  <q-badge
    v-for="attr in props.row.atributos"
    :key="attr.atributo"
    outline color="grey-7"
    :label="`${attr.atributo}: ${attr.valor}`"
    class="q-px-xs"
  />
</div>
```

**4. `calcularTotalesCarrito` — ya es correcto** (L2322)

Usa `producto.precio * producto.cantidad`. Dado que `nuevoProducto.precio` ya se asigna desde la variante (tras fix #2), **no requiere cambios**.

**5. `enviarDatos` payload — incluir variante explícitamente** (L2429)

El carrito completo ya se serializa con `JSON.stringify(carritoCO)`, que incluye `idproductovariante`, `sku` y `atributos` en cada ítem de `listaProductos`. **No se requiere cambio**, pero se documenta como verificación.

**6. Quick Consult restore — preservar variante** (L2796–2809)

Al mapear productos desde Quick Consult, agregar los campos de variante:

```diff
  carritoCO.listaProductos = data.listaProductos.map((p, index) => ({
    num: index + 1,
    idproductoalmacen: p.idproductoalmacen,
    cantidad: p.cantidad,
    precio: p.precio,
    idstock: p.idstock,
    idporcentaje: p.idporcentaje,
    candiponible: p.stock,
    descripcion: p.descripcion,
    descripcionAdicional: p.descripcionAdicional || '',
    codigo: p.codigo,
    despachado: p.despachado,
    codigosUnicos: p.codigosUnicos || [],
+   ...(p.idproductovariante != null && {
+     idproductovariante: p.idproductovariante,
+     sku: p.sku || '',
+     atributos: p.atributos || [],
+     id: p.idproductovariante,
+   }),
  }))
```

## Verificación

- [ ] Seleccionar producto con variantes → `SelectorVariantesProducto` aparece
- [ ] Confirmar variantes → ítem en tabla con badges de atributos
- [ ] Subtotal/total reflejan precio de variante
- [ ] `enviarDatos` → payload JSON contiene `idproductovariante`, `sku`, `atributos`
- [ ] Producto sin variantes → flujo normal sin cambios

> [!IMPORTANT]
> Confirmar que `SelectorVariantesProducto` emite `variante.precio` en el evento `confirmar`. Si no lo emite, el fix #2 no aplica y el precio debe mantenerse como `precioCO.value`.

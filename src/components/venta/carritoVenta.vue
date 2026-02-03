<template>
  <div>
    <div>
    <q-card class="my-card q-mb-md">
      <div
        class="bg-primary text-white q-py-lg q-bar--dense"
        style="display: flex; justify-content: space-between; align-items: center"
      >
        <div class="col flex justify-start">
          <div class="text-weight-bold btn-res" style="font-size: 15px">
            <q-icon name="shopping_cart" size="15px" class="q-mr-sm icono" />
            <span class="texto">Procesar Venta</span>
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            color="accent"
            @click="handleBack"
            :disable="carritoPrueba.length === 0"
            rounded
            unelevated
            class="btn-res"
            size="15px"
          >
            <q-icon name="arrow_forward" class="icono" />
            <span class="texto">Continuar</span>
          </q-btn>
        </div>
      </div>
    </q-card>

    <div class="my-card q-mb-md">
      <div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <label for="almacen">Origen de venta</label>
            <q-select
              v-model="almacenSeleccionado"
              :options="almacenes"
              id="almacen"
              map-options
              :loading="cargandoAlmacenes"
              @update:model-value="cargarCategoriasPrecio"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="store" color="primary" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <label for="categoria">Categoría de precio</label>
            <q-select
              v-model="categoriaPrecioSeleccionada"
              :options="categoriasPrecio"
              id="categoria"
              emit-value
              map-options
              :loading="cargandoCategorias"
              :disable="!almacenSeleccionado"
              @update:model-value="cargarProductosDisponibles"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3" v-if="mostrarCategoriasCampania">
            <label for="campana">Categorías con Campaña</label>
            <q-select
              v-model="categoriaCampaniaSeleccionada"
              :options="categoriasCampania"
              id="campana"
              emit-value
              map-options
              :disable="!categoriaPrecioSeleccionada"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="campaign" color="accent" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3 flex items-center">
            <q-checkbox v-model="mostrarCategoriasCampania" color="accent">
              <template v-slot:default>
                <div class="flex items-center text-grey-8">
                  <q-icon name="campaign" color="accent" class="q-mr-sm" />
                  <span>Mostrar Categorías con Campaña</span>
                </div>
              </template>
            </q-checkbox>
          </div>
        </div>
      </div>
    </div>

    <div class="my-card q-mb-md">
      <div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-10">
            <label for="producto">Buscar producto (código o descripción)</label>
            <q-select
              v-model="productoSeleccionado"
              :options="productosFiltrados"
              use-input
              @filter="filtrarProductos"
              id="producto"
              option-label="label"
              option-value="value"
              @update:model-value="seleccionarProducto"
              :loading="cargandoProductos"
              :disable="!categoriaPrecioSeleccionada"
              clearable
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append>
                <q-btn
                  icon="refresh"
                  color="primary"
                  :disable="!almacenSeleccionado"
                  title="Refrescar Productos"
                  @click="cargarProductosDisponibles"
                  flat
                  round
                />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{
                      categoriaPrecioSeleccionada
                        ? 'No se encontraron productos'
                        : 'Seleccione una categoría primero'
                    }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="q-ma-md flex justify-around" style="width: 80px; height: 80px">
            <q-img
              :src="imagen + productoSeleccionado?.originalData?.imagen || null"
              @click="mostrarGrande = true"
              style="max-width: 70px; max-height: 70px; cursor: pointer"
              spinner-color="primary"
            >
              <template v-slot:error>
                <div
                  class="column items-center justify-center bg-grey-3"
                  style="height: 100%; width: 100%"
                >
                  <q-icon name="image_not_supported" size="md" color="grey-7" />
                </div>
              </template>
            </q-img>

            <q-dialog v-model="mostrarGrande">
              <q-card class="responsive-dialog">
                <q-card-section class="bg-primary text-white text-h6 flex justify-between">
                  <div>Vista previa de imagen</div>
                  <q-btn icon="close" flat dense round @click="mostrarGrande = false" />
                </q-card-section>
                <q-card-section>
                  <q-img
                    :src="imagen + productoSeleccionado?.originalData?.imagen || null"
                    style="max-width: 100%; max-height: 100%"
                    spinner-color="primary"
                  />
                </q-card-section>
              </q-card>
            </q-dialog>
          </div>
        </div>

        <div v-if="productoSeleccionado" class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-sm-3">
            <label for="stockdisponible">Stock disponible</label>
            <q-input
              v-model="productoSeleccionado.originalData.stock"
              id="stockdisponible"
              readonly
              outlined
              dense
              style="text-align: end"
            >
            </q-input>
          </div>

          <div class="col-12 col-sm-3">
            <label for="cantidad">Cantidad</label>
            <q-input
              v-model.number="cantidad"
              id="cantidad"
              type="number"
              :rules="[
                (val) => val > 0 || 'Ingrese cantidad válida',
                (val) => val <= productoSeleccionado.originalData.stock || 'Supera el stock',
              ]"
              outlined
              dense
            >
            </q-input>
          </div>

          <div class="col-12 col-sm-3">
            <label for="precio">Precio unitario</label>
            <q-input
              v-model="precioUnitario"
              id="precio"
              :prefix="currencyStore.simbolo"
              :rules="[(val) => val > 0 || 'Ingrese precio válido']"
              outlined
              dense
              type="number"
            >
            </q-input>
          </div>

          <div class="col-12 col-md-3 flex justify-end q-mt-lg">
            <q-btn
              color="primary"
              @click="agregarAlCarrito"
              class="btn-res"
              :disable="!puedeAgregarProducto"
            >
              <q-icon name="add" class="icono" />
              <span class="texto">Añadir al carrito</span>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <div class="row items-center q-gutter-sm">
      <q-label class="text-subtitle2">Venta sin stock</q-label>
      <q-btn
        :icon="permitirStock ? 'toggle_on' : 'toggle_off'"
        dense
        flat
        :color="permitirStock ? 'green' : 'grey'"
        :title="permitirStock ? 'Desactivar venta sin stock' : 'Activar venta sin stock'"
        @click="permitirStockvacio()"
      />
    </div>
    <q-table
      :rows="carritoPrueba"
      :columns="columnasCarrito"
      row-key="id"
      flat
      title="Lista de items cargados"
      no-data-label="Aún no se han añadido productos"
    >
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn icon="delete" color="negative" flat round @click="eliminarDelCarrito(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-descripcion="props">
        <q-td :props="props" style="background-color: #f9f9f9; vertical-align: top">
          <!-- Descripción principal -->
          <div>{{ props.row.descripcion }}</div>

          <!-- Descripción adicional editable debajo -->
          <div
            style="
              margin-top: 4px;
              font-size: 0.9em;
              color: #555;
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <q-popup-edit v-model="props.row.descripcionAdicional" v-slot="scope">
              <label for="desAdicional">Añadir Descripción Adicional</label>
              <q-input
                v-model="scope.value"
                outlined
                dense
                id="desAdicional"
                autofocus
                type="text"
                @keyup.enter="validarDescripcion(scope, props.row)"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit>

            <!-- Mostrar valor actual y el ícono de editar -->

            <span style="margin-left: 4px">{{ props.row.descripcionAdicional }}</span>
            <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
          </div>
        </q-td>
      </template>

      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="5" class="text-right text-weight-bold text-grey-8">
            <q-icon name="receipt" color="primary" class="q-mr-sm" />
            Sub Total:
          </q-td>
          <q-td class="text-center text-weight-bold text-primary"
            >{{ currencyStore.simbolo }}{{ subTotal }}</q-td
          >
        </q-tr>
        <q-tr>
          <q-td colspan="5" class="text-right text-weight-bold text-grey-8">
            <q-icon name="discount" color="accent" class="q-mr-sm" />
            Descuento:
          </q-td>
          <q-td class="text-center">
            <q-input
              v-model.number="descuento"
              dense
              outlined
              style="max-width: 100px"
              :prefix="currencyStore.simbolo"
              @update:model-value="calcularTotal"
              color="accent"
            >
            </q-input>
          </q-td>
        </q-tr>
        <q-tr>
          <q-td colspan="5" class="text-right text-weight-bold text-grey-8">
            <q-icon name="payments" color="green-8" class="q-mr-sm" />
            Total:
          </q-td>
          <q-td class="text-center text-weight-bold text-h6 text-green-8"
            >{{ currencyStore.simbolo }}{{ total }}</q-td
          >
        </q-tr>
      </template>
    </q-table>
  </div>
    <RegistrarAlmacenDialog
    v-model="showWarningDialog"
    title="¡Advertencia!"
    message="No tienes un almacén asignado. Para desbloquear las funcionalidades del sistema, debes crear y asignarte un almacén o asignar un almacén y un punto de venta a otros usuarios."
    @accepted="redirectToAssignment"
    @closed="redirectToAssignment"
  />
  </div>
</template>

<style scoped>
.my-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.bg-gradient {
  background: linear-gradient(to right, #219286, #044e49);
}

.text-white {
  color: #ffffff;
}

.text-grey-8 {
  color: #424242;
}

.text-primary {
  color: #219286 !important;
}

.text-accent {
  color: #f2c037 !important;
}

.bg-grey-1 {
  background-color: #f5f5f5;
}

.q-table {
  border-radius: 8px;
  overflow: hidden;
}

.q-table th {
  font-weight: bold;
  background-color: #f0f0f0;
  color: #424242;
}

.q-btn {
  font-weight: 500;
  text-transform: none;
}

/* Typography */
body {
  font-family: 'Roboto', 'Open Sans', 'Lato', sans-serif;
}
</style>

<script setup>
import { ref, computed, onMounted, defineExpose, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useCurrencyStore, useCurrencyLeyenda } from 'src/stores/currencyStore'
import { imagen } from 'src/boot/url'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'
import { useRouter } from 'vue-router'
// import { showDialog } from 'src/utils/dialogs'
const currencyStore = useCurrencyStore()
const divisaActiva = useCurrencyStore()
const leyendaActiva = useCurrencyLeyenda()
leyendaActiva.cargarLeyendaActivo()

console.log(divisaActiva)
console.log(leyendaActiva)
const permitirStock = ref(false)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()
const mostrarGrande = ref(false)
const emit = defineEmits(['reiniciar', 'volver'])

const limpiarCarrito = async () => {
  // Limpiar arrays y objetos
  emit('reiniciar')
}

defineExpose({
  limpiarCarrito,
})
// Datos del usuario y empresa (simulados)
const usuario = ref({
  idusuario: idusuario,
  empresa: {
    idempresa: idempresa,
    nombre: 'Mi Empresa SA',
  },
})

const handleBack = () => {
  try {
    continuarVenta()
    emit('volver') // Esto activará el toggle en el padre
  } catch (error) {
    console.error('Error al continuar venta:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al procesar los datos para continuar.',
    })
  }
}
// Estado del componente
const almacenSeleccionado = ref(null)
const categoriaPrecioSeleccionada = ref(null)
const categoriaCampaniaSeleccionada = ref(null)
const mostrarCategoriasCampania = ref(false)
const productoSeleccionado = ref(null)
const cantidad = ref(1)
const precioUnitario = ref(0)
const descuento = ref(0)
const carritoPrueba = ref([])

// Estados de carga
const cargandoAlmacenes = ref(false)
const cargandoCategorias = ref(false)
const cargandoProductos = ref(false)

// Datos ficticios
const almacenes = ref([])
const categoriasPrecio = ref([])
const categoriasCampania = ref([])
const productos = ref([])
const productosFiltrados = ref([])
const showWarningDialog = ref(false)
const router = useRouter()

// Columnas para la tabla del carritoPrueba sucursal
const columnasCarrito = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  {
    name: 'precio',
    label: 'Precio Unit.',
    field: 'precio',
    align: 'right',
    format: (val) => ` ${currencyStore.simbolo} ${Number(val).toFixed(2)}`, //${val.toFixed(2)}
  },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
    format: (val) => `${currencyStore.simbolo} ${val.toFixed(2)}`,
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const validarDescripcion = async (scope, row) => {
  console.log(scope.value)

  let carrito = JSON.parse(localStorage.getItem('carrito'))

  if (carrito && carrito.listaProductos) {
    carrito.listaProductos = carrito.listaProductos.map((prod) => {
      // Agregar o editar la descripción adicional
      if (Number(prod.id) == Number(row.idproductoalmacen)) {
        prod.descripcionAdicional = scope.value
      }
      return prod
    })

    localStorage.setItem('carrito', JSON.stringify(carrito))
    console.log('Descripción adicional actualizada correctamente ')
  } else {
    console.warn('No se encontró la lista de productos en el localStorage')
  }

  scope.set()
}

// Computed properties
const puedeAgregarProducto = computed(() => {
  const producto = productoSeleccionado.value
  const cantidadValida = cantidad.value > 0
  const precioValido = precioUnitario.value > 0

  if (!producto || !cantidadValida || !precioValido) {
    return false
  }

  if (permitirStock.value) {
    // Se permite agregar incluso si no hay stock
    return true
  }

  // Solo permitir si la cantidad es menor o igual al stock
  return cantidad.value <= producto.originalData.stock
})

const permitirStockvacio = () => {
  permitirStock.value = !permitirStock.value
  if (!permitirStock.value) {
    const datos = JSON.parse(localStorage.getItem('carrito')) || {}

    const productos = Array.isArray(datos.listaProductos) && datos.listaProductos.length > 0

    const facturados =
      Array.isArray(datos.listaProductosFactura) && datos.listaProductosFactura.length > 0

    const carrito = Array.isArray(carritoPrueba.value) && carritoPrueba.value.length > 0

    if (carrito || facturados || productos) {
      emit('reiniciar')
    }
  }
}

const subTotal = computed(() => {
  return carritoPrueba.value.reduce((sum, item) => sum + item.subtotal, 0)
})

const total = computed(() => {
  console.log('SubTotal:', subTotal.value)
  console.log('Descuento:', descuento.value)
  const datos = JSON.parse(localStorage.getItem('carrito')) || {}
  datos.subTotal = subTotal.value.toFixed(2)
  datos.descuento = descuento.value.toFixed(2)
  datos.ventatotal = (parseFloat(datos.subtotal) - parseFloat(datos.descuento)).toFixed(2)
  localStorage.setItem('carrito', JSON.stringify(datos))

  return subTotal.value - descuento.value
})

// Métodos
async function cargarAlmacenes() {
  try {
    cargandoAlmacenes.value = true
    const endpoint = `/listaResponsableAlmacen/${usuario.value.empresa.idempresa}`
    const { data } = await api.get(endpoint)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar almacenes')
    console.log(data)
    // Filtrar por usuario y mapear
    const filter = data
      .filter((item) => item.idusuario == usuario.value.idusuario)
      .map((item) => ({
        label: item.almacen,
        value: item.idalmacen,
        codigosin: item.sucursales[0]?.codigosin || '',
      }))
    if (filter.length === 0) {
      showWarningDialog.value = true
    }
    almacenes.value = filter
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes disponibles',
    })
  } finally {
    cargandoAlmacenes.value = false
  }
}

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}

//permitirStockvacio carrito
async function cargarCategoriasPrecio() {
  if (almacenSeleccionado.value) {
    const datos = JSON.parse(localStorage.getItem('carrito'))

    const almacen = almacenSeleccionado.value

    datos.idalmacen = almacen.value

    datos.codigosinsucursal = almacenSeleccionado.value?.codigosin
    localStorage.setItem('carrito', JSON.stringify(datos))
    try {
      cargandoCategorias.value = true
      categoriaPrecioSeleccionada.value = null
      categoriasPrecio.value = []

      const endpoint = `/listaCategoriaPrecio/${usuario.value.empresa.idempresa}`
      const { data } = await api.get(endpoint)

      if (data[0] === 'error') throw new Error(data.error || 'Error al cargar categorías')

      categoriasPrecio.value = data
        .filter((item) => item.estado == 1 && item.idalmacen == almacenSeleccionado.value?.value)
        .map((item) => ({
          label: item.nombre,
          value: item.id,
        }))
      reinicia()
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar las categorías de precio',
      })
    } finally {
      cargandoCategorias.value = false
    }
  } else {
    console.error('Almacén seleccionado es nulo, no se pueden cargar categorías.')
  }
}
watch(
  () => almacenes.value,
  async (almacenes) => {
    // Si la lista de almacenes no está vacía y no hay uno seleccionado...
    if (almacenes.length > 0 && !almacenSeleccionado.value) {
      almacenSeleccionado.value = almacenes[0]

      // Ahora que tenemos un almacén, cargamos las categorías.
      try {
        // Inside your cargarCategoriasPrecio() or related function

        await cargarCategoriasPrecio()

        // Si las categorías se cargaron correctamente y hay alguna...
        if (categoriasPrecio.value.length > 0) {
          categoriaPrecioSeleccionada.value = categoriasPrecio.value[0].value

          // Y finalmente, cargamos los productos.
          cargarProductosDisponibles()
        }
      } catch (error) {
        // Manejo de errores: ¿Qué pasa si la llamada a la API falla?
        console.error('Error al cargar categorías o productos:', error)
      }
    }
  },
  { immediate: true },
)

// Los otros dos `watch` ya no son necesarios.)

function reinicia() {
  const datos = JSON.parse(localStorage.getItem('carrito')) || {}

  const productos = Array.isArray(datos.listaProductos) && datos.listaProductos.length > 0

  const facturados =
    Array.isArray(datos.listaProductosFactura) && datos.listaProductosFactura.length > 0

  const carrito = Array.isArray(carritoPrueba.value) && carritoPrueba.value.length > 0

  if (carrito || facturados || productos) {
    emit('reiniciar')
  }
}
// async function cargarCategoriaCampaña() {
//   const datos = JSON.parse(localStorage.getItem('carrito'))
//   datos.idalmacen = almacenSeleccionado.value?.value
//   datos.codigosinsucursal = almacenSeleccionado.value?.codigosin
//   localStorage.setItem('carrito', JSON.stringify(datos))

//   console.log(almacenSeleccionado.value?.codigosin)
//   try {
//     cargandoCategorias.value = true
//     categoriaPrecioSeleccionada.value = null
//     categoriasPrecio.value = []

//     const endpoint = `/listaCategoriaPrecio/${usuario.value.empresa.idempresa}`
//     const { data } = await api.get(endpoint)

//     if (data[0] === 'error') throw new Error(data.error || 'Error al cargar categorías')

//     categoriasPrecio.value = data
//       .filter((item) => item.estado == 1 && item.idalmacen == almacenSeleccionado.value?.value)
//       .map((item) => ({
//         label: item.nombre,
//         value: item.id,
//       }))
//   } catch (error) {
//     console.error('Error al cargar categorías:', error)
//     $q.notify({
//       type: 'negative',
//       message: 'Error al cargar las categorías de precio',
//     })
//   } finally {
//     cargandoCategorias.value = false
//   }
// }
async function cargarProductosDisponibles() {
  try {
    cargandoProductos.value = true
    productos.value = []
    productoSeleccionado.value = null

    // Simular datos del carritoPrueba en localStorage
    const datos = JSON.parse(localStorage.getItem('carrito'))
    console.log(datos.listaProductos)
    const datosCarrito = datos
    const idporcentajeventa = categoriaPrecioSeleccionada.value

    const endpoint = `/listaProductosDisponiblesVenta/${usuario.value.empresa.idempresa}`
    const { data } = await api.get(endpoint)
    console.log(data)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar productos')

    // Filtrar productos como en la lógica original
    let productosDisponibles = data.datos.filter((u) => u.idporcentaje == idporcentajeventa)
    console.log(productosDisponibles, datosCarrito.listaProductos)
    if (datosCarrito.listaProductos.length > 0) {
      productosDisponibles = productosDisponibles.filter(
        (u) =>
          !datosCarrito.listaProductos.some((u2) => {
            console.log(u2, u)
            return Number(u.id) === Number(u2.id)
          }),
      )
    }
    console.log(productosDisponibles)
    // Mapear para el selector
    productos.value = productosDisponibles.map((producto) => ({
      label: `${producto.codigo} - ${producto.descripcion}`,
      value: producto.id,
      originalData: {
        ...producto,
        datosAdicionales: `${producto.codigosin}-${producto.actividadsin}-${producto.unidadsin}-${producto.codigonandina}`,
      },
    }))

    productosFiltrados.value = [...productos.value]
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los productos disponibles',
    })
  } finally {
    cargandoProductos.value = false
  }
}

function filtrarProductos(val, update) {
  update(() => {
    if (val === '') {
      console.log(productosFiltrados.value, productos.value)
      productosFiltrados.value = productos.value
    } else {
      const searchTerm = val.toLowerCase()
      productosFiltrados.value = productos.value.filter((v) =>
        v.label.toLowerCase().includes(searchTerm),
      )
    }
  })
}

function seleccionarProducto(producto) {
  if (!producto) {
    resetearCamposProducto()
    return
  }

  precioUnitario.value = producto.originalData.precio || 0
}
function decimas(saldo) {
  var saldocondecimas = parseFloat(saldo).toFixed(2)
  return saldocondecimas
}
function redondear(num) {
  if (typeof num != 'number') {
    return null
  }
  let signo = num >= 0 ? 1 : -1
  return parseFloat(
    (Math.round(num * Math.pow(10, 2) + signo * 0.0001) / Math.pow(10, 2)).toFixed(2),
  )
}
function agregarAlCarrito() {
  const datos = JSON.parse(localStorage.getItem('carrito'))
  datos.idalmacen = almacenSeleccionado.value?.value

  const producto = productoSeleccionado.value.originalData
  console.log(producto)
  console.log(precioUnitario.value)

  const nuevoProducto = {
    idproductoalmacen: producto.id,
    cantidad: cantidad.value,
    precio: precioUnitario.value,
    idstock: producto.idstock,
    idporcentaje: producto.idporcentaje,
    candiponible: producto.stock,
    descripcion: producto.descripcion,
    descripcionAdicional: '',
    codigo: producto.codigo,
    id: producto.id,
    subtotal: precioUnitario.value * cantidad.value,
    datosAdicionales: producto.datosAdicionales,
    despachado: Number(producto.stock) == 0 ? 2 : 1,
  }
  datos.listaProductos.push(nuevoProducto)

  const nuevoProductoFactura = {
    codigoProducto: producto.codigo,
    codigoActividadSin: producto.actividadsin,
    codigoProductoSin: producto.codigosin,
    descripcion: producto.descripcion,
    unidadMedida: producto.unidadsin,
    precioUnitario: precioUnitario.value,
    subTotal: decimas(redondear(parseFloat(cantidad.value) * parseFloat(precioUnitario.value))),
    cantidad: cantidad.value,
    numeroSerie: '',
    montoDescuento: 0,
    numeroImei: '',
    codigoNandina: producto.codigonandina,
  }
  datos.listaProductosFactura.push(nuevoProductoFactura)

  // Actualiza el subtotal sumando los nuevos productos
  datos.subtotal = datos.listaProductos
    .reduce((subtotal, producto) => {
      const precio = parseFloat(producto.precio)
      const cantidad = parseFloat(producto.cantidad)
      return subtotal + precio * cantidad
    }, 0)
    .toFixed(2)

  // Calcula la ventatotal restando el descuento del subtotal
  datos.ventatotal = (parseFloat(datos.subtotal) - parseFloat(datos.descuento)).toFixed(2)

  carritoPrueba.value.push(nuevoProducto)

  // Guarda los datos actualizados en el localStorage
  localStorage.setItem('carrito', JSON.stringify(datos))
  $q.notify({
    type: 'positive',
    message: 'Producto agregado al carrito',
  })

  resetearCamposProducto()
  productoSeleccionado.value = null
  cargarProductosDisponibles()
}
function eliminarDelCarrito(item) {
  carritoPrueba.value = carritoPrueba.value.filter((i) => i.id !== item.id)

  // Actualizar localStorage montoTotalMoneda
  localStorage.setItem(
    'carritoPrueba',
    JSON.stringify({
      listaProductos: carritoPrueba.value.map((item) => ({
        idproductoalmacen: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    }),
  )

  $q.notify({
    type: 'info',
    message: 'Producto eliminado del carritoPrueba',
  })
}

function resetearCamposProducto() {
  cantidad.value = 1
  precioUnitario.value = 0
}

function continuarVenta() {
  $q.notify({
    type: 'positive',
    message: 'Procediendo al registro de la venta...',
  })

  // Aquí iría la lógica para continuar con el proceso de venta
  console.log('Datos para la venta:', {
    almacen: almacenSeleccionado.value?.value,
    categoriaPrecio: categoriaPrecioSeleccionada.value,
    productos: carritoPrueba.value,
    descuento: descuento.value,
    total: total.value,
  })
}

function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (contenidousuario) {
    return contenidousuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
    window.location.assign('../../app/')
  }
}

async function crearCarritoVenta() {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo

    // Verificar que currencyStore.divisa esté cargado
    if (!currencyStore.divisa) {
      console.error('Divisa no está definida en currencyStore')
      return
    }

    // Obtener datos existentes o crear estructura inicial
    const carritoExistente = JSON.parse(localStorage.getItem('carrito')) || {
      listaProductos: [],
      listaProductosFactura: [],
      listaFactura: {},
    }

    const datos = {
      ...carritoExistente,
      idalmacen: almacenSeleccionado.value?.value || 0,
      codigosinsucursal: null,
      token,
      tipo,
      iddivisa: currencyStore.divisa.id || null, // Eliminado computed()
      idcampana: categoriaCampaniaSeleccionada.value || 0,
      ventatotal: total.value || 0,
      subtotal: subTotal.value || 0,
      descuento: descuento.value || 0,
      nropagos: 0,
      valorpagos: 0,
      dias: 0,
      fechalimite: 0,
      pagosDivididos: [],
      variablePago: 'dividido',
    }

    console.log('Guardando carritoDos:', datos)
    localStorage.setItem('carrito', JSON.stringify(datos))
    return true
  } catch (error) {
    console.error('Error al crear carritoDos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al preparar datos de venta',
    })
    return false
  }
}
function eliminarCarrito() {
  // Elimina del localStorage
  localStorage.removeItem('carrito')

  // Limpia la lista reactiva en la interfaz
  carritoPrueba.value = []

  // Notifica al usuario
  $q.notify({
    type: 'positive',
    message: 'Listo para añadir al carrito ',
  })
}

// Inicialización $ currencyStore codigoActividadSin despachado
onMounted(async () => {
  try {
    // Cargar divisa
    await currencyStore.cargarDivisaActiva()

    if (!currencyStore.divisa) {
      console.error('No se pudo cargar la divisa')
      return
    }

    // Limpiar y cargar todo
    eliminarCarrito()
    await crearCarritoVenta()
    await cargarAlmacenes()
  } catch (error) {
    console.error('Error en inicialización:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al inicializar componente',
    })
  }
})
</script>

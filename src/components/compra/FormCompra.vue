<template>
  <q-form @submit.prevent="onSubmit" class="q-pa-lg bg-white" style="border-radius: 12px">
    <div class="row q-col-gutter-lg">
      <!-- SECCION 1: Configuración de Registro -->
      <div class="col-12">
        <div
          class="text-subtitle2 text-primary text-weight-bold q-mb-md flex items-center"
          style="letter-spacing: 0.5px"
        >
          <q-icon name="settings" size="20px" class="q-mr-sm" />
          Configuración Principal
        </div>

        <div
          class="row q-col-gutter-md items-center bg-grey-1 q-pa-md rounded-borders"
          style="border: 1px solid #e0e0e0"
        >
          <div class="col-12 col-md-4">
            <label
              for="tipo"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Tipo de Registro <span class="text-negative">*</span></label
            >
            <q-toggle
              v-model="isIngresoConPedido"
              label="Ingreso con pedido"
              color="primary"
              dense
              id="tipo"
              class="text-weight-medium bg-white q-pa-xs rounded-borders shadow-1"
              style="border: 1px solid #e0e0e0; width: 100%"
            />
          </div>

          <!-- Mostrar select de pedido si es Ingreso con Pedido -->
          <div class="col-12 col-md-4 animate__animated animate__fadeIn" v-if="conPEdido">
            <label
              for="pedido"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Pedido Asociado <span class="text-negative">*</span></label
            >
            <q-select
              v-model="localData.pedido"
              :options="filteredPedidos"
              id="pedido"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              @filter="filterFnPedidos"
              dense
              outlined
              bg-color="white"
              class="premium-input text-weight-medium"
              hide-bottom-space
              :rules="[(val) => !!val || 'Campo requerido']"
              @update:model-value="seleccionarPedido"
            >
              <template v-slot:prepend>
                <q-icon name="receipt_long" color="primary" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey text-italic"> No hay resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Mostrar almacén si es Ingreso sin Pedido (Directo) -->
          <div class="col-12 col-md-4 animate__animated animate__fadeIn" v-if="conPEdido === false">
            <label
              for="almacen"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Almacén de Destino <span class="text-negative">*</span></label
            >
            <q-select
              v-model="localData.almacen"
              :options="props.almacenes"
              id="almacen"
              dense
              outlined
              bg-color="white"
              map-options
              class="premium-input text-weight-medium"
              hide-bottom-space
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="warehouse" color="primary" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4 animate__animated animate__fadeIn">
            <label for="fecha">Fecha*</label>
            <q-input
              v-model="localData.fecha"
              type="date"
              id="fecha"
              outlined
              dense
              bg-color="white"
            />
          </div>
        </div>
      </div>

      <!-- SECCION 2: Detalles Técnicos -->
      <div class="col-12 q-mt-md">
        <div
          class="text-subtitle2 text-primary text-weight-bold q-mb-md flex items-center"
          style="letter-spacing: 0.5px"
        >
          <q-icon name="inventory_2" size="20px" class="q-mr-sm" />
          Detalles de la Compra
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6">
            <label
              for="nombre"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Nombre <span class="text-negative">*</span></label
            >
            <q-input
              v-model="localData.nombre"
              id="nombre"
              outlined
              dense
              bg-color="white"
              class="premium-input"
              hide-bottom-space
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="edit_square" color="grey-6" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <label
              for="codigo"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Código <span class="text-negative">*</span></label
            >
            <q-input
              v-model="localData.codigo"
              id="codigo"
              dense
              outlined
              bg-color="white"
              class="premium-input"
              hide-bottom-space
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="qr_code_2" color="grey-6" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-6">
            <label
              for="provedor"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Proveedor <span class="text-negative">*</span></label
            >
            <q-select
              v-model="localData.proveedor"
              :options="filteredProveedores"
              id="provedor"
              dense
              outlined
              bg-color="white"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              @filter="filterFn"
              class="premium-input"
              hide-bottom-space
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="local_shipping" color="grey-6" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey text-italic"> No hay resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-6">
            <label
              for="factura"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Nro. Factura <span class="text-grey-5">(Opcional)</span></label
            >
            <q-input
              v-model="localData.factura"
              id="factura"
              dense
              outlined
              bg-color="white"
              class="premium-input"
              hide-bottom-space
            >
              <template v-slot:prepend>
                <q-icon name="receipt" color="grey-6" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- SECCION 3: Metodos de Pago -->
      <div class="col-12 q-mt-md">
        <div
          class="text-subtitle2 text-primary text-weight-bold q-mb-md flex items-center"
          style="letter-spacing: 0.5px"
        >
          <q-icon name="payments" size="20px" class="q-mr-sm" />
          Condiciones de Pago
        </div>

        <div
          class="row q-col-gutter-lg q-pa-md bg-blue-50 rounded-borders"
          style="border: 1px dashed #90caf9"
        >
          <div
            class="col-12"
            :class="{
              'col-md-6': localData.tipocompra === 2,
              'col-md-12': localData.tipocompra !== 2,
            }"
            style="transition: all 0.3s ease"
          >
            <label
              for="tipocompra"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Forma de Pago <span class="text-negative">*</span></label
            >
            <q-select
              v-model="localData.tipocompra"
              :options="tiposCompra"
              id="tipocompra"
              dense
              outlined
              bg-color="white"
              emit-value
              map-options
              class="premium-input text-weight-bold"
              hide-bottom-space
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="account_balance_wallet" color="primary" />
              </template>
            </q-select>
          </div>
          <div
            class="col-12 col-md-6 animate__animated animate__zoomIn"
            v-if="localData.tipocompra === 2 && props.cajaBancos.length > 0"
          >
            <label
              for="cajaBanco"
              class="text-weight-bold text-grey-9 q-mb-sm block"
              style="font-size: 13px"
              >Seleccione Medio de Pago <span class="text-negative">*</span></label
            >

            <q-select
              v-model="localData.cajabanco"
              :options="props.cajaBancos"
              id="cajaBanco"
              dense
              outlined
              emit-value
              map-options
              class="premium-input"
              :rules="[(val) => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="account_balance" color="positive" />
              </template>

              <template v-slot:selected-item="scope">
                <div v-if="scope.opt" class="q-py-xs">
                  <span class="text-weight-bold text-primary">{{ scope.opt.codigo }}</span>
                  <span class="q-ml-xs">- {{ scope.opt.nombre }}</span>
                </div>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>
                      <span class="text-weight-bolder text-grey-9">{{ scope.opt.codigo }}</span>
                    </q-item-label>
                    <q-item-label caption>
                      {{ scope.opt.nombre }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <!-- ACCIONES -->
    <q-separator class="q-my-lg bg-grey-3" />
    <div class="row justify-end q-gutter-x-sm">
      <q-btn
        label="Cancelar"
        icon="close"
        flat
        color="grey-8"
        @click="$emit('cancel')"
        class="q-px-lg text-weight-bold"
        style="border-radius: 8px"
      />
      <q-btn
        label="Guardar Información"
        icon="save"
        type="submit"
        color="primary"
        unelevated
        class="q-px-xl text-weight-bolder shadow-3"
        style="
          border-radius: 8px;
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          letter-spacing: 0.5px;
        "
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG'
const filteredPedidos = ref([])
const $q = useQuasar()
const idempresa = idempresa_md5()
const conPEdido = ref(true)
const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  almacenes: Array,
  proveedores: Array,
  cajaBancos: Array,
})
const PedidosAlmacen = ref([])
const emit = defineEmits(['submit', 'cancel'])
const pedidos = ref([])
const localData = ref({ ...props.modalValue })
const isIngresoConPedido = computed({
  get() {
    // La vista lee este valor para saber si el toggle está 'encendido'
    //console.log(localData.value)
    verificar()
    return localData.value.tipoRegistro === 1
  },
  set(val) {
    // Cuando el usuario cambia el toggle, actualizamos el valor original
    //console.log(localData)
    localData.value.tipoRegistro = val ? 1 : 2
    // Llamamos a la función 'verificar' como antes
    verificar()
  },
})
const tiposCompra = [
  { label: 'Al contado', value: 2 },
  { label: 'Credito', value: 1 },
]

const onSubmit = () => {
  localData.value.nombrealmacen = localData.value.almacen?.label || ''
  localData.value.almacen = localData.value.almacen?.value || null
  localData.value.md5empresa = idempresa
  //console.log('Formulario enviado con datos:', localData.value)

  emit('submit', localData.value)
}

// 3. NUEVO: Función encargada de filtrar los pedidos según lo que escriba el usuario
function filterFnPedidos(val, update) {
  if (val === '') {
    update(() => {
      filteredPedidos.value = [...pedidos.value]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    // Busca coincidencias en el label (Almacén, código, fecha, observación)
    filteredPedidos.value = pedidos.value.filter((v) => v.label.toLowerCase().includes(needle))
  })
}
const seleccionarPedido = () => {
  const pedidoSeleccionado = pedidos.value.find(
    (pedido) => Number(pedido.value) === Number(localData.value.pedido),
  )
  console.log('Pedido seleccionado:', pedidoSeleccionado)
  if (pedidoSeleccionado) {
    const idAlmacen = Number(pedidoSeleccionado.idalmacen)
    const almacenObj = props.almacenes.find((a) => Number(a.value) === idAlmacen)
    localData.value.almacen = almacenObj || null
  } else {
    localData.value.almacen = null
  }
}
const verificar = () => {
  const tipo = localData.value.tipoRegistro
  //console.log(tipo)
  conPEdido.value = tipo == 1
}
// async function cargarPedidos() {
//   // console.log('=== CARGANDO PEDIDOS ===')
//   // console.log('props.almacenes:', props.almacenes)
//   // console.log('props.almacenes.length:', props.almacenes?.length)

//   if (!props.almacenes || props.almacenes.length === 0) {
//     console.warn('No hay almacenes disponibles para cargar pedidos')
//     pedidos.value = []
//     return
//   }

//   try {
//     const idAlmacenes = props.almacenes.map((obj) => obj.value)
//     //console.log('IDs de almacenes:', idAlmacenes)

//     const response = await api.get(`listaPedido/${idempresa}`)
//     console.log('Respuesta API pedidos:', response.data)
//     //console.log('Total pedidos recibidos:', response.data.length)

//     const filtrados = response.data.filter((item) => {
//       // Convert to number for comparison since API returns strings
//       const idAlmacenNum = Number(item.idalmacen)
//       const cumpleAlmacen = idAlmacenes.includes(idAlmacenNum)
//       const cumpleEstado = Number(item.estado) == 2 // Pendiente
//       const cumpleAutorizacion = Number(item.autorizacion) == 1 // Autorizado
//       const cumpleTipoPedido = Number(item.tipopedido) == 1 // Solo pedidos de compra

//       console.log(`Pedido ${item.id}:`, {
//         idalmacen: item.idalmacen,
//         idAlmacenNum,
//         cumpleAlmacen,
//         estado: item.estado,
//         cumpleEstado,
//         autorizacion: item.autorizacion,
//         cumpleAutorizacion,
//         tipopedido: item.tipopedido,
//         cumpleTipoPedido,
//         pasa: cumpleAlmacen && cumpleEstado && cumpleAutorizacion && cumpleTipoPedido,
//       })

//       return cumpleAlmacen && cumpleEstado && cumpleAutorizacion && cumpleTipoPedido
//     })

//     // console.log('Pedidos filtrados:', filtrados)

//     PedidosAlmacen.value = filtrados
//     pedidos.value = filtrados.map((item) => ({
//       label: `${item.almacen} - ${item.codigo} - ${cambiarFormatoFecha(item.fecha)} - ${item.observacion || 'Sin observación'}`,
//       idalmacen: item.idalmacen,
//       value: item.id,
//     }))
//     //console.log('Pedidos formateados para select:', pedidos.value)
//   } catch (error) {
//     console.error('Error al cargar datos:', error)
//     $q.notify({
//       type: 'negative',
//       message: 'No se pudieron cargar los Pedidos',
//     })
//   }
// }
async function cargarPedidos() {
  if (!props.almacenes || props.almacenes.length === 0) {
    console.warn('No hay almacenes disponibles para cargar pedidos')
    pedidos.value = []
    filteredPedidos.value = [] // También limpiar los filtrados
    return
  }

  try {
    const idAlmacenes = props.almacenes.map((obj) => obj.value)
    const response = await api.get(`listaPedido/${idempresa}`)

    const filtrados = response.data.filter((item) => {
      const idAlmacenNum = Number(item.idalmacen)
      const cumpleAlmacen = idAlmacenes.includes(idAlmacenNum)
      const cumpleEstado = Number(item.estado) == 2
      const cumpleAutorizacion = Number(item.autorizacion) == 1
      const cumpleTipoPedido = Number(item.tipopedido) == 1

      return cumpleAlmacen && cumpleEstado && cumpleAutorizacion && cumpleTipoPedido
    })

    PedidosAlmacen.value = filtrados

    // Mapeamos los datos originales
    pedidos.value = filtrados.map((item) => ({
      label: `${item.almacen} - ${item.codigo} - ${cambiarFormatoFecha(item.fecha)} - ${item.observacion || 'Sin observación'}`,
      idalmacen: item.idalmacen,
      value: item.id,
    }))

    // 2. NUEVO: Inicializar la lista reactiva que usa el q-select con todos los pedidos cargados
    filteredPedidos.value = [...pedidos.value]
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Pedidos',
    })
  }
}
const filteredProveedores = ref([...props.proveedores])

// Función de filtrado
function filterFn(val, update) {
  if (val === '') {
    update(() => {
      filteredProveedores.value = [...props.proveedores]
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredProveedores.value = props.proveedores.filter((v) =>
      v.label.toLowerCase().includes(needle),
    )
  })
}
// Esperar a que los almacenes estén disponibles
watch(
  () => props.almacenes,
  (newVal) => {
    //console.log('Watch almacenes triggered, length:', newVal?.length)
    if (newVal && newVal.length > 0) {
      cargarPedidos()
    }
  },
  { immediate: true },
)

// Cargar pedidos cuando se activa "con pedido"
watch(
  () => conPEdido.value,
  (newVal) => {
    if (newVal && props.almacenes && props.almacenes.length > 0) {
      cargarPedidos()
    }
  },
)

// asignar almacen si selecciona un pedido
watch(
  () => localData.value.pedido,
  (newVal) => {
    const pedido = PedidosAlmacen.value.find((obj) => obj.id == newVal)
    if (pedido) {
      const idAlmacen = Number(pedido.idalmacen)
      const almacenObj = props.almacenes.find((a) => Number(a.value) === idAlmacen)
      localData.value.almacen = almacenObj || null
    }
    console.log('Almacén asignado:', localData.value.almacen)
  },
)
// Resetear pedido si cambia tipoRegistro
watch(
  () => localData.value.tipoRegistro,
  (newVal) => {
    console.log('Watch tipoRegistro triggered:', newVal)
    if (newVal === '2' || newVal === 2) {
      localData.value.pedido = null
      localData.value.almacen = null
    } else if (newVal === '1' || newVal === 1) {
      localData.value.almacen = null
    }
  },
)
onMounted(() => {
  verificar()
  if (props.almacenes && props.almacenes.length > 0) {
    cargarPedidos()
  }
  localData.value.fecha = obtenerFechaActualDato()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.q-form {
  font-family: 'Inter', sans-serif;
}

.premium-input {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.premium-input:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px !important;
}

:deep(.q-btn) {
  text-transform: none;
  letter-spacing: 0.3px;
}
</style>

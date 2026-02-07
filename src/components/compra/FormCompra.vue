<template>
  <q-form @submit.prevent="onSubmit">
    <q-card-section class="row q-col-gutter-x-md">
      <div class="col-12 col-md-3">
        <label for="tipo">Tipo de registro*</label>

        <q-toggle
          v-model="isIngresoConPedido"
          label="Ingreso con pedido"
          dense
          outlined
          id="tipo"
        />
      </div>

      <!-- Mostrar selezct de pedido solo si tipoRegistro es '1' -->
      <div class="col-12 col-md-3" v-if="conPEdido">
        <label for="pedido">Pedido*</label>
        <q-select
          v-model="localData.pedido"
          :options="pedidos"
          id="pedido"
          emit-value
          map-options
          dense
          outlined
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <!-- Mostrar almacén solo si tipoRegistro es '2' -->
      <div class="col-12 col-md-3" v-if="conPEdido === false">
        <label for="almacen">Almacén*</label>
        <q-select
          v-model="localData.almacen"
          :options="props.almacenes"
          id="almacen"
          dense
          outlined
          emit-value
          map-options
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="nombre">Nombre*</label>
        <q-input
          v-model="localData.nombre"
          id="nombre"
          label
          outlined
          dense
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="codigo">Codigo*</label>
        <q-input
          v-model="localData.codigo"
          id="codigo"
          dense
          outlined
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="provedor">Proveedor*</label>
        <q-select
          v-model="localData.proveedor"
          :options="filteredProveedores"
          id="provedor"
          dense
          outlined
          emit-value
          map-options
          use-input
          fill-input
          hide-selected
          input-debounce="0"
          @filter="filterFn"
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="factura">Nro Factura</label>
        <q-input v-model="localData.factura" id="factura" dense outlined />
      </div>

      <div class="col-12 col-md-3">
        <label for="tipocompra">Tipo de Compra*</label>
        <q-select
          v-model="localData.tipocompra"
          :options="tiposCompra"
          id="tipocompra"
          dense
          outlined
          emit-value
          map-options
          :rules="[(val) => !!val || 'Campo requerido']"
        />
      </div>
    </q-card-section>

    <q-card-actions class="flex justify-start">
      <q-btn label="Guardar" type="submit" color="primary" />
      <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
    </q-card-actions>
  </q-form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const idempresa = idempresa_md5()
const conPEdido = ref(true)
const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  almacenes: Array,
  proveedores: Array,
})
const PedidosAlmacen = ref([])
const emit = defineEmits(['submit', 'cancel'])
const pedidos = ref([])
const localData = ref({ ...props.modalValue })

const isIngresoConPedido = computed({
  get() {
    // La vista lee este valor para saber si el toggle está 'encendido'
    console.log(localData.value)
    verificar()
    return localData.value.tipoRegistro === 1
  },
  set(val) {
    // Cuando el usuario cambia el toggle, actualizamos el valor original
    console.log(localData)
    localData.value.tipoRegistro = val ? 1 : 2
    // Llamamos a la función 'verificar' como antes
    verificar()
  },
})
const tiposCompra = [
  { label: 'Al contado', value: '2' },
  { label: 'Credito', value: '1' },
]

const onSubmit = () => {
  emit('submit', localData.value)
}

const verificar = () => {
  const tipo = localData.value.tipoRegistro
  console.log(tipo)
  conPEdido.value = tipo == 1
}
async function cargarPedidos() {
  console.log('=== CARGANDO PEDIDOS ===')
  console.log('props.almacenes:', props.almacenes)
  console.log('props.almacenes.length:', props.almacenes?.length)
  
  if (!props.almacenes || props.almacenes.length === 0) {
    console.warn('No hay almacenes disponibles para cargar pedidos')
    pedidos.value = []
    return
  }
  
  try {
    const idAlmacenes = props.almacenes.map((obj) => obj.value)
    console.log('IDs de almacenes:', idAlmacenes)
    
    const response = await api.get(`listaPedido/${idempresa}`)
    console.log('Respuesta API pedidos:', response.data)
    console.log('Total pedidos recibidos:', response.data.length)
    
    const filtrados = response.data.filter(
      (item) => {
        // Convert to number for comparison since API returns strings
        const idAlmacenNum = Number(item.idalmacen)
        const cumpleAlmacen = idAlmacenes.includes(idAlmacenNum)
        const cumpleEstado = Number(item.estado) == 2  // Pendiente
        const cumpleAutorizacion = Number(item.autorizacion) == 1  // Autorizado
        const cumpleTipoPedido = Number(item.tipopedido) == 1  // Solo pedidos de compra
        
        console.log(`Pedido ${item.id}:`, {
          idalmacen: item.idalmacen,
          idAlmacenNum,
          cumpleAlmacen,
          estado: item.estado,
          cumpleEstado,
          autorizacion: item.autorizacion,
          cumpleAutorizacion,
          tipopedido: item.tipopedido,
          cumpleTipoPedido,
          pasa: cumpleAlmacen && cumpleEstado && cumpleAutorizacion && cumpleTipoPedido
        })
        
        return cumpleAlmacen && cumpleEstado && cumpleAutorizacion && cumpleTipoPedido
      }
    )
    
    console.log('Pedidos filtrados:', filtrados)
    
    PedidosAlmacen.value = filtrados
    pedidos.value = filtrados.map((item) => ({
      label: `${item.almacen} - ${item.observacion || 'Sin observación'}`,
      value: item.id,
    }))
    console.log('Pedidos formateados para select:', pedidos.value)
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
    console.log('Watch almacenes triggered, length:', newVal?.length)
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
    console.log('Watch conPEdido triggered:', newVal)
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
      localData.value.almacen = pedido.idalmacen
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
</script>

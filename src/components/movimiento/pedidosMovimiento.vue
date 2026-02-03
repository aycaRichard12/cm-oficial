<template>
  <q-dialog v-model="showDialog" @hide="onDialogHide" :maximized="true">
    <q-card class="column full-height bg-grey-1">
      <!-- Header -->
      <q-card-section class="bg-primary text-white q-py-sm q-px-md col-auto shadow-2 z-top">
        <div class="row items-center justify-between no-wrap">
          <div class="row items-center q-gutter-x-md">
            <q-icon name="assignment" size="md" />
            <div class="text-h6 text-weight-bold">{{ title }}</div>
          </div>

          <div class="row items-center q-gutter-x-md">
            <!-- Selector de Almacén -->
            <div class="bg-white rounded-borders shadow-1" style="min-width: 300px">
              <AlmacenSelector />
            </div>

            <q-btn icon="close" flat round dense class="text-white" @click="onDialogHide">
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <!-- Table Content -->
      <q-card-section class="col q-pa-md overflow-hidden">
        <q-table
          :rows="dataRows"
          :columns="columns"
          row-key="id"
          class="my-sticky-header-table full-height"
          flat
          bordered
          virtual-scroll
          :rows-per-page-options="[0]"
          :row-class="rowClass"
          @row-click="onRowClick"
        >
          <!-- Custom Header Slots -->
          <template v-slot:header-cell="props">
            <q-th :props="props" class="bg-grey-2 text-primary text-weight-bold">
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-opciones="props">
            <q-th :props="props" class="bg-grey-2 text-primary text-weight-bold text-center">
              {{ props.col.label }}
            </q-th>
          </template>

          <!-- Custom Body Slots -->
          <template v-slot:body-cell-opciones="props">
            <q-td :props="props" class="text-center">
              <div class="row items-center justify-center q-gutter-x-xs no-wrap">
                <q-btn-group unelevated rounded>
                  <q-btn
                    icon="visibility"
                    color="info"
                    size="sm"
                    dense
                    @click="emitAction('view', props.row)"
                  >
                    <q-tooltip>Ver Pedido</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="cancel"
                    color="negative"
                    size="sm"
                    dense
                    @click="emitAction('discard', props.row)"
                  >
                    <q-tooltip>Descartar Pedido</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="check_circle"
                    color="positive"
                    size="sm"
                    dense
                    @click="emitAction('process', props.row)"
                  >
                    <q-tooltip>Procesar Pedido</q-tooltip>
                  </q-btn>
                </q-btn-group>

                <q-separator vertical class="q-mx-sm" />

                <q-checkbox
                  :model-value="isRowSelected(props.row)"
                  @update:model-value="(val) => toggleRowSelection(props.row, val)"
                  dense
                  color="primary"
                >
                  <q-tooltip v-if="!canSelectRow(props.row)" class="bg-warning text-black">
                    Destino diferente al seleccionado
                  </q-tooltip>
                </q-checkbox>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-indice="props">
            <q-td :props="props">
              <q-badge color="grey-3" text-color="black" :label="props.value" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-separator />

      <!-- Footer Actions -->
      <q-card-actions align="right" class="col-auto bg-white q-pa-md">
        <q-btn
          flat
          label="Ver Pedidos Acumulados"
          color="primary"
          icon="list"
          @click="verAcumulados"
        />
        <q-btn flat label="Cerrar" color="grey-8" icon="close" @click="onDialogHide" />
        <q-btn
          unelevated
          color="primary"
          icon="send"
          label="Enviar Pedidos"
          :disable="selected.length === 0"
          :loading="loadingObj"
          @click="enviarPedidos"
        >
          <q-badge color="orange" floating v-if="selected.length > 0">{{
            selected.length
          }}</q-badge>
        </q-btn>
      </q-card-actions>
    </q-card>

    <!-- Modal de Pedidos Acumulados -->
    <q-dialog v-model="showAcumuladosDialog">
      <q-card style="min-width: 700px; max-width: 80vw">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Pedidos y Productos Acumulados</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-if="pedidosAcumulados.length === 0" class="text-center text-grey-6 q-pa-lg">
            <q-icon name="shopping_cart" size="4em" />
            <div class="text-h6 q-mt-md">No hay productos acumulados</div>
            <div>Seleccione pedidos para acumular sus productos</div>
          </div>

          <q-table
            v-else
            :rows="pedidosAcumulados"
            :columns="columnsAcumulados"
            row-key="codigo"
            flat
            bordered
            dense
          >
            <template v-slot:body-cell-indice="props">
              <q-td :props="props">
                {{ props.rowIndex + 1 }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, defineEmits, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import imprimirReporte from 'src/utils/pdfReportGenerator'
import AlmacenSelector from './AlmacenSelector.vue'
import { useAlmacenStore } from 'src/composables/movimiento/useAlmacenStore'

const { selectedAlmacen } = useAlmacenStore()
const idusuario = idusuario_md5()
const idempresa = idempresa_md5()
const $q = useQuasar()
const pdfData = ref(null)
const mostrarModal = ref(false)
const showAcumuladosDialog = ref(false)

const pedidosAcumulados = ref([])

const columnsAcumulados = [
  { name: 'indice', label: '#', field: 'indice', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left', sortable: true },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
]

const verAcumulados = () => {
  showAcumuladosDialog.value = true
}

// Define Emits
const emit = defineEmits(['ok', 'hide', 'orders-processed'])

// Reactive state
const showDialog = ref(true)
const detallePedido = ref([])

// Define table columns
const columns = [
  {
    name: 'indice',
    required: true,
    label: 'N°',
    align: 'center',
    field: 'indice',
    sortable: true,
    headerClasses: 'text-bold',
  },
  {
    name: 'fecha',
    required: true,
    label: 'FECHA',
    align: 'left',
    field: 'fecha',
    sortable: true,
    format: (val) => val,
    headerClasses: 'text-bold',
  },
  {
    name: 'destino',
    required: true,
    label: 'DESTINO',
    align: 'left',
    field: 'destino',
    sortable: true,
    headerClasses: 'text-bold',
  },
  {
    name: 'observacion',
    required: true,
    label: 'OBSERVACIÓN',
    align: 'left',
    field: 'observacion',
    sortable: true,
    classes: 'text-grey-8',
    headerClasses: 'text-bold',
  },
  {
    name: 'opciones',
    label: 'ACCIONES',
    align: 'center',
    field: 'opciones',
    required: true,
    headerClasses: 'text-bold',
  },
]

const tableData = ref([])
// const almacen = props.initialData // Ya no usamos initialData, usamos el store
const selected = ref([])
const destinoSeleccionado = ref(null)

// Computed properties
const dataRows = computed(() => {
  return tableData.value.map((item, index) => ({
    id: item.id,
    indice: index + 1,
    fecha: item.fecha,
    destino: item.almacen,
    observacion: item.observacion,
    estado: item.estado,
    autorizacion: item.autorizacion,
    codigo: item.codigo,
    idalmacen: item.idalmacen,
    tipopedido: item.tipopedido,
    idalmacenorigen: item.idalmacenorigen,
    almacenorigen: item.almacenorigen,
    idusuario: item.idusuario,
    nropedido: item.nropedido,
    ruta: item.ruta,
  }))
})

// Methods
const onDialogHide = () => {
  showDialog.value = false
  emit('hide')
}

// const onDialogOK = () => {
//   emit('ok')
//   onDialogHide()
// }

const isRowSelected = (row) => {
  return selected.value.some((selectedRow) => selectedRow.id === row.id)
}

const canSelectRow = (row) => {
  // Si no hay destino seleccionado, todas las filas son seleccionables
  if (!destinoSeleccionado.value) return true

  // Si ya hay un destino seleccionado, solo permitir filas con ese destino
  return row.destino === destinoSeleccionado.value
}

const toggleRowSelection = (row, val) => {
  // Verificar primero si se puede seleccionar
  if (val && !canSelectRow(row)) {
    $q.notify({
      type: 'warning',
      message: `Solo puedes seleccionar pedidos para el destino: ${destinoSeleccionado.value}`,
      timeout: 3000,
      position: 'top',
      actions: [{ icon: 'close', color: 'white' }],
    })
    return // No hacer nada, el checkbox no cambiará gracias a :model-value
  }

  if (!val) {
    // Deseleccionar
    selected.value = selected.value.filter((r) => r.id !== row.id)

    // Si no quedan seleccionados, resetear el destino
    if (selected.value.length === 0) {
      destinoSeleccionado.value = null
    }
  } else {
    // Si es la primera selección, establecer el destino
    if (selected.value.length === 0) {
      destinoSeleccionado.value = row.destino
    }

    // Agregar a la selección si no está ya seleccionado
    if (!isRowSelected(row)) {
      selected.value = [...selected.value, row]
      acumularPedidos(row.id)
    }
  }
}

async function acumularPedidos(idPedido) {
  const response = await api.get(`getPedido_/${idPedido}/${idempresa}`)
  const data = response.data
  const items = data[0].detalle
  items.map((item) => {
    console.log('item', item)
    console.log('pedidosAcumulados.value', pedidosAcumulados.value)
    if (!pedidosAcumulados.value.some((pedido) => pedido.codigo === item.codigo)) {
      pedidosAcumulados.value.push(item)
      console.log(
        'pedidosAcumulados.value 2',
        !pedidosAcumulados.value.some((pedido) => pedido.codigo === item.codigo),
      )
    } else {
      const index = pedidosAcumulados.value.findIndex((pedido) => pedido.codigo === item.codigo)
      pedidosAcumulados.value[index].cantidad =
        Number(pedidosAcumulados.value[index].cantidad) + Number(item.cantidad)
    }
  })
  console.log('pedidosAcumulados.value', pedidosAcumulados.value)
}

// const onRowClick = (evt, row) => {
//   // Opcional: puedes hacer que el clic en la fila también seleccione/deseleccione
//   // toggleRowSelection(row, !isRowSelected(row))
// }

const emitAction = (actionType, row) => {
  if (actionType === 'view') {
    verDetalle(row)
  } else if (actionType === 'discard') {
    console.log('Discarding item:', row.id)
    discarding(row)
  } else if (actionType === 'process') {
    processing(row)
    console.log('Processing item:', row.id)
  }
}

async function processing(row) {
  console.log(row)
  $q.dialog({
    title: '¿Estás seguro de que deseas realizar esta acción? Es irreversible.',
    message: 'Esto creara un nuevo registro de movimiento con los datos del pedido',
    persistent: true,
    color: 'positive',
    ok: {
      label: 'Sí, continuar',
      color: 'positive',
      flat: false,
    },
    cancel: {
      label: 'No, cancelar',
      color: 'negative',
      flat: true,
    },
  })
    .onOk(async () => {
      const endpoint = `cambiarEstadoPedido/${row.id}/1/${idusuario}`
      const result = await api.get(endpoint)
      const resultado = result.data
      console.log(result)
      $q.dialog({
        title: 'Pedido Registrado',
        message: resultado.detalles.lista || 'El pedido ha sido descartado exitosamente.',
        color: 'positive',
        ok: true,
        persistent: false,
      }).onDismiss(() => {
        emit('orders-processed')
      })
    })
    .onCancel(() => {
      $q.notify({
        type: 'info',
        message: 'Acción cancelada.',
        icon: 'cancel',
      })
    })
}

async function discarding(row) {
  console.log(row)
  $q.dialog({
    title: '¿Estás seguro de que deseas realizar esta acción? Es irreversible.',
    message: 'No podra usar este pedido al descartarlo',
    persistent: true,
    color: 'negative',
    ok: {
      label: 'Sí, continuar',
      color: 'positive',
      flat: false,
    },
    cancel: {
      label: 'No, cancelar',
      color: 'negative',
      flat: true,
    },
    verAcumulado: {
      label: 'Ver acumulado',
      color: 'bluestyle',
      flat: true,
    },
  })
    .onOk(async () => {
      const endpoint = `cambiarEstadoPedido/${row.id}/3/${idusuario}`
      const result = await api.get(endpoint)
      const resultado = result.data
      console.log(result)
      $q.dialog({
        title: 'Pedido Descartado',
        message: resultado.detalles || 'El pedido ha sido descartado exitosamente.',
        color: 'positive',
        ok: true,
        persistent: false,
      })
    })
    .onCancel(() => {
      $q.notify({
        type: 'info',
        message: 'Acción cancelada.',
        icon: 'cancel',
      })
    })
}

const verDetalle = async (row) => {
  console.log(row)
  await getDatallePedido(row.id)
  if (detallePedido.value) {
    const doc = imprimirReporte(detallePedido)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Pedido  sin items',
    })
  }
}

const getDatallePedido = async (id) => {
  try {
    const response = await api.get(`getPedido_/${id}/${idempresa}`)
    console.log('detalle', response.data)
    detallePedido.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const getPedidos = async () => {
  if (!selectedAlmacen.value) {
    console.warn('selectedAlmacen is not yet defined, skipping API call.')
    tableData.value = []
    return
  }
  try {
    const response = await api.get(`listaPedido/${idempresa}`)
    console.log('Raw API response:', response.data)
    console.log('selectedAlmacen.value for filter:', selectedAlmacen.value)

    // El store guarda el objeto completo, usamos .value o .id segun corresponda
    const almacenId = selectedAlmacen.value.value || selectedAlmacen.value.id

    const filtrado = response.data.filter((u) => {
      const x = Number(u.idalmacenorigen) === Number(almacenId)
      const y = Number(u.estado) === 2
      const z = Number(u.autorizacion) === 1
      return x && y && z
    })
    tableData.value = filtrado
    console.log('Filtered data:', tableData.value)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

// const enviarPedidos = async () => {
//   const ids = selected.value.map((p) => p.id)
//   console.log('Pedidos seleccionados:', ids)
//   console.log('Destino común:', destinoSeleccionado.value)
//   const body = {
//     ver: 'cambiarestadopedidoOptimizado',
//     idsPedido: ids,
//     estado: 1,
//     idUsuarioMd5: idusuario,
//   }

//   const response = await api.post('', body)
//   console.log('Respuesta del servidor:', response.data)
//   getPedidos()
//   $q.notify({
//     type: 'positive',
//     message: `${ids.length} pedidos enviados exitosamente`,
//   })
// }
const enviarPedidos = async () => {
  // Validación básica
  if (selected.value.length === 0) {
    $q.notify('Seleccione pedidos primero')
    return
  }

  try {
    // Preparar datos
    const ids = selected.value.map((p) => p.id)
    const body = {
      ver: 'cambiarestadopedidoOptimizado',
      idsPedido: ids,
      estado: 1,
      idUsuarioMd5: idusuario,
    }

    // Enviar
    await api.post('', body)

    // Éxito
    $q.notify({
      icon: 'check',
      color: 'positive',
      message: `${ids.length} pedido(s) enviados`,
    })

    // Limpiar y recargar
    selected.value = []
    destinoSeleccionado.value = null
    emit('orders-processed')
    getPedidos()
  } catch (error) {
    console.error('Error:', error)
    $q.notify({
      icon: 'error',
      color: 'negative',
      message: 'Error al enviar pedidos',
    })
  }
}

onMounted(() => {
  getPedidos()
})

// Watch for store changes to re-fetch/filter
watch(selectedAlmacen, () => {
  getPedidos()
})

// Watch para limpiar selección si cambian los datos
watch(dataRows, (newRows) => {
  // Filtrar la selección actual para mantener solo las filas que todavía existen
  selected.value = selected.value.filter((selectedRow) =>
    newRows.some((row) => row.id === selectedRow.id),
  )
})
</script>

<style lang="scss" scoped>
// Corrección para altura de tabla con sticky header
.my-sticky-header-table {
  height: 100%;

  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(thead tr:first-child th) {
    background-color: #f5f5f5;
  }
}
</style>

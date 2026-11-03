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
            <div class="cm-surface rounded-borders shadow-1" style="min-width: 300px">
              <AlmacenSelector />
            </div>

            <q-btn icon="close" flat round dense class="text-white" @click="onDialogHide"><!-- theme-allow: white icon on bg-primary header -->
              <q-tooltip>{{ $t('ui.cerrar-4b0816') }}</q-tooltip>
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
                    <q-tooltip>{{ $t('ui.ver-pedido-87d476') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="cancel"
                    color="negative"
                    size="sm"
                    dense
                    @click="emitAction('discard', props.row)"
                  >
                    <q-tooltip>{{ $t('ui.descartar-pedido-15b247') }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="check_circle"
                    color="positive"
                    size="sm"
                    dense
                    @click="emitAction('process', props.row)"
                  >
                    <q-tooltip>{{ $t('ui.procesar-pedido-c12d3e') }}</q-tooltip>
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
                    {{ $t('ui.destino-diferente-al-seleccionado-2cc0da') }}
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
      <q-card-actions align="right" class="col-auto cm-surface q-pa-md">
        <q-btn
          flat
          :label="$t('ui.ver-pedidos-acumulados-62bf50')"
          color="primary"
          icon="list"
          @click="verAcumulados"
        />
        <q-btn flat :label="$t('ui.cerrar-4b0816')" color="grey-8" icon="close" @click="onDialogHide" />
        <q-btn
          unelevated
          color="primary"
          icon="send"
          :label="$t('ui.enviar-pedidos-b877c6')"
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
          <div class="text-h6">{{ $t('ui.pedidos-y-productos-acumulados-4f34b7') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-if="pedidosAcumulados.length === 0" class="text-center text-grey-6 q-pa-lg">
            <q-icon name="shopping_cart" size="4em" />
            <div class="text-h6 q-mt-md">{{ $t('ui.no-hay-productos-acumulados-8a2098') }}</div>
            <div>{{ $t('ui.seleccione-pedidos-para-acumular-sus-productos-6ff564') }}</div>
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
          <q-btn flat :label="$t('ui.cerrar-4b0816')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
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
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left', sortable: true },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left', sortable: true },
  { name: 'unidad', label: i18nT('configProducto.unidadProducto.table.nombre'), field: 'unidad', align: 'left', sortable: true },
  { name: 'cantidad', label: i18nT('ui.cantidad-b5b6f8'), field: 'cantidad', align: 'right', sortable: true },
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
    label: i18nT('cotizacion.table.number'),
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
    label: i18nT('ui.observacion-dc265c'),
    align: 'left',
    field: 'observacion',
    sortable: true,
    classes: 'cm-text',
    headerClasses: 'text-bold',
  },
  {
    name: 'opciones',
    label: i18nT('ui.acciones-f6f89a'),
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
      actions: [{ icon: 'close', color: 'white' }], // theme-allow: white action on warning notify
    })
    return // No hacer nada, el checkbox no cambiará gracias a :model-value
  }

  if (!val) {
    // Deseleccionar - RESTAR productos del acumulado
    desacumularPedidos(row.id)
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

async function desacumularPedidos(idPedido) {
  try {
    const response = await api.get(`getPedido_/${idPedido}/${idempresa}`)
    const data = response.data
    const items = data[0].detalle

    items.forEach((item) => {
      const index = pedidosAcumulados.value.findIndex((pedido) => pedido.codigo === item.codigo)

      if (index !== -1) {
        // Restar la cantidad
        pedidosAcumulados.value[index].cantidad =
          Number(pedidosAcumulados.value[index].cantidad) - Number(item.cantidad)

        // Si la cantidad llega a 0 o menos, eliminar el producto del acumulado
        if (pedidosAcumulados.value[index].cantidad <= 0) {
          pedidosAcumulados.value.splice(index, 1)
        }
      }
    })

    console.log('Productos desacumulados. Acumulado actual:', pedidosAcumulados.value)
  } catch (error) {
    console.error('Error al desacumular pedidos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-actualizar-productos-acumulados-7d1f75'),
    })
  }
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
    title: i18nT('ui.estas-seguro-de-que-deseas-realizar-esta-accion-es-i-7a9bcb'),
    message: i18nT('ui.esto-creara-un-nuevo-registro-de-movimiento-con-los-2b1a29'),
    persistent: true,
    color: 'positive',
    ok: {
      label: i18nT('ui.si-continuar-08fee7'),
      color: 'positive',
      flat: false,
    },
    cancel: {
      label: i18nT('ui.no-cancelar-c97628'),
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
        title: i18nT('ui.pedido-registrado-2513d9'),
        message: resultado.detalles.lista || i18nT('ui.el-pedido-ha-sido-descartado-exitosamente-42d1f2'),
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
        message: i18nT('ui.accion-cancelada-69a320'),
        icon: 'cancel',
      })
    })
}

async function discarding(row) {
  console.log(row)
  $q.dialog({
    title: i18nT('ui.estas-seguro-de-que-deseas-realizar-esta-accion-es-i-7a9bcb'),
    message: i18nT('ui.no-podra-usar-este-pedido-al-descartarlo-b101ce'),
    persistent: true,
    color: 'negative',
    ok: {
      label: i18nT('ui.si-continuar-08fee7'),
      color: 'positive',
      flat: false,
    },
    cancel: {
      label: i18nT('ui.no-cancelar-c97628'),
      color: 'negative',
      flat: true,
    },
    verAcumulado: {
      label: i18nT('ui.ver-acumulado-dc5b11'),
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
        title: i18nT('ui.pedido-descartado-53d279'),
        message: resultado.detalles || i18nT('ui.el-pedido-ha-sido-descartado-exitosamente-42d1f2'),
        color: 'positive',
        ok: true,
        persistent: false,
      })
    })
    .onCancel(() => {
      $q.notify({
        type: 'info',
        message: i18nT('ui.accion-cancelada-69a320'),
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
      message: i18nT('ui.pedido-sin-items-16845d'),
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
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
    $q.notify(i18nT('ui.seleccione-pedidos-primero-078e8f'))
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
    pedidosAcumulados.value = [] // Limpiar productos acumulados
    emit('orders-processed')
    getPedidos()
  } catch (error) {
    console.error('Error:', error)
    $q.notify({
      icon: 'error',
      color: 'negative',
      message: i18nT('ui.error-al-enviar-pedidos-c5a521'),
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

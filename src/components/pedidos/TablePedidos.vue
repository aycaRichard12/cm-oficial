<template>
  <div class="q-pa-md">
    <!-- Cabecera -->
    <div class="row q-col-gutter-x-md">
      <div class="col-6 flex justify-start">
        <q-btn
          color="primary"
          @click="$emit('add')"
          class="btn-res"
          id="btnAgregar"
          :title="$t('ui.registrar-pedido-5839d5')"
        >
          <q-icon name="add" class="icono" />
          <span class="texto"> <q-icon name="add" />{{ $t('common.new') }}</span>
        </q-btn>
      </div>
      <div class="col-6 flex justify-end">
        <q-btn
          color="primary"
          icon="refresh"
          :label="$t('ui.recargar-9d2c9d')"
          outline
          no-caps
          class="btn-res q-mr-sm"
          id="btnRecargarTablaPedidos"
          :loading="recargando"
          @click.stop.prevent="recargar"
        >
          <q-tooltip>{{ $t('ui.recargar-pedidos-y-almacenes-6c52b7') }}</q-tooltip>
        </q-btn>
        <q-btn color="info" @click="imprimir" outline class="btn-res" id="btnImprimir">
          <q-icon name="picture_as_pdf" class="icono" />
          <span class="texto">{{ $t('ui.vista-previa-pdf-9db3ed') }}</span>
        </q-btn>
      </div>
    </div>
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-3" id="almacenPedidos">
        <label for="almacen">{{ $t('inventario.warehouse') }}</label>
        <q-select
          v-model="filtroAlmacen"
          :options="almacenes"
          id="almacen"
          map-options
          dense
          outlined
          style="min-width: 200px"
        />
      </div>

      <div class="col-12 col-md-3" id="tipoPedidos">
        <label for="tipo">{{ $t('configGeneral.divisas.table.type') }}</label>
        <q-select
          v-model="filtroTipo"
          :options="tiposPedido"
          id="tipo"
          emit-value
          map-options
          clearable
          dense
          outlined
        />
      </div>
      <div class="col-12 col-md-3 q-mt-lg" id="importarExcelPedidos">
        <q-btn
          outline
          color="green"
          icon="upload"
          :label="$t('ui.importar-excel-c115aa')"
          no-caps
          @click="mostrarImportarExcel = true"
          id="importarExcel"
        />
      </div>
      <div class="col-12 col-md-12 flex justify-end" id="buscarPedidos">
        <div>
          <label for="buscar">{{ $t('common.search') }}</label>
          <q-input dense debounce="300" v-model="search" id="buscar" outlined>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <q-table
      id="tablePedidos"
      :title="$t('ui.pedidos-6170d2')"
      :rows="ordenados"
      :columns="columnas"
      :loading="loading"
      row-key="id"
      flat
      bordered
      wrap-cells
      class="q-mt-sm"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-autorizacion="props">
        <q-td :props="props">
          <q-badge
            color="green"
            v-if="Number(props.row.autorizacion) === 1"
            :label="$t('ui.autorizado-b4fb49')"
            outline
          />
          <q-badge color="red" v-else :label="$t('ui.no-autorizado-988c4e')" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-tipopedido="props">
        <q-td :props="props">
          <div v-if="Number(props.row.tipopedido) === 1">
            {{ $t('ui.compra-e1fa56') }}
          </div>
          <div v-else>
            {{ $t('ui.movimiento-e09ae5') }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-ruta="props">
        <q-td :props="props">
          <template v-if="/\.pdf$/i.test(props.row.ruta)">
            <q-btn
              id="btnVerPDF"
              color="primary"
              icon="picture_as_pdf"
              :label="$t('ui.ver-pdf-57c851')"
              @click="abrirEnNuevaPestana(props.row.ruta)"
            />
          </template>

          <template v-else>
            <q-img
              id="btnVerImagen"
              :src="props.row.ruta"
              class="cursor-pointer"
              style="max-height: 100px"
              @click="$emit('verimagen', props.row)"
            />
          </template>
        </q-td>
      </template>
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          {{ tipoestados[Number(props.row.estado)] }}
        </q-td>
      </template>
      <template v-slot:body-cell-detalle="props">
        <q-td>
          <q-btn
            id="btnVerDetalle"
            color="primary"
            label=""
            icon="shopping_cart"
            dense
            flat
            @click="$emit('verDetalle', props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <div v-if="Number(props.row.autorizacion) === 2">
            <q-btn
              icon="edit"
              color="primary"
              dense
              flat
              @click="$emit('edit', props.row)"
              id="btnEditar"
            />
            <q-btn
              icon="delete"
              color="negative"
              dense
              flat
              @click="$emit('delete', props.row)"
              id="btnEliminar"
            />
            <q-btn
              id="autorizar"
              v-if="permisosStore.tienePermiso('generarpedido')"
              icon="toggle_off"
              dense
              flat
              color="grey"
              @click="$emit('toggle-status', props.row)"
            >
              <q-tooltip>{{ $t('ui.autorizar-pedido-56cac3') }}</q-tooltip>
            </q-btn>
            <q-btn
              id="notificaciones"
              icon="notifications"
              color="warning"
              dense
              flat
              @click="abrirDialogNotificacion(props.row)"
            >
              <q-tooltip>{{ $t('ui.enviar-notificacion-a4632e') }}</q-tooltip>
            </q-btn>
            <template v-if="Number(props.row.tipopedido) === 2">
              <q-btn
                icon="attach_file"
                color="secondary"
                dense
                flat
                @click="subirBaucher(props.row)"
                id="btnSubirBaucher"
              />
            </template>
          </div>
          <div v-else>
            <div v-if="Number(props.row.tipopedido) === 2">
              <q-btn
                icon="attach_file"
                color="secondary"
                dense
                flat
                @click="subirBaucher(props.row)"
                id="btnSubirBaucher"
              />
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md">{{ $t('ui.no-hay-datos-para-mostrar-abdd8b') }}</div>
      </template>
    </q-table>
  </div>
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
  <baucherPedido v-model="baucherPedidomodal" :modal-value="pedido" :idPedido="pedidoId" />

  <!-- Dialog de Notificación -->
  <NotificacionDialog
    v-model="dialogNotificacionOpen"
    :title="tituloNotificacion"
    @notificacion-enviada="onNotificacionEnviada"
  />
  <importarInventarioProductoVariante v-model="mostrarImportarExcel" @done="$emit('reload')" />
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { PDFpedidos } from 'src/utils/pdfReportGenerator'
import baucherPedido from './baucherPedido.vue'
import NotificacionDialog from 'src/components/pusher-notificaciones/NotificacionDialog.vue'
import { useOperacionesPermitidas } from 'src/composables/useAutorizarOperaciones'
import importarInventarioProductoVariante from './importarInventarioProductoVariante.vue'

const permisosStore = useOperacionesPermitidas()
const $q = useQuasar()

// Estado para el dialog de notificación
const dialogNotificacionOpen = ref(false)
const pedidoSeleccionado = ref(null)
const tituloNotificacion = computed(() => {
  if (!pedidoSeleccionado.value) return i18nT('ui.enviar-notificacion-a4632e')
  const tipo =
    Number(pedidoSeleccionado.value.tipopedido) === 1
      ? i18nT('ui.compra-e1fa56')
      : i18nT('ui.movimiento-e09ae5')
  return i18nT('ui.notificacion-pedido-de-tipo-n-b2d5e8', {
    tipo,
    codigo: pedidoSeleccionado.value.codigo,
  })
})
const mostrarImportarExcel = ref(false)
const recargando = ref(false)

//filtroAlmacen
const props = defineProps({
  pedidos: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  almacenes: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const pedido = ref(null)
const baucherPedidomodal = ref(false)
const emit = defineEmits(['add', 'edit', 'delete', 'reload'])
const recargar = async () => {
  if (recargando.value) return
  recargando.value = true
  try {
    emit('reload')
    $q.notify({ type: 'positive', message: i18nT('ui.solicitando-recarga-44a131'), position: 'top', timeout: 1200 })
  } finally {
    recargando.value = false
  }
}
const tipoestados = { 1: 'Procesado', 2: 'Pendiente', 3: 'Descartado' }
const pdfData = ref(null)
console.log(props.almacenes[0])
const filtroAlmacen = ref(null)
const search = ref('')
const mostrarModal = ref(false)
const pedidoId = ref('')
const tiposPedido = [
  { label: i18nT('ui.pedidos-de-compras-41dc5a'), value: 1 },
  { label: i18nT('ui.pedidos-de-movimientos-9e7b28'), value: 2 },
  { label: i18nT('ui.pedidos-de-produccion-b22175'), value: 3 },
]

const filtroTipo = ref(null) // Siempre comienza en 1
const columnas = ref([])
console.log(filtroTipo.value)

function actualizarColumnas() {
  columnas.value = [
    { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
    { name: 'fecha', label: i18nT('cotizacion.table.date'), field: 'fecha', align: 'center' },
    ...(filtroTipo.value === 2
      ? [
          {
            name: 'almacenorigen',
            label: i18nT('ui.almacen-origen-3ef997'),
            field: 'almacenorigen',
            align: 'center',
          },
        ]
      : []),
    { name: 'almacen', label: i18nT('ui.almacen-destino-80fb1d'), field: 'almacen', align: 'center' },
    { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'center' },
    { name: 'tipopedido', label: i18nT('configGeneral.divisas.table.type'), field: 'tipopedido', align: 'align' },
    { name: 'observacion', label: i18nT('ui.observacion-1d0d99'), field: 'observacion', align: 'align' },
    { name: 'autorizacion', label: i18nT('ui.autorizacion-077400'), field: 'autorizacion', align: 'center' },
    { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
    { name: 'ruta', label: i18nT('ui.vaucher-7cd4c4'), field: 'ruta', align: 'center' },
    { name: 'detalle', label: i18nT('ui.detalle-be605b'), field: 'detalle', align: 'center' },
    { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
  ]
}

watch(filtroTipo, () => {
  actualizarColumnas()
})
watch(
  () => tiposPedido,
  (tipos) => {
    if (tipos.length > 0 && !filtroTipo.value) {
      filtroTipo.value = tipos[0].value
    }
  },
  { immediate: true },
)
filtroAlmacen.value = props.almacenes[0]
console.log(filtroAlmacen.value)
const filtrados = computed(() => {
  console.log(props.pedidos)
  return props.pedidos.filter((p) => {
    const coincideAlmacen = filtroAlmacen.value?.value
      ? String(p.idalmacen).includes(filtroAlmacen.value?.value)
      : true
    console.log(filtroTipo.value)
    const coincideTipo = filtroTipo.value ? Number(p.tipopedido) === filtroTipo.value : true
    const coincideBusqueda = search.value
      ? Object.values(p).some((val) =>
          String(val).toLowerCase().includes(search.value.toLowerCase()),
        )
      : true

    return coincideAlmacen && coincideTipo && coincideBusqueda
  })
})

const ordenados = computed(() => {
  return filtrados.value.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})

function imprimir() {
  const doc = PDFpedidos(ordenados, tipoestados, filtroAlmacen)
  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const subirBaucher = (item) => {
  console.log(item)
  baucherPedidomodal.value = !baucherPedidomodal.value
  pedido.value = {
    ...item,
  }
  pedidoId.value = item.id
}
const abrirEnNuevaPestana = (ruta) => {
  window.open(ruta, '_blank')
}

const abrirDialogNotificacion = (pedido) => {
  pedidoSeleccionado.value = pedido
  dialogNotificacionOpen.value = true
}

const onNotificacionEnviada = (datos) => {
  console.log('Notificación enviada para pedido:', pedidoSeleccionado.value)
  console.log('Datos de notificación:', datos)

  $q.notify({
    type: 'positive',
    message: `Notificación enviada para el pedido ${pedidoSeleccionado.value.codigo}`,
    position: 'top',
    icon: 'check_circle',
    timeout: 2500,
  })

  // Resetear selección
  pedidoSeleccionado.value = null
}

watch(
  () => props.almacenes,
  (nuevo) => {
    if (nuevo.length > 0 && !filtroAlmacen.value) {
      filtroAlmacen.value = nuevo[0]
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.text-nowrap {
  white-space: nowrap;
}
</style>

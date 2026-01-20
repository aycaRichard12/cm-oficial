<template>
  <div class="q-pa-md">
    <!-- Cabecera -->
    <div class="row q-col-gutter-x-md">
      <div class="col-6 flex justify-start">
        <q-btn color="primary" @click="$emit('add')" class="btn-res">
          <q-icon name="add" class="icono" />
          <span class="texto">Agregar</span>
        </q-btn>
      </div>
      <div class="col-6 flex justify-end">
        <q-btn color="info" @click="imprimir" outline class="btn-res">
          <q-icon name="picture_as_pdf" class="icono" />
          <span class="texto">Vista Previa PDF</span>
        </q-btn>
      </div>
    </div>
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-3">
        <label for="almacen">Almacén</label>
        <q-select
          v-model="filtroAlmacen"
          :options="almacenes"
          id="almacen"
          map-options
          clearable
          dense
          outlined
          style="min-width: 200px"
        />
      </div>

      <div class="col-12 col-md-3">
        <label for="tipo">Tipo</label>
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
      <div class="col-12 col-md-6 flex justify-end">
        <div>
          <label for="buscar">Buscar...</label>
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
      title="Pedidos"
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
            label="Autorizado"
            outline
          />
          <q-badge color="red" v-else label="No Autorizado" outline />
        </q-td>
      </template>
      <template v-slot:body-cell-tipopedido="props">
        <q-td :props="props">
          <div v-if="Number(props.row.tipopedido) === 1">
            {{ 'Compra' }}
          </div>
          <div v-else>
            {{ 'Movimiento' }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-ruta="props">
        <q-td :props="props">
          <template v-if="/\.pdf$/i.test(props.row.ruta)">
            <q-btn
              color="primary"
              icon="picture_as_pdf"
              label="Ver PDF"
              @click="abrirEnNuevaPestana(props.row.ruta)"
            />
          </template>

          <template v-else>
            <q-img
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
            <q-btn icon="edit" color="primary" dense flat @click="$emit('edit', props.row)" />
            <q-btn icon="delete" color="negative" dense flat @click="$emit('delete', props.row)" />
            <q-btn
              v-if="permisosStore.tienePermiso('generarpedido')"
              icon="toggle_off"
              dense
              flat
              color="grey"
              @click="$emit('toggle-status', props.row)"
            >
              <q-tooltip>Autorizar Pedido</q-tooltip>
            </q-btn>
            <template v-if="Number(props.row.tipopedido) === 2">
              <q-btn
                icon="attach_file"
                color="secondary"
                dense
                flat
                @click="subirBaucher(props.row)"
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
              />
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md">No hay datos para mostrar.</div>
      </template>
    </q-table>
  </div>
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
  <baucherPedido v-model="baucherPedidomodal" :modal-value="pedido" :idPedido="pedidoId" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { PDFpedidos } from 'src/utils/pdfReportGenerator'
import baucherPedido from './baucherPedido.vue'
import { useOperacionesPermitidas } from 'src/composables/useAutorizarOperaciones'

const permisosStore = useOperacionesPermitidas()
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
defineEmits(['add', 'edit', 'delete'])
const tipoestados = { 1: 'Procesado', 2: 'Pendiente', 3: 'Descartado' }
const pdfData = ref(null)
console.log(props.almacenes[0])
const filtroAlmacen = ref(null)
const search = ref('')
const mostrarModal = ref(false)
const pedidoId = ref('')
const tiposPedido = [
  { label: 'Pedidos de Compras', value: 1 },
  { label: 'Pedidos de Movimientos', value: 2 },
]

const filtroTipo = ref(null) // Siempre comienza en 1
const columnas = ref([])
console.log(filtroTipo.value)

function actualizarColumnas() {
  columnas.value = [
    { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center' },
    ...(filtroTipo.value === 2
      ? [
          {
            name: 'almacenorigen',
            label: 'Almacén origen',
            field: 'almacenorigen',
            align: 'center',
          },
        ]
      : []),
    { name: 'almacen', label: 'Almacén destino', field: 'almacen', align: 'center' },
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
    { name: 'tipopedido', label: 'Tipo', field: 'tipopedido', align: 'align' },
    { name: 'observacion', label: 'Observación', field: 'observacion', align: 'align' },
    { name: 'autorizacion', label: 'Autorización', field: 'autorizacion', align: 'center' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
    { name: 'ruta', label: 'Vaucher', field: 'ruta', align: 'center' },
    { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'center' },
    { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
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

<template>
  <div>
    <!-- Cabecera con filtros y botones -->
    <q-card flat class="q-mb-md" id="filtrosClientes">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-sm items-center justify-between q-mb-sm">
          <div class="col-12 col-md-auto row q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              @click="$emit('add')"
              icon="add"
              label="Agregar"
              id="registrarCliente"
            />
            <q-btn
              outline
              color="green"
              @click="$emit('importFromExcel')"
              icon="upload"
              label="Importar Excel"
              id="importarExcel"
            />
            <q-btn
              outline
              color="info"
              @click="exportarClientesFiltrados"
              icon="file_download"
              label="Exportar Excel"
              id="exportarExcel"
            />
            <q-btn
              outline
              color="red"
              @click="exportarClientesPDF"
              icon="picture_as_pdf"
              label="Reporte PDF"
              id="exportarPdf"
            />
          </div>
          <div class="col-12 col-md-auto text-right">
            <q-input
              dense
              outlined
              bg-color="white"
              clearable
              debounce="300"
              v-model="search"
              id="buscar"
              placeholder="Buscar rápido..."
              style="min-width: 250px"
            >
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroTipoCliente"
              :options="tipoClienteFilterOptions"
              id="tipocliente"
              label="Filtrar por Tipo Cliente"
              dense
              outlined
              clearable
            >
              <template v-slot:prepend><q-icon name="category" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroCanalVenta"
              :options="canalVentaFilterOptions"
              id="canalventa"
              label="Filtrar por Canal Venta"
              dense
              outlined
              clearable
            >
              <template v-slot:prepend><q-icon name="storefront" /></template>
            </q-select>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtroTipoDocumento"
              :options="tipoDocumentoFilterOptions"
              id="tipodoc"
              label="Filtrar por Tipo Doc."
              dense
              outlined
              clearable
            >
              <template v-slot:prepend><q-icon name="badge" /></template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Alerta/Notificación -->
    <q-banner v-if="alertMessage" :class="alertClass" class="q-mb-md rounded-borders">
      <q-icon name="info" size="sm" class="q-mr-sm" />
      {{ alertMessage }}
    </q-banner>

    <!-- Tabla de clientes -->
    <q-table
      title="Clientes"
      :rows="filteredClients"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="search"
      class="sticky-header-table"
      id="tablaClientes"
    >
      <template v-slot:top-right> </template>
      <!-- Personalización de celdas para truncar texto -->
      <template v-slot:body-cell="props">
        <q-td :props="props">
          <div class="text-wrap">
            {{ props.value }}
          </div>
        </q-td>
      </template>

      <!-- Columna de opciones -->
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn
            icon="edit"
            color="primary"
            dense
            flat
            @click="editClient(props.row)"
            id="editarCliente"
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            flat
            @click="deleteClient(props.row)"
            id="eliminarCliente"
          />
          <q-btn
            icon="add"
            color="primary"
            dense
            flat
            @click="addToList(props.row)"
            id="agregarCliente"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de confirmación para eliminar -->
    <q-dialog v-model="confirmDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar eliminación</div>
        </q-card-section>

        <q-card-section>
          ¿Está seguro que desea eliminar al cliente {{ clientToDelete.nombre }}?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="deleteClient" />
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
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx-js-style'
import { PDF_REPORTE_CLIENTES } from 'src/utils/pdfReportGenerator'

const mostrarModal = ref(false)
const pdfData = ref(null)

// Props desde el componente padre
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
  tipoClienteFilterOptions: {
    type: Array,
    required: true,
    default: () => [],
  },
  canalVentaFilterOptions: {
    type: Array,
    required: true,
    default: () => [],
  },
  tipoDocumentoFilterOptions: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// Filtros
const filtroTipoCliente = ref(null)
const filtroCanalVenta = ref(null)
const filtroTipoDocumento = ref(null)

// Alerta
const alertMessage = ref('')
const alertClass = ref('bg-green text-white')

// Búsqueda y paginación
const search = ref('')

const columns = [
  { name: 'id', label: 'N°', field: (row) => row.numero, align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Razón Social', field: 'nombre', align: 'left' },
  {
    name: 'nombrecomercial',
    label: 'Nombre Comercial',
    field: 'nombrecomercial',
    align: 'left',
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',

    align: 'left',
  },
  {
    name: 'canal',
    label: 'Canal Venta',
    field: 'canal',
    align: 'left',
  },
  {
    name: 'textotipodocumento',
    label: 'Tipo.Doc',
    field: 'textotipodocumento',
    align: 'center',
  },
  { name: 'nit', label: 'Nro.Doc', field: 'nit', align: 'right' },
  { name: 'detalle', label: 'Detalle', field: 'detalle', align: 'left' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'telefono', label: 'Telefono', field: 'telefono', align: 'center' },
  { name: 'movil', label: 'Movil', field: 'movil', align: 'left' },
  { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left' },
  { name: 'zona', label: 'Zona', field: 'zona', align: 'left' },
  { name: 'pais', label: 'Pais', field: 'pais', align: 'left' },
  { name: 'web', label: 'Web', field: 'web', align: 'left' },
  { name: 'contacto', label: 'Contacto', field: 'contacto', align: 'left' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]
const processedRows = computed(() => {
  return props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
// Emit para comunicar al componente padre
const emit = defineEmits(['add', 'importFromExcel', 'exportToExcel', 'edit', 'delete', 'addToList'])

// Filtrar los clientes según los filtros aplicados
const filteredClients = computed(() => {
  return processedRows.value.filter((client) => {
    const matchesTipo =
      !filtroTipoCliente.value ||
      filtroTipoCliente.value.value === '0' ||
      client.tipo === filtroTipoCliente.value.label
    const matchesCanal =
      !filtroCanalVenta.value ||
      filtroCanalVenta.value.value === '0' || // opción "Todos"
      client.canal === filtroCanalVenta.value.label

    const matchesDocumento =
      !filtroTipoDocumento.value ||
      filtroTipoDocumento.value === 'Todos (Tipo Doc.)' ||
      client.textotipodocumento === filtroTipoDocumento.value
    return matchesTipo && matchesCanal && matchesDocumento
  })
})

// Edición
function editClient(client) {
  emit('edit', client)
}

// Confirmación de eliminación
const confirmDeleteDialog = ref(false)
const clientToDelete = ref({})

function deleteClient(client) {
  const clientCopy = { ...client } // Clon plano del objeto
  clientToDelete.value = clientCopy
  emit('delete', clientCopy)
}

function exportarClientesFiltrados() {
  const worksheet = XLSX.utils.json_to_sheet(filteredClients.value)

  // Establecer anchos de columnas (wch = width in characters)
  worksheet['!cols'] = [
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 20 }, // Nombre
    { wch: 50 }, // Dirección
    { wch: 15 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 25 }, // Email
    { wch: 25 }, // Email
    { wch: 25 }, // Email
    { wch: 25 }, // Email
    { wch: 25 }, // Email

    // Añade más columnas si hay más campos
  ]

  // Establecer altura de filas (hpt = height in points)
  worksheet['!rows'] = [
    { hpt: 50 }, // Encabezado
    // Puedes repetir para más filas si deseas
  ]

  // Aplicar estilos
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      console.log(cell_ref, cell_address)
      console.log(worksheet[cell_ref])
      const cell = worksheet[cell_ref]
      if (!cell) continue

      cell.s = {
        font: {
          name: 'Arial',
          sz: 12,
          bold: R === 0,
          color: { rgb: R === 0 ? 'FFFFFF' : '000000' },
        },
        fill: {
          fgColor: { rgb: R === 0 ? '4F81BD' : 'FFFFFF' },
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      }
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')
  XLSX.writeFile(workbook, 'clientes.xlsx')
}

// Añadir a una lista personalizada
function addToList(client) {
  emit('addToList', client)
}

function exportarClientesPDF() {
  const doc = PDF_REPORTE_CLIENTES(filteredClients.value)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
</script>

<style scoped></style>

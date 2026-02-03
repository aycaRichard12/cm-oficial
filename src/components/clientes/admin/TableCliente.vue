<template>
  <div>
    <!-- Cabecera con filtros y botones -->
    <div class="row q-col-gutter-x-md q-mb-md">
      <div>
        <q-btn color="primary" @click="$emit('add')" class="btn-res q-mt-lg">
          <q-icon name="add" class="icono" />
          <span class="texto">Agregar</span>
        </q-btn>
      </div>
      <div>
        <q-btn color="green" @click="$emit('importFromExcel')" class="btn-res q-mt-lg" outline>
          <q-icon name="import_export" class="icono" />
          <span class="texto">Importar de Excel</span>
        </q-btn>
      </div>
      <div>
        <q-btn color="info" @click="exportarClientesFiltrados" class="btn-res q-mt-lg" outline="">
          <q-icon name="file_upload" class="icono" />
          <span class="texto">Exportar a Excel</span>
        </q-btn>
      </div>
    </div>
    <div class="row q-col-gutter-x-md q-mb-md">
      <!-- Botones izquierda -->

      <div class="col-12 col-md-2">
        <label for="tipocliente">Tipo Cliente</label>
        <q-select
          v-model="filtroTipoCliente"
          :options="tipoClienteFilterOptions"
          id="tipocliente"
          dense
          outlined
        />
      </div>

      <!-- Filtros centrales -->
      <div class="col-12 col-md-2">
        <label for="canalventa">Canal Venta</label>
        <q-select
          v-model="filtroCanalVenta"
          :options="canalVentaFilterOptions"
          id="canalventa"
          dense
          outlined
        />
      </div>

      <div class="col-12 col-md-2">
        <label for="tipodoc">Tipo Doc</label>
        <q-select
          v-model="filtroTipoDocumento"
          :options="tipoDocumentoFilterOptions"
          id="tipodoc"
          dense
          outlined
        />
      </div>
      <div class="col-12 col-md-6 flex justify-end">
        <div>
          <label for="buscar">Buscar...</label>
          <q-input dense debounce="300" v-model="search" id="buscar" outlined="" />
        </div>
      </div>

      <!-- Busqueda derecha -->
    </div>

    <!-- Alerta/Notificación -->
    <q-banner v-if="alertMessage" :class="alertClass">
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
          <q-btn icon="edit" color="primary" dense flat @click="editClient(props.row)" />
          <q-btn icon="delete" color="negative" dense flat @click="deleteClient(props.row)" />
          <q-btn icon="add" color="primary" dense flat @click="addToList(props.row)" />
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
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx-js-style'

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
  { name: 'nombre', label: 'Razón Social', field: 'nombre', align: 'left' },
  {
    name: 'nombrecomercial',
    label: 'Nombre Comercial',
    field: 'nombrecomercial',
    align: 'left',
  },
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left' },
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
</script>

<style scoped></style>

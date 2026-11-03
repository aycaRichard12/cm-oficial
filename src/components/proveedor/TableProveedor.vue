<template>
  <div>
    <q-card flat class="q-mb-md" id="filtrosProveedores">
      <q-card-section class="q-pa-md row q-col-gutter-sm items-center justify-between">
        <div class="col-12 col-md-auto row q-gutter-sm">
          <q-btn color="primary" @click="$emit('add')" class="btn-res" :title="$t('ui.registrar-proveedor-0beda2')">
            <q-icon name="add" class="icono" />
            <span class="texto"> <q-icon name="add" /> {{ $t('common.new') }} </span>
          </q-btn>
          <q-btn
            outline
            color="green"
            @click="$emit('importFromExcel')"
            icon="upload"
            :label="$t('ui.importar-excel-c115aa')"
            id="importarExcel"
          />
          <q-btn
            outline
            color="info"
            @click="exportarClientesFiltrados"
            icon="file_download"
            :label="$t('reportes.exportExcel')"
            id="exportarExcel"
          />
          <q-btn
            outline
            color="red"
            @click="exportarProveedoresPDF"
            icon="picture_as_pdf"
            :label="$t('ui.reporte-pdf-7a7b28')"
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
            v-model="filtro"
            id="buscar"
            :placeholder="$t('ui.buscar-rapido-534a2b')"
            style="min-width: 250px"
          >
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
        </div>
      </q-card-section>
    </q-card>
    <q-table
      id="tablaProveedores"
      flat
      bordered
      :title="$t('ui.proveedores-e10044')"
      :rows="filtrarProveedores"
      :columns="columnas"
      row-key="id"
      :filter="filtro"
      :pagination="{ rowsPerPage: 10 }"
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
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            dense
            icon="edit"
            color="primary"
            @click="editarProveedor(props.row)"
            id="editarProveedor"
          />
          <q-btn
            flat
            dense
            icon="delete"
            color="negative"
            @click="eliminarProveedor(props.row)"
            id="eliminarProveedor"
          />
        </q-td>
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
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx-js-style'
import { PDF_REPORTE_PROVEEDORES } from 'src/utils/pdfReportGenerator'
const mostrarModal = ref(false)
const pdfData = ref(null)
const emit = defineEmits(['add', 'importFromExcel', 'exportToExcel', 'edit', 'delete', 'addToList'])
const filtro = ref('')

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

const columnas = [
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  {
    name: 'nombre',
    label: i18nT('configGeneral.tipoAlmacen.form.name'),
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  { name: 'nit', label: 'NIT', field: 'nit', align: 'right' },
  { name: 'detalle', label: i18nT('ui.detalle-be605b'), field: 'detalle', align: 'left' },
  { name: 'direccion', label: i18nT('ui.direccion-04f478'), field: 'direccion', align: 'left' },
  { name: 'email', label: i18nT('configuracion.servicios.table.email'), field: 'email', align: 'left' },
  { name: 'telefono', label: i18nT('ui.telefono-99af37'), field: 'telefono' },
  { name: 'mobil', label: i18nT('ui.mobil-6e1dff'), field: 'mobil' },
  { name: 'ciudad', label: i18nT('ui.ciudad-c6fbe2'), field: 'ciudad', align: 'left' },
  { name: 'zona', label: i18nT('ui.zona-27288b'), field: 'zona', align: 'left' },
  { name: 'pais', label: i18nT('ui.pais-0c664f'), field: 'pais', align: 'center' },
  { name: 'web', label: i18nT('ui.web-a8323a'), field: 'web', align: 'left' },
  { name: 'contacto', label: i18nT('ui.contacto-d8a53e'), field: 'contacto', align: 'left' },
  { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'opciones', align: 'center' },
]

const filtrarProveedores = computed(() => {
  if (!filtro.value) return props.rows
  const texto = filtro.value.toLowerCase()
  return props.rows.filter((p) =>
    Object.values(p).some((val) => String(val).toLowerCase().includes(texto)),
  )
})

const editarProveedor = (row) => {
  console.log('Editar', row)
  emit('edit', row)
}

const eliminarProveedor = (row) => {
  console.log('Eliminar', row)
  emit('delete', row)
}

function exportarClientesFiltrados() {
  const worksheet = XLSX.utils.json_to_sheet(filtrarProveedores.value)

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
  XLSX.utils.book_append_sheet(workbook, worksheet, i18nT('ui.proveedores-e10044'))
  XLSX.writeFile(workbook, 'proveedores.xlsx')
}

function exportarProveedoresPDF() {
  const doc = PDF_REPORTE_PROVEEDORES(filtrarProveedores.value)
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
</script>

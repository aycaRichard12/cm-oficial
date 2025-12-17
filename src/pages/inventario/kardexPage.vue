<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h5 text-center text-weight-bold q-mb-md">Reporte de Kardex</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="searchKardex" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-6">
              <q-input
                filled
                v-model="startDate"
                label="Fecha Inicial"
                mask="####-##-##"
                :rules="[(val) => !!val || 'La fecha inicial es requerida']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="startDate" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-input
                filled
                v-model="endDate"
                label="Fecha Final"
                mask="####-##-##"
                :rules="[
                  (val) => !!val || 'La fecha final es requerida',
                  (val) =>
                    validateDates() ||
                    'La fecha final debe ser igual o posterior a la fecha inicial',
                ]"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="endDate" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
          <div class="row justify-center q-mt-md">
            <q-btn label="Buscar" type="submit" color="primary" icon="search" :loading="loading">
              <template v-slot:loading>
                <q-spinner-tail color="white" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>

      <q-separator class="q-my-md" />

      <q-card-section v-if="kardexEntries.length > 0">
        <q-table
          :rows="kardexEntries"
          :columns="columns"
          row-key="id"
          flat
          bordered
          separator="cell"
          hide-pagination
          :rows-per-page-options="[0]"
          no-data-label="No hay movimientos en el rango de fechas seleccionado"
        >
          <template v-slot:body-cell-entrada="props">
            <q-td :props="props">
              <span :class="props.value > 0 ? 'text-green-8 text-weight-bold' : ''">
                {{ props.value > 0 ? props.value : '-' }}
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-salida="props">
            <q-td :props="props">
              <span :class="props.value > 0 ? 'text-red-8 text-weight-bold' : ''">
                {{ props.value > 0 ? props.value : '-' }}
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-saldo="props">
            <q-td :props="props">
              <span class="text-blue-8 text-weight-bold">
                {{ props.value }}
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-valor_entrada="props">
            <q-td :props="props">
              <span :class="props.value > 0 ? 'text-green-8' : ''">
                {{ formatCurrency(props.value) }}
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-valor_salida="props">
            <q-td :props="props">
              <span :class="props.value > 0 ? 'text-red-8' : ''">
                {{ formatCurrency(props.value) }}
              </span>
            </q-td>
          </template>
          <template v-slot:body-cell-valor_saldo="props">
            <q-td :props="props">
              <span class="text-blue-8 text-weight-bold">
                {{ formatCurrency(props.value) }}
              </span>
            </q-td>
          </template>
        </q-table>

        <q-card-section class="q-mt-md">
          <div class="text-h6 text-right">Resumen:</div>
          <div class="text-body1 text-right q-mt-sm">
            Saldo Total de Unidades:
            <span class="text-weight-bold text-blue-8">{{ totalUnitsSaldo }}</span>
          </div>
          <div class="text-body1 text-right">
            Valor Total en Saldo:
            <span class="text-weight-bold text-blue-8">{{ formatCurrency(totalValueSaldo) }}</span>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-mt-md">
          <q-btn
            label="Exportar PDF"
            color="red"
            icon="picture_as_pdf"
            @click="exportToPdf"
            :disable="kardexEntries.length === 0"
          />
          <q-btn
            label="Exportar Excel"
            color="green"
            icon="cloud_download"
            @click="exportToExcel"
            :disable="kardexEntries.length === 0"
          />
        </q-card-actions>
      </q-card-section>

      <q-card-section v-else-if="!loading && searchAttempted" class="text-center text-grey-7">
        <q-icon name="info" size="xl" />
        <div class="q-mt-sm">No hay resultados para el rango de fechas seleccionado.</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import api from 'src/api/api' // Ajusta la ruta a tu archivo api.js
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

const $q = useQuasar()

const startDate = ref(null)
const endDate = ref(null)
const kardexEntries = ref([])
const loading = ref(false)
const searchAttempted = ref(false) // Para saber si ya se intentó una búsqueda

const columns = [
  {
    name: 'id',
    required: true,
    label: '#',
    align: 'left',
    field: 'id',
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', sortable: true },
  { name: 'detalle', align: 'left', label: 'Detalle', field: 'detalle', sortable: true },
  {
    name: 'precio_unitario',
    align: 'right',
    label: 'P. Unitario',
    field: 'precio_unitario',
    format: (val) => formatCurrency(val),
    sortable: true,
  },
  { name: 'cantidad', align: 'right', label: 'Cantidad', field: 'cantidad', sortable: true },
  { name: 'entrada', align: 'right', label: 'Entrada', field: 'entrada', sortable: true },
  { name: 'salida', align: 'right', label: 'Salida', field: 'salida', sortable: true },
  { name: 'saldo', align: 'right', label: 'Saldo (U)', field: 'saldo', sortable: true },
  {
    name: 'valor_entrada',
    align: 'right',
    label: 'V. Entrada',
    field: 'valor_entrada',
    format: (val) => formatCurrency(val),
    sortable: true,
  },
  {
    name: 'valor_salida',
    align: 'right',
    label: 'V. Salida',
    field: 'valor_salida',
    format: (val) => formatCurrency(val),
    sortable: true,
  },
  {
    name: 'valor_saldo',
    align: 'right',
    label: 'V. Saldo',
    field: 'valor_saldo',
    format: (val) => formatCurrency(val),
    sortable: true,
  },
]

// Computed properties para el resumen
const totalUnitsSaldo = computed(() => {
  if (kardexEntries.value.length === 0) return 0
  return kardexEntries.value[kardexEntries.value.length - 1].saldo
})

const totalValueSaldo = computed(() => {
  if (kardexEntries.value.length === 0) return 0
  return kardexEntries.value[kardexEntries.value.length - 1].valor_saldo
})

// Formato de moneda
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '-'
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB', // O la moneda de tu preferencia
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Validación de fechas
const validateDates = () => {
  if (!startDate.value || !endDate.value) return true // La regla de "requerido" ya cubre esto.
  return new Date(endDate.value) >= new Date(startDate.value)
}

// Función para buscar movimientos del Kardex
const searchKardex = async () => {
  searchAttempted.value = true
  if (!startDate.value || !endDate.value || !validateDates()) {
    $q.notify({
      type: 'negative',
      message: 'Por favor, complete las fechas correctamente.',
      position: 'top',
    })
    return
  }

  loading.value = true
  kardexEntries.value = [] // Limpiar resultados anteriores
  try {
    const response = await api.get('/kardex', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    })
    kardexEntries.value = response.data
    if (kardexEntries.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No se encontraron movimientos para el rango de fechas seleccionado.',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error al obtener datos del Kardex:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos del Kardex. Intente nuevamente.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// Exportar a PDF
const exportToPdf = () => {
  const doc = new jsPDF('landscape')
  doc.text('Reporte de Kardex', 14, 16)
  doc.text(`Desde: ${startDate.value} Hasta: ${endDate.value}`, 14, 22)

  const tableColumn = columns.map((col) => col.label)
  const tableRows = kardexEntries.value.map((entry) => {
    return columns.map((col) => {
      let value = entry[col.field]
      if (['precio_unitario', 'valor_entrada', 'valor_salida', 'valor_saldo'].includes(col.field)) {
        return formatCurrency(value)
      }
      if (['entrada', 'salida'].includes(col.field) && value === 0) {
        return '-'
      }
      return value
    })
  })

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      // Ajusta el ancho de las columnas si es necesario
      0: { cellWidth: 10 }, // ID
      1: { cellWidth: 20 }, // Fecha
      2: { cellWidth: 60 }, // Detalle
      3: { cellWidth: 25, halign: 'right' }, // P. Unitario
      4: { cellWidth: 20, halign: 'right' }, // Cantidad
      5: { cellWidth: 20, halign: 'right' }, // Entrada
      6: { cellWidth: 20, halign: 'right' }, // Salida
      7: { cellWidth: 20, halign: 'right' }, // Saldo (U)
      8: { cellWidth: 25, halign: 'right' }, // V. Entrada
      9: { cellWidth: 25, halign: 'right' }, // V. Salida
      10: { cellWidth: 25, halign: 'right' }, // V. Saldo
    },
  })

  // Añadir resumen al final del PDF
  const finalY = doc.autoTable.previous.finalY + 10
  doc.setFontSize(10)
  doc.text(
    `Saldo Total de Unidades: ${totalUnitsSaldo.value}`,
    doc.internal.pageSize.width - 14,
    finalY,
    { align: 'right' },
  )
  doc.text(
    `Valor Total en Saldo: ${formatCurrency(totalValueSaldo.value)}`,
    doc.internal.pageSize.width - 14,
    finalY + 7,
    { align: 'right' },
  )

  doc.save(`Kardex_${startDate.value}_${endDate.value}.pdf`)
}

// Exportar a Excel
const exportToExcel = () => {
  const dataToExport = kardexEntries.value.map((entry) => {
    const row = {}
    columns.forEach((col) => {
      let value = entry[col.field]
      if (['precio_unitario', 'valor_entrada', 'valor_salida', 'valor_saldo'].includes(col.field)) {
        // Para Excel, puedes querer el número puro o el string formateado sin el símbolo de moneda
        row[col.label] = value // Exporta el número para mejor manipulación en Excel
        // Si prefieres el string formateado con el símbolo de moneda:
        // row[col.label] = formatCurrency(value);
      } else if (['entrada', 'salida'].includes(col.field) && value === 0) {
        row[col.label] = '' // O '-' si prefieres el texto
      } else {
        row[col.label] = value
      }
    })
    return row
  })

  // Añadir fila de resumen
  dataToExport.push({}) // Fila vacía para espacio
  dataToExport.push({
    '#': 'Resumen:',
    Fecha: '',
    Detalle: '',
    'P. Unitario': '',
    Cantidad: '',
    Entrada: '',
    Salida: 'Saldo Total de Unidades:',
    'Saldo (U)': totalUnitsSaldo.value,
    'V. Entrada': '',
    'V. Salida': 'Valor Total en Saldo:',
    'V. Saldo': totalValueSaldo.value,
  })

  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Kardex')
  XLSX.writeFile(wb, `Kardex_${startDate.value}_${endDate.value}.xlsx`)
}
</script>

<style lang="scss" scoped>
// Puedes añadir estilos específicos aquí si es necesario
// Por ejemplo, para el color de las celdas directamente si no te agrada la solución con clases
.text-green-8 {
  color: #1a7e3d; // Ejemplo de verde Quasar
}
.text-red-8 {
  color: #c10015; // Ejemplo de rojo Quasar
}
.text-blue-8 {
  color: #1976d2; // Ejemplo de azul Quasar
}
</style>

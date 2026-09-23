<template>
  <q-dialog
    v-model="internalModelValue"
    persistent
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="resetForm"
  >
    <q-card class="dpv-card">
      <!-- ── HEADER ────────────────────────────────────────────── -->
      <q-card-section class="dpv-header row items-center q-pb-none">
        <div class="col">
          <div class="dpv-title">
            <q-icon name="upload_file" size="22px" class="q-mr-sm" />
            Importar Detalle de Compra
          </div>
          <div class="dpv-subtitle">
            Compra: {{ compra?.codigo || 'S/C' }} · Factura: {{ compra?.nfactura || 'S/N' }}
          </div>
        </div>
        <q-btn icon="close" flat round dense color="white" v-close-popup :disable="isUploading" />
      </q-card-section>

      <!-- ── STEPPER VISUAL ───────────────────────────────────── -->
      <div class="dpv-steps row q-px-lg q-pt-md q-pb-xs">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="dpv-step col"
          :class="{
            'dpv-step--active': currentStep >= i + 1,
            'dpv-step--done': currentStep > i + 1,
          }"
        >
          <div class="dpv-step__circle">
            <q-icon v-if="currentStep > i + 1" name="check" size="14px" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="dpv-step__label">{{ step }}</div>
          <div v-if="i < steps.length - 1" class="dpv-step__line" />
        </div>
      </div>

      <q-separator class="q-mt-sm" />

      <!-- ── BODY ──────────────────────────────────────────────── -->
      <q-card-section class="q-pt-md q-px-lg">
        <!-- PASO 1 · Almacén asignado ─────────────────────────── -->
        <div class="dpv-section">
          <div class="dpv-section__label">
            <span class="dpv-badge">1</span>
            Almacén asignado a la compra
          </div>

          <div class="dpv-almacen-info q-mt-sm row items-center justify-between">
            <div class="row items-center">
              <q-icon name="store" color="primary" size="24px" class="q-mr-sm" />
              <div>
                <div class="text-subtitle2 text-weight-bold text-grey-9">
                  {{ almacenNombre }}
                </div>
                <div class="text-caption text-grey-7">
                  Proveedor: {{ compra?.proveedor || 'No especificado' }}
                </div>
              </div>
            </div>
            <q-chip dense color="primary" text-color="white" icon="check" size="sm">
              Asignado
            </q-chip>
          </div>
        </div>

        <!-- PASO 2 · Descargar plantilla ─────────────────────── -->
        <div class="dpv-section" :class="{ 'dpv-section--disabled': !idalmacen }">
          <div class="dpv-section__label">
            <span class="dpv-badge" :class="{ 'dpv-badge--inactive': !idalmacen }">2</span>
            Descargar plantilla Excel
          </div>
          <div class="dpv-download-area q-mt-sm">
            <div class="dpv-download-info">
              <q-icon name="description" color="green-7" size="28px" />
              <div class="q-ml-sm">
                <div class="text-body2 text-weight-medium">plantilla_detalle_compra.xlsx</div>
                <div class="text-caption text-grey-6">
                  Contiene los productos y variantes del almacén asignado
                </div>
              </div>
            </div>
            <q-btn
              label="Descargar"
              icon="download"
              color="green-7"
              unelevated
              :disable="!idalmacen || isUploading"
              :loading="isDownloading"
              class="dpv-btn-download"
              @click="descargarPlantilla"
            >
              <template #loading>
                <q-spinner-ios size="18px" />
              </template>
            </q-btn>
          </div>
        </div>

        <!-- PASO 3 · Subir archivo ────────────────────────────── -->
        <div class="dpv-section" :class="{ 'dpv-section--disabled': !idalmacen }">
          <div class="dpv-section__label">
            <span class="dpv-badge" :class="{ 'dpv-badge--inactive': !idalmacen }">3</span>
            Subir archivo editado
          </div>

          <q-file
            v-model="archivoExcel"
            label="Selecciona tu archivo Excel completado"
            outlined
            dense
            accept=".xlsx, .xls"
            :disable="!idalmacen || isUploading"
            class="q-mt-sm"
            @update:model-value="onFileSelected"
          >
            <template #prepend>
              <q-icon name="upload_file" color="primary" />
            </template>
            <template #append>
              <q-icon
                v-if="archivoExcel"
                name="cancel"
                class="cursor-pointer"
                color="grey-5"
                @click.stop.prevent="resetArchivo"
              />
            </template>
          </q-file>

          <!-- Estado del archivo seleccionado -->
          <transition name="dpv-fade">
            <div
              v-if="fileStatus"
              class="dpv-file-status q-mt-sm"
              :class="`dpv-file-status--${fileStatus.type}`"
            >
              <q-icon :name="fileStatus.icon" size="16px" class="q-mr-xs" />
              {{ fileStatus.text }}
            </div>
          </transition>
        </div>

        <!-- MENSAJE DE ESTADO GLOBAL ─────────────────────────── -->
        <transition name="dpv-fade">
          <q-banner
            v-if="statusMessage"
            dense
            rounded
            :class="
              statusMessage.type === 'error' ? 'bg-red-1 text-red-9' : 'bg-green-1 text-green-9'
            "
            class="q-mt-md dpv-banner"
          >
            <template #avatar>
              <q-icon
                :name="statusMessage.type === 'error' ? 'error_outline' : 'check_circle_outline'"
                :color="statusMessage.type === 'error' ? 'red-7' : 'green-7'"
              />
            </template>
            {{ statusMessage.text }}
          </q-banner>
        </transition>
      </q-card-section>

      <!-- ── FOOTER ────────────────────────────────────────────── -->
      <q-card-actions align="right" class="q-px-lg q-pb-lg q-pt-sm">
        <q-btn flat label="Cancelar" color="grey-7" :disable="isUploading" v-close-popup />
        <q-btn
          label="Importar Detalle"
          icon="cloud_upload"
          color="primary"
          unelevated
          :loading="isUploading"
          :disable="!canSubmit"
          class="dpv-btn-submit"
          @click="procesarYEnviar"
        >
          <template #loading>
            <q-spinner-dots size="18px" class="q-mr-sm" />
            Procesando...
          </template>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { api } from 'src/boot/axios'

// ──────────────────────────────────────────────────────────────
// PROPS & EMITS
// ──────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  compra: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'done'])

const $q = useQuasar()

/** Controla la visibilidad del diálogo sin mutar la prop directamente */
const internalModelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// ──────────────────────────────────────────────────────────────
// ESTADO REACTIVO
// ──────────────────────────────────────────────────────────────
const isDownloading = ref(false)
const isUploading = ref(false)
const archivoExcel = ref(null)
const fileStatus = ref(null) // { type: 'success'|'error', icon, text }
const statusMessage = ref(null) // { type: 'error'|'success', text }

// Stepper
const steps = ['Almacén', 'Descarga', 'Importar']

// ──────────────────────────────────────────────────────────────
// COMPUTED
// ──────────────────────────────────────────────────────────────
const idalmacen = computed(() => {
  return props.compra?.idalmacen || props.compra?.almacen_id_almacen || null
})

const idingreso = computed(() => {
  return props.compra?.id || props.compra?.id_ingreso || props.compra?.idingreso || null
})

const almacenNombre = computed(() => {
  return props.compra?.almacen || (idalmacen.value ? `Almacén #${idalmacen.value}` : 'No asignado')
})

const currentStep = computed(() => {
  if (isUploading.value) return 3
  if (archivoExcel.value) return 3
  if (idalmacen.value) return 2
  return 1
})

const canSubmit = computed(() => {
  return !!idalmacen.value && !!idingreso.value && !!archivoExcel.value && !isUploading.value
})

// ──────────────────────────────────────────────────────────────
// FUNCIONES
// ──────────────────────────────────────────────────────────────

/**
 * Descarga la plantilla con los productos y variantes del almacén asignado a la compra.
 */
async function descargarPlantilla() {
  if (!idalmacen.value) {
    statusMessage.value = { type: 'error', text: 'La compra no tiene un almacén válido asignado.' }
    return
  }

  isDownloading.value = true
  statusMessage.value = null

  try {
    const url = `descargarPlanillaDetalleCompra/${idalmacen.value}`
    const { data } = await api.get(url)

    if (data.estado === 'error') {
      throw new Error(data.mensaje || 'Error al obtener productos para exportar.')
    }

    if (!Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No hay productos ni variantes disponibles en este almacén.')
    }

    // Formatear filas para el Excel
    const filas = data.data.map((item) => ({
      productoalmacen: item.id_productos_almacen,
      idproductovariante: item.id_variante || '',
      codigo_producto: item.codigo_producto || '',
      nombre_producto: item.nombre_producto || '',
      descripcion_producto: item.descripcion_producto || '',
      sku_variante: item.sku_variante || '',
      atributos: item.atributos || '',
      precio_unitario: '',
      cantidad: '',
    }))

    // Crear libro de cálculo
    const worksheet = XLSX.utils.json_to_sheet(filas)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DetalleCompra')

    // Descargar archivo
    const nombreDescarga = `plantilla_detalle_compra_${props.compra?.codigo || idalmacen.value}.xlsx`
    XLSX.writeFile(workbook, nombreDescarga)

    statusMessage.value = {
      type: 'success',
      text: 'Plantilla generada correctamente. Rellena precio_unitario y cantidad en los productos deseados.',
    }

    $q.notify({
      type: 'positive',
      message: 'Plantilla de compra descargada',
      icon: 'download_done',
    })
  } catch (err) {
    console.error('[descargarPlantilla Detalle Compra]', err)
    statusMessage.value = {
      type: 'error',
      text: err?.response?.data?.mensaje || err.message || 'Error al generar la plantilla.',
    }
  } finally {
    isDownloading.value = false
  }
}

/**
 * Valida y analiza el archivo Excel seleccionado
 */
async function onFileSelected(file) {
  statusMessage.value = null

  if (!file) {
    fileStatus.value = null
    return
  }

  const esExcel = /\.(xlsx|xls)$/i.test(file.name)
  if (!esExcel) {
    fileStatus.value = {
      type: 'error',
      icon: 'error_outline',
      text: 'El archivo debe ser .xlsx o .xls',
    }
    archivoExcel.value = null
    return
  }

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]

    if (!sheetName) {
      throw new Error('El archivo no contiene hojas de cálculo.')
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet)

    const validas = rows.filter((r) => {
      const cant = Number(r.cantidad)
      const prec = Number(r.precio_unitario ?? r.precio)
      const prodAlm = Number(r.productoalmacen ?? r.id_productos_almacen)
      return prodAlm > 0 && cant > 0 && !isNaN(prec) && prec >= 0
    })

    fileStatus.value = {
      type: 'success',
      icon: 'check_circle_outline',
      text: `${file.name} · ${validas.length} producto(s) con cantidad válida detectado(s)`,
    }
  } catch (err) {
    console.error('[onFileSelected]', err)
    fileStatus.value = {
      type: 'success',
      icon: 'check_circle_outline',
      text: `${file.name} · ${(file.size / 1024).toFixed(1)} KB`,
    }
  }
}

/** Limpia el archivo seleccionado */
function resetArchivo() {
  archivoExcel.value = null
  fileStatus.value = null
}

/**
 * Lee el Excel, filtra las filas con cantidad > 0, convierte a CSV y envía al backend
 */
async function procesarYEnviar() {
  if (!idingreso.value) {
    return mostrarError('No se identificó el registro de compra (idingreso inválido).')
  }
  if (!idalmacen.value) {
    return mostrarError('La compra no tiene un almacén asignado.')
  }
  if (!archivoExcel.value) {
    return mostrarError('Debes seleccionar un archivo Excel.')
  }

  isUploading.value = true
  statusMessage.value = null

  try {
    const buffer = await archivoExcel.value.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]

    if (!sheetName) {
      throw new Error('El archivo no contiene hojas de cálculo.')
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet)

    // Filtrar solo filas que tengan cantidad > 0 y precio >= 0
    const validRows = rows.filter((r) => {
      const cant = Number(r.cantidad)
      const prec = Number(r.precio_unitario ?? r.precio)
      const prodAlm = Number(r.productoalmacen ?? r.id_productos_almacen)
      return prodAlm > 0 && cant > 0 && !isNaN(prec) && prec >= 0
    })

    if (validRows.length === 0) {
      throw new Error(
        'No se encontraron filas con cantidades mayores a 0 y precios válidos para importar.',
      )
    }

    // Mapear estrictamente a las columnas esperadas por el backend
    const filasParaCsv = validRows.map((r) => ({
      productoalmacen: Number(r.productoalmacen ?? r.id_productos_almacen),
      idproductovariante:
        r.idproductovariante !== undefined && r.idproductovariante !== ''
          ? Number(r.idproductovariante)
          : '',
      cantidad: Number(r.cantidad),
      precio_unitario: Number(r.precio_unitario ?? r.precio),
    }))

    const csvSheet = XLSX.utils.json_to_sheet(filasParaCsv)
    const csv = XLSX.utils.sheet_to_csv(csvSheet)

    // Construir FormData
    const blob = new Blob([csv], { type: 'text/csv' })
    const formData = new FormData()
    formData.append('ver', 'registroDetalleCompraDesdeExcel')
    formData.append('idingreso', String(idingreso.value))
    formData.append('file', blob, 'detalle_compra.csv')

    const { data } = await api.post('', formData)
    console.log('Respuesta servidor importar detalle compra:', data)

    if (data.estado === 'error') {
      throw new Error(data.mensaje || 'Error en el registro del detalle de compra.')
    }

    $q.notify({
      type: 'positive',
      message: data.mensaje || `Se importaron ${validRows.length} productos correctamente.`,
      icon: 'check_circle',
      timeout: 3500,
      position: 'top',
    })

    emit('done')
    cerrarModal()
  } catch (err) {
    console.error('[procesarYEnviar detalle compra]', err)
    mostrarError(
      err?.response?.data?.mensaje ||
        err?.message ||
        'Ocurrió un error al procesar el archivo. Intenta de nuevo.',
    )
  } finally {
    isUploading.value = false
  }
}

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
function mostrarError(text) {
  statusMessage.value = { type: 'error', text }
}

function cerrarModal() {
  emit('update:modelValue', false)
}

function resetForm() {
  archivoExcel.value = null
  fileStatus.value = null
  statusMessage.value = null
  isUploading.value = false
  isDownloading.value = false
}

defineExpose({ resetForm })
</script>

<style scoped lang="scss">
$primary: #004d40;
$primary-soft: #e3f2fd;
$border-color: #e0e0e0;
$radius: 12px;
$radius-sm: 8px;

.dpv-card {
  width: 540px;
  max-width: 95vw;
  border-radius: $radius !important;
  overflow: hidden;
}

.dpv-header {
  background: linear-gradient(135deg, #004d40 0%, #054e2c 100%);
  padding: 18px 20px 16px;

  .dpv-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    letter-spacing: 0.3px;
  }

  .dpv-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 2px;
    padding-left: 30px;
  }
}

/* Stepper visual */
.dpv-steps {
  gap: 0;
  position: relative;
}

.dpv-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;

  &__circle {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: $border-color;
    color: #9e9e9e;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    z-index: 1;
  }

  &__label {
    font-size: 11px;
    color: #9e9e9e;
    margin-top: 4px;
    font-weight: 500;
    transition: color 0.25s ease;
  }

  &__line {
    position: absolute;
    top: 13px;
    left: calc(50% + 14px);
    width: calc(100% - 28px);
    height: 2px;
    background: $border-color;
    transition: background 0.25s ease;
  }

  &--active {
    .dpv-step__circle {
      background: $primary-soft;
      color: $primary;
      border: 2px solid $primary;
    }
    .dpv-step__label {
      color: $primary;
    }
  }

  &--done {
    .dpv-step__circle {
      background: $primary;
      color: #fff;
    }
    .dpv-step__label {
      color: $primary;
    }
    .dpv-step__line {
      background: $primary;
    }
  }
}

/* Secciones del formulario */
.dpv-section {
  margin-bottom: 20px;
  transition: opacity 0.2s ease;

  &--disabled {
    opacity: 0.45;
    pointer-events: none;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #424242;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }
}

/* Info almacén */
.dpv-almacen-info {
  background: #f1f8e9;
  border: 1px solid #c5e1a5;
  border-radius: $radius-sm;
  padding: 10px 14px;
}

/* Badges numéricos */
.dpv-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: $primary;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &--inactive {
    background: #bdbdbd;
  }
}

/* Área de descarga */
.dpv-download-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fbe7;
  border: 1.5px dashed #c5e1a5;
  border-radius: $radius-sm;
  padding: 12px 16px;
}

.dpv-download-info {
  display: flex;
  align-items: center;
}

.dpv-btn-download {
  border-radius: $radius-sm !important;
  font-weight: 600 !important;
  font-size: 13px !important;
}

/* Estado del archivo */
.dpv-file-status {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: 500;

  &--success {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &--error {
    background: #ffebee;
    color: #c62828;
  }
}

/* Banner de estado */
.dpv-banner {
  border-radius: $radius-sm !important;
  font-size: 13px;
}

/* Botón submit */
.dpv-btn-submit {
  border-radius: $radius-sm !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
  padding: 0 20px !important;
}

/* Transición */
.dpv-fade-enter-active,
.dpv-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.dpv-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.dpv-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

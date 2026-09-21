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
            <q-icon name="download" size="22px" class="q-mr-sm" />
            Plantilla de Productos Variantes
          </div>
          <div class="dpv-subtitle">
            Descarga el Excel, complétalo y súbelo para registrar variantes masivamente
          </div>
        </div>
        <q-btn icon="close" flat round dense color="grey-6" v-close-popup :disable="isUploading" />
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
        <!-- PASO 1 · Seleccionar almacén ─────────────────────── -->
        <div class="dpv-section">
          <div class="dpv-section__label">
            <span class="dpv-badge">1</span>
            Seleccionar almacén
          </div>

          <q-select
            v-model="selectedAlmacen"
            :options="almacenOptions"
            label="Almacén"
            outlined
            dense
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :loading="isLoadingAlmacenes"
            :disable="isLoadingAlmacenes || isUploading"
            clearable
            class="dpv-select q-mt-sm"
            @update:model-value="onAlmacenChange"
          >
            <template #prepend>
              <q-icon name="store" color="primary" />
            </template>
            <template #append>
              <q-btn
                round
                dense
                flat
                size="sm"
                color="primary"
                icon="refresh"
                :loading="isLoadingAlmacenes"
                @click.stop.prevent="recargarAlmacenes"
              >
                <q-tooltip>Recargar almacenes</q-tooltip>
              </q-btn>
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey text-caption">
                  No hay almacenes disponibles
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- PASO 2 · Descargar plantilla ─────────────────────── -->
        <div class="dpv-section" :class="{ 'dpv-section--disabled': !selectedAlmacen }">
          <div class="dpv-section__label">
            <span class="dpv-badge" :class="{ 'dpv-badge--inactive': !selectedAlmacen }">2</span>
            Descargar plantilla Excel
          </div>
          <div class="dpv-download-area q-mt-sm">
            <div class="dpv-download-info">
              <q-icon name="description" color="green-7" size="28px" />
              <div class="q-ml-sm">
                <div class="text-body2 text-weight-medium">plantilla_variantes.xlsx</div>
                <div class="text-caption text-grey-6">
                  Contiene los productos del almacén seleccionado
                </div>
              </div>
            </div>
            <q-btn
              label="Descargar"
              icon="download"
              color="green-7"
              unelevated
              :disable="!selectedAlmacen || isUploading"
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
        <div class="dpv-section" :class="{ 'dpv-section--disabled': !selectedAlmacen }">
          <div class="dpv-section__label">
            <span class="dpv-badge" :class="{ 'dpv-badge--inactive': !selectedAlmacen }">3</span>
            Subir archivo editado
          </div>

          <q-file
            v-model="archivoExcel"
            label="Selecciona tu archivo Excel"
            outlined
            dense
            accept=".xlsx, .xls"
            :disable="!selectedAlmacen || isUploading"
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
          label="Importar variantes"
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

  <!-- Diálogo sin almacenes -->
  <q-dialog v-model="showNoAlmacenesDialog">
    <q-card style="min-width: 320px">
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="warning" text-color="white" />
        <span class="q-ml-sm text-body1 text-weight-medium">Sin almacenes asignados</span>
      </q-card-section>
      <q-card-section class="q-pt-none text-body2 text-grey-8">
        No tienes almacenes asignados a tu usuario. Contacta al administrador del sistema.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Entendido" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import emitter from 'src/event-bus'

// ──────────────────────────────────────────────────────────────
// PROPS & EMITS
// ──────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

// Almacenes
const almacenOptions = ref([])
const selectedAlmacen = ref(null)
const isLoadingAlmacenes = ref(false)
const showNoAlmacenesDialog = ref(false)

// Descarga
const isDownloading = ref(false)

// Archivo
const archivoExcel = ref(null)
const fileStatus = ref(null) // { type: 'success'|'error', icon, text }

// Upload
const isUploading = ref(false)
const statusMessage = ref(null) // { type: 'error'|'success', text }

// Stepper
const steps = ['Almacén', 'Descarga', 'Importar']

// ──────────────────────────────────────────────────────────────
// COMPUTED
// ──────────────────────────────────────────────────────────────
const currentStep = computed(() => {
  if (isUploading.value) return 3
  if (archivoExcel.value) return 3
  if (selectedAlmacen.value) return 2
  return 1
})

const canSubmit = computed(
  () => !!selectedAlmacen.value && !!archivoExcel.value && !isUploading.value,
)

// ──────────────────────────────────────────────────────────────
// WATCHERS
// ──────────────────────────────────────────────────────────────
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) cargarAlmacenes()
  },
)

onMounted(() => {
  if (props.modelValue) cargarAlmacenes()
})

// ──────────────────────────────────────────────────────────────
// FUNCIONES
// ──────────────────────────────────────────────────────────────

/** Carga los almacenes asignados al usuario actual */
async function cargarAlmacenes() {
  isLoadingAlmacenes.value = true
  almacenOptions.value = []

  try {
    const { data } = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = data.filter((item) => item.idusuario === idusuario)

    if (!filtrados.length) {
      showNoAlmacenesDialog.value = true
      return
    }

    almacenOptions.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (err) {
    console.error('[cargarAlmacenes]', err)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes',
      icon: 'warning',
    })
  } finally {
    isLoadingAlmacenes.value = false
  }
}

/**
 * Descarga la plantilla con los productos del almacén seleccionado.
 * Las columnas son las que espera el backend de importación.
 */
async function descargarPlantilla() {
  if (!selectedAlmacen.value) {
    statusMessage.value = { type: 'error', text: 'Debes seleccionar un almacén.' }
    return
  }

  isDownloading.value = true
  statusMessage.value = null

  try {
    const url = `descargarPlanillaProductoVariante/${selectedAlmacen.value}`
    const { data } = await api.get(url)

    if (!Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No hay productos para este almacén')
    }

    // Formatear datos para el Excel
    const filas = data.data.map((producto) => ({
      nombre_producto: producto.nombre || '',
      descripcion: producto.descripcion || '',
      codigo: producto.codigo || '',
      idproducto: producto.id_productos,
      productos_almacen_id_productos_almacen: producto.id_productos_almacen,
      costo_unitario: '',
      cantidad: '',
      sku: '',
      atributo_1: '',
      valor_1: '',
      atributo_2: '',
      valor_2: '',
      atributo_3: '',
      valor_3: '',
      atributo_4: '',
      valor_4: '',
      atributo_5: '',
      valor_5: '',
    }))

    // Crear hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(filas)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Variantes')

    // Descargar archivo
    XLSX.writeFile(workbook, `plantilla_variantes_almacen_${selectedAlmacen.value}.xlsx`)

    statusMessage.value = {
      type: 'success',
      text: 'Plantilla generada correctamente.',
    }

    $q.notify({
      type: 'positive',
      message: 'Plantilla descargada',
      icon: 'download_done',
    })
  } catch (err) {
    console.error('[descargarPlantilla]', err)
    statusMessage.value = {
      type: 'error',
      text: err?.response?.data?.mensaje || err.message || 'Error al generar la plantilla.',
    }
  } finally {
    isDownloading.value = false
  }
}

/**
 * Handler cuando el usuario selecciona un archivo
 */
function onFileSelected(file) {
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

  fileStatus.value = {
    type: 'success',
    icon: 'check_circle_outline',
    text: `${file.name} · ${(file.size / 1024).toFixed(1)} KB`,
  }
}

/**
 * Handler cuando cambia el almacén seleccionado
 */
async function recargarAlmacenes() {
  if (isLoadingAlmacenes.value) return
  try {
    await cargarAlmacenes()
    $q.notify({ type: 'positive', message: 'Almacenes recargados', position: 'top', timeout: 1200 })
  } catch (err) {
    console.error('Error al recargar almacenes:', err)
  }
}

function onAlmacenChange() {
  resetArchivo()
  statusMessage.value = null
}

/** Limpia el archivo seleccionado */
function resetArchivo() {
  archivoExcel.value = null
  fileStatus.value = null
}

/**
 * Lee el Excel, convierte a CSV y envía al backend para registrar variantes
 */
async function procesarYEnviar() {
  if (!selectedAlmacen.value) {
    return mostrarError('Debes seleccionar un almacén.')
  }
  if (!archivoExcel.value) {
    return mostrarError('Debes seleccionar un archivo Excel.')
  }

  isUploading.value = true
  statusMessage.value = null

  try {
    // Leer el archivo con XLSX
    const buffer = await archivoExcel.value.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]

    if (!sheetName) {
      throw new Error('El archivo no contiene hojas de cálculo.')
    }

    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)

    // Construir FormData
    const blob = new Blob([csv], { type: 'text/csv' })
    const formData = new FormData()
    formData.append('ver', 'ImportarInventarioProductoVarianteExcel')
    formData.append('md5', idempresa)
    formData.append('md5U', idusuario)
    formData.append('file', blob, 'productos_variantes.csv')

    // Enviar al backend
    const { data } = await api.post('', formData)
    console.log('Respuesta del servidor:', data)

    // Extraer resultados (si no existe, asumir arreglo vacío)
    const resultados = data.resultados || []
    const totalLotes = resultados.length
    const exitosos = resultados.filter((r) => r.status === 'success').length
    const fallidos = totalLotes - exitosos

    if (exitosos === totalLotes && totalLotes > 0) {
      // Todo salió bien
      $q.notify({
        type: 'positive',
        message: `Importación completada: ${exitosos} lote(s) exitoso(s).`,
        icon: 'check_circle',
        timeout: 3000,
        position: 'top',
      })

      emitter.emit('reiniciar-notificaciones')
      emit('done')
      cerrarModal()
    } else if (exitosos > 0) {
      // Algunos lotes fallaron
      $q.notify({
        type: 'warning',
        message: `Importación parcial: ${exitosos} lote(s) exitoso(s), ${fallidos} con errores.`,
        icon: 'warning',
        timeout: 5000,
        position: 'top',
      })

      // Opcional: mostrar detalle de errores
      const errores = resultados.filter((r) => r.status !== 'success')
      console.error('Detalle de errores:', errores)

      emitter.emit('reiniciar-notificaciones')
      emit('done')
      cerrarModal()
    } else {
      // Todos fallaron
      $q.notify({
        type: 'negative',
        message: `Error en la importación: ${fallidos} lote(s) fallaron.`,
        icon: 'error',
        timeout: 5000,
        position: 'top',
      })
    }
  } catch (err) {
    console.error('[procesarYEnviar]', err)
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

/** Muestra un mensaje de error en el banner interno */
function mostrarError(text) {
  statusMessage.value = { type: 'error', text }
}

/** Cierra el modal emitiendo el evento de v-model */
function cerrarModal() {
  emit('update:modelValue', false)
}

/**
 * Limpia el formulario (llamado en el evento @hide del dialog)
 */
function resetForm() {
  selectedAlmacen.value = null
  archivoExcel.value = null
  fileStatus.value = null
  statusMessage.value = null
  isUploading.value = false
  isDownloading.value = false
  almacenOptions.value = []
}

// Exponer resetForm para que el padre pueda invocarlo si lo desea
defineExpose({ resetForm })
</script>

<style scoped lang="scss">
$primary: #004d40;
$primary-soft: #e3f2fd;
$border-color: #e0e0e0;
$radius: 12px;
$radius-sm: 8px;

.dpv-card {
  width: 520px;
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
    color: rgba(255, 255, 255, 0.75);
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

/* Select */
.dpv-select {
  :deep(.q-field__control) {
    border-radius: $radius-sm !important;
  }
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

<template>
  <!-- ============================================================
       MODAL PRINCIPAL: Importar Precios Base por Excel
       Uso: <importar-precios-base v-model="showModal" @done="loadRows" />
  ============================================================ -->
  <q-dialog
    v-model="internalModelValue"
    persistent
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="resetFormImport"
  >
    <q-card class="ipb-card">
      <!-- ── HEADER ────────────────────────────────────────────── -->
      <q-card-section class="ipb-header row items-center q-pb-none">
        <div class="col">
          <div class="ipb-title">
            <q-icon name="inventory_2" size="22px" class="q-mr-sm" />
            Actualización Masiva de Precios Base
          </div>
          <div class="ipb-subtitle">Gestiona tus precios mediante plantilla Excel</div>
        </div>
        <q-btn icon="close" flat round dense color="grey-6" v-close-popup :disable="isUploading" />
      </q-card-section>

      <!-- ── STEPPER VISUAL (solo informativo) ─────────────────── -->
      <div class="ipb-steps row q-px-lg q-pt-md q-pb-xs">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="ipb-step col"
          :class="{
            'ipb-step--active': currentStep >= i + 1,
            'ipb-step--done': currentStep > i + 1,
          }"
        >
          <div class="ipb-step__circle">
            <q-icon v-if="currentStep > i + 1" name="check" size="14px" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="ipb-step__label">{{ step }}</div>
          <div v-if="i < steps.length - 1" class="ipb-step__line" />
        </div>
      </div>

      <q-separator class="q-mt-sm" />

      <!-- ── BODY ──────────────────────────────────────────────── -->
      <q-card-section class="q-pt-md q-px-lg">
        <!-- PASO 1 · Seleccionar almacén ─────────────────────── -->
        <div class="ipb-section">
          <div class="ipb-section__label">
            <span class="ipb-badge">1</span>
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
            class="ipb-select q-mt-sm"
            @update:model-value="onAlmacenChange"
          >
            <template #prepend>
              <q-icon name="store" color="primary" />
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
        <div class="ipb-section" :class="{ 'ipb-section--disabled': !selectedAlmacen }">
          <div class="ipb-section__label">
            <span class="ipb-badge" :class="{ 'ipb-badge--inactive': !selectedAlmacen }">2</span>
            Descargar plantilla Excel
          </div>
          <div class="ipb-download-area q-mt-sm">
            <div class="ipb-download-info">
              <q-icon name="description" color="green-7" size="28px" />
              <div class="q-ml-sm">
                <div class="text-body2 text-weight-medium">plantilla_precios_base.xlsx</div>
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
              class="ipb-btn-download"
              @click="descargarPlantilla"
            >
              <template #loading>
                <q-spinner-ios size="18px" />
              </template>
            </q-btn>
          </div>
        </div>

        <!-- PASO 3 · Subir archivo ────────────────────────────── -->
        <div class="ipb-section" :class="{ 'ipb-section--disabled': !selectedAlmacen }">
          <div class="ipb-section__label">
            <span class="ipb-badge" :class="{ 'ipb-badge--inactive': !selectedAlmacen }">3</span>
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
          <transition name="ipb-fade">
            <div
              v-if="fileStatus"
              class="ipb-file-status q-mt-sm"
              :class="`ipb-file-status--${fileStatus.type}`"
            >
              <q-icon :name="fileStatus.icon" size="16px" class="q-mr-xs" />
              {{ fileStatus.text }}
            </div>
          </transition>
        </div>

        <!-- MENSAJE DE ESTADO GLOBAL ─────────────────────────── -->
        <transition name="ipb-fade">
          <q-banner
            v-if="statusMessage"
            dense
            rounded
            :class="
              statusMessage.type === 'error' ? 'bg-red-1 text-red-9' : 'bg-green-1 text-green-9'
            "
            class="q-mt-md ipb-banner"
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
          label="Importar precios"
          icon="cloud_upload"
          color="primary"
          unelevated
          :loading="isUploading"
          :disable="!canSubmit"
          class="ipb-btn-submit"
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

  <!-- ============================================================
       DIÁLOGO: Advertencia sin almacenes
  ============================================================ -->
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

<!-- ============================================================ -->
<!-- SCRIPT                                                        -->
<!-- ============================================================ -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

// ──────────────────────────────────────────────────────────────
// 📌 PROPS & EMITS
// ──────────────────────────────────────────────────────────────
const props = defineProps({
  /** Controla la visibilidad del modal (v-model) */
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const resetArchivo = () => {
  archivoExcel.value = null
  fileStatus.value = null
}

const emit = defineEmits([
  'update:modelValue', // v-model
  'done', // emitido al finalizar la importación con éxito
])

// ──────────────────────────────────────────────────────────────
// 🔧 QUASAR INSTANCE
// ──────────────────────────────────────────────────────────────
const $q = useQuasar()

/** Propiedad computada para manejar el v-model del diálogo sin mutar la prop directamente */
const internalModelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// ──────────────────────────────────────────────────────────────
// 📊 ESTADO REACTIVO
// ──────────────────────────────────────────────────────────────
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

// Almacenes
const almacenOptions = ref([]) // [{ label, value }]
const selectedAlmacen = ref(null) // idalmacen seleccionado
const isLoadingAlmacenes = ref(false)
const showNoAlmacenesDialog = ref(false)

// Descarga
const isDownloading = ref(false)

// Archivo
const archivoExcel = ref(null) // File object
const fileStatus = ref(null) // { type, icon, text }

// Upload
const isUploading = ref(false)
const statusMessage = ref(null) // { type: 'error'|'success', text }

// Stepper visual
const steps = ['Almacén', 'Descarga', 'Importar']

// ──────────────────────────────────────────────────────────────
// 🧮 COMPUTED
// ──────────────────────────────────────────────────────────────

/** Paso activo del stepper según el estado del formulario */
const currentStep = computed(() => {
  if (isUploading.value) return 3
  if (archivoExcel.value) return 3
  if (selectedAlmacen.value) return 2
  return 1
})

/** Habilita el botón de importar */
const canSubmit = computed(
  () => !!selectedAlmacen.value && !!archivoExcel.value && !isUploading.value,
)

// ──────────────────────────────────────────────────────────────
// 🔄 WATCHERS
// ──────────────────────────────────────────────────────────────

/** Carga almacenes cuando se abre el modal */
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) cargarAlmacenes()
  },
)

// ──────────────────────────────────────────────────────────────
// 🏭 FUNCIONES PRINCIPALES
// ──────────────────────────────────────────────────────────────

/**
 * 1️⃣  Carga los almacenes disponibles para el usuario actual
 */
async function cargarAlmacenes() {
  isLoadingAlmacenes.value = true
  almacenOptions.value = []

  try {
    const { data } = await api.get(`listaResponsableAlmacen/${idempresa}`)

    // Filtrar solo los almacenes del usuario actual
    const filtrados = data.filter((item) => item.idusuario === idusuario)

    if (!filtrados.length) {
      showNoAlmacenesDialog.value = true
      return
    }

    // Formatear para q-select
    almacenOptions.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    console.log('Almacenes cargados:', almacenOptions.value)
  } catch (err) {
    console.error('[cargarAlmacenes]', err)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes. Intenta de nuevo.',
      icon: 'warning',
    })
  } finally {
    isLoadingAlmacenes.value = false
  }
}

async function descargarPlantilla() {
  console.log('Iniciando descarga para almacén ID:', selectedAlmacen.value)
  if (!selectedAlmacen.value) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar un almacén',
    })
    return
  }
  console.log('Iniciando descarga para almacén ID:', selectedAlmacen.value)

  isDownloading.value = true
  statusMessage.value = null

  try {
    const url = `descargar_formato_excel_precio_base/${selectedAlmacen.value}`

    console.log('Descargando plantilla desde:', url)

    // 🔹 1. Consumir API con axios
    const response = await api.get(url)
    console.log('Respuesta recibida:', response) // Verificar estructura de la respuesta
    const data = response.data

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No hay datos para generar el Excel')
    }

    // 🔹 2. Eliminar duplicados por ID_PA (opcional pero recomendado)
    const uniqueData = Object.values(
      data.reduce((acc, item) => {
        acc[item.ID_PA] = item
        return acc
      }, {}),
    )
    console.log(uniqueData)

    // 🔹 3. Formatear datos para Excel
    const formattedData = uniqueData.map((item) => ({
      ID_PA: item.ID_PA,
      Codigo: item.Codigo,
      Producto: item.descripcion,
      Almacen: item.Almacen,
      Precio_Actual: item.Precio_Actual,
      Nuevo_Precio: '', // columna editable
    }))

    // 🔹 4. Crear Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Precios')

    // 🔹 5. Descargar archivo
    XLSX.writeFile(workbook, 'plantilla_precios_base.xlsx')

    $q.notify({
      type: 'positive',
      message: 'Plantilla generada correctamente',
      icon: 'download_done',
    })
  } catch (error) {
    console.error('[descargarPlantilla]', error)

    $q.notify({
      type: 'negative',
      message: 'Error al generar la plantilla',
    })
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
function onAlmacenChange() {
  // Limpiar archivo previo si cambió el almacén
  archivoExcel.value = null
  fileStatus.value = null
  statusMessage.value = null
}

/**
 * 3️⃣  Lee el Excel, convierte a CSV y envía al backend
 */
async function procesarYEnviar() {
  // Validaciones previas
  if (!selectedAlmacen.value) {
    return mostrarError('Debes seleccionar un almacén.')
  }
  if (!archivoExcel.value) {
    return mostrarError('Debes seleccionar un archivo Excel.')
  }

  isUploading.value = true
  statusMessage.value = null

  try {
    // ── Leer el archivo con XLSX ──────────────────────────────
    const buffer = await archivoExcel.value.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]

    if (!sheetName) {
      throw new Error('El archivo no contiene hojas de cálculo.')
    }

    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)

    // ── Construir FormData ────────────────────────────────────
    const blob = new Blob([csv], { type: 'text/csv' })
    const formData = new FormData()
    formData.append('ver', 'importar_excel_precios_base')
    formData.append('file', blob, 'precio_base.csv')

    // ── Enviar al backend ─────────────────────────────────────
    const { data } = await api.post('', formData)
    console.log('Respuesta del servidor:', data)

    // ── Validar Respuesta ─────────────────────────────────────
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data?.mensaje || 'Precios actualizados correctamente.',
        icon: 'check_circle',
        timeout: 3000,
        position: 'top',
      })

      emit('done') // notifica al padre para recargar datos
      cerrarModal()
    } else {
      mostrarError(data.mensaje || 'Hubo un error al procesar el archivo.')
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
// 🧹 HELPERS
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
 * Exportado para que el padre pueda llamarlo si lo necesita.
 */
function resetFormImport() {
  selectedAlmacen.value = null
  archivoExcel.value = null
  fileStatus.value = null
  statusMessage.value = null
  isUploading.value = false
  isDownloading.value = false
  almacenOptions.value = []
}

onMounted(() => {
  // Si el modal ya está abierto al montar, carga almacenes
  if (props.modelValue) cargarAlmacenes()
})

// Exponer resetFormImport para que el padre pueda invocarlo si lo desea
defineExpose({ resetFormImport })
</script>
<style scoped lang="scss">
// ── Variables ──────────────────────────────────────────────────
$primary: #004d40;
$primary-soft: #e3f2fd;
$border-color: #e0e0e0;
$radius: 12px;
$radius-sm: 8px;

// ── Card ───────────────────────────────────────────────────────
.ipb-card {
  width: 520px;
  max-width: 95vw;
  border-radius: $radius !important;
  overflow: hidden;
}

// ── Header ─────────────────────────────────────────────────────
.ipb-header {
  background: linear-gradient(135deg, #004d40 0%, #054e2c 100%);
  padding: 18px 20px 16px;

  .ipb-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    letter-spacing: 0.3px;
  }

  .ipb-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 2px;
    padding-left: 30px;
  }
}

// ── Stepper visual ─────────────────────────────────────────────
.ipb-steps {
  gap: 0;
  position: relative;
}

.ipb-step {
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

  // La línea conectora
  &__line {
    position: absolute;
    top: 13px;
    left: calc(50% + 14px);
    width: calc(100% - 28px);
    height: 2px;
    background: $border-color;
    transition: background 0.25s ease;
  }

  // Paso activo
  &--active {
    .ipb-step__circle {
      background: $primary-soft;
      color: $primary;
      border: 2px solid $primary;
    }
    .ipb-step__label {
      color: $primary;
    }
  }

  // Paso completado
  &--done {
    .ipb-step__circle {
      background: $primary;
      color: #fff;
    }
    .ipb-step__label {
      color: $primary;
    }
    .ipb-step__line {
      background: $primary;
    }
  }
}

// ── Secciones del formulario ───────────────────────────────────
.ipb-section {
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

// ── Badges numéricos ───────────────────────────────────────────
.ipb-badge {
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

// ── Área de descarga ───────────────────────────────────────────
.ipb-download-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fbe7;
  border: 1.5px dashed #c5e1a5;
  border-radius: $radius-sm;
  padding: 12px 16px;
}

.ipb-download-info {
  display: flex;
  align-items: center;
}

.ipb-btn-download {
  border-radius: $radius-sm !important;
  font-weight: 600 !important;
  font-size: 13px !important;
}

// ── Estado del archivo ─────────────────────────────────────────
.ipb-file-status {
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

// ── Banner de estado ───────────────────────────────────────────
.ipb-banner {
  border-radius: $radius-sm !important;
  font-size: 13px;
}

// ── Botón submit ───────────────────────────────────────────────
.ipb-btn-submit {
  border-radius: $radius-sm !important;
  font-weight: 600 !important;
  letter-spacing: 0.3px !important;
  padding: 0 20px !important;
}

// ── Select ─────────────────────────────────────────────────────
.ipb-select {
  :deep(.q-field__control) {
    border-radius: $radius-sm !important;
  }
}

// ── Transición ─────────────────────────────────────────────────
.ipb-fade-enter-active,
.ipb-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.ipb-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.ipb-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

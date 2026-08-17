<template>
  <!-- ============================================================
       MODAL: Descargar Plantilla de Productos Variantes
       Uso: <descargar-plantilla-variantes v-model="showModal" />
  ============================================================ -->
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
          <div class="dpv-subtitle">Descarga un Excel para cargar variantes masivamente</div>
        </div>
        <q-btn
          icon="close"
          flat
          round
          dense
          color="grey-6"
          v-close-popup
          :disable="isDownloading"
        />
      </q-card-section>

      <!-- ── BODY ──────────────────────────────────────────────── -->
      <q-card-section class="q-px-lg q-pt-md">
        <!-- Seleccionar almacén -->
        <div class="q-mb-md">
          <div class="dpv-label">
            <q-icon name="store" color="primary" size="18px" class="q-mr-xs" />
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
            :disable="isLoadingAlmacenes || isDownloading"
            clearable
            class="dpv-select q-mt-sm"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey text-caption">
                  No hay almacenes disponibles
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Información de la plantilla -->
        <div class="dpv-info q-mb-md">
          <q-icon name="info" color="blue-7" size="20px" />
          <div class="q-ml-sm">
            <div class="text-body2 text-weight-medium">Formato de la plantilla</div>
            <ul class="dpv-list">
              <li>Incluye los productos del almacén seleccionado.</li>
              <li>
                Debes completar las columnas: <b>costo_unitario</b>, <b>cantidad</b>, <b>sku</b> y
                los <b>atributos</b>.
              </li>
              <li>
                Cada fila corresponde a una variante (mismo producto puede repetirse con distintos
                atributos).
              </li>
            </ul>
          </div>
        </div>

        <!-- Botón descargar -->
        <q-btn
          label="Descargar plantilla"
          icon="download"
          color="primary"
          unelevated
          class="full-width"
          :loading="isDownloading"
          :disable="!selectedAlmacen || isDownloading"
          @click="descargarPlantilla"
        >
          <template #loading>
            <q-spinner-ios size="18px" class="q-mr-sm" />
            Generando Excel...
          </template>
        </q-btn>

        <!-- Mensaje de estado -->
        <transition name="dpv-fade">
          <q-banner
            v-if="statusMessage"
            dense
            rounded
            :class="
              statusMessage.type === 'error' ? 'bg-red-1 text-red-9' : 'bg-green-1 text-green-9'
            "
            class="q-mt-md"
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
        <q-btn flat label="Cerrar" color="grey-7" v-close-popup :disable="isDownloading" />
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

// ──────────────────────────────────────────────────────────────
// PROPS & EMITS
// ──────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

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

const almacenOptions = ref([])
const selectedAlmacen = ref(null)
const isLoadingAlmacenes = ref(false)
const showNoAlmacenesDialog = ref(false)

const isDownloading = ref(false)
const statusMessage = ref(null) // { type, text }

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
    // 1. Obtener productos del almacén (endpoint ficticio – ajusta según tu API)
    const { data } = await api.get(`descargarPlanillaProductoVariante/${selectedAlmacen.value}`)

    if (!Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('No hay productos para este almacén')
    }

    // 2. Formatear datos para el Excel
    //    Se asume que cada producto viene con: idproducto, nombre, idalmacen (o ya está filtrado)
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

    // 3. Crear hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(filas)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Variantes')

    // 4. Descargar archivo
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

/** Limpia el formulario al cerrar el modal */
function resetForm() {
  selectedAlmacen.value = null
  statusMessage.value = null
  isDownloading.value = false
  almacenOptions.value = []
}
</script>

<style scoped lang="scss">
$primary: #004d40;
$primary-soft: #e3f2fd;
$border-color: #e0e0e0;
$radius: 12px;
$radius-sm: 8px;

.dpv-card {
  width: 480px;
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

.dpv-label {
  font-size: 13px;
  font-weight: 600;
  color: #424242;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.dpv-select {
  :deep(.q-field__control) {
    border-radius: $radius-sm !important;
  }
}

.dpv-info {
  display: flex;
  align-items: flex-start;
  background: #f0f8ff;
  border-left: 4px solid #1976d2;
  border-radius: $radius-sm;
  padding: 10px 14px;

  .dpv-list {
    margin: 5px 0 0;
    padding-left: 18px;
    font-size: 12px;
    color: #555;
    line-height: 1.5;

    li {
      margin-bottom: 2px;
    }
  }
}

.dpv-fade-enter-active,
.dpv-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dpv-fade-enter-from,
.dpv-fade-leave-to {
  opacity: 0;
}
</style>

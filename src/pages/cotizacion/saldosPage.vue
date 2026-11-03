<template>
  <q-page>
    <div>
      <div class="row flex justify-between q-mb-md">
        <div>
          <q-btn
            color="secondary"
            class="btn-res"
            id="btnregistrarcompra"
            icon="arrow_back"
            :label="$t('ui.volver-84a715')"
            @click="$emit('close')"
            no-caps
          />
        </div>
        <div class="col-md-4 col-12">
          <q-input dense v-model="filter" :placeholder="$t('common.search')">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
      <q-table
        :title="$t('ui.saldos-registrados-38b509')"
        :rows="saldos"
        :columns="columns"
        row-key="id_saldo"
        :loading="loading"
        :filter="filter"
        :no-data-label="$t('ui.no-se-encontraron-saldos-iniciales-141eb6')"
        :rows-per-page-options="[10, 25, 50, 0]"
      >
        <template v-slot:top-right> </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              icon="edit"
              color="blue-grey-7"
              size="sm"
              flat
              round
              dense
              @click="openDialog('edit', props.row)"
              :title="$t('ui.editar-saldo-26be69')"
            />
            <q-btn
              icon="delete"
              color="red-7"
              size="sm"
              flat
              round
              dense
              @click="confirmDelete(props.row.id_saldo)"
              :title="$t('ui.eliminar-saldo-714824')"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ isEditing ? $t('ui.editar-saldo-a96387') : $t('ui.nuevo-saldo-inicial-7b2ced') }}
          </div>
        </q-card-section>

        <q-form>
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="currentSaldo.fecha"
              :label="$t('ui.fecha-0aff00')"
              type="date"
              filled
              :rules="[(val) => !!val || $t('ui.la-fecha-es-requerida-4a4376')]"
            />

            <q-select
              v-model="currentSaldo.metodo"
              :label="$t('ui.metodo-9d5bbb')"
              filled
              :options="['PEPS', 'UEPS', 'PROMEDIO']"
              :rules="[(val) => !!val || $t('ui.el-metodo-es-requerido-b8f20b')]"
            />

            <q-input
              v-model.number="currentSaldo.cantidad"
              :label="$t('ui.cantidad-a5de18')"
              type="number"
              filled
              step="0.01"
              :rules="[
                (val) => val != null || $t('ui.la-cantidad-es-requerida-b4b75e'),
                (val) => val > 0 || $t('ui.debe-ser-un-numero-positivo-daaec1'),
              ]"
            />

            <q-input
              v-model.number="currentSaldo.costo_unitario"
              :label="$t('ui.costo-unitario-5f63f1')"
              type="number"
              filled
              step="0.0001"
              :rules="[
                (val) => val != null || $t('ui.el-costo-es-requerido-7db03a'),
                (val) => val > 0 || $t('ui.debe-ser-un-numero-positivo-daaec1'),
              ]"
            />

            <q-input
              :model-value="calculatedCostoTotal"
              :label="$t('ui.costo-total-ba6044')"
              filled
              readonly
              disable
              class="text-bold"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-2">
            <q-btn :label="$t('common.cancel')" color="grey-7" flat @click="dialogVisible = false" />
            <q-btn
              :label="isEditing ? $t('ui.guardar-cambios-7d2fd7') : $t('ui.crear-saldo-5e77ee')"
              color="primary"
              :loading="saving"
              @click="saveSaldo"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import saldosService from 'src/services/saldo.service'
defineEmits(['close'])

const props = defineProps({
  producto: {
    type: String,
    required: true,
  },
})
console.log(props.producto)
const idProducto = ref(props.producto)

// Instancias de Quasar
const $q = useQuasar()

// --- ESTADO REACTIVO ---
const saldos = ref([])
const loading = ref(false)
const filter = ref('')
const dialogVisible = ref(false)
const isEditing = ref(true)
const saving = ref(false)

// Estructura inicial para un nuevo saldo
const emptySaldo = {
  id_saldo: null,
  productos_almacen_id_productos_almacen: null,
  fecha: new Date().toISOString().slice(0, 10), // Formato 'YYYY-MM-DD'
  metodo: 'Promedio',
  cantidad: 0.0,
  costo_unitario: 0.0,
  costo_total: 0.0, // Se calcula en el backend o como campo calculado.
}

const currentSaldo = ref({ ...emptySaldo })

// --- CÁLCULOS Y PROPIEDADES CALCULADAS ---

/**
 * Calcula el costo total en el frontend solo para visualización en el modal.
 * El cálculo real debe ocurrir en el backend/base de datos.
 */
const calculatedCostoTotal = computed(() => {
  const cantidad = Number(currentSaldo.value.cantidad || 0)
  const costoUnitario = Number(currentSaldo.value.costo_unitario || 0)

  const total = cantidad * costoUnitario
  return total.toFixed(4) // Mostrar con 4 decimales.
})

// --- CONFIGURACIÓN DE LA TABLA ---
const columns = [
  // { name: 'id_saldo', label: 'ID', field: 'id_saldo', align: 'left' },

  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    field: 'fecha',
    format: (val) => new Date(val).toLocaleDateString(),
    align: 'left',
    sortable: true,
  },
  {
    name: 'metodo',
    label: i18nT('ui.metodo-49ddd8'),
    field: 'metodo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: i18nT('ui.cantidad-b5b6f8'),
    field: 'cantidad',
    format: (val) => Number(val).toFixed(2),
    align: 'right',
    sortable: true,
  },
  {
    name: 'costo_unitario',
    label: i18nT('ui.costo-unitario-4ec928'),
    field: 'costo_unitario',
    format: (val) => Number(val).toFixed(4),
    align: 'right',
    sortable: true,
  },
  {
    name: 'costo_total',
    label: i18nT('ui.costo-total-ba6044'),
    field: 'costo_total',
    format: (val) => Number(val).toFixed(4),
    align: 'right',
    sortable: true,
  },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
]

// --- FUNCIONES CRUD ---

/**
 * Carga la lista de saldos iniciales desde la API.
 */
async function fetchSaldos() {
  loading.value = true
  try {
    const data = await saldosService.getAllSaldos(idProducto.value)
    console.log(data)
    saldos.value = data
    $q.notify({
      type: 'info',
      message: `Saldos cargados correctamente (${data.length} registros).`,
      color: 'blue-grey-6',
      position: 'top-right',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message,
      color: 'red-6',
      position: 'top-right',
    })
  } finally {
    loading.value = false
  }
}

/**
 * Abre el diálogo modal para crear o editar un saldo.
 * @param {'create'|'edit'} mode - Modo de la operación.
 * @param {Object} [saldo=null] - El objeto saldo si el modo es 'edit'.
 */
function openDialog(mode, saldo = null) {
  console.log(mode)
  console.log(saldo)

  isEditing.value = mode === 'edit'
  console.log(isEditing.value)
  if (isEditing.value) {
    // Clona el objeto para evitar modificar el estado de la tabla antes de guardar
    // y ajusta los números para la reactividad de los inputs.
    currentSaldo.value = { ...saldo }
    console.log(currentSaldo.value)
  } else {
    currentSaldo.value = { ...emptySaldo }
  }
  dialogVisible.value = true
}

/**
 * Guarda (crea o actualiza) el saldo actual.
 */
async function saveSaldo() {
  saving.value = true
  try {
    let result
    if (isEditing.value) {
      // Actualizar
      console.log(currentSaldo.value)
      const form = currentSaldo.value
      const sendJson = {
        ver: 'editarSaldo',
        idSaldo: form.id_saldo,
        cantidad: form.cantidad,
        precio: form.costo_unitario,
      }
      console.log(sendJson)
      result = await saldosService.updateSaldo(sendJson)
      console.log(result)
      if (result.success) {
        saving.value = false
      }
      $q.notify({
        type: 'positive',
        message: i18nT('ui.saldo-actualizado-con-exito-4fd01c'),
        color: 'green-7',
        position: 'top',
      })
    }

    // Recargar la tabla o actualizar localmente si es posible
    await fetchSaldos()

    dialogVisible.value = false // Cerrar el modal
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message,
      color: 'red-7',
      position: 'top',
    })
  }
}

/**
 * Muestra un diálogo de confirmación antes de eliminar.
 * @param {number} id_saldo - El ID del saldo a eliminar.
 */
function confirmDelete(id_saldo) {
  $q.dialog({
    title: i18nT('configGeneral.tipoAlmacen.messages.deleteTitle'),
    message: `¿Está seguro de que desea eliminar el saldo con ID ${id_saldo}? Esta acción es irreversible.`,
    cancel: true,
    persistent: true,
    ok: {
      label: i18nT('common.delete'),
      color: 'negative',
    },
  }).onOk(() => {
    console.log(id_saldo)
    deleteSaldo(id_saldo)
  })
}

/**
 * Ejecuta la eliminación del saldo en la API.
 * @param {number} id_saldo - El ID del saldo a eliminar.
 */
async function deleteSaldo(id_saldo) {
  try {
    $q.loading.show({ message: i18nT('ui.eliminando-saldo-a90ccb') })
    await saldosService.deleteSaldo(id_saldo)

    $q.notify({
      type: 'positive',
      message: `Saldo ${id_saldo} eliminado correctamente.`,
      color: 'green-7',
      position: 'top',
    })

    // Recargar la tabla
    await fetchSaldos()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message,
      color: 'red-7',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}

// --- HOOKS DE VUE ---
onMounted(() => {
  fetchSaldos()
})
</script>

<style scoped>
/* Estilos sobrios: sombras suaves, bordes redondeados */
.q-card {
  border-radius: 8px;
}
.q-card-section.bg-blue-grey-1 {
  border-bottom: 1px solid #cfd8dc; /* Tono de gris suave */
}
/* Estilo para los inputs llenos (filled) para un diseño limpio */
.q-field--filled .q-field__control {
  background: #f5f5f5;
}
</style>

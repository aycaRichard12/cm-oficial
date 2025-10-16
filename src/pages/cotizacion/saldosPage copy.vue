<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card class="shadow-2" bordered>
      <q-card-section class="bg-blue-grey-1 text-blue-grey-10 q-pb-sm">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 text-weight-bold">Gestión de Saldos Iniciales por Método</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="saldos"
          :columns="columns"
          row-key="id_saldo"
          :loading="loading"
          :filter="filter"
          no-data-label="No se encontraron saldos iniciales."
          :rows-per-page-options="[10, 25, 50, 0]"
        >
          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar...">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

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
                title="Editar saldo"
              />
              <q-btn
                icon="delete"
                color="red-7"
                size="sm"
                flat
                round
                dense
                @click="confirmDelete(props.row.id_saldo)"
                title="Eliminar saldo"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ isEditing ? 'Editar Saldo' : 'Nuevo Saldo Inicial' }}
          </div>
        </q-card-section>

        <q-form @submit.prevent="saveSaldo">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model.number="currentSaldo.productos_almacen_id_productos_almacen"
              label="ID Producto Almacén *"
              type="number"
              filled
              :rules="[
                (val) => !!val || 'El ID es requerido',
                (val) => val > 0 || 'Debe ser un número positivo',
              ]"
            />

            <q-input
              v-model="currentSaldo.fecha"
              label="Fecha *"
              type="date"
              filled
              :rules="[(val) => !!val || 'La fecha es requerida']"
            />

            <q-select
              v-model="currentSaldo.metodo"
              label="Método *"
              filled
              :options="['Promedio', 'FIFO', 'LIFO']"
              :rules="[(val) => !!val || 'El método es requerido']"
            />

            <q-input
              v-model.number="currentSaldo.cantidad"
              label="Cantidad *"
              type="number"
              filled
              step="0.01"
              :rules="[
                (val) => val != null || 'La cantidad es requerida',
                (val) => val > 0 || 'Debe ser un número positivo',
              ]"
            />

            <q-input
              v-model.number="currentSaldo.costo_unitario"
              label="Costo Unitario *"
              type="number"
              filled
              step="0.0001"
              :rules="[
                (val) => val != null || 'El costo es requerido',
                (val) => val > 0 || 'Debe ser un número positivo',
              ]"
            />

            <q-input
              :model-value="calculatedCostoTotal"
              label="Costo Total"
              filled
              readonly
              disable
              class="text-bold"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-2">
            <q-btn label="Cancelar" color="grey-7" flat @click="dialogVisible = false" />
            <q-btn
              :label="isEditing ? 'Guardar Cambios' : 'Crear Saldo'"
              color="primary"
              type="submit"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import saldosService from 'src/services/saldo.service'

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
const isEditing = ref(false)
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
    name: 'id_producto_almacen',
    label: 'ID Producto Almacén',
    field: 'productos_almacen_id_productos_almacen',
    align: 'left',
    sortable: true,
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    format: (val) => new Date(val).toLocaleDateString(),
    align: 'left',
    sortable: true,
  },
  {
    name: 'metodo',
    label: 'Método',
    field: 'metodo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    format: (val) => Number(val).toFixed(2),
    align: 'right',
    sortable: true,
  },
  {
    name: 'costo_unitario',
    label: 'Costo Unitario',
    field: 'costo_unitario',
    format: (val) => Number(val).toFixed(4),
    align: 'right',
    sortable: true,
  },
  {
    name: 'costo_total',
    label: 'Costo Total',
    field: 'costo_total',
    format: (val) => Number(val).toFixed(4),
    align: 'right',
    sortable: true,
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
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
  isEditing.value = mode === 'edit'
  if (isEditing.value) {
    // Clona el objeto para evitar modificar el estado de la tabla antes de guardar
    // y ajusta los números para la reactividad de los inputs.
    currentSaldo.value = { ...saldo }
  } else {
    currentSaldo.value = { ...emptySaldo }
  }
  dialogVisible.value = true
}
/**
 * Muestra un diálogo de confirmación antes de eliminar.
 * @param {number} id_saldo - El ID del saldo a eliminar.
 */
function confirmDelete(id_saldo) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar el saldo con ID ${id_saldo}? Esta acción es irreversible.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteSaldo(id_saldo)
  })
}

/**
 * Ejecuta la eliminación del saldo en la API.
 * @param {number} id_saldo - El ID del saldo a eliminar.
 */
async function deleteSaldo(id_saldo) {
  try {
    $q.loading.show({ message: 'Eliminando saldo...' })
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

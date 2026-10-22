<template>
  <q-page padding>
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md">
            <div class="text-h5 text-weight-bold">Sincronización de Kardex por Almacén</div>
            <div class="text-caption text-grey-7">
              Seleccione un almacén y presione <b>Sincronizar</b>. El reporte PDF se descargará
              automáticamente.
            </div>
          </div>
          <div class="col-12 col-md-auto row q-gutter-sm items-center">
            <q-input
              v-model="filtro"
              dense
              outlined
              clearable
              placeholder="Buscar almacén, código o empresa..."
              style="min-width: 280px"
            >
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
            <q-btn
              outline
              color="primary"
              icon="refresh"
              label="Recargar"
              :loading="loadingAlmacenes"
              @click="cargarAlmacenes"
            />
          </div>
        </div>

        <div v-if="ultimoResultado" class="row q-gutter-sm q-mt-md">
          <q-chip
            icon="check_circle"
            :color="ultimoResultado.estado === 'exito' ? 'positive' : 'negative'"
            text-color="white"
            dense
          >
            Estado: {{ ultimoResultado.estado }}
          </q-chip>
          <q-chip icon="inventory_2" color="blue-grey-7" text-color="white" dense>
            {{ ultimoResultado.sincronizados }} / {{ ultimoResultado.total_productos }} productos
          </q-chip>
          <q-chip icon="swap_vert" color="blue-grey-7" text-color="white" dense>
            {{ ultimoResultado.total_movimientos }} movimientos
          </q-chip>
          <q-chip icon="warning" color="orange-8" text-color="white" dense>
            {{ (ultimoResultado.advertencias || []).length }} advertencias
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-table
        :rows="almacenesFiltrados"
        :columns="columnas"
        row-key="idalmacen"
        :loading="loadingAlmacenes"
        :rows-per-page-options="[10, 25, 50, 100, 0]"
        flat
        dense
        binary-state-sort
      >
        <template v-slot:body-cell-estado="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="Number(props.row.estado) === 1 ? 'positive' : 'grey-6'">
              {{ Number(props.row.estado) === 1 ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              color="primary"
              icon="sync"
              label="Sincronizar"
              size="sm"
              no-caps
              unelevated
              :loading="!!sincronizando[props.row.idalmacen]"
              :disable="Number(props.row.estado) !== 1"
              @click="sincronizar(props.row)"
            >
              <q-tooltip v-if="Number(props.row.estado) !== 1">
                Almacén inactivo
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="text-caption text-grey q-pa-md full-width text-center">
            {{ loadingAlmacenes ? 'Cargando almacenes...' : 'No hay almacenes disponibles.' }}
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { SincronizacionAlmacenService } from '../services/SincronizacionAlmacenService'
import { SincronizacionPdfService } from '../services/SincronizacionPdfService'

const $q = useQuasar()
const service = new SincronizacionAlmacenService()
const pdfService = new SincronizacionPdfService()

const loadingAlmacenes = ref(false)
const almacenes = ref([])
const filtro = ref('')
const sincronizando = ref({})
const ultimoResultado = ref(null)

const columnas = [
  { name: 'idalmacen', label: 'ID', field: 'idalmacen', align: 'center', sortable: true, style: 'width: 70px' },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'empresa', label: 'Empresa', field: 'empresa', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'center', style: 'width: 140px' },
]

const almacenesFiltrados = computed(() => {
  const q = (filtro.value || '').trim().toLowerCase()
  if (!q) return almacenes.value
  return almacenes.value.filter((a) => {
    const s = `${a.almacen || ''} ${a.codigo || ''} ${a.empresa || ''}`.toLowerCase()
    return s.includes(q)
  })
})

async function cargarAlmacenes() {
  loadingAlmacenes.value = true
  try {
    almacenes.value = await service.listarAlmacenes()
    if (!almacenes.value.length) {
      $q.notify({ type: 'warning', message: 'No hay almacenes disponibles para este usuario.' })
    }
  } catch (e) {
    console.error('[sincronizarAlmacenes] cargarAlmacenes:', e)
    const msg =
      e?.response?.data?.mensaje || e?.message || 'No se pudo cargar el listado de almacenes.'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    loadingAlmacenes.value = false
  }
}

async function sincronizar(row) {
  if (sincronizando.value[row.idalmacen]) return
  sincronizando.value = { ...sincronizando.value, [row.idalmacen]: true }

  try {
    $q.loading.show({ message: `Sincronizando almacén "${row.almacen}"...` })
    const resultado = await service.sincronizar(row.idalmacen)
    ultimoResultado.value = resultado

    if (resultado?.estado !== 'exito') {
      $q.notify({
        type: 'negative',
        message: resultado?.mensaje || 'La sincronización finalizó con errores.',
        timeout: 6000,
      })
    } else {
      $q.notify({
        type: 'positive',
        message:
          `Sincronización OK: ${resultado.sincronizados}/${resultado.total_productos} productos ` +
          `· ${resultado.total_movimientos} movimientos ` +
          `· ${(resultado.advertencias || []).length} advertencias.`,
        timeout: 5000,
      })
    }

    $q.loading.show({ message: 'Generando reporte PDF...' })
    const doc = await pdfService.generate({
      resultado,
      almacenNombre: row.almacen,
      orientation: 'landscape',
      format: 'a4',
    })

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    doc.save(`Sincronizacion_${row.idalmacen}_${stamp}.pdf`)
    $q.notify({ type: 'positive', message: 'Reporte PDF generado y descargado.' })
  } catch (e) {
    console.error('[sincronizarAlmacenes] sincronizar:', e)
    const msg =
      e?.response?.data?.mensaje ||
      e?.response?.data?.error ||
      e?.message ||
      'Error al sincronizar el almacén.'
    $q.notify({ type: 'negative', message: msg, timeout: 6000 })
  } finally {
    $q.loading.hide()
    sincronizando.value = { ...sincronizando.value, [row.idalmacen]: false }
  }
}

onMounted(cargarAlmacenes)
</script>

<style lang="scss" scoped>
.q-table__card {
  border-radius: 12px;
}
</style>

<template>
  <q-page padding>
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md">
            <div class="text-h5 text-weight-bold">{{ $t('ui.sincronizacion-de-kardex-por-almacen-2f1ae6') }}</div>
            <div class="text-caption text-grey-7">
              {{ $t('ui.seleccione-un-almacen-y-presione-bfeef9') }} <b>{{ $t('ui.sincronizar-e32f49') }}</b>{{ $t('ui.el-reporte-pdf-se-descargara-automaticamente-f4a086') }}
            </div>
          </div>
          <div class="col-12 col-md-auto row q-gutter-sm items-center">
            <q-input
              v-model="filtro"
              dense
              outlined
              clearable
              :placeholder="$t('ui.buscar-almacen-codigo-o-empresa-6e186e')"
              style="min-width: 280px"
            >
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
            <q-btn
              outline
              color="primary"
              icon="refresh"
              :label="$t('ui.recargar-9d2c9d')"
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
            {{ $t('ui.estado-d25c1e') }} {{ ultimoResultado.estado }}
          </q-chip>
          <q-chip icon="inventory_2" color="blue-grey-7" text-color="white" dense>
            {{ ultimoResultado.sincronizados }} / {{ ultimoResultado.total_productos }} {{ $t('ui.productos-2d7e7d') }}
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
              {{ Number(props.row.estado) === 1 ? $t('common.active') : $t('common.inactive') }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              color="primary"
              icon="sync"
              :label="$t('ui.sincronizar-e32f49')"
              size="sm"
              no-caps
              unelevated
              :loading="!!sincronizando[props.row.idalmacen]"
              :disable="Number(props.row.estado) !== 1"
              @click="sincronizar(props.row)"
            >
              <q-tooltip v-if="Number(props.row.estado) !== 1">
                {{ $t('ui.almacen-inactivo-f47c19') }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="text-caption text-grey q-pa-md full-width text-center">
            {{ loadingAlmacenes ? $t('ui.cargando-almacenes-f7a01e') : $t('ui.no-hay-almacenes-disponibles-5d547d') }}
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left', sortable: true },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left', sortable: true },
  { name: 'empresa', label: i18nT('ui.empresa-6eb94b'), field: 'empresa', align: 'left', sortable: true },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: i18nT('common.actions'), align: 'center', style: 'width: 140px' },
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
      $q.notify({ type: 'warning', message: i18nT('ui.no-hay-almacenes-disponibles-para-este-usuario-d6cad2') })
    }
  } catch (e) {
    console.error('[sincronizarAlmacenes] cargarAlmacenes:', e)
    const msg =
      e?.response?.data?.mensaje || e?.message || i18nT('ui.no-se-pudo-cargar-el-listado-de-almacenes-94f8ab')
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
        message: resultado?.mensaje || i18nT('ui.la-sincronizacion-finalizo-con-errores-d139f6'),
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

    $q.loading.show({ message: i18nT('ui.generando-reporte-pdf-13a1f4') })
    const doc = await pdfService.generate({
      resultado,
      almacenNombre: row.almacen,
      orientation: 'landscape',
      format: 'a4',
    })

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    doc.save(`Sincronizacion_${row.idalmacen}_${stamp}.pdf`)
    $q.notify({ type: 'positive', message: i18nT('ui.reporte-pdf-generado-y-descargado-568778') })
  } catch (e) {
    console.error('[sincronizarAlmacenes] sincronizar:', e)
    const msg =
      e?.response?.data?.mensaje ||
      e?.response?.data?.error ||
      e?.message ||
      i18nT('ui.error-al-sincronizar-el-almacen-68b641')
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

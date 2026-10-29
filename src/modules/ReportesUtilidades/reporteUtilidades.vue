<template>
  <div class="q-pa-md">
    <!-- Filtros -->
    <q-form @submit.prevent="obtenerReporte" class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="form.fecha_inicio"
          :label="$t('ui.fecha-inicio-09c9bb')"
          type="date"
          stack-label
          :rules="[(val) => !!val || $t('common.required')]"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="form.fecha_fin"
          :label="$t('ui.fecha-fin-340809')"
          type="date"
          stack-label
          :rules="[(val) => !!val || $t('common.required')]"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-select
          v-model="form.almacen_id"
          :options="listaAlmacenes"
          option-label="label"
          option-value="value"
          :label="$t('inventario.warehouse')"
          emit-value
          map-options
          clearable
          :loading="loadingAlmacenes"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-select
          v-model="form.cliente_id"
          :options="listaClientes"
          option-label="label"
          option-value="value"
          :label="$t('ventas.client')"
          emit-value
          map-options
          clearable
          :loading="loadingClientes"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-select
          v-model="form.campana_id"
          :options="listaCampanas"
          option-label="label"
          option-value="value"
          :label="$t('ui.campana-236ee5')"
          emit-value
          map-options
          clearable
          :loading="loadingCampanas"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-4" v-if="tipoReporte === 'grafico'">
        <q-select
          v-model="form.granularidad"
          :options="['dia', 'semana', 'mes']"
          :label="$t('ui.agrupar-por-30a165')"
          emit-value
        />
      </div>

      <div class="col-12">
        <q-btn type="submit" color="primary" :label="$t('ui.generar-reporte-eeafce')" :loading="loadingReporte" />
      </div>
    </q-form>

    <!-- Tipo de reporte -->
    <div class="q-my-md">
      <q-tabs
        v-model="tipoReporte"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="resumen" :label="$t('ui.resumen-35414e')" />
        <q-tab name="detalle" :label="$t('ui.detalle-be605b')" />
        <q-tab name="grafico" :label="$t('ui.grafico-b420dc')" />
      </q-tabs>
    </div>

    <!-- Resultados -->
    <div class="q-mt-md">
      <!-- Resumen -->
      <div v-if="tipoReporte === 'resumen' && resumenData" class="row q-col-gutter-md">
        <q-card class="col-12 col-sm-4" flat bordered>
          <q-card-section>
            <div class="text-subtitle2">{{ $t('ui.venta-bruta-6ce759') }}</div>
            <div class="text-h6">{{ resumenData.venta_bruta || currency }}</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4" flat bordered>
          <q-card-section>
            <div class="text-subtitle2">{{ $t('ui.descuentos-6e4366') }}</div>
            <div class="text-h6">{{ resumenData.descuentos || currency }}</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4" flat bordered>
          <q-card-section>
            <div class="text-subtitle2">{{ $t('ui.venta-neta-ca0aa8') }}</div>
            <div class="text-h6">{{ resumenData.venta_neta || currency }}</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4" flat bordered>
          <q-card-section>
            <div class="text-subtitle2">{{ $t('ui.costo-de-ventas-d04ca4') }}</div>
            <div class="text-h6">{{ resumenData.costo_ventas || currency }}</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4" flat bordered>
          <q-card-section>
            <div class="text-subtitle2">{{ $t('ui.utilidad-64a80d') }}</div>
            <div class="text-h6">{{ resumenData.utilidad || currency }}</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4" flat bordered>
          <q-card-section>
            <div class="text-subtitle2">{{ $t('ui.margen-vta-neta-da40f4') }}</div>
            <div class="text-h6">{{ resumenData.margen_sobre_venta_neta }}%</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4" flat bordered>
          <q-card-section>
            <div class="text-subtitle2">{{ $t('ui.margen-vta-bruta-e05277') }}</div>
            <div class="text-h6">{{ resumenData.margen_sobre_venta_bruta }}%</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Detalle -->
      <div v-if="tipoReporte === 'detalle' && detalleData.length">
        <q-table
          :title="$t('ui.productos-vendidos-fb7909')"
          :rows="detalleData"
          :columns="detalleColumns"
          row-key="codigo_producto"
          :pagination="{ rowsPerPage: 15 }"
          dense
        />
      </div>

      <!-- Gráfico -->
      <div v-if="tipoReporte === 'grafico' && graficoData.length">
        <q-table
          :title="$t('ui.ventas-por-periodo-fc1a57')"
          :rows="graficoData"
          :columns="graficoColumns"
          row-key="periodo"
          :pagination="{ rowsPerPage: 30 }"
          dense
        />
      </div>

      <!-- Sin datos -->
      <div v-if="errorMensaje" class="text-negative q-mt-md">
        {{ errorMensaje }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, reactive, onMounted } from 'vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
// Constantes
const ID_EMPRESA = idempresa_md5()

// Estado
const loadingAlmacenes = ref(false)
const loadingClientes = ref(false)
const loadingCampanas = ref(false)
const loadingReporte = ref(false)
const errorMensaje = ref('')

const listaAlmacenes = ref([])
const listaClientes = ref([])
const listaCampanas = ref([])

const form = reactive({
  fecha_inicio: '',
  fecha_fin: '',
  almacen_id: null,
  cliente_id: null,
  campana_id: null,
  granularidad: 'dia', // para gráfico
})

const tipoReporte = ref('resumen')
const resumenData = ref(null)
const detalleData = ref([])
const graficoData = ref([])

// Columnas de las tablas
const detalleColumns = [
  {
    name: 'codigo_producto',
    label: i18nT('ui.codigo-c35510'),
    field: 'codigo_producto',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre_producto',
    label: i18nT('inventario.product'),
    field: 'nombre_producto',
    align: 'left',
    sortable: true,
  },
  { name: 'categoria_precio', label: i18nT('ui.categoria-precio-30f1a7'), field: 'categoria_precio', align: 'left' },
  { name: 'cantidad_vendida', label: i18nT('ui.cantidad-b5b6f8'), field: 'cantidad_vendida', align: 'center' },
  {
    name: 'precio_unitario_promedio',
    label: i18nT('ui.precio-unit-2591ea'),
    field: 'precio_unitario_promedio',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'total_vendido',
    label: i18nT('ui.total-vendido-526123'),
    field: 'total_vendido',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costo_unitario_promedio',
    label: i18nT('ui.costo-unit-baa0d4'),
    field: 'costo_unitario_promedio',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costo_total',
    label: i18nT('ui.costo-total-ba6044'),
    field: 'costo_total',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'utilidad',
    label: i18nT('ui.utilidad-64a80d'),
    field: 'utilidad',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'margen_sobre_venta_neta',
    label: i18nT('ui.margen-v-neta-a65bb2'),
    field: 'margen_sobre_venta_neta',
    align: 'center',
  },
  {
    name: 'margen_sobre_venta_bruta',
    label: i18nT('ui.margen-v-bruta-7230c4'),
    field: 'margen_sobre_venta_bruta',
    align: 'center',
  },
]

const graficoColumns = [
  { name: 'periodo', label: i18nT('ui.periodo-b4d82e'), field: 'periodo', align: 'left', sortable: true },
  {
    name: 'venta_bruta',
    label: i18nT('ui.venta-bruta-6ce759'),
    field: 'venta_bruta',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'venta_neta',
    label: i18nT('ui.venta-neta-ca0aa8'),
    field: 'venta_neta',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'costo_ventas',
    label: i18nT('ui.costo-ventas-940130'),
    field: 'costo_ventas',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'utilidad',
    label: i18nT('ui.utilidad-64a80d'),
    field: 'utilidad',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  { name: 'margen_neta', label: i18nT('ui.margen-neta-4faba0'), field: 'margen_neta', align: 'center' },
]

// Cargar opciones de filtros al montar
onMounted(() => {
  cargarAlmacenes()
  cargarClientes()
  cargarCampanas()
})

async function cargarAlmacenes() {
  loadingAlmacenes.value = true
  try {
    const { data } = await api.get(`listaResponsableAlmacenReportes/${ID_EMPRESA}`)
    // Ajusta el mapeo según la respuesta real; se asume [{ idalmacen, almacen }]
    listaAlmacenes.value = data.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
  } finally {
    loadingAlmacenes.value = false
  }
}

async function cargarClientes() {
  loadingClientes.value = true
  try {
    const { data } = await api.get(`listaCliente/${ID_EMPRESA}`)
    // Ajusta mapeo: [{ nombre, id }]
    listaClientes.value = data.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  } finally {
    loadingClientes.value = false
  }
}

async function cargarCampanas() {
  loadingCampanas.value = true
  try {
    const { data } = await api.get(`campanas/${ID_EMPRESA}`)
    // Ajusta mapeo: [{ nombre, id }]
    listaCampanas.value = data.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error al cargar campañas:', error)
  } finally {
    loadingCampanas.value = false
  }
}

async function obtenerReporte() {
  errorMensaje.value = ''
  resumenData.value = null
  detalleData.value = []
  graficoData.value = []

  if (!form.fecha_inicio || !form.fecha_fin) {
    errorMensaje.value = 'Debe seleccionar un rango de fechas.'
    return
  }

  loadingReporte.value = true

  try {
    const params = {
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      almacen_id: form.almacen_id || '',
      cliente_id: form.cliente_id || '',
      campana_id: form.campana_id || '',
    }

    let ver = ''
    switch (tipoReporte.value) {
      case 'resumen':
        ver = 'reportes/ventasUtilidadResumen'
        break
      case 'detalle':
        ver = 'reportes/ventasUtilidadDetalle'
        break
      case 'grafico':
        ver = 'reportes/ventasUtilidadGrafico'
        params.granularidad = form.granularidad
        break
    }

    const queryString = Object.entries(params)
      .filter(([, v]) => v !== '' && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${ver}&${queryString}`
    const { data } = await api.get(url)

    if (data.estado === 'exito') {
      if (tipoReporte.value === 'resumen') {
        resumenData.value = data.data
      } else if (tipoReporte.value === 'detalle') {
        detalleData.value = data.data
      } else if (tipoReporte.value === 'grafico') {
        graficoData.value = data.data
      }
    } else {
      errorMensaje.value = data.mensaje || i18nT('ui.error-al-obtener-el-reporte-b3deb3')
    }
  } catch (error) {
    console.error('Error en reporte:', error)
    errorMensaje.value = 'Error de conexión al obtener el reporte.'
  } finally {
    loadingReporte.value = false
  }
}

// Filtro currency global (opcional)
import { useQuasar } from 'quasar'
const $q = useQuasar()
// Registrar filtro currency
$q.iconSet.currency = 'Bs.' // si usas bolivianos
</script>

<style scoped>
/* Ajustes menores */
</style>

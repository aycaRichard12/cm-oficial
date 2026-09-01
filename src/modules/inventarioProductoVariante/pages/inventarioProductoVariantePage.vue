<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">Inventario de Productos Variantes</div>
      </q-card-section>

      <q-card-section>
        <!-- Select de almacén -->
        <div class="row q-col-gutter-md q-mb-md items-center">
          <div class="col-12 col-md-4">
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              emit-value
              map-options
              label="Almacén"
              dense
              outlined
              :loading="loadingAlmacenes"
              :disable="loadingAlmacenes"
              @update:model-value="cargarInventario"
            >
              <template v-slot:prepend>
                <q-icon name="store" color="primary" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin almacenes disponibles</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-auto flex q-gutter-sm">
            <q-btn
              icon="refresh"
              color="primary"
              flat
              dense
              @click="cargarAlmacenes"
              :loading="loadingAlmacenes"
            >
              <q-tooltip>Recargar almacenes</q-tooltip>
            </q-btn>
            <q-btn
              icon="sync"
              color="secondary"
              flat
              dense
              @click="cargarInventario"
              :loading="loading"
              :disable="!almacenSeleccionado"
            >
              <q-tooltip>Recargar inventario</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Tabla con filtros avanzados -->
        <BaseFilterableTable
          :rows="filas"
          :columns="columnas"
          :array-headers="columnasFiltrables"
          :sum-columns="['cantidad', 'precio_base']"
          row-key="id_variante"
          :loading="loading"
          :no-data-label="almacenSeleccionado ? 'Sin variantes para este almacén' : 'Seleccione un almacén'"
        >
          <!-- Celda: Imagen -->
          <template v-slot:body-cell-imagen="props">
            <q-td :props="props" style="width: 70px">
              <q-img
                :src="imagen + props.row.imagen"
                style="width: 56px; height: 56px; border-radius: 6px"
                spinner-color="primary"
                fit="cover"
              >
                <template v-slot:error>
                  <div
                    class="column items-center justify-center bg-grey-3"
                    style="height: 100%; width: 100%; border-radius: 6px"
                  >
                    <q-icon name="image_not_supported" size="sm" color="grey-6" />
                  </div>
                </template>
              </q-img>
            </q-td>
          </template>

          <!-- Celda: Código -->
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <q-chip outline color="primary" dense>{{ props.row.codigo }}</q-chip>
            </q-td>
          </template>

          <!-- Celda: Nombre -->
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.nombre }}</div>
              <div class="text-caption text-grey">{{ props.row.descripcion }}</div>
            </q-td>
          </template>

          <!-- Celda: Atributos -->
          <template v-slot:body-cell-atributos="props">
            <q-td :props="props">
              <div v-for="(attr, idx) in props.row.atributos" :key="idx" class="q-mb-xs">
                <q-badge outline color="secondary" class="q-mr-xs">
                  {{ attr.atributo }}: {{ attr.valor }}
                </q-badge>
              </div>
            </q-td>
          </template>

          <!-- Celda: Stock -->
          <template v-slot:body-cell-stock="props">
            <q-td :props="props" class="text-center">
              <q-badge :color="props.row.cantidad > 0 ? 'green' : 'red'">
                {{ props.row.cantidad }}
              </q-badge>
            </q-td>
          </template>
        </BaseFilterableTable>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { imagen } from 'src/boot/url'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const props = defineProps({
  idalmacen: {
    type: [Number, String],
    default: null,
  },
})

const $q = useQuasar()
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()

const loading = ref(false)
const loadingAlmacenes = ref(false)
const filas = ref([])
const almacenSeleccionado = ref(null)
const opcionesAlmacenes = ref([])

const columnas = [
  { name: 'imagen', label: 'Imagen', field: 'imagen', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true, dataType: 'text' },
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true, dataType: 'text' },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true, dataType: 'text' },
  { name: 'atributos', label: 'Atributos', align: 'left' },
  { name: 'stock', label: 'Stock', field: 'cantidad', align: 'center', sortable: true, dataType: 'number' },
  { name: 'precio_base', label: 'Precio Base', field: 'precio_base', align: 'right', sortable: true, dataType: 'number' },
]

// Columnas que tendrán filtro de encabezado (excluye imagen y atributos por su complejidad)
const columnasFiltrables = ['codigo', 'nombre', 'sku', 'stock', 'precio_base']

async function cargarAlmacenes() {
  loadingAlmacenes.value = true
  try {
    const response = await api.get(`listaResponsableAlmacenReportes/${idempresa}`)
    if (Array.isArray(response.data)) {
      const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
      opcionesAlmacenes.value = filtrados.map((item) => ({
        label: item.almacen,
        value: item.idalmacen,
      }))

      // Si se pasó idalmacen como prop, usarlo; si no, usar el primero disponible
      if (props.idalmacen) {
        almacenSeleccionado.value = props.idalmacen
      } else if (opcionesAlmacenes.value.length > 0) {
        almacenSeleccionado.value = opcionesAlmacenes.value[0].value
      }
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudo cargar la lista de almacenes.' })
  } finally {
    loadingAlmacenes.value = false
  }
}

async function cargarInventario() {
  if (!almacenSeleccionado.value) return

  loading.value = true
  try {
    const response = await api.get(`listar_inventario_variantes_por_almacen/${almacenSeleccionado.value}`)
    if (response.data.estado === 'exito' && Array.isArray(response.data.data)) {
      const plano = []
      for (const producto of response.data.data) {
        for (const variante of producto.variantes) {
          plano.push({
            id_variante: `${producto.id_productos_almacen}-${variante.id_Producto_Variante}`,
            id_productos_almacen: producto.id_productos_almacen,
            id_producto_comercial: producto.id_producto_comercial,
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            imagen: producto.imagen || '',
            unidad: producto.unidad,
            sku: variante.sku,
            precio_base: variante.precio_base,
            cantidad: variante.cantidad,
            idstock_variante: variante.idstock_variante,
            atributos: variante.atributos,
          })
        }
      }
      filas.value = plano
    } else {
      filas.value = []
      if (response.data.mensaje) {
        $q.notify({ type: 'warning', message: response.data.mensaje })
      }
    }
  } catch (error) {
    console.error('Error al cargar inventario de variantes:', error)
    $q.notify({ type: 'negative', message: 'No se pudo cargar el inventario de variantes.' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await cargarAlmacenes()
  await cargarInventario()
})
</script>

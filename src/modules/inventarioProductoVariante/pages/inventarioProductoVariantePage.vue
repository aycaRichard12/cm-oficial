<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">Inventario de Productos Variantes</div>
        <div class="text-subtitle2 text-grey">Almacén ID: {{ idalmacen }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="filtro"
          dense
          outlined
          debounce="300"
          placeholder="Buscar producto, SKU o atributo..."
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filasFiltradas"
          :columns="columnas"
          row-key="id_variante"
          flat
          bordered
          :loading="loading"
          :no-data-label="'Sin variantes para este almacén'"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="codigo" :props="props">
                <q-chip outline color="primary" dense>{{ props.row.codigo }}</q-chip>
              </q-td>
              <q-td key="nombre" :props="props">
                {{ props.row.nombre }}
                <div class="text-caption text-grey">{{ props.row.descripcion }}</div>
              </q-td>
              <q-td key="sku" :props="props">{{ props.row.sku }}</q-td>
              <q-td key="atributos" :props="props">
                <div v-for="(attr, idx) in props.row.atributos" :key="idx">
                  <q-badge outline color="secondary" class="q-mr-xs">
                    {{ attr.atributo }}: {{ attr.valor }}
                  </q-badge>
                </div>
              </q-td>
              <q-td key="stock" :props="props">
                <q-badge :color="props.row.cantidad > 0 ? 'green' : 'red'">
                  {{ props.row.cantidad }}
                </q-badge>
              </q-td>
              <q-td key="precio" :props="props">
                {{ props.row.precio_base }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  idalmacen: {
    type: [Number, String],
    required: true,
  },
})

const $q = useQuasar()
const loading = ref(false)
const filas = ref([])
const filtro = ref('')

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left' },
  { name: 'atributos', label: 'Atributos', align: 'left' },
  { name: 'stock', label: 'Stock', field: 'cantidad', align: 'center', sortable: true },
  { name: 'precio', label: 'Precio Base', field: 'precio_base', align: 'right', sortable: true },
]

const filasFiltradas = computed(() => {
  if (!filtro.value.trim()) return filas.value
  const needle = filtro.value.toLowerCase()
  return filas.value.filter((fila) =>
    Object.values(fila).some((valor) => {
      if (Array.isArray(valor)) {
        return valor.some((attr) => `${attr.atributo} ${attr.valor}`.toLowerCase().includes(needle))
      }
      return String(valor).toLowerCase().includes(needle)
    }),
  )
})

async function cargarInventario() {
  loading.value = true
  try {
    const response = await api.get(`listar_inventario_variantes_por_almacen/${props.idalmacen}`)
    if (response.data.estado === 'exito' && Array.isArray(response.data.data)) {
      const datos = response.data.data
      const plano = []
      for (const producto of datos) {
        for (const variante of producto.variantes) {
          plano.push({
            id_variante: `${producto.id_productos_almacen}-${variante.id_Producto_Variante}`,
            id_productos_almacen: producto.id_productos_almacen,
            id_producto_comercial: producto.id_producto_comercial,
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
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

onMounted(cargarInventario)
</script>

<template>
  <q-form @submit.prevent="submitForm" class="q-gutter-md q-ma-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-input
          v-model="localForm.serie"
          label="Nombre de la Serie *"
          outlined
          dense
          :rules="[(val) => !!val || 'El nombre es obligatorio']"
        />
      </div>

      <div class="col-12">
        <q-select
          v-model="localForm.producto_idproducto"
          :options="productosOptions"
          label="Producto"
          outlined
          dense
          emit-value
          map-options
          clearable
          option-label="label"
          option-value="value"
          @update:model-value="onProductoChange"
        />
      </div>

      <div class="col-12" v-if="localForm.producto_idproducto">
        <BaseFilterableTable
          title="Seleccione las variantes"
          v-model:selected="selectedRows"
          :rows="variantesOptions"
          :columns="variantColumns"
          :arrayHeaders="['sku', 'atributos']"
          row-key="value"
          selection="multiple"
          :loading="cargandoVariantes"
          dense
          flat
          bordered
          :pagination="{ rowsPerPage: 5 }"
          :rows-per-page-options="[5, 10, 20, 0]"
          filterMode="client"
        >
          <template v-slot:top>
            <div class="text-subtitle2">Seleccione las variantes</div>
            <q-space />
            <div class="text-caption">{{ selectedRows.length }} seleccionadas</div>
          </template>

          <!-- Custom body slot to handle selection and display format -->
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td key="label" :props="props">{{ props.row.label }}</q-td>
              <q-td key="sku" :props="props">{{ props.row.sku }}</q-td>
              <q-td key="atributos" :props="props">
                <div class="q-gutter-xs">
                  <q-badge
                    v-for="attr in props.row.valores"
                    :key="attr.id_Valor_Atributo"
                    color="primary"
                    outline
                  >
                    {{ attr.atributo }}: {{ attr.valor }}
                  </q-badge>
                </div>
              </q-td>
              <q-td key="precio" :props="props">{{ props.row.precio }}</q-td>
            </q-tr>
          </template>
        </BaseFilterableTable>
      </div>

      <div class="col-12">
        <q-toggle
          v-model="localForm.estado"
          :true-value="1"
          :false-value="0"
          label="Estado Activo"
        />
      </div>
    </div>

    <div class="row justify-end q-mt-md q-gutter-sm">
      <q-btn label="Cancelar" color="negative" flat @click="$emit('cancel')" />
      <q-btn label="Guardar" type="submit" color="primary" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { apiP } from 'boot/axios'
import { useQuasar } from 'quasar'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  productos: {
    type: Array,
    default: () => [],
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const localForm = ref({ ...props.modelValue })
const productosOptions = ref([])
const variantesOptions = ref([])
const cargandoVariantes = ref(false)
const selectedRows = ref([]) // filas seleccionadas en la tabla

const variantColumns = [
  { name: 'label', label: 'Variante', field: 'label', align: 'left', sortable: true },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  {
    name: 'atributos',
    label: 'Atributos',
    field: (row) => row.valores.map((v) => `${v.atributo}: ${v.valor}`).join(', '),
    align: 'left',
  },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'left', sortable: true },
]

const cargarVariantes = async (idproducto) => {
  if (!idproducto) {
    variantesOptions.value = []
    selectedRows.value = []
    return
  }
  cargandoVariantes.value = true
  try {
    const response = await apiP.get(`listar_productos_variantes/${idproducto}`)
    const variantes = response.data || []
    variantesOptions.value = variantes.map((v) => ({
      label: v.sku ? `Variante ${v.sku}` : `Variante #${v.id_Producto_Variante}`,
      value: v.id_Producto_Variante,
      sku: v.sku,
      precio: v.precio_base,
      valores: v.valores || [],
    }))

    // Precargar selección si estamos editando y hay variantes previamente asignadas
    const idsSeleccionados = localForm.value.variantes || []
    selectedRows.value = variantesOptions.value.filter((v) => idsSeleccionados.includes(v.value))
  } catch (error) {
    console.error('Error al cargar variantes', error)
    $q.notify({ type: 'negative', message: 'Error al cargar variantes' })
  } finally {
    cargandoVariantes.value = false
  }
}

const onProductoChange = (val) => {
  localForm.value.variantes = []
  selectedRows.value = []
  cargarVariantes(val)
}

// Sincronizar selectedRows -> localForm.variantes
watch(
  selectedRows,
  (nuevasSeleccionadas) => {
    localForm.value.variantes = nuevasSeleccionadas.map((row) => row.value)
  },
  { deep: true },
)

watch(
  () => props.modelValue,
  (newVal) => {
    localForm.value = { ...newVal }
    if (newVal.producto_idproducto) {
      cargarVariantes(newVal.producto_idproducto)
    } else {
      variantesOptions.value = []
      selectedRows.value = []
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.productos,
  (newVal) => {
    productosOptions.value = newVal.map((p) => ({
      label: p.codigo + ' - ' + p.descripcion,
      value: p.id,
    }))
  },
  { deep: true, immediate: true },
)

const submitForm = () => {
  emit('submit', localForm.value)
}
</script>

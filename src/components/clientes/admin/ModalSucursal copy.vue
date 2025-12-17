<!-- <template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-8 text-h6">Sucursales</div>
      </div>
    </q-card-section>

    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <q-input v-model="modelValue.nombre" label="Nombre *" outlined class="col-md-4" />
      <q-input v-model="modelValue.telefono" label="Teléfono" outlined class="col-md-2" />
      <q-input v-model="modelValue.direccion" label="Dirección" outlined class="col-md-4" />
      <q-card-actions align="right">
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
        <q-btn label="Guardar" type="submit" color="primary" />
      </q-card-actions>
    </q-form>

    <q-table
      class="q-mt-md"
      :rows="processedRows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      wrap-cells
    >
      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="text-nowrap">
          <q-btn icon="edit" color="info" size="sm" dense flat @click="editarSucursal(props.row)" />
          <q-btn
            icon="delete"
            color="negative"
            size="sm"
            dense
            flat
            @click="eliminarSucursal(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'edit', 'delete'])
const onSubmit = () => {
  emit('submit', props.modelValue)
}

const columns = [
  { name: 'id', label: 'N°', field: (row) => row.numero, align: 'center' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'center' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'center' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'center' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]
const processedRows = computed(() => {
  return props.rows.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))
})
function editarSucursal(sucursal) {
  emit('edit', sucursal)
}
function eliminarSucursal(sucursal) {
  emit('delete', sucursal)
}
</script> -->

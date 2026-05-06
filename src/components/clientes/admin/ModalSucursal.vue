<template>
  <q-card class="q-pa-md" style="min-width: 350px; max-width: 900px; width: 100%">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6 text-primary">
        <q-icon name="store" class="q-mr-sm" />
        Sucursales
      </div>
      <q-space />
      <q-btn
        v-if="modelValue.id"
        label="Nueva Sucursal"
        icon="add"
        flat
        color="primary"
        @click="resetForm"
        class="q-mr-sm"
      />
      <q-btn icon="close" flat round dense v-close-popup @click="$emit('cancel')" />
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="onSubmit" class="q-gutter-y-md">
        <div class="row q-col-gutter-md">
          <q-input
            :model-value="modelValue.nombre"
            @update:model-value="(val) => updateModelValue('nombre', val)"
            label="Nombre *"
            outlined
            dense
            class="col-12 col-md-4"
            :rules="[(val) => (val && val.length > 0) || 'El nombre es requerido']"
            lazy-rules
          />
          <q-input
            :model-value="modelValue.telefono"
            @update:model-value="(val) => updateModelValue('telefono', val)"
            label="Teléfono"
            outlined
            dense
            class="col-12 col-md-3"
          />
          <q-input
            :model-value="modelValue.direccion"
            @update:model-value="(val) => updateModelValue('direccion', val)"
            label="Dirección"
            outlined
            dense
            class="col-12 col-md-5"
          />
        </div>

        <div class="row justify-end q-mt-sm">
          <q-btn
            :label="modelValue.id ? 'Actualizar Sucursal' : 'Guardar Sucursal'"
            type="submit"
            color="primary"
            :loading="loading"
            icon="save"
          />
        </div>
      </q-form>
    </q-card-section>

    <q-separator class="q-my-md" />

    <q-card-section class="q-pa-none">
      <q-table
        :rows="processedRows"
        :columns="columns"
        row-key="id"
        flat
        bordered
        dense
        wrap-cells
        :loading="loading"
        no-data-label="No hay sucursales registradas"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props" class="text-nowrap">
            <q-btn
              icon="edit"
              color="primary"
              size="sm"
              dense
              flat
              round
              @click="editarSucursal(props.row)"
            >
              <q-tooltip>Editar sucursal</q-tooltip>
            </q-btn>
            <q-btn
              icon="delete"
              color="negative"
              size="sm"
              dense
              flat
              round
              @click="eliminarSucursal(props.row)"
            >
              <q-tooltip>Eliminar sucursal</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
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

const updateModelValue = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const resetForm = () => {
  emit('update:modelValue', {
    ver: 'registrarSucursal',
    nombre: '',
    telefono: '',
    direccion: '',
    idcliente: props.modelValue.idcliente,
  })
}

const onSubmit = () => {
  emit('submit', props.modelValue)
}

const columns = [
  { name: 'id', label: 'N°', field: (row) => row.numero, align: 'center' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'center' },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
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
</script>

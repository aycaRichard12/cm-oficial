<template>
  <div class="q-mb-md">
    <q-card-section>
      <div class="row justify-center q-col-gutter-md">
        <div class="col-12 col-md-4">
          <label for="fechafin">Fecha Final*</label>
          <q-input
            :model-value="modelValueFecha"
            @update:model-value="$emit('update:modelValueFecha', $event)"
            id="fechafin"
            type="date"
            outlined
            dense
            @change="$emit('generar')"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="almacen">Almacén*</label>
          <q-select
            :model-value="modelValueAlmacen"
            :options="opcionesAlmacenes"
            id="almacen"
            dense
            outlined
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            clearable
            required
            @update:model-value="
              (val) => {
                $emit('update:modelValueAlmacen', val)
                $emit('generar')
              }
            "
          />
        </div>
      </div>

      <div class="row justify-center q-mt-md">
        <!-- <q-btn color="primary" label="Generar Reporte" class="q-mr-sm" @click="$emit('generar')" /> -->
        <q-btn color="primary" label="Vista previa del Reporte" @click="$emit('vistaPrevia')" />
      </div>
    </q-card-section>
  </div>
</template>

<script setup>
defineProps({
  modelValueFecha: {
    type: String,
    required: true,
  },
  modelValueAlmacen: {
    type: [Number, String, null],
    required: true,
  },
  opcionesAlmacenes: {
    type: Array,
    default: () => [],
  },
  disableVistaPrevia: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValueFecha', 'update:modelValueAlmacen', 'generar', 'vistaPrevia'])
</script>

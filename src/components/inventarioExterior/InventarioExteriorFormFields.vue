
<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-12" style="display: none">
      <q-input type="hidden" name="ver" id="verINV" v-model="localFormData.ver" required />
    </div>

    <div class="col-md-12" style="display: none">
      <q-input type="hidden" name="idusuario" id="idusuarioINV" v-model="localFormData.idusuario" />
    </div>

    <div class="col-12 col-md-4">
      <label for="almacen">Almacén</label>
      <q-select
        v-model="localFormData.almacen"
        :options="almacenOptions"
        id="almacen"
        dense
        outlined
        emit-value
        map-options
        :rules="[(val) => !!val || 'Debe seleccionar un almacen']"
      />
    </div>

    <ClienteSucursal
      class="col-12 col-md-8"
      v-model:client="localFormData.cliente"
      v-model:branch="localFormData.sucursal"
    />

    <div class="col-12 col-md-2">
      <label for="fechaINV">Fecha*</label>
      <q-input
        dense
        outlined
        type="date"
        name="fecha"
        id="fechaINV"
        v-model="localFormData.fecha"
        label="Fecha*"
        required
      />
    </div>

    <div class="col-12 col-md-4">
      <label for="observacionINV">Observación</label>
      <q-input
        type="text"
        name="observacion"
        id="observacionINV"
        v-model="localFormData.observacion"
        dense
        required
        outlined
      />
    </div>
    <div class="col-12 col-md-3">
      <label for="ubicacion">Latitud</label>
      <q-input
        name="ubicacion"
        id="ubicacion"
        v-model="localFormData.latitud"
        dense
        outlined
        readonly
      />
    </div>
    <div class="col-12 col-md-3">
      <label for="ubicacion2">Longitud</label>
      <q-input
        name="ubicacion2"
        id="ubicacion2"
        v-model="localFormData.longitud"
        dense
        outlined
        readonly
      />
    </div>
    <div class="col-md-12 flex justify-end">
      <q-btn label="Registrar" type="submit" color="primary" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ClienteSucursal from 'src/components/ClienteSucursal.vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  almacenOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:formData'])

const localFormData = ref({ ...props.formData })

watch(() => props.formData, (newVal) => {
  Object.assign(localFormData.value, newVal)
}, { deep: true })

watch(localFormData, (newVal) => {
  emit('update:formData', newVal)
}, { deep: true })
</script>

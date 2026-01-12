
<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-12" style="display: none">
      <q-input type="hidden" name="ver" id="verINV" v-model="localFormData.ver" required />
    </div>

    <div class="col-md-12" style="display: none">
      <q-input type="hidden" name="idusuario" id="idusuarioINV" v-model="localFormData.idusuario" />
    </div>

    <div class="col-12 col-md-4">
      <label for="almacen">Almacén*</label>
      <q-select
        v-model="localFormData.almacen"
        :options="almacenOptions"
        id="almacen"
        label="Almacén"
        dense
        outlined
        emit-value
        map-options
        :rules="[(val) => !!val || 'Debe seleccionar un almacen']"
      >
        <template v-slot:prepend>
          <q-icon name="store" />
        </template>
      </q-select>
    </div>

    <ClienteSucursal
      class="col-12 col-md-8"
      v-model:client="localFormData.cliente"
      v-model:branch="localFormData.sucursal"
    />

    <div class="col-12 col-md-4">
      <q-input
        dense
        outlined
        type="date"
        name="fecha"
        id="fechaINV"
        v-model="localFormData.fecha"
        label="Fecha*"
        required
        stack-label
      >
        <template v-slot:prepend>
          <q-icon name="event" />
        </template>
      </q-input>
    </div>

    <div :class="['col-12', isEditing ? 'col-md-8' : 'col-md-4']">
      <q-input
        type="text"
        name="observacion"
        id="observacionINV"
        v-model="localFormData.observacion"
        label="Observación"
        dense
        required
        outlined
      >
        <template v-slot:prepend>
          <q-icon name="description" />
        </template>
      </q-input>
    </div>
    <div class="col-12 col-md-2" v-if="!isEditing">
      <q-input
        name="ubicacion"
        id="ubicacion"
        v-model="localFormData.latitud"
        label="Latitud"
        dense
        outlined
        readonly
      >
        <template v-slot:prepend>
          <q-icon name="place" />
        </template>
      </q-input>
    </div>
    <div class="col-12 col-md-2" v-if="!isEditing">
      <q-input
        name="ubicacion2"
        id="ubicacion2"
        v-model="localFormData.longitud"
        label="Longitud"
        dense
        outlined
        readonly
      >
        <template v-slot:prepend>
          <q-icon name="pin_drop" />
        </template>
      </q-input>
    </div>

    <div class="col-12" v-if="!isEditing">
      <label>Ubicación en Mapa</label>
      <InventarioExteriorMapa
        v-model:latitud="localFormData.latitud"
        v-model:longitud="localFormData.longitud"
        :readonly="true"
      />
    </div>

    <div class="col-md-12 flex justify-end q-mt-md">
      <q-btn 
        :label="isEditing ? 'Guardar Cambios' : 'Registrar'" 
        :icon="isEditing ? 'save' : 'add_circle'"
        type="submit" 
        color="primary" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ClienteSucursal from 'src/components/ClienteSucursal.vue'
import InventarioExteriorMapa from 'src/components/inventarioExterior/InventarioExteriorMapa.vue'

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

const isEditing = computed(() => {
  return !!localFormData.value.id
})

watch(() => props.formData, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localFormData.value)) {
    localFormData.value = { ...newVal }
  }
}, { deep: true })

watch(localFormData, (newVal) => {
  emit('update:formData', newVal)
}, { deep: true })
</script>

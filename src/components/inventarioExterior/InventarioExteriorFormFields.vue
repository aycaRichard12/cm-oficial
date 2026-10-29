
<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-12" style="display: none">
      <q-input type="hidden" name="ver" id="verINV" v-model="localFormData.ver" required />
    </div>

    <div class="col-md-12" style="display: none">
      <q-input type="hidden" name="idusuario" id="idusuarioINV" v-model="localFormData.idusuario" />
    </div>

    <div class="col-12 col-md-4">
      <label for="almacen">{{ $t('ui.almacen-3e3724') }}</label>
      <q-select
        v-model="localFormData.almacen"
        :options="almacenOptions"
        id="almacen"
        :label="$t('inventario.warehouse')"
        dense
        outlined
        emit-value
        map-options
        :rules="[(val) => !!val || $t('ui.debe-seleccionar-un-almacen-ab2da4')]"
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
        :label="$t('ui.fecha-659648')"
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
        :label="$t('ui.observacion-1d0d99')"
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
        :label="$t('ui.latitud-04f172')"
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
        :label="$t('ui.longitud-9b1023')"
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
      <label>{{ $t('ui.ubicacion-en-mapa-7669f5') }}</label>
      <InventarioExteriorMapa
        v-model:latitud="localFormData.latitud"
        v-model:longitud="localFormData.longitud"
        :readonly="true"
      />
    </div>

    <div class="col-md-12 flex justify-end q-mt-md">
      <q-btn 
        :label="isEditing ? $t('ui.guardar-cambios-7d2fd7') : $t('ui.registrar-caacc6')" 
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

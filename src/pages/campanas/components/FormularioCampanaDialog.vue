<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" @hide="resetearFormulario" @keydown.esc="$emit('update:modelValue', false)">
    <q-card style="width: 100%; max-width: 600px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="campaign" class="q-mr-sm" />
          {{ formData.id ? 'Editar Campaña' : 'Nueva Campaña' }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="registrarCampana">
          <div class="row q-col-gutter-md">
            <div class="col-12 row items-center">
              <div class="col"><q-input :model-value="formData.campana" @update:model-value="val => $emit('update-form', 'campana', val)" label="Nombre *" outlined dense required><template v-slot:prepend><q-icon name="label" /></template></q-input></div>
              <div class="col-auto q-ml-sm"><q-checkbox :model-value="formData.estadoActivo" @update:model-value="val => $emit('update-form', 'estadoActivo', val)" label="Activar" color="primary" /></div>
            </div>
            <div class="col-12 col-sm-6"><q-input :model-value="formData.fechai" @update:model-value="val => $emit('update-form', 'fechai', val)" label="Fecha inicio *" type="date" outlined dense required><template v-slot:prepend><q-icon name="event" /></template></q-input></div>
            <div class="col-12 col-sm-6"><q-input :model-value="formData.fechaf" @update:model-value="val => $emit('update-form', 'fechaf', val)" label="Fecha final *" type="date" outlined dense required><template v-slot:prepend><q-icon name="event" /></template></q-input></div>
            <div class="col-12 col-sm-6"><q-input :model-value="formData.porcentaje" @update:model-value="val => $emit('update-form', 'porcentaje', val)" label="Descuento *" type="number" suffix="%" outlined dense required><template v-slot:prepend><q-icon name="percent" /></template></q-input></div>
            <div class="col-12 col-sm-6">
              <q-select :model-value="formData.idalmacen" @update:model-value="val => $emit('update-form', 'idalmacen', val)" :options="almacenesOptions" option-value="idalmacen" option-label="almacen" label="Almacén *" outlined dense emit-value map-options required>
                <template v-slot:prepend><q-icon name="store" /></template>
              </q-select>
            </div>
          </div>
          <div class="row q-mt-md q-gutter-sm justify-end">
            <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
            <q-btn type="submit" unelevated color="primary" icon="save" label="Guardar" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
defineProps({
  modelValue: Boolean,
  formData: Object,
  almacenesOptions: Array,
  registrarCampana: Function,
  resetearFormulario: Function
})
defineEmits(['update:modelValue', 'update-form'])
</script>

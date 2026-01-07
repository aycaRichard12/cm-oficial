<template>
  <q-form @submit.prevent="$emit('generar')">
    <div class="row flex justify-center q-col-gutter-x-md">
      <div class="col-12 col-md-4">
        <label for="fechaini">Fecha Inicial*</label>
        <q-input
          outlined
          dense
          :model-value="fechaInicial"
          @update:model-value="$emit('update:fechaInicial', $event)"
          id="fechaini"
          :rules="[(val) => !!val || 'Campo obligatorio']"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="fechaInicial"
                  @update:model-value="$emit('update:fechaInicial', $event)"
                  mask="YYYY-MM-DD"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-4">
        <label for="fechafin">Fecha Final*</label>
        <q-input
          outlined
          dense
          :model-value="fechaFinal"
          @update:model-value="$emit('update:fechaFinal', $event)"
          id="fechafin"
          :rules="[
            (val) => !!val || 'Campo obligatorio',
            (val) => validarFechas(val) || 'Fecha final debe ser mayor o igual a la inicial',
          ]"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="fechaFinal"
                  @update:model-value="$emit('update:fechaFinal', $event)"
                  mask="YYYY-MM-DD"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row justify-center q-mt-md">
      <q-btn label="Generar reporte" type="submit" color="primary" class="q-mr-sm" />
      <q-btn
        label="Exportar a Excel"
        color="primary"
        @click="$emit('exportar')"
        :disable="disableExport"
      />
    </div>
  </q-form>
</template>

<script setup>
defineProps({
  fechaInicial: String,
  fechaFinal: String,
  validarFechas: Function,
  disableExport: Boolean,
})

defineEmits(['update:fechaInicial', 'update:fechaFinal', 'generar', 'exportar'])
</script>

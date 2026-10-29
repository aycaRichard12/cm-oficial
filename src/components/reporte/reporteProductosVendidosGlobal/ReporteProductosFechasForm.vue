<template>
  <q-form @submit.prevent="$emit('generar')">
    <div class="row flex justify-center q-col-gutter-x-md">
      <div class="col-12 col-md-4" id="fechaini">
        <label for="fechaini">{{ $t('ui.fecha-iniciala-300da7') }}</label>
        <q-input
          outlined
          dense
          :model-value="fechaInicial"
          @update:model-value="$emit('update:fechaInicial', $event)"
          id="fechaini"
          mask="##/##/####"
          fill-mask
          :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="fechaInicial"
                  @update:model-value="$emit('update:fechaInicial', $event)"
                  mask="DD/MM/YYYY"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-4" id="fechafin">
        <label for="fechafin">{{ $t('ui.fecha-final-33d0e8') }}</label>
        <q-input
          outlined
          dense
          :model-value="fechaFinal"
          @update:model-value="$emit('update:fechaFinal', $event)"
          id="fechafin"
          mask="##/##/####"
          fill-mask
          :rules="[
            (val) => !!val || $t('configuracion.canalesDeVenta.form.required'),
            (val) => validarFechas(val) || $t('ui.fecha-final-debe-ser-mayor-o-igual-a-la-inicial-543555'),
          ]"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  :model-value="fechaFinal"
                  @update:model-value="$emit('update:fechaFinal', $event)"
                  mask="DD/MM/YYYY"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row justify-center q-mt-md">
      <q-btn :label="$t('ui.generar-reporte-eeafce')" type="submit" color="primary" class="q-mr-sm" id="generar" />
      <q-btn
        :label="$t('ui.exportar-a-excel-1569c7')"
        color="primary"
        @click="$emit('exportar')"
        :disable="disableExport"
        id="exportar"
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

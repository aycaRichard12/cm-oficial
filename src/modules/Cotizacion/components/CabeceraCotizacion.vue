<template>
  <div class="row items-center q-mb-lg animate__animated animate__fadeInDown">
    <div class="col-12 flex items-center">
      <div class="q-pa-md bg-white rounded-borders q-mr-md shadow-2 radius-12">
        <q-icon name="request_quote" size="36px" color="primary" />
      </div>
      <div>
        <h1 class="text-h4 text-weight-bolder q-my-none text-primary letter-spacing-neg-05">
          {{ titulo }}
        </h1>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          {{ subtitulo }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, default: 'Emisión de Cotización' },
  subtitulo: {
    type: String,
    default: 'Registre los detalles de la nueva cotización y añada productos',
  },
})
</script>

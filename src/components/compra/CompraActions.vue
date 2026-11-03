<template>
  <div class="row items-center justify-between q-mb-sm">
    <div class="col-4 q-mt-lg flex flex-col gap-4">
      <!-- Botón de nueva compra -->
      <q-btn
        color="primary"
        class="btn-res"
        @click="$emit('add')"
        no-caps
        id="btnNuevaCompra"
        :title="$t('ui.registrar-compra-8c3ac1')"
      >
        <q-icon name="add" class="icono" />
        <span class="texto"> <q-icon name="add" />{{ $t('common.new') }}</span>
      </q-btn>
    </div>

    <div class="col-auto q-mt-lg flex justify-end q-gutter-x-sm">
      <q-btn
        color="primary"
        icon="refresh"
        @click="$emit('recargar')"
        class="btn-res"
        outline
        id="btnRecargar"
      >
        <q-icon name="refresh" class="icono" />
        <span class="texto">{{ $t('ui.recargar-9d2c9d') }}</span>
      </q-btn>
      <q-btn
        color="info"
        @click="$emit('imprimirReporte')"
        class="btn-res"
        outline
        id="btnImprimir"
      >
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">{{ $t('ui.vista-previa-pdf-9db3ed') }}</span>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
defineEmits(['add', 'imprimirReporte', 'recargar'])
</script>

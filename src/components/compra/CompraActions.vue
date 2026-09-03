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
        title="Registrar Compra"
      >
        <q-icon name="add" class="icono" />
        <span class="texto"> <q-icon name="add" />Nuevo</span>
      </q-btn>
    </div>

    <div class="col-auto q-mt-lg flex justify-end q-gutter-x-sm">
      <q-btn
        color="primary"
        @click="$emit('recargar')"
        class="btn-res"
        outline
        id="btnRecargar"
      >
        <q-icon name="refresh" class="icono" />
        <span class="texto">Recargar</span>
      </q-btn>
      <q-btn
        color="info"
        @click="$emit('imprimirReporte')"
        class="btn-res"
        outline
        id="btnImprimir"
      >
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">Vista Previa PDF</span>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
defineEmits(['add', 'imprimirReporte', 'recargar'])
</script>

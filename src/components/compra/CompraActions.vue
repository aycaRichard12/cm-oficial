<template>
  <div class="row items-center justify-between q-mb-sm">
    <div class="col-4 q-mt-lg flex flex-col gap-4">
      <!-- Botón de nueva compra -->
      <q-btn
        color="primary"
        class="btn-res"
        id="btnNuevaCompra"
        @click="$emit('add')"
        icon="add"
        label="Nueva Compra"
        no-caps
      />
      
    </div>

    <div class="col-2 q-mt-lg flex justify-end">
      <q-btn color="info" @click="$emit('imprimirReporte')" class="btn-res" outline>
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">Vista Previa PDF</span>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
defineEmits(['add', 'imprimirReporte'])
</script>



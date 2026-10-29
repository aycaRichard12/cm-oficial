<template>
  <div class="q-gutter-xs">
    <template v-if="Number(row.tipoventa) <= 0">
      <q-btn
        id="btnvercomprobanteanulacion"
        icon="picture_as_pdf"
        color="negative"
        dense
        round
        flat
        :title="$t('ui.generar-comprobante-pdf-b2cabe')"
        @click="$emit('pdf', row)"
      />
    </template>

    <template v-else>
      <q-btn
        id="btnvercomprobanteanulacion2"
        icon="picture_as_pdf"
        color="negative"
        dense
        round
        flat
        :title="$t('ui.generar-comprobante-pdf-b2cabe')"
        @click="$emit('pdf', row)"
      />
      <q-btn
        id="btnverfacturaanulacion"
        icon="receipt_long"
        dense
        rounded
        flat
        color="blue"
        :title="$t('ui.ver-factura-3d5c6a')"
        @click="$emit('ver-factura', row.shortlink)"
      />
      <q-btn
        id="btnversiatanulacion"
        icon="policy"
        dense
        rounded
        flat
        color="warning"
        :title="$t('ui.ver-factura-siat-278b05')"
        @click="$emit('ver-siat', row.urlsin)"
      />
    </template>
  </div>
</template>

<script setup>
defineProps({
  row: { type: Object, required: true }
})

defineEmits(['pdf', 'ver-factura', 'ver-siat'])
</script>

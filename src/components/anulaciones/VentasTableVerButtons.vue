<template>
  <div class="q-gutter-xs">
    <template v-if="Number(row.tipoventa) <= 0">
      <q-btn
        icon="picture_as_pdf"
        color="negative"
        dense
        round
        flat
        title="Generar Comprobante PDF"
        @click="$emit('pdf', row)"
      />
    </template>

    <template v-else>
      <q-btn
        icon="picture_as_pdf"
        color="negative"
        dense
        round
        flat
        title="Generar Comprobante PDF"
        @click="$emit('pdf', row)"
      />
      <q-btn
        icon="receipt_long"
        dense
        rounded
        flat
        color="blue"
        title="Ver Factura"
        @click="$emit('ver-factura', row.shortlink)"
      />
      <q-btn
        icon="policy"
        dense
        rounded
        flat
        color="warning"
        title="Ver Factura Siat"
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

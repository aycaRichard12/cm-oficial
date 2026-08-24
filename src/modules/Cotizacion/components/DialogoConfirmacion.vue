<template>
  <q-dialog
    :model-value="mostrar"
    @update:model-value="$emit('update:mostrar', $event)"
    backdrop-filter="blur(4px)"
  >
    <q-card class="dialog-card-custom shadow-10">
      <q-card-section
        class="q-pa-lg text-white flex items-center justify-center column dialog-header-gradient"
      >
        <div class="bg-white q-pa-sm rounded-borders q-mb-sm shadow-2" style="border-radius: 50%">
          <q-icon name="check" size="40px" color="positive" />
        </div>
        <div class="text-h6 text-weight-bolder" style="letter-spacing: 0.5px">
          ¡Cotización Exitosa!
        </div>
      </q-card-section>

      <q-card-section class="q-pa-xl text-center bg-white">
        <div class="text-body1 text-grey-9 q-mb-md text-weight-medium" style="font-size: 16px">
          El comprobante ha sido generado y guardado correctamente en el sistema.
        </div>
        <div class="text-subtitle2 text-grey-7" style="line-height: 1.5">
          ¿Desea enviar una copia en formato PDF al correo electrónico del cliente asociado?
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="center" class="q-pa-md bg-grey-1">
        <q-btn
          flat
          label="No, gracias"
          color="grey-7"
          @click="$emit('cancelar')"
          class="q-px-md text-weight-bold radius-8"
        />
        <q-btn
          unelevated
          label="Enviar PDF por Correo"
          color="positive"
          icon="send"
          class="q-px-md text-weight-bold shadow-3 q-ml-sm radius-8"
          @click="$emit('confirmar')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({ mostrar: Boolean })
defineEmits(['cancelar', 'confirmar', 'update:mostrar'])
</script>

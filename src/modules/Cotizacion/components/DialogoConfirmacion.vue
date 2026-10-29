<template>
  <q-dialog
    :model-value="mostrar"
    @update:model-value="$emit('update:mostrar', $event)"
    backdrop-filter="blur(4px)"
  >
    <q-card class="dialog-card-custom shadow-10">
      <q-card-section
        class="q-pa-lg flex items-center justify-center column dialog-header-gradient"
        style="color: var(--cm-on-primary)"
      >
        <div class="cm-surface q-pa-sm rounded-borders q-mb-sm shadow-2" style="border-radius: 50%">
          <q-icon name="check" size="40px" color="positive" />
        </div>
        <div class="text-h6 text-weight-bolder" style="letter-spacing: 0.5px">
          {{ $t('ui.cotizacion-exitosa-10d1c0') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-xl text-center cm-surface">
        <div class="text-body1 cm-text q-mb-md text-weight-medium" style="font-size: 16px">
          {{ $t('ui.el-comprobante-ha-sido-generado-y-guardado-correctam-50d0b1') }}
        </div>
        <div class="text-subtitle2 cm-text-muted" style="line-height: 1.5">
          {{ $t('ui.desea-enviar-una-copia-en-formato-pdf-al-correo-elec-00d095') }}
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="center" class="q-pa-md cm-surface-2">
        <q-btn
          flat
          :label="$t('ui.no-gracias-ec7892')"
          color="grey-7"
          @click="$emit('cancelar')"
          class="q-px-md text-weight-bold radius-8"
        />
        <q-btn
          unelevated
          :label="$t('ui.enviar-pdf-por-correo-1a3769')"
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

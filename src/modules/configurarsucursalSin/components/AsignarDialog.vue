<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('ui.asignar-sucursal-sin-aaa8d7') }}</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- Info sucursal pequeña -->
        <div class="q-mb-md">
          <div class="text-subtitle1 text-primary q-mb-sm">{{ $t('ui.sucursal-empresa-9d0fca') }}</div>
          <q-list dense bordered separator class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('configGeneral.tipoAlmacen.form.name') }}</q-item-label>
                <q-item-label>{{ smallSucursal.nombre }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('ui.pais-0c664f') }}</q-item-label>
                <q-item-label>{{ smallSucursal.pais }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label caption>{{ $t('ui.municipio-9e8609') }}</q-item-label>
                <q-item-label>{{ smallSucursal.municipio }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('ui.codigo-actual-6a3e6d') }}</q-item-label>
                <q-item-label>{{ smallSucursal.codigosucursal || $t('ui.sin-codigo-257bfb') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Selector de sucursal grande -->
        <q-select
          v-model="selectedBig"
          :options="bigOptions"
          :label="$t('ui.seleccione-sucursal-sin-2e8297')"
          outlined
          dense
          option-label="label"
          option-value="codigoSucursal"
          map-options
          emit-value
          :rules="[(val) => !!val || $t('ui.debe-seleccionar-una-sucursal-grande-e9ef03')]"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ $t('ui.no-hay-sucursales-grandes-disponibles-e2f5fc') }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="$t('common.cancel')" color="grey" v-close-popup />
        <q-btn
          color="primary"
          :label="$t('ui.guardar-asignacion-fdaca0')"
          @click="guardarAsignacion"
          :loading="loading"
          :disable="!selectedBig || loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
import { asignarCodigo } from '../services/sucursalService'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  smallSucursal: Object,
  bigSucursales: Array,
  token: String,
})

const emit = defineEmits(['update:modelValue', 'asignado'])
const $q = useQuasar()

const selectedBig = ref(null)
const loading = ref(false)

const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const bigOptions = computed(() =>
  props.bigSucursales.map((big) => ({
    ...big,
    label: `${big.codigoSucursal} - ${big.municipio} - ${big.pais}`,
  })),
)

const guardarAsignacion = async () => {
  if (!selectedBig.value) return
  loading.value = true
  try {
    const response = await asignarCodigo(props.smallSucursal.idsucursalcontable, selectedBig.value)
    $q.notify({
      type: 'positive',
      message: response.mensaje || i18nT('ui.codigo-asignado-correctamente-5b73fc'),
      position: 'top',
    })
    emit('asignado')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || i18nT('ui.error-en-la-asignacion-4a525d'),
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

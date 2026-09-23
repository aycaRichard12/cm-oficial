<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card style="min-width: 500px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Asignar Sucursal Sin</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- Info sucursal pequeña -->
        <div class="q-mb-md">
          <div class="text-subtitle1 text-primary q-mb-sm">Sucursal Empresa</div>
          <q-list dense bordered separator class="rounded-borders">
            <q-item>
              <q-item-section>
                <q-item-label caption>Nombre</q-item-label>
                <q-item-label>{{ smallSucursal.nombre }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>País</q-item-label>
                <q-item-label>{{ smallSucursal.pais }}</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Municipio</q-item-label>
                <q-item-label>{{ smallSucursal.municipio }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Código Actual</q-item-label>
                <q-item-label>{{ smallSucursal.codigosucursal || 'Sin código' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Selector de sucursal grande -->
        <q-select
          v-model="selectedBig"
          :options="bigOptions"
          label="Seleccione Sucursal Sin"
          outlined
          dense
          option-label="label"
          option-value="codigoSucursal"
          map-options
          emit-value
          :rules="[(val) => !!val || 'Debe seleccionar una sucursal grande']"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No hay sucursales grandes disponibles
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn
          color="primary"
          label="Guardar Asignación"
          @click="guardarAsignacion"
          :loading="loading"
          :disable="!selectedBig || loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
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
      message: response.mensaje || 'Código asignado correctamente',
      position: 'top',
    })
    emit('asignado')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error en la asignación',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-card>
    <q-form @submit.prevent="onSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <!-- Fecha -->
        <div class="col-12 col-md-3">
          <label for="fecha">{{ $t('ui.fecha-659648') }}</label>
          <q-input
            v-model="localData.fecha"
            type="date"
            id="fecha"
            dense
            outlined
            :rules="[(val) => !!val || $t('ui.la-fecha-es-requerida-4a4376')]"
            lazy-rules
          />
        </div>

        <!-- Tipo de Pedido -->
        <div class="col-12 col-md-3">
          <label for="tipopedido">{{ $t('ui.tipo-de-pedido-119ba5') }}</label>
          <q-select
            v-model="localData.tipo"
            :options="tiposPedido"
            id="tipopedido"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :rules="[(val) => !!val || $t('ui.seleccione-un-tipo-de-pedido-2e5a9c')]"
            lazy-rules
            dense
            outlined
            @update:model-value="handleTipoChange"
          />
        </div>

        <!-- Almacén Destino (visible siempre) -->
        <div class="col-12 col-md-3">
          <label for="destino">{{ $t('ui.almacen-destino-53277e') }}</label>
          <q-select
            v-model="localData.almacendestino"
            :options="almacenes"
            id="destino"
            dense
            outlined
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :rules="[(val) => !!val || $t('ui.seleccione-el-almacen-destino-44a654')]"
            lazy-rules
            @update:model-value="updateFiltrado"
          />
        </div>

        <!-- Almacén Origen (solo para movimientos) -->
        <div class="col-12 col-md-3" v-if="localData.tipo === TIPOS_PEDIDO.MOVIMIENTO">
          <label for="almacenorigen">{{ $t('ui.almacen-origen-0ecf81') }}</label>
          <q-select
            v-model="localData.almacenorigen"
            :options="filtrado"
            id="almacenorigen"
            dense
            outlined
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :rules="[(val) => !!val || $t('ui.seleccione-el-almacen-origen-cf1c70')]"
            lazy-rules
            :loading="loadingAlmacenes"
          />
        </div>

        <!-- Observación -->
        <div class="col-12 col-md-3">
          <label for="observacion">{{ $t('ui.observacion-05b5d2') }}</label>
          <q-input
            v-model="localData.observacion"
            id="observacion"
            :rules="[(val) => !!val || $t('ui.la-observacion-es-requerida-aa6833')]"
            lazy-rules
            dense
            outlined
          />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-start">
        <q-btn :label="$t('common.save')" type="submit" color="primary" :loading="submitting" />
        <q-btn
          :label="$t('common.cancel')"
          flat
          color="negative"
          @click="$emit('cancel')"
          :disable="submitting"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const idempresa = idempresa_md5()

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  almacenes: Array,
  proveedores: Array,
})

const emit = defineEmits(['submit', 'cancel'])

// Constants
const TIPOS_PEDIDO = Object.freeze({
  COMPRA: 1,
  MOVIMIENTO: 2,
  PRODUCCION: 3,
})

const tiposPedido = [
  { label: i18nT('ui.pedido-de-compra-271dfb'), value: TIPOS_PEDIDO.COMPRA },
  { label: i18nT('ui.pedido-de-movimiento-d15293'), value: TIPOS_PEDIDO.MOVIMIENTO },
  { label: i18nT('ui.pedidos-de-produccion-b22175'), value: TIPOS_PEDIDO.PRODUCCION },
]

// State
const almacenesOrigen = ref([])
const loadingAlmacenes = ref(false)
const submitting = ref(false)

// Initialize form data
const localData = ref({
  fecha: new Date().toISOString().slice(0, 10),
  tipo: null,
  almacenorigen: null,
  almacendestino: null,
  observacion: null,
  ...(props.modalValue || {}),
})

// Computed
const filtrado = computed(() => {
  return almacenesOrigen.value.filter((item) => item.value !== localData.value.almacendestino)
})

// Methods
const onSubmit = () => {
  submitting.value = true
  emit('submit', localData.value)
  submitting.value = false
}

async function getAlmacenesOrigen() {
  loadingAlmacenes.value = true
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    almacenesOrigen.value = response.data.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-cargar-los-almacenes-5919ff'),
      caption: error.message,
    })
  } finally {
    loadingAlmacenes.value = false
  }
}

function handleTipoChange(newVal) {
  if (newVal === TIPOS_PEDIDO.MOVIMIENTO) {
    getAlmacenesOrigen()
  } else if (newVal === TIPOS_PEDIDO.COMPRA) {
    localData.value.almacenorigen = null
  }
}

function updateFiltrado() {
  if (localData.value.tipo === TIPOS_PEDIDO.MOVIMIENTO) {
    localData.value.almacenorigen = null
  }
}

// Watchers
watch(
  () => props.modalValue,
  (newVal) => {
    if (newVal) {
      localData.value = { ...newVal }
      if (newVal.tipo === TIPOS_PEDIDO.MOVIMIENTO) {
        getAlmacenesOrigen()
      }
    }
  },
  { deep: true },
)

// Lifecycle hooks
onMounted(() => {
  if (props.editing && localData.value.tipo === TIPOS_PEDIDO.MOVIMIENTO) {
    getAlmacenesOrigen()
  }
})
</script>

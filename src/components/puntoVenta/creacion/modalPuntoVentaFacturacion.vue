<template>
  <q-dialog v-model="show">
    <q-card class="q-pa-md" style="min-width: 400px; max-width: 500px">
      <q-card-section class="text-h6 text-primary"> {{ $t('ui.crear-punto-de-venta-d4c938') }} </q-card-section>

      <q-card-section>
        <div class="text-body2 q-mb-md">
          {{ $t('ui.esto-creara-un-registro-en-el-736277') }} <strong>SIAT</strong> {{ $t('ui.para-el-punto-de-venta-seleccionado-cbb0a8') }}
        </div>

        <q-select
          v-model="tipoSeleccionado"
          :options="tiposPuntoVenta"
          :label="$t('ui.selecciona-un-tipo-de-punto-de-venta-aeb9ab')"
          emit-value
          map-options
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" color="negative" v-close-popup />
        <q-btn :label="$t('ui.aceptar-8f9f73')" color="primary" :loading="loading" @click="crearPuntoVenta" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { getToken } from 'src/composables/FuncionesG'
import { getTipoFactura } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
const tipoF = getTipoFactura()
console.log(tipoF)
const token = getToken()
console.log(token)

// Props recibidos desde el padre
const props = defineProps({
  showModal: Boolean,
  dato: Array, // [nombre, descripcion, id]
  codigosucursal: [String, Number],
  URL_APICM: String,
})
const emit = defineEmits(['update:showModal', 'onSuccess'])

// Estado local
const $q = useQuasar()
const show = ref(props.showModal)
const tipoSeleccionado = ref(null)
const loading = ref(false)

watch(
  () => props.showModal,
  (val) => (show.value = val),
)
watch(show, (val) => emit('update:showModal', val))

// Opciones del tipo de punto de venta
const tiposPuntoVenta = [
  { label: i18nT('ui.punto-venta-comisionista-cdb829'), value: 1 },
  { label: i18nT('ui.punto-venta-ventanilla-de-cobranza-354f7d'), value: 2 },
  { label: i18nT('ui.punto-de-venta-moviles-cab428'), value: 3 },
  { label: i18nT('ui.punto-de-venta-ypfb-ea8757'), value: 4 },
  { label: i18nT('ui.punto-de-venta-cajeros-39c96a'), value: 5 },
  { label: i18nT('ui.punto-de-venta-conjunta-1f92ee'), value: 6 },
]

// Función para validar usuario (puedes reemplazar por tu propia lógica)

// Crear punto de venta
async function crearPuntoVenta() {
  if (!tipoSeleccionado.value) {
    $q.notify({ type: 'warning', message: i18nT('ui.selecciona-un-tipo-de-punto-de-venta-aeb9ab') })
    return
  }

  try {
    loading.value = true
    console.log(props.dato)
    const puntoventa = {
      nombre: props.dato.nombre,
      descripcion: props.dato.descripcion,
      tipo: tipoSeleccionado.value,
    }

    const formData = new FormData()
    formData.append('ver', 'crearPuntoVentaFacturacion')
    formData.append('puntoventaJSON', JSON.stringify(puntoventa))
    formData.append('codigosucursal', props.codigosucursal)
    formData.append('token', token)
    formData.append('tipof', tipoF)
    formData.append('id', props.dato.id)
    formData.append('tipo', tipoSeleccionado.value)

    const res = await api.post(``, formData)
    console.log(res)
    const response = res.data

    const data = response
    if (data.estado === 'error') {
      $q.notify({ type: 'negative', message: data.mensaje || i18nT('ui.error-en-el-servidor-ebb125') })
    } else {
      $q.notify({
        type: 'positive',
        message: data.mensaje || i18nT('ui.punto-de-venta-creado-correctamente-8b2d65'),
      })
      emit('onSuccess') // notificar al padre para refrescar lista
      show.value = false
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: err.message })
  } finally {
    loading.value = false
  }
}
</script>

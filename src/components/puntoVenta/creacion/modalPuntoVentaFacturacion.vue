<template>
  <q-dialog v-model="show">
    <q-card class="q-pa-md" style="min-width: 400px; max-width: 500px">
      <q-card-section class="text-h6 text-primary"> Crear Punto de Venta </q-card-section>

      <q-card-section>
        <div class="text-body2 q-mb-md">
          Esto creará un registro en el <strong>SIAT</strong> para el punto de venta seleccionado.
        </div>

        <q-select
          v-model="tipoSeleccionado"
          :options="tiposPuntoVenta"
          label="Selecciona un tipo de punto de venta"
          emit-value
          map-options
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" v-close-popup />
        <q-btn label="Aceptar" color="primary" :loading="loading" @click="crearPuntoVenta" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
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
  { label: 'PUNTO VENTA COMISIONISTA', value: 1 },
  { label: 'PUNTO VENTA VENTANILLA DE COBRANZA', value: 2 },
  { label: 'PUNTO DE VENTA MÓVILES', value: 3 },
  { label: 'PUNTO DE VENTA YPFB', value: 4 },
  { label: 'PUNTO DE VENTA CAJEROS', value: 5 },
  { label: 'PUNTO DE VENTA CONJUNTA', value: 6 },
]

// Función para validar usuario (puedes reemplazar por tu propia lógica)

// Crear punto de venta
async function crearPuntoVenta() {
  if (!tipoSeleccionado.value) {
    $q.notify({ type: 'warning', message: 'Selecciona un tipo de punto de venta' })
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
      $q.notify({ type: 'negative', message: data.mensaje || 'Error en el servidor' })
    } else {
      $q.notify({
        type: 'positive',
        message: data.mensaje || 'Punto de venta creado correctamente',
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

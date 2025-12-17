<template>
  <q-card class="q-pa-m">
    <q-card-section>
      <h5 class="text-left q-mt-none q-mb-md">Nuevo Registro</h5>
      <q-form @submit.prevent="onSubmit" class="">
        <div class="row q-col-gutter-md">
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.nombre"
              label="Razón Social *"
              :rules="[(val) => !!val || 'Campo Obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.nombrecomercial"
              label="Nombre Comercial *"
              :rules="[(val) => !!val || 'Campo Obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              outlined
              v-model="localData.tipocliente"
              :options="tipoClienteOptions"
              label="Tipo de Cliente *"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un tipo']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              outlined
              v-model="localData.canalventa"
              :options="canalVentaOptions"
              label="Canal de venta *"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un canal']"
            />
          </div>
          <div class="col-md-3">
            <q-select
              outlined
              v-model="localData.tipodocumento"
              :options="tipoDocumetosOptions"
              label="Tipo de Documentos *"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || 'Seleccione un tipo']"
            />
          </div>
          <div class="col-md-3">
            <q-input
              outlined
              v-model="localData.nrodocumento"
              label="Nro De Documento"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            />
          </div>
          <div class="col-md-3">
            <q-input outlined v-model="localData.telefono" label="Teléfono" />
          </div>
        </div>
        <q-card-actions align="right">
          <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
          <q-btn label="Guardar" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'

const idempresa = idempresa_md5()
const emit = defineEmits(['update:modelValue', 'recordCreated'])

const $q = useQuasar()

const localData = ref({
  ver: 'registroClienteMinimal',
  idempresa: idempresa,
  nombre: '',
  nombrecomercial: '',
  tipocliente: null, // Will be set after options load
  canalventa: null, // Will be set after options load
  tipodocumento: null, // Defaulting to '5' (NIT) as per your options
  nrodocumento: '0', // Defaulting to '0' instead of '11 1111 11' for a numeric field
  telefono: '0', // Defaulting to '0' instead of '000 000 00'
})

// Define options for your select fields
const tipoClienteOptions = ref([])
const canalVentaOptions = ref([])

const tipoDocumetosOptions = ref([
  { label: 'CI', value: '1' },
  { label: 'CEX', value: '2' },
  { label: 'PAS', value: '3' },
  { label: 'OD', value: '4' },
  { label: 'NIT', value: '5' },
])

const cargarCanalesVenta = async () => {
  try {
    const response = await api.get(`listaCanalVenta/${idempresa}`)
    canalVentaOptions.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id, // Assuming 'id' is the value you want to emit
    }))
    // Set default *after* options are loaded
    if (canalVentaOptions.value.length > 0) {
      localData.value.canalventa = canalVentaOptions.value[0].value // Sets the first option as default
    }
  } catch (error) {
    console.error('Error al cargar canales de venta:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los canales de venta.',
    })
  }
}

const cargarTipoCliente = async () => {
  try {
    const response = await api.get(`listaTipoCliente/${idempresa}`)
    tipoClienteOptions.value = response.data.map((item) => ({
      label: item.tipo,
      value: item.id, // Assuming 'id' is the value you want to emit
    }))
    // Set default *after* options are loaded
    if (tipoClienteOptions.value.length > 0) {
      localData.value.tipocliente = tipoClienteOptions.value[0].value // Sets the first option as default
    }
  } catch (error) {
    console.error('Error al cargar tipos de cliente:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los tipos de cliente.',
    })
  }
}

const onSubmit = async () => {
  // You would typically perform form validation here if not relying solely on Quasar's :rules
  // For now, we'll just emit and close
  emit('update:modelValue', false)
  emit('recordCreated', localData.value) // localData.value is the object
}

onMounted(() => {
  cargarTipoCliente()
  cargarCanalesVenta()
})
</script>

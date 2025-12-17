<template>
  <div class="q-pa-md">
    <q-card-section>
      <div class="text-h6">Configuración de Kardex</div>
      <div class="text-subtitle2 text-grey-8">
        Define el método de valoración de inventario que usará.
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!-- Si aún no tiene configurado -->
      <div>
        <q-select
          v-model="tipoSeleccionado"
          :options="opciones"
          label="Seleccione el tipo de Kardex"
          emit-value
          map-options
          dense
          outlined
          class="q-mb-md"
        />

        <q-btn
          color="primary"
          label="Guardar Configuración"
          :disable="!tipoSeleccionado"
          @click="guardarConfiguracion"
        />
      </div>
    </q-card-section>
    <q-banner dense rounded class="bg-yellow-1 text-yellow-10 q-pa-sm">
      <q-icon name="settings" size="sm" class="q-mr-sm" />
      Método de Kardex configurado:
      <strong>{{ metodo || 'Pendiente de configurar' }}</strong>
    </q-banner>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()

// empresa actual

// const tipoActual = computed(() => kardex.getTipo(companyId.value))
const metodo = ref(null)

// opciones de kardex
const opciones = [
  { label: 'PEPS (Primero en entrar, primero en salir)', value: 'PEPS' },
  { label: 'UEPS (Último en entrar, primero en salir)', value: 'UEPS' },
  { label: 'Promedio Ponderado', value: 'PROMEDIO' },
]

const tipoSeleccionado = ref(null)
async function getTipoKardex() {
  const response = await api.get(`getTipoKardex/${idempresa}`)
  const data = response.data
  metodo.value = data.metodo
  console.log(metodo.value)
}

// guardar configuración solo si aún no existe
async function guardarConfiguracion() {
  const data = {
    ver: 'cambiarTipoKardex',
    tipo: tipoSeleccionado.value,
    idempresa: idempresa,
  }

  const response = await api.post('', data)
  console.log(response)
  getTipoKardex()
  $q.notify({
    type: 'positive',
    message: 'Configuración de Kardex guardada correctamente',
  })
}

onMounted(() => {
  getTipoKardex()
})
</script>

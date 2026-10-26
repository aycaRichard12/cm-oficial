<template>
  <q-card-section>
    <q-form @submit.prevent="onSubmit">
      <div class="row q-col-gutter-md">
        <!-- Nombre de la divisa -->
        <div class="col-12 col-md-4">
          <label for="nombre">{{ t('configGeneral.divisas.form.name') }}</label>
          <q-input
            v-model="localData.nombre"
            outlined
            dense
            id="nombre"
            :rules="[(val) => !!val || t('configGeneral.divisas.form.nameRequired')]"
          />
        </div>

        <!-- Símbolo de la divisa -->
        <div class="col-12 col-md-4">
          <label for="simbolo">{{ t('configGeneral.divisas.form.symbol') }}</label>

          <q-input
            v-model="localData.tipo"
            id="simbolo"
            outlined
            dense
            :rules="[(val) => !!val || t('configGeneral.divisas.form.symbolRequired')]"
          />
        </div>

        <!-- Moneda SIN (Dropdown) -->
        <div class="col-12 col-md-4" v-if="tipoFactura">
          <label for="monedasin">{{ t('configGeneral.divisas.form.sin') }}</label>
          <q-select
            use-input
            fill-input
            v-model="localData.monedasin"
            :options="opcionesMoneda"
            @filter="filtrarMonedas"
            id="monedasin"
            emit-value
            map-options
            option-label="label"
            option-value="value"
            clearable
            outlined=""
            dense=""
            :q-rules="[(val) => !!val || t('configGeneral.divisas.form.sinRequired')]"
          />
        </div>
      </div>

      <q-card-actions class="flex justify-start">
        <q-btn :label="t('common.save')" type="submit" color="primary" />
        <q-btn :label="t('common.cancel')" flat color="negative" @click="$emit('cancel')" />
      </q-card-actions>
    </q-form>
  </q-card-section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { validarUsuario } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { getTipoFactura } from 'src/composables/FuncionesG'
const tipoFactura = getTipoFactura(true)
const props = defineProps({
  editing: Boolean,
  modalValue: Object,
})
const $q = useQuasar()
const { t } = useI18n()

const localData = ref({ ...props.modalValue })

const opcionesMoneda = ref([])
const emit = defineEmits(['submit', 'cancel'])

const inicio = () => {
  if (tipoFactura) {
    getDivisasSIN()
  }
}
const getDivisasSIN = async () => {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo

    if (!token || !tipo) {
      throw new Error('Token o tipo de usuario no válidos.')
    }

    const response = await api.get(`listaLeyendaSIN/monedas/${token}/${tipo}`)
    console.log('Respuesta API:', response)

    if (
      !response.data ||
      response.data.status !== 'success' ||
      !Array.isArray(response.data.data)
    ) {
      throw new Error('La respuesta del servidor no tiene el formato esperado.')
    }

    opcionesMoneda.value = response.data.data.map((item) => ({
      label: item.descripcion,
      value: item.codigo,
    }))
  } catch (error) {
    console.error('Error al cargar monedas SIN:', error)

    let mensaje = t('configGeneral.divisas.form.sinLoadError')

    // Errores personalizados
    if (error.response) {
      // Error del servidor (status 4xx, 5xx)
      mensaje += ` Servidor respondió con status ${error.response.status}.`
      if (error.response.data?.message) {
        mensaje += ` ${error.response.data.message}`
      }
    } else if (error.message) {
      // Error lanzado manualmente
      mensaje += ` ${error.message}`
    }

    $q.notify({ type: 'negative', message: mensaje })
  }
}

watch(
  () => props.modalValue,
  (nuevoValor) => {
    localData.value = { ...nuevoValor }
  },
)
async function onSubmit() {
  emit('submit', localData.value)
}
onMounted(() => {
  inicio()
})
</script>

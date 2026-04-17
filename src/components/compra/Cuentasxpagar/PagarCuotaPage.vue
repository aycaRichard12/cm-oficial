<template>
  <q-form @submit.prevent="onSubmit" @reset="onReset" class="row q-col-gutter-x-md">
    <div class="col-12 col-md-6">
      <label for="monto">Monto a Pagar *</label>
      <q-input
        v-model.number="form.monto_pagado"
        id="monto"
        type="number"
        step="0.01"
        lazy-rules
        dense=""
        outlined=""
        :rules="[
          (val) => (val !== null && val !== '') || 'Este campo es requerido',
          (val) => val > 0 || 'El monto debe ser mayor a cero',
        ]"
      />
    </div>

    <div class="col-12 col-md-6">
      <label for="referencia">Referencia (Opcional)</label>
      <q-input
        dense
        outlined=""
        v-model="form.referencia"
        id="referencia"
        hint="Ej: Nro. de transacción, código de recibo"
      />
    </div>
    <div class="col-12">
      <label for="obs">Observaciones (Opcional)</label>
      <q-input v-model="form.observaciones" id="obs" type="textarea" autogrow dense outlined="" />
    </div>
    <div class="col-12 col-md-6">
      <label for="imagen">Comprobante (Opcional, máx 5MB)</label>
      <q-file
        v-model="form.comprobanteFile"
        dense
        outlined=""
        id="imagen"
        accept=".jpg, .jpeg, .png, .pdf"
        max-file-size="5242880"
        @rejected="onFileRejected"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
        <template v-slot:append>
          <q-icon
            v-if="form.comprobanteFile"
            name="cancel"
            @click.stop.prevent="form.comprobanteFile = null"
            class="cursor-pointer"
          />
        </template>
      </q-file>
    </div>

    <div class="col-12 col-md-6 animate__animated animate__zoomIn">
      <label
        for="cajaBanco"
        class="text-weight-bold text-grey-9 q-mb-sm block"
        style="font-size: 13px; text-transform: uppercase"
        >Seleccione Caja o Banco <span class="text-negative">*</span></label
      >
      <q-select
        v-model="form.cajabanco"
        :options="listaCajaBancos"
        id="cajaBanco"
        dense
        outlined
        bg-color="white"
        emit-value
        map-options
        class="premium-input"
        hide-bottom-space
        :rules="[(val) => !!val || 'Campo requerido']"
      >
        <template v-slot:prepend>
          <q-icon name="account_balance" color="positive" />
        </template>
      </q-select>
    </div>
    <q-slide-transition>
      <div v-if="resultado.comprobante_path">
        <q-banner inline-actions class="text-white bg-green-8 q-mt-md">
          <template v-slot:avatar>
            <q-icon name="cloud_done" color="white" />
          </template>
          <p class="text-bold q-mb-xs">¡Comprobante subido con éxito!</p>
          <p class="text-caption" style="word-break: break-all">
            Ruta: {{ resultado.comprobante_path }}
          </p>
        </q-banner>
      </div>
    </q-slide-transition>
    <div class="q-mt-lg">
      <q-btn label="Registrar Pago" type="submit" color="primary" :loading="loading" />
      <q-btn label="Limpiar" type="reset" color="primary" flat class="q-ml-sm" />
    </div>
  </q-form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { idusuario_md5, idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api, apiCt } from 'src/boot/axios'
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const listaCajaBancos = ref([])
// Se asume una instancia de axios pre-configurada, pero puedes usar axios directamente.

const props = defineProps({
  cuota: Object,
})
const emit = defineEmits(['registrado', 'cancel'])
console.log(props.cuota)
const $q = useQuasar()

const initialState = {
  id_cuota: props.cuota.id_cuota,
  monto_pagado: props.cuota.monto_cuota,
  referencia: '',
  usuario_id: idusuario,
  observaciones: '',
  comprobanteFile: null,
}
console.log(props.cuota)
const form = reactive({ ...initialState })
const resultado = reactive({ comprobante_path: null })
const loading = ref(false)

const onReset = () => {
  Object.assign(form, initialState)
  resultado.comprobante_path = null
}

const onFileRejected = (rejectedEntries) => {
  const reason = rejectedEntries[0].failedPropValidation
  let message = 'El archivo seleccionado no es válido.'
  if (reason === 'max-file-size') {
    message = 'El archivo es demasiado grande. El máximo es 5MB.'
  } else if (reason === 'accept') {
    message = 'Tipo de archivo no permitido. Sube solo imágenes (JPG, PNG) o PDF.'
  }

  $q.notify({
    type: 'negative',
    message: message,
    icon: 'warning',
  })
}

const onSubmit = async () => {
  loading.value = true
  resultado.comprobante_path = null

  // 1. Construir FormData
  const formData = new FormData()
  console.log(form)
  formData.append('ver', 'RegistrarPagos')
  formData.append('monto_pagado', form.monto_pagado)
  formData.append('usuario_id', form.usuario_id)
  formData.append('id_cuota', form.id_cuota)
  formData.append('cajabanco', form.cajabanco)
  formData.append('idempresa', idempresa)

  if (form.referencia) {
    formData.append('referencia', form.referencia)
  }
  if (form.observaciones) {
    formData.append('observaciones', form.observaciones)
  }
  if (form.comprobanteFile) {
    formData.append('comprobante', form.comprobanteFile)
  }

  try {
    // 2. Enviar petición POST

    const response = await api.post('', formData)
    console.log(response.data)
    emit('registrado', response.data)
    // 3. Manejar respuesta de éxito
    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: response.data.mensaje || 'Pago registrado con éxito.',
    })

    // Opcional: limpiar formulario después del éxito
    // onReset();
  } catch (error) {
    // 4. Manejar respuesta de error
    let errorMessage = 'Ocurrió un error inesperado al contactar al servidor.'
    if (error.response && error.response.data && error.response.data.mensaje) {
      errorMessage = error.response.data.mensaje
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      color: 'negative',
      icon: 'error',
      message: errorMessage,
    })
  } finally {
    // 5. Finalizar estado de carga
    loading.value = false
  }
}
async function listarcajasbanco() {
  try {
    const response = await apiCt.get(`listar_caja_bancos/${idempresa}`)

    listaCajaBancos.value = response.data.map((item) => ({
      label: item.codigo_cuenta + ' ' + item.codigo + ' ' + item.glosa,
      value: item.idcaja_bancos,
    }))
    console.log(listaCajaBancos.value)
  } catch (error) {
    console.error('Error al cargar caja bancos:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar caja Bancos' })
  }
}
onMounted(() => {
  listarcajasbanco()
})
</script>

<style scoped>
.q-card {
  max-width: 600px;
}
</style>

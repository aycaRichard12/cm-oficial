<template>
  <q-dialog v-model="show" persistent maximized full-width full-height>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('ui.registrar-firma-5468c9') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm text-caption text-grey-7">
          {{ $t('ui.firma-para-680d6f') }} {{ idEntidad.nombre }} {{ idEntidad.nombrecomercial }}
        </div>
        <canvas
          ref="canvasRef"
          style="
            border: 2px dashed #ccc;
            width: 100%;
            height: 70vh;
            border-radius: 8px;
            cursor: crosshair;
          "
        ></canvas>
      </q-card-section>

      <q-card-actions align="between" class="q-pa-md">
        <q-btn flat :label="$t('ui.limpiar-f3b225')" color="negative" icon="delete" @click="limpiar" />
        <div>
          <q-btn flat :label="$t('common.cancel')" v-close-popup class="q-mr-sm" />
          <q-btn
            :label="$t('ui.guardar-firma-d88565')"
            color="primary"
            icon="draw"
            :loading="cargando"
            @click="guardarFirma"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch, nextTick } from 'vue'
import SignaturePad from 'signature_pad'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

// PROPS: Datos que recibe del padre
const props = defineProps({
  modelValue: Boolean, // Controla si el modal está abierto
  idEntidad: { type: Object }, // id_cliente o id_operacion
  tipoOperacion: { type: String, default: 'CLIENTE' },
})

console.log(props.idEntidad)
// EMITS: Eventos que devuelve al padre
const emit = defineEmits(['update:modelValue', 'onSuccess', 'onError'])

const show = ref(false)
const canvasRef = ref(null)
const cargando = ref(false)
let signaturePad = null

// Sincronizar prop modelValue con el ref local show
watch(
  () => props.modelValue,
  async (val) => {
    show.value = val
    console.log(val)
    if (val) {
      await nextTick()
      inicializarCanvas()
    }
  },
)

watch(show, (val) => emit('update:modelValue', val))

const inicializarCanvas = () => {
  const canvasEl = canvasRef.value
  // Ajustar resolución interna para que no se vea pixelado
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  canvasEl.width = canvasEl.offsetWidth * ratio
  canvasEl.height = canvasEl.offsetHeight * ratio
  canvasEl.getContext('2d').scale(ratio, ratio)

  signaturePad = new SignaturePad(canvasEl, {
    maxWidth: 3,
    penColor: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
  })
}

const limpiar = () => signaturePad?.clear()
function reducirImagen(base64) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64

    img.onload = () => {
      const canvas = document.createElement('canvas')

      const maxWidth = 400
      const scale = maxWidth / img.width

      canvas.width = maxWidth
      canvas.height = img.height * scale

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      resolve(canvas.toDataURL('image/png', 0.7))
    }
  })
}
const guardarFirma = async () => {
  if (signaturePad.isEmpty()) {
    $q.notify({ color: 'warning', message: i18nT('ui.debe-firmar-antes-de-guardar-1d558a') })
    return
  }

  cargando.value = true
  const dataUrl = signaturePad.toDataURL('image/png')
  const firmaReducida = await reducirImagen(dataUrl)
  const formData = new FormData()
  // Convertimos el base64 a un Blob para enviarlo como archivo real
  const blob = await (await fetch(firmaReducida)).blob()

  formData.append('imagen', blob, `firma_${props.idEntidad}.png`)
  formData.append('idcliente', props.idEntidad)
  formData.append('ver', 'subirFirmaUsuario')

  try {
    const response = await api.post('', formData)
    console.log(response.data)
    // Devolvemos la respuesta al padre
    emit('onSuccess', response.data)
    $q.notify({ color: 'positive', message: i18nT('ui.firma-registrada-con-exito-6ff93f') })
    show.value = false
  } catch (error) {
    emit('onError', error)
    $q.notify({ color: 'negative', message: i18nT('ui.error-al-registrar-firma-86a676') })
  } finally {
    cargando.value = false
  }
}
</script>

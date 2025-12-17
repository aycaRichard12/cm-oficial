<template>
  <q-card>
    <q-card-section>
      <div class="text-h5 text-primary q-mb-xs"></div>
      <div class="text-subtitle1 text-grey-8">
        Este token se utilizará para autenticar servicios de API. Trátelo como una contraseña.
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form @submit.prevent="generarToken">
        <!-- <q-input
            v-model="idmd5"
            label="IDMD5 del Usuario"
            outlined
            dense
            lazy-rules
            :rules="[(val) => !!val || 'Este campo es requerido']"
            class="q-mb-md"
            data-cy="idmd5-input"
          /> -->

        <q-btn
          type="submit"
          label="Generar Token"
          color="primary"
          class="full-width"
          :loading="cargando"
          icon="vpn_key"
          data-cy="generate-button"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            Generando...
          </template>
        </q-btn>
      </q-form>
    </q-card-section>

    <template v-if="tokenGenerado">
      <q-separator spaced />
      <q-card-section>
        <div class="text-h6 text-positive q-mb-sm">¡Token generado con éxito!</div>
        <q-input
          v-model="tokenGenerado"
          label="Token JWT Generado"
          outlined
          readonly
          dense
          :type="mostrarToken ? 'text' : 'password'"
          data-cy="token-input"
        >
          <template v-slot:append>
            <q-icon
              :name="mostrarToken ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="mostrarToken = !mostrarToken"
            />
            <q-btn
              flat
              round
              dense
              icon="content_copy"
              @click="copiarToken"
              class="q-ml-sm"
              aria-label="Copiar token"
              data-cy="copy-button"
            >
              <q-tooltip>Copiar al portapapeles</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <div class="text-caption text-red q-mt-md text-center">
          <q-icon name="warning" class="q-mr-xs" />
          <strong>Advertencia:</strong> Mantenga este token en un lugar seguro. No lo comparta
          públicamente.
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'

import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { expires_in } from 'src/composables/FuncionesGenerales'
const idmd5 = idempresa_md5()
const fecha_expriation = expires_in()
// Referencia a Quasar para usar plugins como Notify y Clipboard
const $q = useQuasar()

// --- ESTADO REACTIVO ---

const tokenGenerado = ref('')
const cargando = ref(false)
const mostrarToken = ref(false)

// --- MÉTODOS ---

/**
 * Llama a la API para generar un nuevo token JWT.
 */
const generarToken = async () => {
  tokenGenerado.value = '' // Resetea el token anterior
  console.log('IDMD5 del usuario:', idmd5)

  const datos = {
    ver: 'generarTokenJWT',
    idmd5: idmd5,
    fecha_final: fecha_expriation,
  }

  const response = await api.post('out/', datos)
  console.log('Respuesta de la API:', response.data)
  // Validar la respuesta de la API
  if (response.data && response.data.estado === 'success' && response.data.token) {
    tokenGenerado.value = response.data.token
    $q.notify({
      type: 'positive',
      message: 'Token generado exitosamente.',
      icon: 'check_circle',
    })
  } else {
    // Si la respuesta no tiene el formato esperado
    const mensajeError = response.data?.mensaje || 'La respuesta de la API no es válida.'
    throw new Error(mensajeError)
  }
}

/**
 * Copia el token generado al portapapeles del usuario.
 */
const copiarToken = () => {
  copyToClipboard(tokenGenerado.value)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: '¡Token copiado al portapapeles!',
        icon: 'content_paste',
        position: 'top',
      })
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: 'Error al intentar copiar el token.',
        icon: 'error',
      })
    })
}
</script>

<style scoped>
.q-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

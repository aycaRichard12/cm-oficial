<template>
  <q-card>
    <q-card-section>
      <div class="text-h5 text-primary q-mb-xs"></div>
      <div class="text-subtitle1 cm-text-muted">
        {{ t('configuracion.tokensApis.subtitle') }}
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form @submit.prevent="generarToken">
        <q-btn
          type="submit"
          :label="t('configuracion.tokensApis.btn')"
          color="primary"
          class="full-width"
          :loading="cargando"
          icon="vpn_key"
          data-cy="generate-button"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            {{ t('configuracion.tokensApis.loading') }}
          </template>
        </q-btn>
      </q-form>
    </q-card-section>

    <template v-if="tokenGenerado">
      <q-separator spaced />
      <q-card-section>
        <div class="text-h6 text-positive q-mb-sm">{{ t('configuracion.tokensApis.success') }}</div>
        <q-input
          v-model="tokenGenerado"
          :label="t('configuracion.tokensApis.tokenLabel')"
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
              :aria-label="t('configuracion.tokensApis.copy')"
              data-cy="copy-button"
            >
              <q-tooltip>{{ t('configuracion.tokensApis.copy') }}</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <div class="text-caption text-red q-mt-md text-center">
          <q-icon name="warning" class="q-mr-xs" />
          <strong>{{ t('configuracion.tokensApis.warning') }}</strong> {{ t('configuracion.tokensApis.warningDesc') }}
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { useI18n } from 'vue-i18n'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { expires_in } from 'src/composables/FuncionesGenerales'

const { t } = useI18n()
const idmd5 = idempresa_md5()
const fecha_expriation = expires_in()
const $q = useQuasar()
const tokenGenerado = ref('')
const cargando = ref(false)
const mostrarToken = ref(false)

const generarToken = async () => {
  tokenGenerado.value = ''
  cargando.value = true
  
  const datos = {
    ver: 'generarTokenJWT',
    idmd5: idmd5,
    fecha_final: fecha_expriation,
  }
  try {
    const response = await api.post('out/', datos)
    if (response.data && response.data.estado === 'success' && response.data.token) {
      tokenGenerado.value = response.data.token
      $q.notify({
        type: 'positive',
        message: t('configuracion.tokensApis.success'),
        icon: 'check_circle',
      })
    } else {
      const mensajeError = response.data?.mensaje || 'La respuesta de la API no es válida.'
      throw new Error(mensajeError)
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || t('configuracion.tokensApis.error') })
  } finally {
    cargando.value = false
  }
}

const copiarToken = () => {
  copyToClipboard(tokenGenerado.value)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: t('configuracion.tokensApis.copied'),
        icon: 'content_paste',
        position: 'top',
      })
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: t('configuracion.tokensApis.error'),
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

<template>
  <div class="q-pa-md">
    <div class="row justify-end q-mb-sm">
      <LanguageSwitcher />
    </div>
    <!-- Card principal con diseño profesional -->
    <q-card class="config-card" flat bordered>
      <!-- Header mejorado -->
      <q-card-section class="bg-primary text-white q-py-md">
        <div class="row items-center">
          <q-icon name="inventory_2" size="28px" class="q-mr-md" />
          <div>
            <div class="text-h6">{{ t('configGeneral.kardex.title') }}</div>
            <div class="text-subtitle2 text-grey-2">
              {{ t('configGeneral.kardex.subtitle') }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Contenido principal con espaciado mejorado -->
      <q-card-section class="q-pt-lg">
        <div>
          <!-- Label personalizado para mejor jerarquía -->
          <div class="text-subtitle1 text-weight-medium cm-text q-mb-sm">
            {{ t('configGeneral.kardex.methodLabel') }}
            <span class="text-caption text-red-6">*</span>
          </div>

          <!-- Select mejorado visualmente -->
          <q-select
            id="selectTipoKardex"
            v-model="tipoSeleccionado"
            :options="opciones"
            :label="t('configGeneral.kardex.selectLabel')"
            emit-value
            map-options
            dense
            outlined
            class="custom-select q-mb-lg"
            :class="{ 'custom-select-error': !tipoSeleccionado }"
          />

          <!-- Botón con mejor diseño visual -->
          <div class="row justify-end">
            <q-btn
              id="btnGuardarKardex"
              color="primary"
              :label="t('configGeneral.kardex.save')"
              :disable="!tipoSeleccionado"
              @click="guardarConfiguracion"
              class="custom-btn"
              icon="save"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator class="q-mt-sm" />

      <!-- Banner informativo rediseñado -->
      <q-card-section class="q-pt-md q-pb-md bg-grey-1">
        <q-banner
          id="bannerKardexActual"
          dense
          rounded
          :class="metodo ? 'banner-active' : 'banner-pending'"
          class="custom-banner"
        >
          <div class="row items-center no-wrap">
            <q-icon
              :name="metodo ? 'check_circle' : 'settings'"
              size="18px"
              class="q-mr-sm"
              :class="metodo ? 'text-positive' : 'text-warning'"
            />
            <div class="col">
              <span class="text-weight-medium">{{ t('configGeneral.kardex.configuredMethod') }}</span>
              <strong class="q-ml-sm">{{ metodo || t('configGeneral.kardex.pending') }}</strong>
            </div>
          </div>
        </q-banner>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
/* Estilos profesionales sin afectar la lógica */
.config-card {
  max-width: 650px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Mejora visual del select */
.custom-select :deep(.q-field__control) {
  border-radius: 8px;
  background-color: var(--cm-surface-2);
  transition: all 0.2s ease;
}

.custom-select :deep(.q-field__control:hover) {
  background-color: var(--cm-surface);
}

.custom-select :deep(.q-field__control:focus-within) {
  border-color: #1976d2;
  box-shadow: 0 0 0 1px #1976d2;
}

.custom-select :deep(.q-field__label) {
  font-weight: 500;
}

/* Efecto cuando no hay selección */
.custom-select-error :deep(.q-field__control) {
  border-color: #ff9800;
  background-color: #fff8e1;
}

/* Botón profesional */
.custom-btn {
  min-width: 200px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.custom-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.custom-btn:disabled {
  opacity: 0.6;
}

/* Banner personalizado */
.custom-banner {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.banner-active {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-left: 4px solid #2e7d32;
}

.banner-pending {
  background: linear-gradient(135deg, #fff9e6 0%, #ffefc0 100%);
  border-left: 4px solid #ed6c02;
}

.custom-banner strong {
  font-weight: 700;
}

/* Ajuste de espaciado general */
.q-pa-md {
  background-color: #f5f5f5;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from 'src/components/general/LanguageSwitcher.vue'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()
const { t } = useI18n()

// empresa actual

// const tipoActual = computed(() => kardex.getTipo(companyId.value))
const metodo = ref(null)

// opciones de kardex
const opciones = computed(() => [
  { label: t('configGeneral.kardex.options.peps'), value: 'PEPS' },
  { label: t('configGeneral.kardex.options.ueps'), value: 'UEPS' },
  { label: t('configGeneral.kardex.options.promedio'), value: 'PROMEDIO' },
])

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
    message: t('configGeneral.kardex.saved'),
  })
}

onMounted(() => {
  getTipoKardex()
})
</script>

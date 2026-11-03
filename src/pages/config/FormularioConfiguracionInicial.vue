<template>
  <!-- Añade QLayout como contenedor principal -->
  <q-layout view="hHh lpR fFf">
    <!-- Opcional: Barra de navegación (QHeader) si la necesitas -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title> {{ $t('ui.configuracion-inicial-c481d2') }} </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- QPageContainer es obligatorio dentro de QLayout -->
    <q-page-container>
      <!-- Tu QPage original (ahora sí funcionará) -->
      <q-page class="flex flex-center bg-light">
        <q-form
          @submit.prevent="enviarFormulario"
          class="cm-surface q-pa-lg rounded-borders shadow"
          style="min-width: 300px; max-width: 500px; width: 100%"
        >
          <div class="q-mb-md text-center">
            <h3 class="q-mb-md">{{ $t('ui.configuracion-inicial-c481d2') }}</h3>
          </div>

          <q-select
            filled
            v-model="usuario"
            :options="usuarios"
            :label="$t('ui.seleccionar-usuario-a7fac8')"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :rules="[(val) => !!val || $t('ui.debe-seleccionar-un-usuario-5015d6')]"
          />

          <q-select
            filled
            v-model="sucursal"
            :options="sucursales"
            :label="$t('ui.seleccionar-sucursal-cb5005')"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            class="q-mt-md"
            :rules="[(val) => !!val || $t('ui.debe-seleccionar-una-sucursal-b91ff3')]"
          />

          <div class="q-mt-lg">
            <q-btn type="submit" :label="$t('ui.ingresar-84b55f')" color="primary" unelevated class="full-width" />
          </div>
        </q-form>

        <!-- Diálogo de Opciones de Configuración -->
        <q-dialog v-model="mostrarOpcionesConfiguracion" persistent>
          <q-card style="width: 400px; max-width: 90vw">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">{{ $t('ui.opciones-de-configuracion-8c38b7') }}</div>
            </q-card-section>

            <q-card-section class="q-pt-md">
              {{ $t('ui.por-favor-seleccione-como-desea-configurar-el-sistem-7fd652') }}
            </q-card-section>

            <q-card-actions align="center" class="q-pb-md q-px-md column q-gutter-y-sm">
              <q-btn
                color="secondary"
                icon="cloud_download"
                :label="$t('ui.1-configuracion-basica-248eb6')"
                class="full-width"
                @click="configurarConfiguracionBasica"
              />
              <q-btn
                color="primary"
                flat
                icon="settings_applications"
                :label="$t('ui.2-configuracion-manual-8961af')"
                class="full-width q-ml-none"
                @click="enviarConfiguracionManual"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { objectToFormData, idempresa_md5, validarUsuario } from 'src/composables/FuncionesGenerales'
import { getIdRubro } from 'src/composables/FuncionesG'

const idrubro = getIdRubro()
console.log('ID Rubro:', idrubro)
const idempresa = idempresa_md5()
const $q = useQuasar()
const router = useRouter()
const contenidousuario = validarUsuario()
const idempresa2 = contenidousuario[0]?.empresa?.idempresa

// Datos de prueba para usuarios
const usuarios = ref([])
const sucursales = ref([])
async function getUsuarios() {
  try {
    const response = await api.get(`usuariosConfiguracion/${idempresa}`)
    console.log(response.data)
    const formateado = response.data.map((item) => ({
      label: item.usuario,
      value: item.id,
    }))
    usuarios.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}
async function getSucursal() {
  try {
    const response = await api.get(`listaSucursales/${idempresa}`)
    console.log(response.data)
    const formateado = response.data.map((item) => ({
      label: item.sucursal,
      value: item.id,
    }))
    sucursales.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}
// Datos de prueba para sucursales

const usuario = ref(null) // Valor por defecto: Juan Pérez
const sucursal = ref(null) // Valor por defecto: Sucursal Norte
const mostrarOpcionesConfiguracion = ref(true)

async function enviarConfiguracionManual() {
  const payload = {
    ver: 'registrarConfiguracionInicial',
    id_empresa_md5: idempresa,
    descripcion: i18nT('ui.no-se-descargo-configuracion-7df055'),
  }

  try {
    const response = await api.post('', payload)
    const data = extraerUltimoJSON(response.data)
    if (data?.estado === 'exito') {
      $q.notify({ type: 'positive', message: i18nT('ui.configuracion-aplicada-correctamente-8c66fd') })
      mostrarOpcionesConfiguracion.value = false
      setTimeout(() => router.push('/'), 1000)
    } else {
      $q.notify({
        type: 'negative',
        message: data?.mensaje || i18nT('ui.error-al-aplicar-configuracion-81fa43'),
      })
    }
  } catch (error) {
    console.error('Error en configuración manual:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.ocurrio-un-error-en-el-servidor-97c47b') })
  }
}

// El backend a veces devuelve texto basura + múltiples JSONs concatenados.
// Esta función extrae el último JSON válido del string de respuesta.
function extraerUltimoJSON(raw) {
  if (typeof raw === 'object') return raw // ya fue parseado por axios
  const matches = [...raw.matchAll(/\{[^{}]*\}/g)]
  if (!matches.length) return null
  try {
    return JSON.parse(matches[matches.length - 1][0])
  } catch {
    return null
  }
}

async function configurarConfiguracionBasica() {
  // Cierra el diálogo → muestra el formulario de usuario/sucursal
  mostrarOpcionesConfiguracion.value = false
}

async function enviarFormulario() {
  const formData = objectToFormData({
    usuario: usuario.value,
    sucursal: sucursal.value,
    ver: 'control',
    empresa: idempresa2,
    idrubro: idrubro,
  })
  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }

  try {
    const response = await api.post('', formData)
    const data = extraerUltimoJSON(response.data)
    if (data?.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: `${i18nT('ui.configuracion-guardada-correctamente-94ef53')}`,
      })
      setTimeout(() => router.push('/'), 1000)
    } else {
      $q.notify({
        type: 'negative',
        message: data?.mensaje || i18nT('ui.hubo-un-problema-al-configurar-94f34f'),
      })
    }
  } catch (error) {
    console.error('Error al configurar: ', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudo-configurar-d3804f') })
  }
}
onMounted(() => {
  getUsuarios()
  getSucursal()
})
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa;
}
</style>

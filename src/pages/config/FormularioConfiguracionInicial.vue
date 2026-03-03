<template>
  <!-- Añade QLayout como contenedor principal -->
  <q-layout view="hHh lpR fFf">
    <!-- Opcional: Barra de navegación (QHeader) si la necesitas -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title> Configuración Inicial </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- QPageContainer es obligatorio dentro de QLayout -->
    <q-page-container>
      <!-- Tu QPage original (ahora sí funcionará) -->
      <q-page class="flex flex-center bg-light">
        <q-form
          @submit.prevent="enviarFormulario"
          class="bg-white q-pa-lg rounded-borders shadow"
          style="min-width: 300px; max-width: 500px; width: 100%"
        >
          <div class="q-mb-md text-center">
            <h3 class="q-mb-md">Configuración Inicial</h3>
          </div>

          <q-select
            filled
            v-model="usuario"
            :options="usuarios"
            label="Seleccionar Usuario"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Debe seleccionar un usuario']"
          />

          <q-select
            filled
            v-model="sucursal"
            :options="sucursales"
            label="Seleccionar Sucursal"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            class="q-mt-md"
            :rules="[(val) => !!val || 'Debe seleccionar una sucursal']"
          />

          <div class="q-mt-lg">
            <q-btn type="submit" label="Ingresar" color="primary" unelevated class="full-width" />
          </div>
        </q-form>

        <!-- Diálogo de Opciones de Configuración -->
        <q-dialog v-model="mostrarOpcionesConfiguracion" persistent>
          <q-card style="width: 400px; max-width: 90vw;">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Opciones de Configuración</div>
            </q-card-section>

            <q-card-section class="q-pt-md">
              Por favor, seleccione cómo desea configurar el sistema para esta empresa:
            </q-card-section>

            <q-card-actions align="center" class="q-pb-md q-px-md column q-gutter-y-sm">
              <q-btn
                color="secondary"
                icon="cloud_download"
                label="1. Descargar Configuración Básica"
                class="full-width"
                @click="configurarConfiguracionBasica"
              />
              <q-btn
                color="primary"
                flat
                icon="settings_applications"
                label="2. Configuración Manual"
                class="full-width q-ml-none"
                @click="mostrarOpcionesConfiguracion = false"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { objectToFormData, validarUsuario } from 'src/composables/FuncionesGenerales'
import { getIdRubro } from 'src/composables/FuncionesG'
const idrubro = getIdRubro()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario[0]?.empresa?.idempresa
const $q = useQuasar()
const router = useRouter()

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
      message: 'No se pudieron cargar los datos',
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
      message: 'No se pudieron cargar los datos',
    })
  }
}
// Datos de prueba para sucursales

const usuario = ref(null) // Valor por defecto: Juan Pérez
const sucursal = ref(null) // Valor por defecto: Sucursal Norte
const mostrarOpcionesConfiguracion = ref(true)

async function configurarConfiguracionBasica() {
  const payload = {
    id_empresa_md5: 'c0c7c76d30bd3dcaefc96f40275bdc0a', // Puede ser sustituido dinamicamente o seguir la petición directa.
    descripcion: 'no acepto configuracion por defecto, con datos que funcionarias bien',
    ver: 'registrarConfiguracionInicial'
  }
  
  const formData = objectToFormData(payload)
  
  try {
    const response = await api.post('', formData)
    
    if (response.data.estado === 'exito' || response.data) {
       $q.notify({
        type: 'positive',
        message: 'Configuración básica descargada e instalada correctamente.'
      })
      // Ocultar modal e iniciar sesión normalmente con redirección
      mostrarOpcionesConfiguracion.value = false
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
       $q.notify({
        type: 'negative',
        message: 'Error al aplicar configuración básica'
      })
    }
  } catch (error) {
    console.error('Error al aplicar config base: ', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error en el servidor.'
    })
  }
}

async function enviarFormulario() {
  const formData = objectToFormData({
    usuario: usuario.value,
    sucursal: sucursal.value,
    ver: 'control',
    empresa: idempresa,
    idrubro: idrubro,
  })
  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }

  try {
    let response

    response = await api.post(``, formData)
    console.log(response)
    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: `Configuración guardada: Usuario ${usuario.value}, Sucursal ${sucursal.value}`,
      })
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al configurar',
      })
    }
  } catch (error) {
    console.error('Error al configurar: ', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo configurar',
    })
  }

  // Simulamos la navegación después de 1 segundo
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

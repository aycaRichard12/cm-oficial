<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="window-height window-width row no-wrap overflow-hidden">
        <!-- Left Side: Form -->

        <!-- Right Side: Image/Branding -->
        <div
          class="col-0 col-md-7 flex flex-center relative-position overflow-hidden"
          style="background: linear-gradient(135deg, var(--cm-brand) 0%, #00251a 100%)"
        >
          <div class="absolute-full">
            <q-img
              src="~assets/fondou.jpg"
              class="full-height full-width"
              fit="cover"
              style="opacity: 0.3; mix-blend-mode: overlay"
            />
          </div>

          <!-- Decoratve Circles/Effects -->
          <div class="absolute-center" style="width: 100%; height: 100%; pointer-events: none">
            <div
              class="bg-teal-6"
              style="
                position: absolute;
                top: -10%;
                right: -10%;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                opacity: 0.1;
                filter: blur(50px);
              "
            ></div>
            <div
              class="bg-secondary"
              style="
                position: absolute;
                bottom: -10%;
                left: -10%;
                width: 500px;
                height: 500px;
                border-radius: 50%;
                opacity: 0.1;
                filter: blur(60px);
              "
            ></div>
          </div>

          <div class="text-center relative-position q-pa-xl" style="z-index: 10; color: var(--cm-on-primary)">
            <q-icon
              name="business"
              size="100px"
              color="white"
              class="q-mb-md"
              style="opacity: 0.9"
            />
            <div class="text-h3 text-weight-bold q-mb-md">Gestión Comercial</div>
            <div class="text-h6 text-grey-4" style="max-width: 500px; margin: 0 auto">
              Administra tus ventas, compras e inventarios de manera eficiente y sencilla.
            </div>
          </div>
        </div>

        <div class="col-12 col-md-5 flex flex-center shadow-2 relative-position z-top cm-surface">
          <div class="q-pa-xl full-width" style="max-width: 480px">
            <div class="text-center q-mb-xl">
              <q-img
                src="~assets/IMAGOTIPO-02.png"
                width="180px"
                class="q-mb-md"
                style="background-color: var(--cm-brand); border-radius: 8px"
              />
              <div class="text-h4 text-weight-bolder text-primary q-mb-sm">Bienvenido</div>
              <div class="text-subtitle1 cm-text-muted">Ingresa a tu cuenta para continuar</div>
            </div>

            <q-form @submit.prevent="login" class="q-gutter-md">
              <div>
                <div class="text-weight-bold cm-text q-mb-xs">Usuario</div>
                <q-input
                  outlined
                  v-model="username"
                  type="text"
                  lazy-rules
                  :rules="[(val) => (val && val.length > 0) || 'Por favor ingresa tu usuario']"
                  bg-color="grey-1"
                  color="primary"
                  dense
                  placeholder="Usuario"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="grey-7" />
                  </template>
                </q-input>
              </div>

              <div>
                <!-- <div class="row items-center justify-between q-mb-xs">
                  <div class="text-weight-bold cm-text">Contraseña</div>
                  <a
                    href="#"
                    class="text-caption text-secondary text-weight-medium"
                    style="text-decoration: none"
                    >¿Olvidaste tu contraseña?</a
                  >
                </div> -->
                <div class="text-weight-bold cm-text q-mb-xs">Contraseña</div>

                <q-input
                  outlined
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  lazy-rules
                  :rules="[(val) => (val && val.length > 0) || 'Por favor ingresa tu contraseña']"
                  bg-color="grey-1"
                  color="primary"
                  dense
                  placeholder="Contraseña"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="grey-7" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer cm-text-muted"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <q-btn
                label="Iniciar Sesión"
                type="submit"
                color="primary"
                text-color="white"
                class="full-width q-mt-lg"
                size="lg"
                unelevated
                style="border-radius: 8px"
              />

              <div class="relative-position q-my-lg">
                <q-separator />
                <div class="absolute-center cm-surface q-px-md cm-text-muted text-caption">
                  O continúa con
                </div>
              </div>

              <div class="text-center q-mt-md text-body2 cm-text-muted">
                ¿No tienes una cuenta?
                <a
                  href="https://mistersofts.com/app/em/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-weight-bold text-primary"
                  style="text-decoration: none"
                >
                  Regístrate
                </a>
              </div>
              <div v-if="deferredPrompt" class="text-center q-mt-sm">
                <q-btn
                  outline
                  dense
                  no-caps
                  color="grey-5"
                  text-color="grey-8"
                  icon="get_app"
                  label="Instalar aplicación"
                  @click="installApp"
                  class="text-caption text-weight-medium q-px-sm"
                  style="border-radius: 6px"
                />
              </div>
            </q-form>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { apiCt } from 'src/boot/axios'
import { mockAuthResponse, guardarSesionUsuario } from 'src/data/mockAuthResponse'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const deferredPrompt = ref(null)

const handleInstallPrompt = () => {
  if (window.deferredPromptEvent) {
    deferredPrompt.value = window.deferredPromptEvent
  }
}

onMounted(() => {
  // Verificar si ya se disparó antes de montar el componente
  if (window.deferredPromptEvent) {
    deferredPrompt.value = window.deferredPromptEvent
  }
  // Escuchar por si se dispara después
  window.addEventListener('pwa-install-available', handleInstallPrompt)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('pwa-install-available', handleInstallPrompt)
})

const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      console.log('App instalada')
    }
    deferredPrompt.value = null
    window.deferredPromptEvent = null
  }
}

const router = useRouter()
const $q = useQuasar()

const isLocal = import.meta.env.VITE_APP_ENV === 'local' || process.env.VITE_APP_ENV === 'local'

// Si hay sesión activa (fuente de verdad: mistersofts-cm), redirigir
const userData = localStorage.getItem('mistersofts-cm')
const isAuthenticated = userData && userData !== 'undefined' && userData !== 'null'

if (isLocal) {
  guardarSesionUsuario(mockAuthResponse)
  router.push('/')
} else if (isAuthenticated) {
  router.push('/')
}

const CACHE_KEY_CONFI_CONTA = 'mistersofts-cm-confi-conta'

// Carga la configuración contable (asientos/operaciones/módulos) desde la API
// de contabilidad y la persiste en localStorage. Nunca propaga errores.
const cargarConfiguracionContable = async (idempresa) => {
  if (!idempresa) {
    console.warn('[confi-conta] idempresa no disponible, se omite la carga')
    return
  }
  try {
    const { data } = await apiCt.get(`listar_confi_conta_integracion/${idempresa}`)
    const lista = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : []
    localStorage.setItem(CACHE_KEY_CONFI_CONTA, JSON.stringify(lista))
    console.log('[confi-conta] Configuracion guardada:', lista)
  } catch (error) {
    console.error('[confi-conta] Error al obtener configuracion:', error?.message || error)
    // Guardar arreglo vacio para no dejar datos obsoletos de una sesion previa
    localStorage.setItem(CACHE_KEY_CONFI_CONTA, JSON.stringify([]))
  }
}

const login = async () => {
  loading.value = true

  try {
    let res
    if (isLocal) {
      res = { data: mockAuthResponse }
    } else {
      res = await axios.post(
        process.env.VITE_URL_AUTH,
        {
          action: 'login',
          usuario: username.value,
          password: password.value,
          modulo: 'cm',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-App-Token': 'APP_CM_KEY_2026',
          },
        },
      )
    }

    if (
      res.data &&
      Array.isArray(res.data) &&
      res.data.length > 0 &&
      res.data[0].ok === 'success'
    ) {
      console.log('Respuesta del servidor:', res.data)
      const userData = [{ ...res.data[0] }]
      const rawMenu = res.data[0].menu || []
      const modulo = res.data[0].modulo || ''
      const idusuario = res.data[0].idusuario || ''
      if (rawMenu.length === 0) {
        $q.notify({
          color: 'warning',
          textColor: 'white', // theme-allow
          icon: 'warning',
          message: 'No se encontraron permisos asignados para este usuario.',
          position: 'top',
        })
        return
      }

      // Transformar menu: añadir "usuario" y asegurarnos que los codigos
      // de los submenús terminan con el idusuario real.
      const menuTransformado = rawMenu.map((item) => ({
        usuario: idusuario,
        titulo: item.titulo,
        codigo: item.codigo,
        submenu: (item.submenu || []).map((sub) => ({
          ...sub,
          codigo: sub.codigo ? `${sub.codigo.split('-')[0]}-${idusuario}` : sub.codigo,
        })),
      }))

      const userMenu = [{ modulo, menu: menuTransformado }]

      // Limpiar el menu del objeto de usuario
      delete userData[0].menu
      console.log('datos el login', res.data)
      localStorage.setItem('mistersofts-cm', JSON.stringify(userData))
      localStorage.setItem('mistersofts-cmmenu', JSON.stringify(userMenu))
      localStorage.setItem('puedeIniciarsesion', 'true')

      // Cargar configuracion contable (no bloquea el login: se ejecuta en 2do plano).
      cargarConfiguracionContable(userData[0]?.empresa?.idempresa).catch((e) =>
        console.error('[confi-conta] Error inesperado:', e),
      )
      console.log('userData', userData)
      console.log('userMenu', userMenu)

      $q.notify({
        color: 'positive',
        textColor: 'white', // theme-allow
        icon: 'check_circle',
        message: 'Bienvenido al sistema',
        position: 'top',
      })

      sessionStorage.removeItem('logoutIntencional')
      router.push('/')
    } else {
      $q.notify({
        color: 'negative',
        textColor: 'white', // theme-allow
        icon: 'error',
        message: res.data[0]?.error || 'Credenciales inválidas. Intente nuevamente.',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error en authentication:', error)
    $q.notify({
      color: 'negative',
      textColor: 'white', // theme-allow
      icon: 'error',
      message: 'Error al conectar con el servidor',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.z-top {
  z-index: 20;
}
/* Glassmorphism subtle effect for the right text container if needed,
   but simplistic distinct styling is usually cleaner */
</style>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="window-height window-width row no-wrap overflow-hidden">
        <!-- Left Side: Form -->
        <div class="col-12 col-md-5 flex flex-center shadow-2 relative-position z-top bg-white">
          <div class="q-pa-xl full-width" style="max-width: 480px">
            <div class="text-center q-mb-xl">
              <q-img
                src="~assets/IMAGOTIPO-02.png"
                width="180px"
                class="q-mb-md"
                style="background-color: #004d40; border-radius: 8px"
              />
              <div class="text-h4 text-weight-bolder text-primary q-mb-sm">Bienvenido</div>
              <div class="text-subtitle1 text-grey-8">Ingresa a tu cuenta para continuar</div>
            </div>

            <q-form @submit.prevent="login" class="q-gutter-md">
              <div>
                <div class="text-weight-bold text-grey-9 q-mb-xs">Usuario</div>
                <q-input
                  outlined
                  v-model="username"
                  type="text"
                  lazy-rules
                  :rules="[(val) => (val && val.length > 0) || 'Por favor ingresa tu usuario']"
                  bg-color="grey-1"
                  color="primary"
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="grey-7" />
                  </template>
                </q-input>
              </div>

              <div>
                <!-- <div class="row items-center justify-between q-mb-xs">
                  <div class="text-weight-bold text-grey-9">Contraseña</div>
                  <a
                    href="#"
                    class="text-caption text-secondary text-weight-medium"
                    style="text-decoration: none"
                    >¿Olvidaste tu contraseña?</a
                  >
                </div> -->
                <div class="text-weight-bold text-grey-9 q-mb-xs">Contraseña</div>

                <q-input
                  outlined
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  lazy-rules
                  :rules="[(val) => (val && val.length > 0) || 'Por favor ingresa tu contraseña']"
                  bg-color="grey-1"
                  color="primary"
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="grey-7" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer text-grey-7"
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
                :loading="loading"
                style="border-radius: 8px"
              />

              <div class="relative-position q-my-lg">
                <q-separator />
                <div class="absolute-center bg-white q-px-md text-grey-7 text-caption">
                  O continúa con
                </div>
              </div>

              <div class="text-center q-mt-md text-body2 text-grey-8">
                ¿No tienes una cuenta?
                <a
                  href="https://mistersofts.com/app/crearcuenta"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-weight-bold text-primary"
                  style="text-decoration: none"
                >
                  Regístrate
                </a>
              </div>
            </q-form>
          </div>
        </div>

        <!-- Right Side: Image/Branding -->
        <div
          class="col-0 col-md-7 flex flex-center relative-position overflow-hidden"
          style="background: linear-gradient(135deg, #004d40 0%, #00251a 100%)"
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

          <div class="text-center text-white relative-position q-pa-xl" style="z-index: 10">
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
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const username = ref('usuario.comercial')
const password = ref('comercial.123')
const showPassword = ref(false)
const loading = ref(false)

const router = useRouter()
const $q = useQuasar()

//si esta autentidcado redirigir a la pagina principal
const isAuthenticated = localStorage.getItem('puedeIniciarsesion') !== null

if (isAuthenticated) {
  router.push('/')
}

const login = () => {
  loading.value = true

  // Simulating API call
  setTimeout(() => {
    if (username.value === 'usuario.comercial' && password.value === 'comercial.123') {
      // Mock Data mimicking the project structure found in FuncionesG.js logic
      // contenidousuario[0]?.empresa?.idempresa etc.
      const mockUser = [
        {
          usuario: {
            name: 'Usuario Comercial',
            username: username.value,
          },
          empresa: {
            idempresa: 1,
            nombre: 'Empresa Demo',
            idtn: 1, // Example for IdRubro logic
          },
          factura: {
            access_token: 'mock_token_12345',
            tipo: 1,
          },
        },
      ]

      localStorage.setItem('puedeIniciarsesion', JSON.stringify(mockUser))

      $q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'check_circle',
        message: 'Bienvenido al sistema',
        position: 'top',
      })

      router.push('/')
    } else {
      $q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'error',
        message: 'Credenciales inválidas. Intente nuevamente.',
        position: 'top',
      })
    }
    loading.value = false
  }, 1000)
}
</script>

<style scoped>
.z-top {
  z-index: 20;
}
/* Glassmorphism subtle effect for the right text container if needed,
   but simplistic distinct styling is usually cleaner */
</style>

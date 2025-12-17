<template>
  <q-layout view="hHh lpR fFf" class="bg-grey-1">
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered :width="300">
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="flex justify-between">
            <div class="text-h6 q-mb-md">APIs Disponibles</div>
          </div>

          <q-input
            dense
            outlined
            v-model="searchTerm"
            placeholder="Buscar API..."
            clearable
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <div class="q-mb-md">
            <q-btn-toggle
              v-model="selectedMethods"
              spread
              class="my-custom-toggle"
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="methodFilterOptions"
            />
          </div>
        </div>

        <q-list separator>
          <template v-for="group in filteredApiGroups" :key="group.groupName">
            <q-item-label header class="text-weight-bold">{{ group.groupName }}</q-item-label>
            <q-item
              v-for="api in group.endpoints"
              :key="api.id"
              clickable
              v-ripple
              :active="selectedApi && selectedApi.id === api.id"
              @click="selectApi(api)"
              active-class="bg-teal-1 text-grey-8"
            >
              <q-item-section>
                <q-item-label>{{ api.name }}</q-item-label>
                <q-item-label caption>
                  <q-badge :color="methodColors[api.method] || 'grey'" class="q-mr-sm">{{
                    api.method
                  }}</q-badge>
                  <span>{{ api.endpoint }}</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <div class="row flex justify-end">
          <div class="col-12 col-md-4">
            <label for="server">Servers</label>
            <q-select v-model="model_server" :options="options" dense outlined />
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <div
            v-if="!selectedApi"
            key="welcome"
            class="flex flex-center text-center"
            style="height: 80vh"
          >
            <div>
              <q-icon name="hub" color="primary" size="100px" />
              <div class="text-h4 q-mt-md text-grey-8">Documentación Interactiva de API</div>
              <p class="text-subtitle1 q-mt-sm text-grey-6">
                Selecciona un endpoint del menú de la izquierda para ver sus detalles.
              </p>
            </div>
          </div>

          <div v-else :key="selectedApi.id">
            <div class="q-mb-lg">
              <h1 class="text-h4 text-weight-light q-mb-none">{{ selectedApi.name }}</h1>
              <div class="flex items-center q-gutter-x-sm q-mt-sm">
                <q-badge
                  :color="methodColors[selectedApi.method] || 'grey'"
                  class="text-subtitle1 q-py-xs"
                  >{{ selectedApi.method }}</q-badge
                >
                <code class="text-subtitle1 bg-grey-3 q-pa-xs rounded-borders text-black">{{
                  selectedApi.endpoint
                }}</code>
              </div>
              <p class="text-body1 q-mt-md text-grey-7">{{ selectedApi.description }}</p>
            </div>

            <q-card
              flat
              bordered
              class="q-mb-lg"
              v-if="selectedApi.params && selectedApi.params.length"
            >
              <q-table
                :rows="selectedApi.params"
                :columns="paramColumns"
                title="Parámetros Requeridos"
                row-key="name"
                flat
                hide-bottom
              >
                <template v-slot:body-cell-required="props">
                  <q-td :props="props">
                    <q-badge :color="props.value ? 'red' : 'grey-5'">
                      {{ props.value ? 'Sí' : 'No' }}
                    </q-badge>
                  </q-td>
                </template>
              </q-table>
            </q-card>

            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <CodeBlock
                  v-if="selectedApi.requestExample"
                  title="Ejemplo de Request"
                  :code="selectedApi.requestExample"
                  language="json"
                />
              </div>
              <div class="col-12 col-md-6">
                <CodeBlock
                  v-if="selectedApi.responseExample"
                  title="Ejemplo de Response (Éxito)"
                  :code="selectedApi.responseExample"
                  language="json"
                />
              </div>
            </div>

            <q-card
              flat
              bordered
              class="q-mb-lg"
              v-if="selectedApi.errors && selectedApi.errors.length"
            >
              <q-card-section class="bg-negative text-white text-h6">
                <div class="text-h6">Respuestas de Error Posibles</div>
              </q-card-section>
              <q-list separator>
                <q-item v-for="error in selectedApi.errors" :key="error.code">
                  <q-item-section>
                    <q-item-label>
                      <q-badge color="negative" class="q-mr-md">{{ error.code }}</q-badge>
                      {{ error.message }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>

            <q-card flat bordered class="q-mb-lg" v-if="selectedApi.notes">
              <q-card-section>
                <div class="text-h6">Notas Adicionales</div>
                <p class="text-body1 q-mt-sm text-grey-7">{{ selectedApi.notes }}</p>
              </q-card-section>
            </q-card>
          </div>
        </transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'

import { apiGroups, methodColors } from 'src/data/apis' // Asegúrate que la ruta sea correcta
import CodeBlock from './CodeBlock.vue'
// --- Estado Reactivo ---

const leftDrawerOpen = ref(true)
const selectedApi = ref(null)
const searchTerm = ref('')
const selectedMethods = ref([])
const options = ref([{ label: 'https://mistersofts.com/app/cmv1', value: 'server1' }])
const model_server = ref(options.value[0].label)
// --- Lógica de Filtros y Búsqueda ---
const methodFilterOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
]

const filteredApiGroups = computed(() => {
  if (!searchTerm.value && selectedMethods.value.length === 0) {
    return apiGroups
  }

  const searchLower = searchTerm.value.toLowerCase()

  return apiGroups
    .map((group) => {
      const filteredEndpoints = group.endpoints.filter((api) => {
        const nameMatch = api.name.toLowerCase().includes(searchLower)
        const endpointMatch = api.endpoint.toLowerCase().includes(searchLower)
        const methodMatch =
          selectedMethods.value.length === 0 || selectedMethods.value.includes(api.method)

        return (nameMatch || endpointMatch) && methodMatch
      })

      // Solo incluye el grupo si tiene endpoints que coinciden
      return { ...group, endpoints: filteredEndpoints }
    })
    .filter((group) => group.endpoints.length > 0)
})

// --- Lógica del Componente ---

// Selecciona una API para mostrarla y la desplaza a la vista
const selectApi = (api) => {
  selectedApi.value = null // Fuerza la re-renderización para la animación
  setTimeout(() => {
    selectedApi.value = api
    console.log(selectedApi.value)
  }, 150) // Pequeño delay para que la transición `out-in` funcione correctamente
}

// Columnas para la tabla de parámetros
const paramColumns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left', sortable: true },
  { name: 'required', label: 'Requerido', field: 'required', align: 'center' },
  { name: 'example', label: 'Ejemplo', field: 'example', align: 'left' },
]

// --- Componente reusble para Bloques de Código ---
// Se define localmente para mantenerlo en un solo archivo, pero podría ser un componente global.
// const CodeBlock = {
//   props: {
//     title: String,
//     code: String,
//     language: String,
//   },
//   setup(props) {
//     const copyCode = () => {
//       copyToClipboard(props.code)
//         .then(() => {
//           $q.notify({
//             message: 'Copiado al portapapeles',
//             color: 'positive',
//             icon: 'check',
//             position: 'top-right',
//             timeout: 1000,
//           })
//         })
//         .catch(() => {
//           $q.notify({
//             message: 'Error al copiar',
//             color: 'negative',
//             icon: 'error',
//             position: 'top-right',
//             timeout: 1000,
//           })
//         })
//     }
//     return { copyCode }
//   },
//   template: `
//      <q-card flat bordered class="code-block-card q-mb-lg">
//       <q-bar class="bg-grey-3 text-grey-8">
//         <div>{{ title }}</div>
//         <q-space />
//         <q-btn flat round dense icon="content_copy" @click="copyCode">
//           <q-tooltip>Copiar código</q-tooltip>
//         </q-btn>
//       </q-bar>
//       <q-card-section class="q-pa-none">
//         <pre class="q-ma-none q-pa-md bg-grey-2 text-black">
//           <code v-text="code"></code>
//         </pre>
//       </q-card-section>
//     </q-card>
//   `,
// }
</script>

<style lang="scss">
/* Estilos para el bloque de código */
.code-block-card {
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    border-radius: 0 0 4px 4px;
  }
}

/* Estilos de la transición */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row justify-center full-width">
      <div class="col-12 row items-center justify-between q-mb-xl">
        <!-- Título + Subtítulo -->
        <div class="row items-center q-gutter-sm">
          <q-icon name="history_edu" color="primary" size="3rem" />

          <div>
            <div class="text-h4 text-weight-bolder text-primary">Notas de la Versión</div>
            <div class="text-subtitle2 text-grey-7">
              Explora las últimas novedades del
              <span class="text-primary text-weight-bold"> Sistema Comercial Mistersofts </span>
            </div>
          </div>
        </div>

        <!-- Navegación de versiones -->
        <div class="bg-white shadow-1 rounded-borders q-pa-xs row q-gutter-x-sm">
          <q-btn
            v-for="version in versions"
            :key="version.id"
            :label="version.title"
            :icon="version.icon"
            :color="selectedVersion.id === version.id ? 'primary' : 'grey-7'"
            :flat="selectedVersion.id !== version.id"
            :unelevated="selectedVersion.id === version.id"
            rounded
            no-caps
            @click="selectedVersion = version"
          >
            <q-badge v-if="version.isNew" color="red" floating rounded transparent />
          </q-btn>
        </div>
      </div>

      <!-- Dynamic Content Area -->
      <div class="col-12">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <div :key="selectedVersion.id">
            <!-- Version Status Banner -->
            <div
              class="row items-center justify-between q-mb-lg bg-white q-pa-md shadow-1 rounded-borders"
            >
              <div class="row items-center q-gutter-x-md">
                <div class="text-h5 text-weight-bold text-primary">
                  {{ selectedVersion.title }}
                </div>
                <div class="text-caption text-grey-8 bg-grey-3 q-px-sm q-py-xs rounded-borders">
                  <q-icon name="event" size="14px" class="q-mr-xs" />
                  {{ selectedVersion.date }}
                </div>
              </div>
              <q-chip
                v-if="selectedVersion.status"
                :color="selectedVersion.statusColor"
                text-color="white"
                :label="selectedVersion.statusName"
                class="text-weight-bold text-uppercase"
              />
            </div>

            <!-- Content: v2.3.0 -->
            <div v-if="selectedVersion.content === 'v2.3.0'">
              <div class="row q-col-gutter-lg">
                <!-- Feature List -->
                <div class="col-12 col-md-6">
                  <q-card flat class="full-height bg-white shadow-1">
                    <q-card-section>
                      <div class="text-h6 q-mb-md text-primary row items-center">
                        <q-icon name="stars" class="q-mr-sm" />
                        <div>Novedades Principales</div>
                      </div>
                      <q-separator class="q-mb-md" />
                      <q-list class="q-gutter-y-sm">
                        <q-item v-for="(item, idx) in featuresV230" :key="idx" dense>
                          <q-item-section avatar>
                            <q-icon name="check_circle" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-body1 text-grey-9">{{ item }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Modules Grid -->
                <div class="col-12 col-md-6">
                  <q-card flat class="full-height bg-white shadow-1">
                    <q-card-section>
                      <!-- Título -->
                      <div class="text-h6 q-mb-md text-primary row items-center">
                        <q-icon name="widgets" class="q-mr-sm" />
                        <div>Módulos Impactados</div>
                      </div>

                      <q-separator class="q-mb-md" />

                      <!-- Grid -->
                      <div class="row q-col-gutter-md">
                        <div class="col-6" v-for="(mod, idx) in modulesV230" :key="idx">
                          <q-card
                            class="bg-blue-1 text-primary text-center shadow-2 cursor-pointer q-hoverable rounded-borders"
                          >
                            <q-card-section>
                              <q-icon :name="mod.icon" size="3em" class="q-mb-sm text-primary" />
                              <div class="text-weight-bold">
                                {{ mod.name }}
                              </div>
                            </q-card-section>

                            <q-tooltip class="bg-primary text-white text-body2">
                              {{ mod.tooltip }}
                            </q-tooltip>
                          </q-card>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Hero Video -->
              <q-card
                flat
                class="q-mb-lg text-white shadow-3 rounded-borders overflow-hidden bg-primary q-mt-md"
              >
                <!-- Header -->
                <div class="row items-center justify-between q-px-xl q-py-md bg-primary">
                  <div class="row items-center">
                    <q-icon name="play_circle_filled" size="28px" class="q-mr-sm text-white" />
                    <div class="text-subtitle1 text-weight-bold">Video de Novedades</div>
                  </div>

                  <q-badge outline color="white" label="Actualización" class="text-weight-medium" />
                </div>

                <!-- Padding lateral (costados) -->
                <div class="q-px-xl q-py-lg bg-grey-9">
                  <q-responsive :ratio="16 / 9" style="max-height: 460px">
                    <iframe
                      src="https://www.youtube.com/embed/bvTBbz2AdFQ?si=RhtXAXCnJsx5AQFI"
                      title="Video de Novedades"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                      class="fit rounded-borders"
                    ></iframe>
                  </q-responsive>
                </div>
              </q-card>
            </div>

            <!-- Content: Future -->
            <div
              v-else
              class="column flex-center q-pa-xl text-center bg-white shadow-1 rounded-borders q-my-lg"
            >
              <q-avatar
                size="100px"
                font-size="50px"
                color="orange-1"
                text-color="orange"
                icon="engineering"
                class="q-mb-md"
              />
              <div class="text-h4 text-grey-8 text-weight-bold">En Desarrollo</div>
              <p class="text-grey-6 text-body1 q-mt-md" style="max-width: 400px">
                Estamos cocinando las próximas mejoras. ¡Pronto verás novedades aquí!
              </p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const featuresV230 = [
  'Filtros avanzados en tablas principales (Fecha, Numéricos, Texto).',
  'Botones de acceso rápido en cabeceras de columnas.',
  'Optimización de rendimiento en carga de reportes.',
  'Nueva interfaz de usuario más limpia y amigable.',
]

const modulesV230 = [
  { name: 'Compras', tooltip: 'Reporte de Compras Desglosado', icon: 'shopping_cart' },
  { name: 'Stock', tooltip: 'Reporte individual de productos', icon: 'inventory_2' },
  { name: 'Ventas', tooltip: 'Ventas y Contingencias', icon: 'point_of_sale' },
  { name: 'Anulaciones', tooltip: 'Gestión de devoluciones', icon: 'remove_shopping_cart' },
]

const versions = ref([
  {
    id: 1,
    title: 'v2.3.0',
    date: '14 ENE 2026',
    icon: 'rocket_launch',
    status: true,
    statusName: 'Publicado',
    statusColor: 'primary',
    statusIcon: 'check_circle',
    content: 'v2.3.0',
    isNew: true,
  },
  {
    id: 2,
    title: 'Próximamente',
    date: 'En desarrollo',
    icon: 'construction',
    status: true,
    statusName: 'En Progreso',
    statusColor: 'orange',
    statusIcon: 'engineering',
    content: 'future',
    isNew: false,
  },
])

const selectedVersion = ref(versions.value[0])
</script>

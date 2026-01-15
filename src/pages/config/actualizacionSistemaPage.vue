<template>
  <q-page class="window-height bg-grey-2">
    <div class="column fit">
      <!-- Header Bar -->
      <div class="bg-white q-py-md q-px-lg shadow-1 z-top col-auto">
        <div class="row items-center justify-between">
          <div class="row items-center q-gutter-x-md">
            <q-avatar color="primary" text-color="white" icon="history_edu" />
            <div>
              <div class="text-h6 text-weight-bold text-primary leading-tight">
                Notas de la Versión
              </div>
              <div class="text-caption text-grey-8">Sistema Comercial Mistersofts</div>
            </div>
          </div>
          <div class="text-caption text-grey-6 gt-xs">
            Última actualización: {{ versions[0].date }}
          </div>
        </div>
      </div>

      <!-- Main Content Splitter -->
      <div class="col relative-position">
        <q-splitter v-model="splitterModel" :limits="[250, 500]" class="fit" unit="px">
          <!-- Left Panel: Version List -->
          <template v-slot:before>
            <div class="fit">
              <q-list separator padding>
                <q-item-label header class="text-weight-bold q-pb-xs">Versiones</q-item-label>

                <q-item
                  v-for="version in versions"
                  :key="version.id"
                  clickable
                  v-ripple
                  :active="selectedVersion.id === version.id"
                  active-class="bg-blue-1 text-primary border-active"
                  @click="selectedVersion = version"
                  class="q-px-md q-py-md transition-base"
                >
                  <q-item-section avatar>
                    <q-icon
                      :name="version.icon"
                      :color="selectedVersion.id === version.id ? 'primary' : 'grey-6'"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ version.title }}</q-item-label>
                    <q-item-label caption lines="1">{{ version.date }}</q-item-label>
                  </q-item-section>

                  <q-item-section side v-if="version.isNew">
                    <q-badge color="green" label="NEW" rounded floating transparent />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </template>

          <!-- Right Panel: Detail View -->
          <template v-slot:after>
            <div class="fit bg-grey-1">
              <div class="q-pa-lg container-fluid">
                <transition
                  appear
                  enter-active-class="animated fadeIn"
                  leave-active-class="animated fadeOut"
                  mode="out-in"
                >
                  <div :key="selectedVersion.id">
                    <!-- Content Header -->
                    <div class="row items-center q-mb-lg">
                      <div class="col">
                        <div class="text-h4 text-weight-bold text-blue-grey-9 q-mb-xs">
                          {{ selectedVersion.title }}
                        </div>
                        <div class="row items-center q-gutter-x-sm">
                          <q-chip
                            outline
                            color="primary"
                            icon="event"
                            :label="selectedVersion.date"
                          />
                          <q-chip
                            v-if="selectedVersion.status"
                            :color="selectedVersion.statusColor"
                            text-color="white"
                            :icon="selectedVersion.statusIcon"
                            :label="selectedVersion.statusName"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Dynamic Content -->
                    <div v-if="selectedVersion.content === 'v2.3.0'">
                      <!-- Cards Grid -->
                      <div class="row q-col-gutter-md q-mb-xl">
                        <!-- Key Features -->
                        <div class="col-12 col-md-6">
                          <q-card flat bordered class="h-full bg-white rounded-lg">
                            <q-card-section>
                              <div class="text-h6 q-mb-md flex items-center text-primary">
                                <q-icon name="stars" class="q-mr-sm" /> Novedades Principales
                              </div>
                              <q-list dense>
                                <q-item
                                  v-for="(item, idx) in featuresV230"
                                  :key="idx"
                                  class="q-px-none"
                                >
                                  <q-item-section avatar min-width>
                                    <q-icon name="check_circle" color="secondary" size="xs" />
                                  </q-item-section>
                                  <q-item-section class="text-body1">{{ item }}</q-item-section>
                                </q-item>
                              </q-list>
                            </q-card-section>
                          </q-card>
                        </div>

                        <!-- Modules -->
                        <div class="col-12 col-md-6">
                          <q-card flat bordered class="h-full bg-white rounded-lg">
                            <q-card-section>
                              <div class="text-h6 q-mb-md flex items-center text-indigo">
                                <q-icon name="widgets" class="q-mr-sm" /> Módulos Impactados
                              </div>
                              <div class="row q-col-gutter-sm">
                                <div class="col-6" v-for="(mod, idx) in modulesV230" :key="idx">
                                  <div
                                    class="bg-indigo-1 text-indigo-9 q-pa-sm rounded-borders text-center text-weight-medium cursor-pointer feature-card"
                                  >
                                    {{ mod.name }}
                                    <q-tooltip>{{ mod.tooltip }}</q-tooltip>
                                  </div>
                                </div>
                              </div>
                            </q-card-section>
                          </q-card>
                        </div>
                      </div>

                      <!-- Video Section -->
                      <q-card flat bordered class="overflow-hidden rounded-lg">
                        <q-card-section class="bg-grey-9 text-white q-py-sm">
                          <div class="text-subtitle1 flex items-center">
                            <q-icon name="play_circle" class="q-mr-sm" /> Video Explicativo
                          </div>
                        </q-card-section>
                        <q-responsive :ratio="16 / 9" style="max-height: 500px">
                          <iframe
                            src="https://www.youtube.com/embed/GnJCM18pb9U?si=O7ETT9CmwJNAEFkw"
                            title="YouTube video"
                            frameborder="0"
                            allowfullscreen
                            class="full-width full-height"
                          ></iframe>
                        </q-responsive>
                      </q-card>
                    </div>

                    <!-- Placeholder for Future -->
                    <div
                      v-else
                      class="flex flex-center q-pa-xl text-center"
                      style="min-height: 400px"
                    >
                      <div>
                        <q-icon name="construction" size="100px" color="grey-4" />
                        <div class="text-h5 text-grey-6 q-mt-md">Próximamente</div>
                        <p class="text-grey-5">Las mejoras en desarrollo aparecerán aquí.</p>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </template>
        </q-splitter>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const splitterModel = ref(300) // Sidebar width in px

const featuresV230 = [
  'Implementación de filtros avanzados en tablas principales.',
  'Filtros por fecha, valores numéricos y texto.',
  'Botones de filtrado en cabeceras de columnas.',
]

const modulesV230 = [
  { name: 'Compras', tooltip: 'Reporte de Compras Desglosado' },
  { name: 'Stock', tooltip: 'Reporte individual de productos' },
  { name: 'Ventas', tooltip: 'Ventas y Contingencias' },
  { name: 'Anulaciones', tooltip: 'Válidas, Anuladas y Devueltas' },
]

const versions = ref([
  {
    id: 1,
    title: 'Versión 2.3.0',
    date: '14 de enero de 2026',
    icon: 'filter_alt',
    status: true,
    statusName: 'Publicado',
    statusColor: 'green',
    statusIcon: 'check_circle',
    content: 'v2.3.0',
    isNew: true,
  },
  {
    id: 2,
    title: 'Próximas Ajustes',
    date: 'En Desarrollo',
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

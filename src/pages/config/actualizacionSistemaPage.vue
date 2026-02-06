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
            v-for="version in versiones"
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

            <!-- Content: Versión publicada -->
            <div v-if="selectedVersion.content !== 'future'">
              <div class="row q-col-gutter-lg">
                <!-- Feature List -->
                <div class="col-12 col-md-6">
                  <FeatureList :features="selectedVersion.features" />
                </div>

                <!-- Modules Grid -->
                <div class="col-12 col-md-6">
                  <ModulesGrid :modules="selectedVersion.modules" />
                </div>
              </div>

              <!-- Video Player -->
              <VideoPlayer
                v-if="selectedVersion.videoUrl"
                :video-url="selectedVersion.videoUrl"
                :title="`Video de Novedades ${selectedVersion.title}`"
                badge="Actualización"
              />
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
import FeatureList from 'src/components/actualizaciones/FeatureList.vue'
import ModulesGrid from 'src/components/actualizaciones/ModulesGrid.vue'
import VideoPlayer from 'src/components/actualizaciones/VideoPlayer.vue'
import { versionesConfig } from 'src/config/versionesConfig.js'

const versiones = ref(versionesConfig)
const selectedVersion = ref(versiones.value[1]) // Seleccionar v1.1 por defecto (la más nueva)
</script>

<template>
  <q-page padding>
    <q-card flat bordered class="q-pa-md">
      <q-toolbar class="bg-primary text-white shadow-2 rounded-borders">
        <q-toolbar-title>Gestión de Permisos de Stock</q-toolbar-title>
        <!-- <q-btn
          icon="add"
          label="Nueva Solicitud"
          color="white"
          flat
          @click="abrirDialogoSolicitud"
        /> -->
      </q-toolbar>

      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="solicitudes" icon="assignment" label="Solicitudes" id="solicitudes" />
        <q-tab name="activos" icon="check_circle" label="P. Activos" id="activos" />
        <q-tab name="historial" icon="history" label="Historial" id="historial" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="solicitudes">
          <q-table
            id="solicitudes"
            title="Solicitudes de Permiso"
            :rows="listaSolicitudesData"
            :columns="colsSolicitudes"
            row-key="id"
            :loading="loading"
          >
            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip :color="getColorEstado(props.value)" text-color="white" dense>
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="q-gutter-xs">
                <q-btn
                  v-if="props.row.estado === 'PENDIENTE'"
                  icon="settings"
                  size="sm"
                  color="secondary"
                  round
                  @click="gestionarSolicitud(props.row)"
                  id="gestionar"
                >
                  <q-tooltip>Aprobar o Rechazar</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="activos" id="tablaActivos">
          <q-table
            title="Permisos Disponibles"
            :rows="listaActivosData"
            :columns="colsPermisos"
            :loading="loading"
          >
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="historial">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-table
                id="historial"
                title="Usados"
                :rows="listaUsadosData"
                :columns="colsPermisos"
                :loading="loading"
                flat
                bordered
              />
            </div>
            <div class="col-12 col-md-6">
              <q-table
                id="vencidos"
                title="Vencidos"
                :rows="listaVencidosData"
                :columns="colsPermisos"
                :loading="loading"
                flat
                bordered
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="dialogoSolicitud" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Nueva Solicitud de Permiso</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit="onSubmitSolicitud">
          <q-card-section class="q-gutter-md">
            <q-select
              v-model="formSolicitud.idalmacen"
              :options="almacenesResponsable"
              label="Almacen"
              map-options
              emit-value
              outlined
              required
            />
            <q-select
              v-model="formSolicitud.idusuario_asignado"
              :options="responsables"
              label="Responsable"
              map-options
              emit-value
              outlined
              required
            />
            <q-input
              v-model="formSolicitud.motivo"
              label="Motivo / Justificación"
              type="textarea"
              outlined
              required
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Cancelar" flat v-close-popup />
            <q-btn label="Enviar Solicitud" color="primary" type="submit" :loading="loading" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoGestion" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">Gestionar Solicitud #{{ selectedItem?.id }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm q-pt-md">
          <p class="text-subtitle2">Defina la vigencia del permiso:</p>
          <div>
            <label for="fI">Fecha y Hora de Inicio</label>
            <q-input v-model="fechaInicio" id="fI" outlined dense readonly>
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="fechaInicio"
                      outlined
                      dense
                      fill-mask
                      mask="YYYY-MM-DD HH:mm:ss"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="fechaInicio" mask="YYYY-MM-DD HH:mm:ss" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div>
            <label for="fF" class="q-mt-md">Fecha y Hora de Fin</label>
            <q-input v-model="fechaFin" id="fF" outlined dense readonly>
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFin" mask="YYYY-MM-DD HH:mm:ss">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time v-model="fechaFin" mask="YYYY-MM-DD HH:mm:ss" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <q-input
            v-model="observacionGestion"
            label="Observaciones del Administrador"
            outlined
            type="textarea"
            rows="2"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn label="Cancelar" flat v-close-popup />
          <q-btn
            label="Rechazar"
            color="negative"
            @click="handleGestion('rechazar')"
            :loading="loading"
          />
          <q-btn
            label="Aprobar"
            color="positive"
            @click="handleGestion('aprobar')"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

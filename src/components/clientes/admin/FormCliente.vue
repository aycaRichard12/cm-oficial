<template>
  <q-card class="client-form-card">
    <!-- Encabezado moderno con título e ícono -->

    <q-form @submit.prevent="onSubmit" :loading="loading">
      <!-- Sección: Información General -->
      <q-card-section class="q-pt-lg">
        <div class="section-title">
          <q-icon name="description" size="sm" class="q-mr-xs" />
          {{ $t('ui.informacion-general-438a25') }}
        </div>
        <div class="row q-col-gutter-md">
          <!-- Razón Social -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('ui.razon-social-adf906') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nombre"
              id="nombre"
              :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
              prepend-icon="business"
              :placeholder="$t('ui.ingrese-razon-social-a15c04')"
            />
          </div>
          <!-- Nombre Comercial -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('ui.nombre-comercial-55a6ae') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nombrecomercial"
              id="nomcomercial"
              :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
              prepend-icon="store"
              :placeholder="$t('ui.nombre-con-el-que-opera-45e395')"
            />
          </div>
          <!-- Tipo de Cliente -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('ui.tipo-de-cliente-0b35df') }} <span class="text-red">*</span></div>
            <q-select
              outlined
              dense
              v-model="localData.tipocliente"
              :options="tipoClienteOptions"
              id="tipocliente"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[(val) => !!val || $t('ui.seleccione-un-tipo-776f45')]"
              prepend-icon="people"
              :placeholder="$t('ui.seleccione-tipo-6f2c4b')"
            >
              <template v-slot:append>
                <q-btn
                  v-if="!tipoClienteOptions || tipoClienteOptions.length === 0"
                  icon="refresh"
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  @click.stop="emit('reload-options', 'tipocliente')"
                >
                  <q-tooltip>{{ $t('ui.recargar-opciones-bc5810') }}</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </div>
          <!-- Canal de venta -->
          <div class="col-12 col-md-3">
            <div class="field-label">{{ $t('ui.canal-de-venta-5eeada') }} <span class="text-red">*</span></div>
            <q-select
              outlined
              dense
              v-model="localData.canalventa"
              :options="canalVentaOptions"
              id="canalventa"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || $t('ui.seleccione-un-canal-ce32e2')]"
              prepend-icon="tune"
              :placeholder="$t('ui.canal-de-venta-5eeada')"
            >
              <template v-slot:append>
                <q-btn
                  v-if="!canalVentaOptions || canalVentaOptions.length === 0"
                  icon="refresh"
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  @click.stop="emit('reload-options', 'canalventa')"
                >
                  <q-tooltip>{{ $t('ui.recargar-opciones-bc5810') }}</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </div>
          <!-- Tipo de Documento -->
          <div class="col-12 col-md-2">
            <div class="field-label">{{ $t('ui.tipo-de-doc-178a9f') }} <span class="text-red">*</span></div>
            <q-select
              outlined
              dense
              v-model="localData.tipodocumento"
              :options="tipoDocumetosOptions"
              id="tipodoc"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || $t('ui.seleccione-un-tipo-776f45')]"
              prepend-icon="badge"
              :placeholder="$t('ui.doc-identidad-698fb9')"
            >
              <template v-slot:append>
                <q-btn
                  v-if="!tipoDocumetosOptions || tipoDocumetosOptions.length === 0"
                  icon="refresh"
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  @click.stop="emit('reload-options', 'tipodocumento')"
                >
                  <q-tooltip>{{ $t('ui.recargar-opciones-bc5810') }}</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </div>
          <!-- Nro De Documento -->
          <div class="col-12 col-md-3">
            <div class="field-label">{{ $t('ui.nro-de-documento-4023c6') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nrodocumento"
              id="nrodoc"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
              prepend-icon="pin"
              :placeholder="$t('ui.numero-de-documento-90fd82')"
            />
          </div>
          <!-- Almacén -->
          <div class="col-12 col-md-3" v-if="soloAlmacen">
            <div class="field-label">{{ $t('inventario.warehouse') }} <span class="text-red">*</span></div>
            <q-select
              outlined
              dense
              v-model="localData.almacen"
              :options="almacenOptions"
              id="canalventa"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || $t('ui.seleccione-un-almacen-d73231')]"
              prepend-icon="warehouse"
              :placeholder="$t('ui.almacen-asignado-999b11')"
            >
              <template v-slot:append>
                <q-btn
                  v-if="!almacenOptions || almacenOptions.length === 0"
                  icon="refresh"
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  @click.stop="emit('reload-options', 'almacen')"
                >
                  <q-tooltip>{{ $t('ui.recargar-opciones-bc5810') }}</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <q-separator class="q-my-md" />

      <!-- Sección: Contacto y Ubicación -->
      <q-card-section class="bg-grey-1">
        <div class="section-title">
          <q-icon name="location_on" size="sm" class="q-mr-xs" />
          {{ $t('ui.contacto-y-ubicacion-8e405f') }}
        </div>
        <div class="row q-col-gutter-md">
          <!-- Email -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('configuracion.servicios.table.email') }}</div>
            <q-input
              outlined
              dense
              v-model="localData.email"
              id="email"
              prepend-icon="email"
              :placeholder="$t('ui.correo-ejemplo-com-054a79')"
              :hint="$t('ui.ejemplo-correo-com-9c0833')"
            />
          </div>
          <!-- Dirección -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('ui.direccion-04f478') }}</div>
            <q-input
              outlined
              dense
              v-model="localData.direccion"
              id="direccion"
              prepend-icon="home"
              :placeholder="$t('ui.calle-numero-piso-6da356')"
            />
          </div>
          <!-- Teléfono -->
          <div class="col-12 col-md-2">
            <div class="field-label">{{ $t('ui.telefono-99af37') }}</div>
            <q-input
              outlined
              dense
              v-model="localData.telefono"
              id="telefono"
              prepend-icon="phone"
              :placeholder="$t('ui.fijo-1f5c32')"
            />
          </div>
          <!-- Móvil -->
          <div class="col-12 col-md-3">
            <div class="field-label">{{ $t('ui.movil-ce84c3') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.movil"
              id="movil"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
              prepend-icon="smartphone"
              :placeholder="$t('ui.celular-3cf916')"
            />
          </div>
          <!-- País -->
          <div class="col-12 col-md-3">
            <div class="field-label">{{ $t('ui.pais-0c664f') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.pais"
              id="pais"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
              prepend-icon="public"
              :placeholder="$t('ui.pais-0c664f')"
            />
          </div>
          <!-- Ciudad -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('ui.ciudad-c6fbe2') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.ciudad"
              id="ciudad"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
              prepend-icon="location_city"
              :placeholder="$t('ui.ciudad-c6fbe2')"
            />
          </div>
          <!-- Zona -->
          <div class="col-12 col-md-3">
            <div class="field-label">{{ $t('ui.zona-27288b') }}</div>
            <q-input
              outlined
              dense
              v-model="localData.zona"
              id="zona"
              prepend-icon="map"
              :placeholder="$t('ui.zona-o-barrio-76c411')"
            />
          </div>
          <!-- Página Web -->
          <div class="col-12 col-md-5">
            <div class="field-label">{{ $t('ui.pagina-web-804748') }}</div>
            <q-input
              outlined
              dense
              v-model="localData.web"
              prepend-icon="language"
              placeholder="https://..."
              :hint="$t('ui.sitio-web-de-la-empresa-53416c')"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator class="q-my-md" />

      <!-- Sección: Datos Adicionales -->
      <q-card-section>
        <div class="section-title">
          <q-icon name="more_horiz" size="sm" class="q-mr-xs" />
          {{ $t('ui.datos-adicionales-9e63c4') }}
        </div>
        <div class="row q-col-gutter-md">
          <!-- Contacto -->
          <div class="col-12 col-md-6">
            <div class="field-label">{{ $t('ui.contacto-d8a53e') }}</div>
            <q-input
              outlined
              dense
              v-model="localData.contacto"
              id="contacto"
              prepend-icon="perm_contact_calendar"
              :placeholder="$t('ui.nombre-de-la-persona-de-contacto-e82bde')"
            />
          </div>
          <!-- Detalle -->
          <div class="col-12 col-md-6">
            <div class="field-label">{{ $t('ui.detalle-be605b') }}</div>
            <q-input
              outlined
              dense
              v-model="localData.detalle"
              id="detalle"
              prepend-icon="notes"
              :placeholder="$t('ui.observaciones-adicionales-5b4a14')"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Acciones del formulario -->
      <q-card-actions align="right" class="q-pa-md q-gutter-sm bg-grey-2">
        <q-btn
          :label="$t('common.cancel')"
          flat
          color="negative"
          icon="close"
          @click="$emit('cancel')"
          class="modern-btn"
        />
        <q-btn
          :label="$t('common.save')"
          type="submit"
          color="primary"
          icon="save"
          unelevated
          class="modern-btn"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useClienteAlmacenConfig } from 'src/modules/config/composables/useClienteAlmacenConfig'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const props = defineProps({
  editing: Boolean,
  modalValue: Object,
  tipoClienteOptions: Array,
  canalVentaOptions: Array,
  tipoDocumetosOptions: Array,
  almacenOptions: Array,
})

const emit = defineEmits(['submit', 'cancel', 'reload-options'])
const localData = ref({ ...props.modalValue })
const { soloAlmacen, loading } = useClienteAlmacenConfig(idempresa)
console.log('Solo Almacén:', soloAlmacen)
const onSubmit = () => {
  emit('submit', localData.value)
}
</script>

<style lang="scss" scoped>
.client-form-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  background: var(--cm-surface);

  &:hover {
    box-shadow:
      0 8px 30px rgba(0, 0, 0, 0.1),
      0 2px 6px rgba(0, 0, 0, 0.12);
  }
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #263238;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  border-left: 4px solid var(--q-primary, #1976d2);
  padding-left: 12px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #455a64;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  .text-red {
    margin-left: 2px;
    font-size: 1.1rem;
    line-height: 1;
  }
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
  background-color: var(--cm-surface-2);
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    background-color: #f5f5f5;
  }
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  background-color: var(--cm-surface);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

:deep(.q-field__prepend) {
  color: #78909c;
  margin-right: 4px;
}

.modern-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;

  &:active {
    transform: scale(0.96);
  }
}

/* Ajustes responsive para etiquetas */
@media (max-width: 767px) {
  .field-label {
    font-size: 0.8rem;
  }
  .section-title {
    font-size: 0.95rem;
    margin-bottom: 16px;
    padding-left: 10px;
  }
}
</style>

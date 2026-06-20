<template>
  <q-card class="client-form-card">
    <!-- Encabezado moderno con título e ícono -->

    <q-form @submit.prevent="onSubmit" :loading="loading">
      <!-- Sección: Información General -->
      <q-card-section class="q-pt-lg">
        <div class="section-title">
          <q-icon name="description" size="sm" class="q-mr-xs" />
          Información General
        </div>
        <div class="row q-col-gutter-md">
          <!-- Razón Social -->
          <div class="col-12 col-md-4">
            <div class="field-label">Razón Social <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nombre"
              id="nombre"
              :rules="[(val) => !!val || 'Campo Obligatorio']"
              prepend-icon="business"
              placeholder="Ingrese razón social"
            />
          </div>
          <!-- Nombre Comercial -->
          <div class="col-12 col-md-4">
            <div class="field-label">Nombre Comercial <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nombrecomercial"
              id="nomcomercial"
              :rules="[(val) => !!val || 'Campo Obligatorio']"
              prepend-icon="store"
              placeholder="Nombre con el que opera"
            />
          </div>
          <!-- Tipo de Cliente -->
          <div class="col-12 col-md-4">
            <div class="field-label">Tipo de Cliente <span class="text-red">*</span></div>
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
              :rules="[(val) => !!val || 'Seleccione un tipo']"
              prepend-icon="people"
              placeholder="Seleccione tipo"
            />
          </div>
          <!-- Canal de venta -->
          <div class="col-12 col-md-3">
            <div class="field-label">Canal de venta <span class="text-red">*</span></div>
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
              :rules="[(val) => !!val || 'Seleccione un canal']"
              prepend-icon="tune"
              placeholder="Canal de venta"
            />
          </div>
          <!-- Tipo de Documento -->
          <div class="col-12 col-md-2">
            <div class="field-label">Tipo de Doc <span class="text-red">*</span></div>
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
              :rules="[(val) => !!val || 'Seleccione un tipo']"
              prepend-icon="badge"
              placeholder="Doc. identidad"
            />
          </div>
          <!-- Nro De Documento -->
          <div class="col-12 col-md-3">
            <div class="field-label">Nro De Documento <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nrodocumento"
              id="nrodoc"
              :rules="[(val) => !!val || 'Campo obligatorio']"
              prepend-icon="pin"
              placeholder="Número de documento"
            />
          </div>
          <!-- Almacén -->
          <div class="col-12 col-md-3" v-if="soloAlmacen">
            <div class="field-label">Almacén <span class="text-red">*</span></div>
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
              :rules="[(val) => !!val || 'Seleccione un Almacen']"
              prepend-icon="warehouse"
              placeholder="Almacén asignado"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator class="q-my-md" />

      <!-- Sección: Contacto y Ubicación -->
      <q-card-section class="bg-grey-1">
        <div class="section-title">
          <q-icon name="location_on" size="sm" class="q-mr-xs" />
          Contacto y Ubicación
        </div>
        <div class="row q-col-gutter-md">
          <!-- Email -->
          <div class="col-12 col-md-4">
            <div class="field-label">Email</div>
            <q-input
              outlined
              dense
              v-model="localData.email"
              id="email"
              prepend-icon="email"
              placeholder="correo@ejemplo.com"
              hint="ejemplo@correo.com"
            />
          </div>
          <!-- Dirección -->
          <div class="col-12 col-md-4">
            <div class="field-label">Dirección</div>
            <q-input
              outlined
              dense
              v-model="localData.direccion"
              id="direccion"
              prepend-icon="home"
              placeholder="Calle, número, piso"
            />
          </div>
          <!-- Teléfono -->
          <div class="col-12 col-md-2">
            <div class="field-label">Teléfono</div>
            <q-input
              outlined
              dense
              v-model="localData.telefono"
              id="telefono"
              prepend-icon="phone"
              placeholder="Fijo"
            />
          </div>
          <!-- Móvil -->
          <div class="col-12 col-md-3">
            <div class="field-label">Móvil <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.movil"
              id="movil"
              :rules="[(val) => !!val || 'Campo obligatorio']"
              prepend-icon="smartphone"
              placeholder="Celular"
            />
          </div>
          <!-- País -->
          <div class="col-12 col-md-3">
            <div class="field-label">País <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.pais"
              id="pais"
              :rules="[(val) => !!val || 'Campo obligatorio']"
              prepend-icon="public"
              placeholder="País"
            />
          </div>
          <!-- Ciudad -->
          <div class="col-12 col-md-4">
            <div class="field-label">Ciudad <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.ciudad"
              id="ciudad"
              :rules="[(val) => !!val || 'Campo obligatorio']"
              prepend-icon="location_city"
              placeholder="Ciudad"
            />
          </div>
          <!-- Zona -->
          <div class="col-12 col-md-3">
            <div class="field-label">Zona</div>
            <q-input
              outlined
              dense
              v-model="localData.zona"
              id="zona"
              prepend-icon="map"
              placeholder="Zona o barrio"
            />
          </div>
          <!-- Página Web -->
          <div class="col-12 col-md-5">
            <div class="field-label">Página Web</div>
            <q-input
              outlined
              dense
              v-model="localData.web"
              prepend-icon="language"
              placeholder="https://..."
              hint="Sitio web de la empresa"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator class="q-my-md" />

      <!-- Sección: Datos Adicionales -->
      <q-card-section>
        <div class="section-title">
          <q-icon name="more_horiz" size="sm" class="q-mr-xs" />
          Datos Adicionales
        </div>
        <div class="row q-col-gutter-md">
          <!-- Contacto -->
          <div class="col-12 col-md-6">
            <div class="field-label">Contacto</div>
            <q-input
              outlined
              dense
              v-model="localData.contacto"
              id="contacto"
              prepend-icon="perm_contact_calendar"
              placeholder="Nombre de la persona de contacto"
            />
          </div>
          <!-- Detalle -->
          <div class="col-12 col-md-6">
            <div class="field-label">Detalle</div>
            <q-input
              outlined
              dense
              v-model="localData.detalle"
              id="detalle"
              prepend-icon="notes"
              placeholder="Observaciones adicionales"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Acciones del formulario -->
      <q-card-actions align="right" class="q-pa-md q-gutter-sm bg-grey-2">
        <q-btn
          label="Cancelar"
          flat
          color="negative"
          icon="close"
          @click="$emit('cancel')"
          class="modern-btn"
        />
        <q-btn
          label="Guardar"
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

const emit = defineEmits(['submit', 'cancel'])
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
  background: #ffffff;

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
  background-color: #fafafa;
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    background-color: #f5f5f5;
  }
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  background-color: #ffffff;
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

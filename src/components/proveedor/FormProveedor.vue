<template>
  <q-card class="client-form-card">
    <q-form @submit.prevent="onSubmit" :loading="false">
      <!-- Sección: Información General -->
      <q-card-section class="q-pt-lg">
        <div class="section-title">
          <q-icon name="description" size="sm" class="q-mr-xs" />
          {{ $t('ui.informacion-general-438a25') }}
        </div>
        <div class="row q-col-gutter-md">
          <!-- Nombre Proveedor -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('ui.nombre-proveedor-bf13f9') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nombre"
              id="nombre"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
              prepend-icon="business"
              :placeholder="$t('ui.ingrese-nombre-del-proveedor-b7ce02')"
            />
          </div>
          <!-- Código (generado automáticamente) -->
          <div class="col-12 col-md-2">
            <div class="field-label">{{ $t('ui.codigo-c35510') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.codigo"
              id="codigo"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
              prepend-icon="tag"
              :placeholder="$t('ui.auto-generado-e96cc5')"
            >
              <template v-slot:append v-if="!editing">
                <q-icon name="refresh" class="cursor-pointer" @click="regenerarCodigo">
                  <q-tooltip>{{ $t('ui.regenerar-codigo-595c3f') }}</q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </div>
          <!-- NIT -->
          <div class="col-12 col-md-2">
            <div class="field-label">NIT <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.nit"
              id="nit"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
              prepend-icon="badge"
              :placeholder="$t('ui.numero-de-nit-63e1b7')"
            />
          </div>
          <!-- Detalle -->
          <div class="col-12 col-md-4">
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
            />
          </div>
          <!-- Dirección -->
          <div class="col-12 col-md-4">
            <div class="field-label">{{ $t('ui.direccion-04f478') }} <span class="text-red">*</span></div>
            <q-input
              outlined
              dense
              v-model="localData.direccion"
              id="direccion"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
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
          <div class="col-12 col-md-2">
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
          <div class="col-12 col-md-3">
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
              id="web"
              prepend-icon="language"
              placeholder="https://..."
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
import { ref, onMounted } from 'vue'

const props = defineProps({
  editing: Boolean,
  modalValue: Object,
})

const emit = defineEmits(['submit', 'cancel'])
const localData = ref({ ...props.modalValue })

// Extraer número del final de una cadena, ej. "test75" -> "75"
const extraerNumeroFinal = (str) => {
  const match = str.match(/\d+$/)
  return match ? match[0] : '00'
}

// Generar código automático
const generarCodigo = () => {
  try {
    const raw = localStorage.getItem('mistersofts-cm')
    const data = raw ? JSON.parse(raw) : []
    const session = data.length ? data[0] : null
    const empresa = session?.empresa

    // 1. Iniciales del nombre de la empresa (máx. 4 caracteres)
    let iniciales = 'EMP'
    if (empresa?.nombre) {
      const palabras = empresa.nombre.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ ]/g, '').split(' ')
      if (palabras.length > 1) {
        iniciales = palabras
          .map((p) => p.charAt(0).toUpperCase())
          .join('')
          .substring(0, 4)
      } else {
        iniciales = empresa.nombre
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 4)
          .toUpperCase()
      }
    }

    // 2. Número de empresa desde el final del campo "usuario"
    const idEmpresaNum = extraerNumeroFinal(session?.usuario || '')

    // 3. Correlativo de 3 dígitos (debes reemplazar por tu secuencia real)
    const correlativo = Math.floor(Math.random() * 900 + 100) // Placeholder: 100-999

    return `${iniciales}${idEmpresaNum}-${correlativo}`
  } catch (e) {
    console.log('Error generando código:', e)
    return `PROV-${Math.floor(Math.random() * 900 + 100)}`
  }
}

// Regenerar manualmente (solo en creación)
const regenerarCodigo = () => {
  if (!props.editing) {
    localData.value.codigo = generarCodigo()
  }
}

// Generar automáticamente al montar si es creación y no tiene código
onMounted(() => {
  if (!props.editing && (!localData.value.codigo || localData.value.codigo === '')) {
    localData.value.codigo = generarCodigo()
  }
})

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

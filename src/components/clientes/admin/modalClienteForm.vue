<template>
  <q-card style="width: 800px; max-width: 95vw" class="shadow-24">
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>
        <q-icon name="person_add" class="q-mr-sm" size="28px" />
        {{ $t('ui.nuevo-registro-de-cliente-3ea242') }}
      </q-toolbar-title>
      <q-btn flat round dense icon="close" v-close-popup @click="$emit('cancel')" />
    </q-toolbar>

    <q-card-section class="q-pa-lg">
      <q-form @submit.prevent="onSubmit" class="q-gutter-y-sm">
        <div class="row q-col-gutter-md">
          <!-- Razón Social -->
          <div class="col-12 col-md-6">
            <q-input
              outlined
              dense
              v-model="localData.nombre"
              :label="$t('ui.razon-social-abb099')"
              :placeholder="$t('ui.ej-juan-perez-o-empresa-s-a-f0e781')"
              :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Nombre Comercial -->
          <div class="col-12 col-md-6">
            <q-input
              outlined
              dense
              v-model="localData.nombrecomercial"
              :label="$t('ui.nombre-comercial-c235f1')"
              :placeholder="$t('ui.ej-mi-negocio-561492')"
              :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
            >
              <template v-slot:prepend>
                <q-icon name="storefront" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Tipo de Cliente -->
          <div class="col-12 col-md-4">
            <q-select
              outlined
              dense
              v-model="localData.tipocliente"
              :options="tipoClienteOptions"
              :label="$t('ui.tipo-de-cliente-4296d0')"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[(val) => !!val || $t('ui.seleccione-un-tipo-776f45')]"
            >
              <template v-slot:prepend>
                <q-icon name="groups" color="primary" />
              </template>
              <template v-slot:append>
                <q-btn
                  v-if="!tipoClienteOptions || tipoClienteOptions.length === 0"
                  icon="refresh"
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  @click.stop="cargarTipoCliente()"
                >
                  <q-tooltip>{{ $t('ui.recargar-opciones-bc5810') }}</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </div>

          <!-- Canal de Venta -->
          <div class="col-12 col-md-4">
            <q-select
              outlined
              dense
              v-model="localData.canalventa"
              :options="canalVentaOptions"
              :label="$t('ui.canal-de-venta-42adfe')"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || $t('ui.seleccione-un-canal-ce32e2')]"
            >
              <template v-slot:prepend>
                <q-icon name="shopping_cart" color="primary" />
              </template>
              <template v-slot:append>
                <q-btn
                  v-if="!canalVentaOptions || canalVentaOptions.length === 0"
                  icon="refresh"
                  flat
                  dense
                  round
                  size="sm"
                  color="primary"
                  @click.stop="cargarCanalesVenta()"
                >
                  <q-tooltip>{{ $t('ui.recargar-opciones-bc5810') }}</q-tooltip>
                </q-btn>
              </template>
            </q-select>
          </div>

          <!-- Tipo de Documento -->
          <div class="col-12 col-md-4">
            <q-select
              outlined
              dense
              v-model="localData.tipodocumento"
              :options="tipoDocumetosOptions"
              :label="$t('ui.tipo-de-documentos-3eb36c')"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :rules="[(val) => !!val || $t('ui.seleccione-un-tipo-776f45')]"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Nro De Documento -->
          <div class="col-12 col-md-6">
            <q-input
              outlined
              dense
              v-model="localData.nrodocumento"
              :label="$t('ui.nro-de-documento-6e2cd7')"
              :rules="[(val) => !!val || $t('configuracion.canalesDeVenta.form.required')]"
            >
              <template v-slot:prepend>
                <q-icon name="numbers" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Teléfono -->
          <div class="col-12 col-md-6">
            <q-input
              outlined
              dense
              v-model="localData.telefono"
              :label="$t('ui.telefono-99af37')"
              :placeholder="$t('ui.ej-71234567-0efc2d')"
            >
              <template v-slot:prepend>
                <q-icon name="phone" color="primary" />
              </template>
            </q-input>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="row justify-end q-gutter-sm">
          <q-btn
            :label="$t('common.cancel')"
            flat
            color="grey-7"
            v-close-popup
            @click="$emit('cancel')"
            class="q-px-md"
          />
          <q-btn
            :label="$t('ui.guardar-cliente-079fd8')"
            type="submit"
            color="primary"
            unelevated
            icon="save"
            class="q-px-lg"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'


const idempresa = idempresa_md5()
const emit = defineEmits(['update:modelValue', 'recordCreated', 'cancel'])

const localData = ref({
  ver: 'registroClienteMinimal',
  idempresa: idempresa,
  nombre: '',
  nombrecomercial: '',
  tipocliente: null,
  canalventa: null,
  tipodocumento: null,
  nrodocumento: '',
  telefono: '',
})

// Define options for your select fields
const tipoClienteOptions = ref([])
const canalVentaOptions = ref([])

const tipoDocumetosOptions = ref([
  { label: 'CI', value: '1' },
  { label: 'CEX', value: '2' },
  { label: 'PAS', value: '3' },
  { label: 'OD', value: '4' },
  { label: 'NIT', value: '5' },
])

const cargarCanalesVenta = async () => {
  try {
    const response = await api.get(`listaCanalVenta/${idempresa}`)
    canalVentaOptions.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
    if (canalVentaOptions.value.length > 0) {
      localData.value.canalventa = canalVentaOptions.value[0].value
    }
  } catch (error) {
    console.error('Error al cargar canales de venta:', error)
  }
}

const cargarTipoCliente = async () => {
  try {
    const response = await api.get(`listaTipoCliente/${idempresa}`)
    tipoClienteOptions.value = response.data.map((item) => ({
      label: item.tipo,
      value: item.id,
    }))
    if (tipoClienteOptions.value.length > 0) {
      localData.value.tipocliente = tipoClienteOptions.value[0].value
    }
  } catch (error) {
    console.error('Error al cargar tipos de cliente:', error)
  }
}

const onSubmit = async () => {
  emit('recordCreated', localData.value)
  emit('update:modelValue', false)
}

onMounted(() => {
  cargarTipoCliente()
  cargarCanalesVenta()
})
</script>



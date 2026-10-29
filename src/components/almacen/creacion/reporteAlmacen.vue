<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="localDialog"
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="cm-surface cm-text column no-wrap fit">
        <q-bar>
          <q-space />

          <q-btn
            dense
            flat
            icon="minimize"
            @click="maximizedToggle = false"
            :disable="!maximizedToggle"
          >
            <q-tooltip v-if="maximizedToggle" class="cm-surface text-primary">{{ $t('ui.minimize-1c5b76') }}</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            icon="crop_square"
            @click="maximizedToggle = true"
            :disable="maximizedToggle"
          >
            <q-tooltip v-if="!maximizedToggle" class="cm-surface text-primary">{{ $t('ui.maximize-35afae') }}</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="cm-surface text-primary">{{ $t('ui.close-bbfa77') }}</q-tooltip>
          </q-btn>
        </q-bar>
        <div class="q-mb-md">
          <div class="row">
            <div class="col-4">
              <p>
                <strong>{{ empresa.nombre }}</strong>
              </p>
              <div>
                <strong>{{ empresa.direccion }}</strong>
              </div>
              <div>
                <strong>{{ empresa.telefono }}</strong>
              </div>
            </div>
            <div class="col-4 text-center">
              <h6><strong>ALMACENES</strong></h6>
              <h6 id="Nro"></h6>
              <p id="divisa"></p>
            </div>
            <div class="col-4 text-right">
              <q-img :src="`/em/${empresa.logo}`" width="130px" height="130px" />
            </div>
          </div>
        </div>
        <q-separator />

        <div class="row q-mt-md justify-between items-start">
          <div>
            <div class="text-grey"><strong>{{ $t('ui.datos-del-reporte-c7e471') }}</strong></div>
            <div id="feventa">{{ $t('ui.fecha-de-impresion-709027') }} {{ fecha }}</div>
          </div>
          <div class="text-right">
            <div class="text-grey"><strong>{{ $t('ui.datos-del-encargado-6be170') }}</strong></div>
            <div>{{ usuario.nombre }}</div>
            <div>{{ usuario.cargo }}</div>
          </div>
        </div>

        <q-table :rows="almacenes" :columns="columns" row-key="id" flat bordered class="q-mt-md" />

        <q-card-actions align="right">
          <q-btn :label="$t('ui.cerrar-4b0816')" color="secondary" v-close-popup />
          <q-btn :label="$t('ui.descargar-en-pdf-71ca4c')" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed } from 'vue'
const props = defineProps({
  dialog: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits(['update:dialog'])
const localDialog = computed({
  get: () => props.dialog,
  set: (val) => emit('update:dialog', val),
})
const fecha = new Date().toLocaleDateString()
const maximizedToggle = ref(true)

const empresa = {
  nombre: 'Comercio e Inversiones YF SRL',
  direccion: 'Av. Ayacucho N° 218 esq. Gral Achá',
  telefono: '+591 12345678',
  logo: 'logos/yof_4b3fde69b5.png',
}

const usuario = {
  nombre: 'Juan Pérez',
  cargo: 'Encargado de Almacén',
}
const almacenes = ref([
  {
    id: 1,
    nombre: 'eliminar2',
    direccion: 'dir',
    telefono: '123',
    email: 'prueba7@gmail.com',
    tipo: 'consumo1',
    stockmin: 123,
    stockmax: 12331,
    sucursal: 'Sucursal1',
    estado: 'Inactivo',
  },
  // más registros si es necesario
])

const columns = [
  { name: 'id', label: i18nT('cotizacion.table.number'), field: 'id', align: 'left' },
  { name: 'nombre', label: i18nT('configGeneral.tipoAlmacen.form.name'), field: 'nombre' },
  { name: 'direccion', label: i18nT('ui.direccion-04f478'), field: 'direccion' },
  { name: 'telefono', label: i18nT('ui.telefono-99af37'), field: 'telefono' },
  { name: 'email', label: i18nT('configuracion.servicios.table.email'), field: 'email' },
  { name: 'tipo', label: i18nT('ui.tipo-almacen-8f4e01'), field: 'tipo' },
  { name: 'stockmin', label: i18nT('ui.stock-min-42e889'), field: 'stockmin' },
  { name: 'stockmax', label: i18nT('ui.stock-max-6ac758'), field: 'stockmax' },
  { name: 'sucursal', label: i18nT('ui.sucursal-07d782'), field: 'sucursal' },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado' },
]

const descargarPDF = () => {
  console.log('Exportando a PDF...')
}
</script>

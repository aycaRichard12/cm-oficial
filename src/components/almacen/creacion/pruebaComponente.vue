<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="localDialog"
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-white text-dark column no-wrap fit">
        <q-bar>
          <q-space />

          <q-btn
            dense
            flat
            icon="minimize"
            @click="maximizedToggle = false"
            :disable="!maximizedToggle"
          >
            <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            icon="crop_square"
            @click="maximizedToggle = true"
            :disable="maximizedToggle"
          >
            <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary">Maximize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <header class="q-pa-md">
          <div class="row">
            <!-- Columna: Detalles de la empresa -->
            <div class="col-4">
              <div class="text-subtitle2">
                <p id="nomempresa" class="q-mb-xs">
                  <strong>Comercio e Inversiones YF SRL</strong>
                </p>
                <div id="dirempresa"><strong>Av. Ayacucho N° 218 esq. Gral Achá</strong></div>
                <div id="celempresa"><strong>+591 12345678</strong></div>
              </div>
            </div>

            <!-- Columna: Título central -->
            <div class="col-4 text-center">
              <h6 class="q-mb-xs"><strong>ALMACENES</strong></h6>
              <h6 id="Nro" class="q-mb-xs"></h6>
              <p id="divisa"></p>
            </div>

            <!-- Columna: Imagen -->
            <div class="col-4 text-right">
              <q-img
                src="src/assets/logos/yof_4b3fde69b5.png"
                :width="130"
                :height="130"
                spinner-color="white"
                id="imagen"
                class="q-mr-md"
              />
            </div>
          </div>
        </header>

        <q-card-section class="scroll">
          <div class="row q-mt-md">
            <div class="col-6">
              <div class="text-grey"><strong>DATOS DEL REPORTE:</strong></div>
              <div id="feventa">Fecha de Impresión: {{ fecha }}</div>
            </div>
            <div class="col-6">
              <div class="text-grey"><strong>DATOS DEL ENCARGADO:</strong></div>
              <div id="user">Richard Systems</div>
              <div id="rol">Programador full stack</div>
            </div>
          </div>

          <q-table
            :rows="almacenes"
            :columns="columns"
            row-key="id"
            flat
            bordered
            class="q-mt-md"
            title="Lista de Almacenes"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="secondary" v-close-popup />
          <q-btn label="Descargar en PDF" color="primary" @click="descargarPDF" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
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
  { name: 'id', label: 'N°', field: 'id', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre' },
  { name: 'direccion', label: 'Dirección', field: 'direccion' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono' },
  { name: 'email', label: 'Email', field: 'email' },
  { name: 'tipo', label: 'Tipo almacén', field: 'tipo' },
  { name: 'stockmin', label: 'Stock min', field: 'stockmin' },
  { name: 'stockmax', label: 'Stock max', field: 'stockmax' },
  { name: 'sucursal', label: 'Sucursal', field: 'sucursal' },
  { name: 'estado', label: 'Estado', field: 'estado' },
]

const descargarPDF = () => {
  console.log('Exportando a PDF...')
}
</script>

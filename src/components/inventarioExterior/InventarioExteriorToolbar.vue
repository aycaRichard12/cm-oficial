<template>
  <div class="row flex justify-between">
    <div id="btnNuevo">
      <q-btn color="primary" @click="$emit('toggleForm')" class="btn-res q-mt-lg">
        <q-icon name="save" class="icono" />
        <span class="texto">{{ formCollapse ? 'Cancelar Registro' : 'Nuevo' }}</span>
      </q-btn>
    </div>

    <div class="col-12 col-md-4" id="selectAlmacenExterno">
      <label for="almacen">Seleccione un Almacén</label>
      <q-select
        v-model="filtroAlmacen"
        :options="almacenOptions"
        id="almacen"
        emit-value
        outlined
        map-options
        clearable
        name="filtroALmacen"
        dense
      />
    </div>
    <div class="col-12 col-md-3" id="inputBuscar">
      <label for="buscar">Buscar...</label>
      <q-input dense debounce="300" v-model="searchQuery" placeholder="Buscar..."></q-input>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'

const props = defineProps({
  formCollapse: Boolean,
  almacenOptions: Array,
  filtroAlmacen: String,
  searchQuery: String,
})
console.log(props.almacenOptions)
const emit = defineEmits(['toggleForm', 'update:filtroAlmacen', 'update:searchQuery'])

const filtroAlmacen = computed({
  get: () => props.filtroAlmacen,
  set: (val) => {
    console.log('Almacen seleccionado:', val) // Debug log para verificar el valor seleccionado
    emit('update:filtroAlmacen', val)
  },
})

const establecerValorInicial = (opciones) => {
  // Solo establecemos si no hay valor seleccionado actualmente y hay opciones
  if (!props.filtroAlmacen && opciones && opciones.length > 0) {
    emit('update:filtroAlmacen', opciones[0].value)
  }
}

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val),
})
onMounted(() => {
  establecerValorInicial(props.almacenOptions)
})

// 2. Observar por si las opciones cargan después de que el componente ya montó
watch(
  () => props.almacenOptions,
  (newOptions) => {
    establecerValorInicial(newOptions)
  },
  { immediate: true }, // El 'immediate' ayuda a cubrir ambos casos
)
</script>

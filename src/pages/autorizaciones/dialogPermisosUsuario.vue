<template>
  <q-dialog v-model="isOpen">
    <q-card :style="cardStyle" flat bordered>
      <q-card-section class="row items-center q-pb-none">
        <q-avatar icon="vpn_key" color="primary" text-color="white" />
        <span class="q-ml-sm text-h6">{{ title }}</span>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <q-table
          :rows="listaActivosData"
          :columns="colsPermisos"
          :loading="loading"
          row-key="idpermiso"
          flat
          bordered
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                label="Consumir"
                color="primary"
                size="sm"
                @click="procesarConsumo(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cerrar" v-close-popup />
      </q-card-actions>

      <q-inner-loading :showing="loading">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useSolicitudes } from 'src/composables/ventasSinStock/useSolicitudes'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: 'Permisos asignados al usuario' },
})

const emit = defineEmits(['update:modelValue', 'permiso-consumido'])

// Composables
const { loading, consumirPermiso, listarPermisosActivos } = useSolicitudes()
const idusuario = idusuario_md5()

// Data
const listaActivosData = ref([])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
// Columnas
const colsPermisos = [
  { name: 'index', label: 'N°', field: 'idpermiso', align: 'left' },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  {
    name: 'usuario',
    label: 'Solicitante',
    field: (row) => row.usuario?.usuario || 'N/A',
    align: 'left',
  },
  { name: 'fecha_inicio', label: 'Inicio', field: 'fecha_inicio', align: 'left' },
  { name: 'fecha_fin', label: 'Fin', field: 'fecha_fin', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'right' },
]

// Cargar datos cuando el diálogo se abra
watch(isOpen, (val) => {
  if (val) refreshAll()
})

async function refreshAll() {
  try {
    const activos = await listarPermisosActivos(idusuario)
    console.log('Permisos activos cargados:', activos)
    listaActivosData.value = activos || []
  } catch (error) {
    console.error('Error cargando permisos:', error)
  }
}

const procesarConsumo = async (permiso) => {
  // 1. Activamos manualmente el estado de carga
  loading.value = true

  // 2. Creamos una pausa artificial de 2 segundos (2000 ms)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    const res = await consumirPermiso({
      idpermiso: permiso.idpermiso,
      ver: 'consumirPermiso',
      idusuario_md5: idusuario,
      id_almacen: permiso.id_almacen,
    })

    // Simulacro de respuesta exitosa

    if (res) {
      emit('permiso-consumido', permiso)
      // refreshAll ya maneja el loading internamente si está bien programado
      await refreshAll()
    }
  } catch (error) {
    console.error('Error al consumir:', error)
  } finally {
    // 4. Nos aseguramos de apagar el loading si no se apagó en refreshAll
    loading.value = false
  }
}
</script>

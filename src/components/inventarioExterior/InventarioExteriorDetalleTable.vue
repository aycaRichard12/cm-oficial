<template>
  <div class="q-table__container q-mt-md" style="max-height: 500px; overflow-y: auto">
    <q-table
      :rows="rows"
      :columns="computedColumns"
      row-key="N°"
      bordered
      flat
      class="q-mt-sm"
      table-class="table-striped"
      table-header-class="thead-dark"
    >
      <template v-slot:body-cell-Opciones="props">
        <q-td
          :props="props"
          class="text-nowrap text-center"
          v-if="estado !== 1 && permisoInventarioExterno"
        >
          <q-btn
            v-if="editar"
            color="primary"
            icon="edit"
            @click="$emit('edit', props.row.id)"
            class="q-mr-sm"
            size="sm"
          />
          <q-btn
            v-if="eliminar"
            color="negative"
            icon="delete"
            @click="$emit('delete', props.row.id)"
            size="sm"
          />
        </q-td>
        <q-td :props="props" class="text-nowrap text-center" v-else>
          <q-btn color="info" icon="edit" class="q-mr-sm" size="sm" disable v-if="editar" />
          <q-btn color="info" icon="delete" size="sm" disable v-if="eliminar" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

const props = defineProps({
  rows: Array,
  columns: Array,
  estado: [Number, String],
  editar: [Boolean, Number],
  eliminar: [Boolean, Number]
})

defineEmits(['edit', 'delete'])

const permisoInventarioExterno = ref(false)
const IDMD5 = idempresa_md5()
const idUsuarioMD5 = idusuario_md5()

const computedColumns = computed(() => {
  if (permisoInventarioExterno.value) {
    return props.columns
  }
  return props.columns.filter(col => col.name !== 'Opciones')
})

async function verificarPermisoUsuario() {
  try {
    const { data: response } = await api.get(`listarOperaciones/${IDMD5}`)

    if (!response?.data || !Array.isArray(response.data)) {
      console.error('Respuesta inválida de permisos')
      return
    }

    const permisos = response.data.filter(
      item => item.idusuario === idUsuarioMD5 && item.estado === 1
    )

    permisoInventarioExterno.value = permisos.some(
      item => item.codigo === 'inventarioexterno'
    )

    console.log('Permisos cargados table:', permisos)
    console.log('Permiso inventario externo table:', permisoInventarioExterno.value)

  } catch (error) {
    console.error('Error al verificar permisos del usuario table:', error)
    permisoInventarioExterno.value = false
  }
}

onMounted(() => {
  verificarPermisoUsuario()
})
</script>

<style scoped>
.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}

.thead-dark th {
  background-color: #343a40;
  color: white;
}
</style>

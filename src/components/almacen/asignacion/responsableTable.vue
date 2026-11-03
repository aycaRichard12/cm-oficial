<template>
  <div class="flex justify-between">
    <q-btn
      color="primary"
      @click="$emit('add')"
      class="btn-res q-mt-lg"
      id="nuevaAsignacion"
      :title="$t('ui.asignar-almacen-087b8e')"
    >
      <q-icon name="add" class="icono" />
      <span class="texto"> <q-icon name="add" /> {{ $t('ui.nueva-asignacion-e3b420') }}</span>
    </q-btn>
    <div id="buscarAsignacion">
      <label for="buscar">{{ $t('common.search') }}</label>
      <q-input dense outlined debounce="300" v-model="search" id="buscar" />
    </div>
  </div>
  <q-table
    :title="$t('ui.responsables-a6d3cc')"
    :rows="rows"
    :columns="columns"
    :pagination="pagination"
    row-key="id"
    :filter="search"
    flat
    bordered
    id="tablaAsignacion"
  >
    <template v-slot:body-cell-opciones="props">
      <q-td>
        <q-btn-group outline flat>
          <q-btn
            dense
            icon="delete"
            color="negative"
            @click="eliminar(props.row.id)"
            :title="$t('common.delete')"
            flat
            id="eliminarAsignacion"
          />
          <q-btn
            dense
            icon="add_box"
            color="primary"
            @click="asignarAlmacenes(props.row)"
            :title="$t('ui.asignar-almacen-087b8e')"
            flat
            id="asignarAlmacenes"
          />
        </q-btn-group>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
/**
 * Componente de tabla para visualizar y gestionar responsables
 * Muestra lista de responsables con opciones para eliminar o asignar almacenes
 * @module components/TablaResponsables
 */

// ==================== DEPENDENCIAS ====================
import { ref } from 'vue'

// ==================== PROPS ====================
/**
 * Propiedades del componente
 * @property {Array} rows - Datos de responsables a mostrar en la tabla (requerido)
 */
defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// ==================== ESTADO REACTIVO ====================
const search = ref('') // Término de búsqueda para filtrar la tabla (implementación pendiente)

// ==================== CONFIGURACIÓN DE COLUMNAS ====================
/**
 * Definición de columnas para QTable
 * Cada columna especifica nombre, etiqueta visual y campo de datos
 */
const columns = [
  {
    name: 'usuario',
    label: i18nT('auth.user'),
    // Acceso anidado con operador optional chaining y fallback a string vacío
    field: (row) => row.usuario?.usuario || '',
    align: 'left',
  },
  {
    name: 'nombre',
    label: i18nT('configGeneral.tipoAlmacen.form.name'),
    field: (row) => row.usuario?.nombre || '',
  },
  {
    name: 'apellido',
    label: i18nT('ui.apellido-45b89a'),
    field: (row) => row.usuario?.apellido || '',
  },
  {
    name: 'cargo',
    label: i18nT('ui.cargo-6c98e8'),
    field: (row) => row.usuario?.cargo || '',
  },
  {
    name: 'opciones',
    label: i18nT('configGeneral.divisas.table.options'),
    field: '', // Campo vacío porque esta columna contiene botones de acción
    align: 'center',
  },
]

// ==================== EVENTOS ====================
const emit = defineEmits(['eliminar', 'asignar'])

// ==================== MANEJADORES DE ACCIONES ====================
/**
 * Emite evento para eliminar un responsable
 * @param {number|string} id - Identificador del responsable a eliminar
 */
function eliminar(id) {
  emit('eliminar', id)
}

/**
 * Emite evento para asignar almacenes a un responsable
 * @param {Object} responsable - Objeto completo del responsable seleccionado
 */
function asignarAlmacenes(responsable) {
  emit('asignar', responsable)
}
</script>

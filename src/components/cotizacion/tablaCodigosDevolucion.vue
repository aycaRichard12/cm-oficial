<template>
  <div class="detail-panel q-pa-none rounded-borders overflow-hidden">
    <div class="panel-header row items-center q-px-lg q-py-md bg-grey-1">
      <div class="row items-center">
        <q-avatar size="32px" color="primary" text-color="white">
          <q-icon :name="icon" size="20px" />
        </q-avatar>
        <div class="q-ml-md">
          <div class="text-subtitle1 text-weight-medium">{{ title }}</div>
          <div class="text-caption text-grey-7">ID Proceso Padre: {{ idpadre }}</div>
        </div>
      </div>
      <q-space />
      <q-badge outline color="primary" :label="`${modelValue.length} items en tabla`" />
    </div>

    <div class="q-px-lg q-pb-lg q-pt-sm">
      <div v-if="apiMode" class="q-mb-lg bg-blue-1 q-pa-md rounded-borders border-dashed">
        <div class="text-caption q-mb-sm text-weight-bold text-primary">
          Registrar Nuevo Movimiento de Producto
        </div>
        <div class="row q-col-gutter-sm items-end">
          <div class="col-12 col-sm-6">
            <q-select
              v-model="productoSeleccionado"
              :options="opcionesProductos"
              label="Seleccionar Producto Único"
              dense
              outlined
              bg-color="white"
              emit-value
              map-options
              option-label="serie"
              option-value="id"
              :rules="[(val) => !!val || 'Requerido']"
              hide-bottom-space
            >
              <template v-slot:no-option>
                <q-item
                  ><q-item-section class="text-grey"
                    >No hay productos disponibles</q-item-section
                  ></q-item
                >
              </template>
            </q-select>
          </div>
          <div class="col-auto">
            <q-checkbox
              v-model="nuevoEsMerma"
              label="¿Es Merma?"
              color="orange"
              dense
              class="q-pb-sm"
            />
          </div>
          <div class="col-grow text-right">
            <q-btn
              color="primary"
              label="Registrar"
              icon="add"
              class="full-width"
              :disable="!productoSeleccionado"
              @click="ejecutarRegistro"
            />
          </div>
        </div>
      </div>

      <q-markup-table flat bordered separator="cell" class="modern-table">
        <thead>
          <tr class="bg-grey-2">
            <th style="width: 60px">N°</th>
            <th>Código / Serie</th>
            <th style="width: 100px">Estado</th>
            <th class="text-center" style="width: 120px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sub, index) in modelValue" :key="sub.id">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="text-left">
              <div v-if="editandoId !== sub.id" class="row items-center">
                <q-icon name="fingerprint" color="primary" size="xs" class="q-mr-xs" />
                {{ sub.serie }}
              </div>
              <q-input
                v-else
                v-model="tempSerie"
                dense
                outlined
                autofocus
                @keyup.enter="confirmarEdicion(sub)"
              />
            </td>
            <td class="text-center">
              <q-badge
                :color="sub.es_merma ? 'orange' : 'green'"
                :label="sub.es_merma ? 'MERMA' : 'OK'"
              />
            </td>
            <td class="text-center">
              <div class="row q-gutter-xs justify-center">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="iniciarEdicion(sub)"
                />
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="ejecutarEliminacion(sub)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="modelValue.length === 0">
            <td colspan="4" class="text-center text-grey q-pa-md">No hay registros asociados.</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  modelValue: { type: Array, required: true }, // Los datos de la tabla
  idpadre: { type: [Number, String], required: true }, // El ID que enviaremos a la API
  opcionesProductos: { type: Array, default: () => [] }, // Viene del padre para el Select
  title: { type: String, default: 'Gestión de Devoluciones' },
  apiMode: { type: Boolean, default: true },
  icon: { type: String, default: 'inventory_2' },
})

const emit = defineEmits(['update:modelValue', 'registro-exitoso'])

// Estados Locales
const productoSeleccionado = ref(null)
const nuevoEsMerma = ref(false)
const editandoId = ref(null)
const tempSerie = ref('')

// --- ACCIÓN: REGISTRAR ---
async function ejecutarRegistro() {
  try {
    $q.loading.show()
    const formData = new FormData()
    formData.append('ver', 'registrar') // Acción según tu API
    formData.append('id_padre', props.idpadre)
    formData.append('id_producto_unico', productoSeleccionado.value)
    formData.append('es_merma', nuevoEsMerma.value ? 1 : 0)

    const response = await api.post('', formData)

    if (response.data.estado === 'exito') {
      // Actualizamos la tabla con el nuevo item que debería devolver la API
      const nuevaLista = [...props.modelValue, response.data.item]
      emit('update:modelValue', nuevaLista)

      // Limpiar formulario
      productoSeleccionado.value.ref = null
      nuevoEsMerma.value = false
      $q.notify({ type: 'positive', message: 'Registrado correctamente' })
    }
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al registrar' })
  } finally {
    $q.loading.hide()
  }
}

// --- ACCIÓN: ELIMINAR ---
async function ejecutarEliminacion(sub) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este registro?',
    cancel: true,
  }).onOk(async () => {
    try {
      $q.loading.show()
      const formData = new FormData()
      formData.append('ver', 'eliminar')
      formData.append('id', sub.id)

      const response = await api.post('', formData)
      if (response.data.estado === 'exito') {
        const nuevaLista = props.modelValue.filter((i) => i.id !== sub.id)
        emit('update:modelValue', nuevaLista)
        $q.notify({ type: 'positive', message: 'Eliminado' })
      }
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    } finally {
      $q.loading.hide()
    }
  })
}

// --- ACCIÓN: EDITAR ---
function iniciarEdicion(sub) {
  editandoId.value = sub.id
  tempSerie.value = sub.serie
}

async function confirmarEdicion(sub) {
  if (tempSerie.value === sub.serie) {
    editandoId.value = null
    return
  }

  try {
    const formData = new FormData()
    formData.append('ver', 'editar')
    formData.append('id', sub.id)
    formData.append('serie', tempSerie.value)

    const response = await api.post('', formData)
    if (response.data.estado === 'exito') {
      const nuevaLista = props.modelValue.map((i) =>
        i.id === sub.id ? { ...i, serie: tempSerie.value } : i,
      )
      emit('update:modelValue', nuevaLista)
      editandoId.value = null
      $q.notify({ type: 'positive', message: 'Actualizado' })
    }
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al editar' })
  }
}
</script>

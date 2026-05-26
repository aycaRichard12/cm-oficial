<template>
  <q-page padding class="q-pt-sm">
    <!-- Header -->
    <div class="row q-mb-sm">
      <div class="col-12">
        <q-card flat class="bg-white shadow-1 rounded-borders">
          <q-card-section class="q-pa-sm q-px-md">
            <div class="row items-center">
              <q-icon name="shortcut" color="primary" size="2.5rem" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold text-primary">Atajos Rápidos</div>
                <div class="text-subtitle2 text-grey-7">
                  Personaliza tus accesos directos en el inicio (Máximo 5)
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Formulario de selección -->
    <div class="row q-mb-sm">
      <div class="col-12">
        <q-card flat class="shadow-1 rounded-borders">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle1 q-mb-md text-weight-medium">Selecciona tus atajos</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-select
                  v-model="selectedShortcuts"
                  :options="availableOptions"
                  label="Módulos disponibles"
                  option-label="title"
                  option-value="codigo"
                  multiple
                  use-chips
                  stack-label
                  emit-value
                  map-options
                  :disable="loading"
                  :max-values="5"
                  hint="Máximo 5 atajos"
                  @update:model-value="validateLimit"
                >
                  <template v-slot:option="{ itemProps, opt, selected }">
                    <q-item v-bind="itemProps">
                      <q-item-section avatar>
                        <q-checkbox :model-value="selected" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ opt.title }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-4">
                <q-btn
                  label="Guardar Atajos"
                  color="primary"
                  :loading="loading"
                  :disable="selectedShortcuts.length === 0"
                  @click="saveShortcuts"
                  class="full-width"
                  icon="save"
                />
              </div>
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              <q-icon name="info" size="xs" /> Los atajos se mostrarán según las reglas: si no hay
              atajos → 4 accesos por defecto; 1 atajo → se añade a los 4 por defecto; 2 o más atajos
              → solo se muestran los atajos seleccionados.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de atajos actuales -->
    <div class="row">
      <div class="col-12">
        <q-card flat class="shadow-1 rounded-borders">
          <q-card-section class="q-pa-sm">
            <base-filterable-table
              title="Mis Atajos Configurados"
              :rows="currentShortcuts"
              :columns="tableColumns"
              row-key="id_operacion"
              no-data-label="No tienes atajos personalizados configurados"
            >
              <template v-slot:body-cell-num="props">
                <q-td :props="props">
                  {{ props.pageIndex + 1 }}
                </q-td>
              </template>
              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    icon="delete"
                    color="negative"
                    dense
                    flat
                    round
                    @click="deleteShortcut(props.row.id_operacion)"
                    size="sm"
                  >
                    <q-tooltip>Eliminar atajo</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </base-filterable-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import { getAvailableShortcuts } from 'src/pages/AtajosConfig/shortcutsRegistry'

const $q = useQuasar()
const loading = ref(false)
const IDMD5 = idempresa_md5()
const currentShortcuts = ref([])
const selectedShortcuts = ref([])

// Opciones disponibles desde el registro
const availableOptions = computed(() => {
  return getAvailableShortcuts().map((item) => ({
    codigo: item.codigo,
    title: item.title,
    id: item.id,
  }))
})

const tableColumns = [
  { name: 'num', label: 'N°', field: 'num', align: 'left' },
  { name: 'titulo', label: 'Módulo', field: 'operacion', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'center', field: 'acciones' },
]

// Cargar atajos existentes del usuario
const fetchUserShortcuts = async () => {
  loading.value = true
  try {
    const { data } = await api.get(`listarOperaciones/${IDMD5}`)
    console.log('Atajos obtenidos del servidor:', data)
    const allOps = data.data || []
    // Filtrar solo atajos (codigo empieza con 'shortcut_')
    const shortcuts = allOps.filter(
      (op) => op.codigo && op.codigo.startsWith('shortcut_') && op.estado == 1,
    )
    console.log('Atajos filtrados para el usuario:', shortcuts)
    // Enriquecer con información de usuario (el mismo usuario actual)
    const userId = getCurrentUserId()
    currentShortcuts.value = shortcuts
      .filter((s) => s.md5 == userId)
      .map((s, idx) => ({
        ...s,
        num: idx + 1,
      }))
    // Precargar selección actual en el multiselect
    selectedShortcuts.value = currentShortcuts.value.map((s) => s.codigo)
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al cargar atajos: ' + error })
  } finally {
    loading.value = false
  }
}

// Obtener ID del usuario actual (desde localStorage)
const getCurrentUserId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('mistersofts-cm') || '[]')
    return userData[0]?.idusuario || null
  } catch {
    return null
  }
}

// Validar límite de selección
const validateLimit = () => {
  if (selectedShortcuts.value.length > 5) {
    $q.notify({ color: 'warning', message: 'Máximo 5 atajos permitidos' })
    selectedShortcuts.value = selectedShortcuts.value.slice(0, 5)
  }
}

// Guardar atajos: eliminar todos los existentes y crear los nuevos seleccionados
const saveShortcuts = async () => {
  if (selectedShortcuts.value.length > 5) {
    $q.notify({ color: 'negative', message: 'No puedes guardar más de 5 atajos' })
    return
  }

  loading.value = true
  const userId = getCurrentUserId()
  console.log('Guardando atajos para usuario ID:', userId)
  console.log('Atajos seleccionados:', IDMD5)
  if (!userId) {
    $q.notify({ color: 'negative', message: 'No se pudo identificar al usuario' })
    loading.value = false
    return
  }

  try {
    //1. Eliminar atajos actuales
    for (const shortcut of currentShortcuts.value) {
      await api.get(`eliminarOperacion/${shortcut.id_operacion}`)
    }

    //2. Crear nuevos atajos seleccionados
    for (const codigo of selectedShortcuts.value) {
      const selectedOption = availableOptions.value.find((opt) => opt.codigo === codigo)

      const data = {
        ver: 'crearOperaciones',
        idmd5: IDMD5,
        idusuario: userId,
        codigo: codigo,
        operacion: selectedOption.title,
        estado: 1,
      }
      console.log(data)
      if (selectedOption) {
        const response = await api.post('', data)
        console.log('Respuesta al crear atajo:', response.data)
      }
    }

    $q.notify({ color: 'positive', message: 'Atajos guardados correctamente' })
    await fetchUserShortcuts()
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Error al guardar atajos' })
  } finally {
    loading.value = false
  }
}

// Eliminar un atajo individual
const deleteShortcut = async (idOperacion) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Deseas eliminar este atajo?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    try {
      await api.get(`eliminarOperacion/${idOperacion}`)
      $q.notify({ color: 'positive', message: 'Atajo eliminado' })
      await fetchUserShortcuts()
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Error al eliminar' })
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  fetchUserShortcuts()
})
</script>

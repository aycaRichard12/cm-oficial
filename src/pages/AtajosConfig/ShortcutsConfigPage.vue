<template>
  <q-page padding class="q-pt-sm">
    <!-- Header -->
    <div class="row q-mb-sm">
      <div class="col-12">
        <q-card flat class="cm-surface shadow-1 rounded-borders">
          <q-card-section class="q-pa-sm q-px-md">
            <div class="row items-center">
              <q-icon name="shortcut" color="primary" size="2.5rem" class="q-mr-md" />
              <div>
                <div class="text-h5 text-weight-bold text-primary">{{ $t('ui.atajos-rapidos-e63995') }}</div>
                <div class="text-subtitle2 text-grey-7">
                  {{ $t('ui.personaliza-tus-accesos-directos-en-el-inicio-maximo-eeefc9') }}
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
            <div class="text-subtitle1 q-mb-md text-weight-medium">{{ $t('ui.selecciona-tus-atajos-c4d4ad') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-8">
                <q-select
                  v-model="selectedShortcuts"
                  :options="availableOptions"
                  :label="$t('ui.modulos-disponibles-e83906')"
                  option-label="title"
                  option-value="codigo"
                  multiple
                  use-chips
                  stack-label
                  emit-value
                  map-options
                  :disable="loading"
                  :max-values="5"
                  :hint="$t('ui.maximo-5-atajos-e86307')"
                  @update:model-value="validateLimit"
                  @remove="onRemoveShortcut"
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
                  :label="$t('ui.guardar-atajos-1f5c31')"
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
              <q-icon name="info" size="xs" /> {{ $t('ui.los-atajos-se-mostraran-segun-las-reglas-si-no-hay-a-ea079d') }}
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
              :no-data-label="$t('ui.no-tienes-atajos-personalizados-configurados-52b966')"
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
                    <q-tooltip>{{ $t('ui.eliminar-atajo-ba8a83') }}</q-tooltip>
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
import { t as i18nT } from 'src/i18n/runtime'
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
  { name: 'num', label: i18nT('cotizacion.table.number'), field: 'num', align: 'left' },
  { name: 'titulo', label: i18nT('ui.modulo-49dbba'), field: 'operacion', align: 'left', sortable: true },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  { name: 'acciones', label: i18nT('common.actions'), align: 'center', field: 'acciones' },
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
    $q.notify({ color: 'negative', message: i18nT('ui.error-al-cargar-atajos-6937ef') + error })
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
    $q.notify({ color: 'warning', message: i18nT('ui.maximo-5-atajos-permitidos-362275') })
    selectedShortcuts.value = selectedShortcuts.value.slice(0, 5)
  }
}

// Guardar atajos: eliminar todos los existentes y crear los nuevos seleccionados
const saveShortcuts = async () => {
  if (selectedShortcuts.value.length > 5) {
    $q.notify({ color: 'negative', message: i18nT('ui.no-puedes-guardar-mas-de-5-atajos-42b646') })
    return
  }

  loading.value = true
  const userId = getCurrentUserId()
  console.log('Guardando atajos para usuario ID:', userId)
  console.log('Atajos seleccionados:', IDMD5)
  if (!userId) {
    $q.notify({ color: 'negative', message: i18nT('ui.no-se-pudo-identificar-al-usuario-8a5f39') })
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

    $q.notify({ color: 'positive', message: i18nT('ui.atajos-guardados-correctamente-4c927a') })
    await fetchUserShortcuts()
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: i18nT('ui.error-al-guardar-atajos-8caa18') })
  } finally {
    loading.value = false
  }
}

// Eliminar un atajo individual
const deleteShortcut = async (idOperacion) => {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: i18nT('ui.deseas-eliminar-este-atajo-cbafeb'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    try {
      await api.get(`eliminarOperacion/${idOperacion}`)
      $q.notify({ color: 'positive', message: i18nT('ui.atajo-eliminado-68b479') })
      await fetchUserShortcuts()
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: i18nT('ui.error-al-eliminar-7e52c8') })
    } finally {
      loading.value = false
    }
  })
}
// Manejar eliminación de un chip
const onRemoveShortcut = async (codigo) => {
  console.log(codigo)
  // Buscar si el atajo ya está guardado en la BD (aparece en la tabla)
  const existing = currentShortcuts.value.find((s) => s.codigo === codigo.value)

  // Si no existe en la tabla, solo se quitó del select; no hay nada que hacer
  if (!existing) {
    return
  }

  // Mostrar diálogo de confirmación
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `¿Eliminar el atajo "${existing.operacion}"?`,
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      loading.value = true
      try {
        await api.get(`eliminarOperacion/${existing.id_operacion}`)
        $q.notify({ color: 'positive', message: i18nT('ui.atajo-eliminado-correctamente-7131a6') })

        // Remover de la tabla local
        const idx = currentShortcuts.value.findIndex(
          (s) => s.id_operacion === existing.id_operacion,
        )
        if (idx > -1) currentShortcuts.value.splice(idx, 1)

        // El modelo selectedShortcuts ya fue actualizado automáticamente por Quasar
        // (ya no contiene el código), pero nos aseguramos por si acaso
        const selIdx = selectedShortcuts.value.indexOf(codigo)
        if (selIdx > -1) selectedShortcuts.value.splice(selIdx, 1)
      } catch (error) {
        console.error(error)
        $q.notify({ color: 'negative', message: i18nT('ui.error-al-eliminar-atajo-e3a14c') })
        // Revertir eliminación del chip en caso de error
        selectedShortcuts.value.push(codigo)
      } finally {
        loading.value = false
      }
    })
    .onCancel(() => {
      // Si el usuario cancela, restaurar el chip en el select
      selectedShortcuts.value.push(codigo.value)
    })
}
onMounted(() => {
  fetchUserShortcuts()
})
</script>

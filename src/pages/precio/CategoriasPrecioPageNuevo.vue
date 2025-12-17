<template>
  <q-page padding>
    <div class="titulo">Categorías de Precio</div>
    <div class="q-pa-md">
      <div flat bordered>
        <div class="q-ma-md">
          <q-btn
            color="primary"
            icon="add"
            label="Nueva Categoría"
            @click="openFormDialog('crear')"
            :loading="loading"
          />
        </div>

        <CategoriasPrecioTable
          :categorias="categorias"
          :loading="loading"
          @editar="handleEdit"
          @eliminar="handleDelete"
          @cambiar-estado="handleChangeStatus"
        />
      </div>
    </div>

    <q-dialog v-model="formDialog" persistent>
      <q-card style="width: 700px; max-width: 80vw">
        <q-toolbar>
          <q-toolbar-title>
            {{ formMode === 'crear' ? 'Crear' : 'Editar' }} Categoría
          </q-toolbar-title>
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <CategoriasPrecioForm
            ref="categoriaForm"
            :initial-data="currentCategory"
            :mode="formMode"
            @submit-form="handleSubmitForm"
            @cancel="formDialog = false"
            :is-submitting="isSubmitting"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import CategoriasPrecioTable from 'src/components/precios/CategoriaPrecioNuevo/CategoriasPrecioTable.vue'
import CategoriasPrecioForm from 'src/components/precios/CategoriaPrecioNuevo/CategoriasPrecioForm.vue'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
console.log('ID Empresa (md5):', idempresa)

// --- Estado Central y Configuración ---
const $q = useQuasar()
const categorias = ref([])
const loading = ref(false)
const isSubmitting = ref(false)

// Estado del Formulario
const formDialog = ref(false)
const formMode = ref('crear')
const currentCategory = ref(null)

// Referencia al componente hijo (Formulario) para exponer funciones
const categoriaForm = ref(null)

// --- Funciones de API (CRUD) ---

/**
 * Carga la lista de categorías desde la API.
 */
const fetchCategories = async () => {
  loading.value = true
  try {
    // API: GET /listarCategoriasPrecio/{idempresa}
    const response = await api.get(`/listarCategoriasPrecio/${idempresa}`)
    // Asumiendo que la respuesta es un array directo:
    console.log('Respuesta de categorías:', response.data)
    categorias.value = response.data || []
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las categorías. Intente de nuevo.',
    })
  } finally {
    loading.value = false
  }
}

/**
 * Maneja la creación o edición de una categoría.
 * @param {object} formData - Datos del formulario.
 */
const handleSubmitForm = async (formData) => {
  isSubmitting.value = true
  try {
    let payload = {}
    let successMessage = ''

    if (formMode.value === 'crear') {
      // API: POST - Crear
      payload = {
        ver: 'crearCategoriaPrecio',
        nombre_categoria: formData.nombre_categoria,
        estado: 1, // Siempre activo al crear, según el ejemplo
        porcentaje: formData.porcentaje,
        idempresa: idempresa,
      }
      successMessage = 'Categoría creada exitosamente.'
    } else if (formMode.value === 'editar') {
      // API: POST - Editar
      payload = {
        ver: 'editarCategoriaPrecioNuevo',
        id: currentCategory.value.id_categoria_precios, // Se obtiene del estado de edición
        nombre_categoria: formData.nombre_categoria,
        porcentaje: formData.porcentaje,
      }
      successMessage = 'Categoría actualizada exitosamente.'
    }
    console.log('Payload a enviar:', payload)
    const response = await api.post('', payload)
    console.log('Respuesta al guardar categoría:', response.data)

    // Nota: Es crucial verificar el formato de respuesta real de su API.
    // Aquí asumimos una respuesta exitosa general.
    if (response.data) {
      $q.notify({ type: 'positive', message: successMessage })
      formDialog.value = false
      await fetchCategories() // Recargar la lista
    } else {
      throw new Error('Respuesta inesperada de la API.')
    }
  } catch (error) {
    console.error('Error al guardar categoría:', error)
    $q.notify({
      type: 'negative',
      message: `Error al guardar: ${error.message || 'Error de conexión.'}`,
    })
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Maneja la eliminación de una categoría (mediante confirmación).
 * @param {object} categoria - Objeto de la categoría a eliminar.
 */
const handleDelete = (categoria) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar la categoría "${categoria.nombre_categoria}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    try {
      // API: GET /eliminarCategoriaPrecio/{id}
      const enpoint = `/eliminarCategoriaPrecioNuevo/${categoria.id_categoria_precios}`
      console.log('Endpoint para eliminar:', enpoint)
      const response = await api.get(enpoint)

      console.log('Respuesta al eliminar categoría:', response.data)
      // Asumiendo que la API devuelve algún indicador de éxito
      if (response.data) {
        $q.notify({ type: 'positive', message: 'Categoría eliminada.' })
        await fetchCategories()
      } else {
        throw new Error('No se pudo eliminar la categoría.')
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al intentar eliminar la categoría.',
      })
    } finally {
      loading.value = false
    }
  })
}

/**
 * Maneja el cambio de estado de una categoría (Activo/Inactivo).
 * @param {object} categoria - Objeto de la categoría a cambiar estado.
 */
const handleChangeStatus = async (categoria) => {
  console.log('Cambiar estado para categoría:', categoria)
  const nuevoEstado = categoria.estado === 1 ? 2 : 1
  loading.value = true
  try {
    // API: GET /cambiarEstadoCategoria/{id}/{estado}
    const endpoint = `/cambiarEstadoCategoria/${categoria.id_categoria_precios}/${nuevoEstado}`
    const response = await api.get(endpoint)
    console.log('Respuesta al cambiar estado:', response.data)
    if (response.data) {
      $q.notify({
        type: 'positive',
        message: `Estado cambiado a ${nuevoEstado === 1 ? 'Activo' : 'Inactivo'}.`,
      })
      // Actualizar localmente o recargar
      await fetchCategories()
    } else {
      throw new Error('Respuesta inesperada al cambiar estado.')
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar el estado.',
    })
  } finally {
    loading.value = false
  }
}

// --- Manejo del Formulario (Emits) ---

/**
 * Abre el diálogo de formulario en modo 'crear' o 'editar'.
 * @param {'crear' | 'editar'} mode - Modo del formulario.
 */
const openFormDialog = (mode, data = null) => {
  formMode.value = mode
  currentCategory.value = data ? { ...data } : null
  formDialog.value = true
  // Si el formulario ya está renderizado y se expone, podríamos llamar a
  // una función de reinicio, pero con la ref `currentCategory` y el v-if/v-model
  // del diálogo ya se maneja el estado de manera efectiva.
}

/**
 * Lógica cuando la tabla emite el evento de edición.
 * @param {object} categoria - La categoría a editar.
 */
const handleEdit = (categoria) => {
  openFormDialog('editar', categoria)
}

// --- Ciclo de Vida ---
onMounted(() => {
  fetchCategories()
})

// --- Exposición para Comandos Externos (Opcional en Page, pero demuestra la técnica) ---
// El Page expone funciones para que *otros* componentes fuera de la jerarquía
// (como un layout o un botón global) puedan interactuar.

defineExpose({
  fetchCategories,
  openFormDialog,
})
</script>

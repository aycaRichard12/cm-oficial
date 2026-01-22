<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Categoria Precio</div>
          <q-btn color="" icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <form-categoria-precio
            :isEditing="isEditing"
            :modal-value="formData"
            :almacenes="almacenes"
            :categorias="categorias"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <RegistrarAlmacenDialog
      v-model="showWarningDialog"
      title="¡Advertencia!"
      message="No tienes un almacén asignado. Debes asignarte uno o asignar un almacén a otros usuarios para desbloquear las funcionalidades del sistema."
      @accepted="redirectToAssignment"
      @closed="redirectToAssignment"
    />
    <table-categoria-precio
      :rows="lista"
      :almacenes="almacenes"
      @add="toggleForm"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import FormCategoriaPrecio from '../../components/precios/categoriaPrecio/FormCategoriaPrecio.vue'
import TableCategoriaPrecio from '../../components/precios/categoriaPrecio/TableCategoriaPrecio.vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useRouter } from 'vue-router'

import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'

const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()
const showForm = ref(false)
const isEditing = ref(false)
const lista = ref([])
const almacenes = ref([])
const formData = ref({
  ver: 'registrarCategoriaPrecio',
  idempresa: idempresa,
})
const categorias = ref([])

const router = useRouter()
const showWarningDialog = ref(false)

async function getAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((item) => item.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    console.log('datos de la respuestas', response)
    console.log('datos filtrados', filtrados.length)
    if (filtrados.length === 0) {
      showWarningDialog.value = true
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  }
}

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}

async function loadRows() {
  try {
    const response = await api.get(`listaCategoriaPrecio/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    lista.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}
function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarCategoriaPrecio',
    idempresa: idempresa,
  }
}
const fetchCategories = async () => {
  try {
    // API: GET /listarCategoriasPrecio/{idempresa}
    const response = await api.get(`/listarCategoriasPrecio/${idempresa}`)

    const filtrados = response.data.filter((item) => item.estado === 1)
    categorias.value = filtrados.map((item) => ({
      value: item.id_categoria_precios,
      label: item.nombre_categoria,
      porcentaje: item.porcentaje,
    }))
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las categorías. Intente de nuevo.',
    })
  }
}
const editUnit = (item) => {
  console.log(item)
  const { id, nombre, porcentaje, idalmacen, id_categoria_precios, almacen } = item
  const categoriaSeleccionada = id_categoria_precios
    ? { value: id_categoria_precios, label: nombre, porcentaje }
    : null
  formData.value = {
    ver: 'editarCategoriaPrecio',
    tipo: nombre,
    porcentaje: porcentaje,
    id: id,
    idalmacen: idalmacen,
    id_categoria_precios: id_categoria_precios,
    categoriaSeleccionada: categoriaSeleccionada,
    almacen: {
      value: idalmacen,
      label: almacen,
    },
  }

  isEditing.value = true
  showForm.value = true
}

const confirmDelete = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar "${item.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarCategoriaPrecio/${item.id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}

const toggleStatus = async (item) => {
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoCategoriaPrecio/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
    console.log(response)
    loadRows()
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const handleSubmit = async (data) => {
  console.log('Datos recibidos del formulario:', data)
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    if (isEditing.value) {
      const response = await api.post(``, formData)
      console.log(response)
    } else {
      const response = await api.post(``, formData)
      console.log(response)
    }
    $q.notify({
      type: 'positive',
      message: isEditing.value ? 'Editado correctamente' : 'Registrado correctamente',
    })
    loadRows()
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al guardar' + error,
    })
  }
  toggleForm()
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    showForm.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
onMounted(() => {
  loadRows()
  getAlmacenes()
  fetchCategories()
})
</script>

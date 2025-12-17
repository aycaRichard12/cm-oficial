<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <!-- Componente de la tabla -->
    <TablaCategorias
      :rows="categorias"
      @new-item="abrirModalNuevo"
      @edit-item="abrirModalEdicion"
      @delete-item="eliminarCategoria"
      @toggle-status="changeStatus"
    />

    <!-- Formulario en diálogo -->
    <q-dialog v-model="mostrarDialogo" persistent>
      <q-card class="responsive-dialog">
        <q-card class="my-card">
          <q-card-section class="bg-primary text-h6 text-white flex justify-between">
            <div>Registrar Categoria Producto</div>
            <q-btn color="" icon="close" @click="mostrarDialogo = false" flat round dense />
          </q-card-section>
          <q-card-section class="q-pa-none q-ma-md">
            <CategoriaForm
              :modalValue="registroActual"
              :editing="modoEdicion"
              :parentCategories="categoriasPadre"
              @submit="guardarCategoria"
              @cancel="cerrarDialogo"
            />
          </q-card-section>
        </q-card>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { api } from 'src/boot/axios'
import CategoriaForm from 'src/components/productoConf/categoria/categoriaForm.vue'
import TablaCategorias from 'src/components/productoConf/categoria/categoriaTable.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const $q = useQuasar()
// Datos
const categorias = ref([])
const categoriasPadre = ref([])

async function getCategorias() {
  try {
    const response = await api.get(`listaCategoriaProducto/${idempresa}`)
    const filtrados = response.data.filter((item) => item.estado == 1 && item.idp == 0)
    categoriasPadre.value = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    categorias.value = response.data
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  }
}
// Estado del diálogo y formulario
const mostrarDialogo = ref(false)
const modoEdicion = ref(false)
const registroActual = ref({})

// Abrir para nuevo registro
function abrirModalNuevo() {
  modoEdicion.value = false
  registroActual.value = {
    ver: 'registrarCategoriaProducto',
    idempresa: idempresa,
    nombre: '',
    descripcion: '',
    tipoCP: null,
    idpadreCP: null,
  }
  mostrarDialogo.value = true
}

// Abrir para edición
function abrirModalEdicion(item) {
  console.log(item)
  modoEdicion.value = true
  registroActual.value = {
    ...item.originalData,
    ver: 'editarCategoriaProducto',
    idempresa: idempresa,
    nombre: item.originalData.nombre, // según tipo
    tipoCP: item.subcategoria ? 1 : 2,
  }
  mostrarDialogo.value = true
}

// Guardar nuevo o editado
async function guardarCategoria(data) {
  console.log(data)
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  let response
  if (modoEdicion.value) {
    response = await api.post('', formData)
  } else {
    response = await api.post('', formData)
  }
  console.log(response)
  if (response.data.estado === 'exito') {
    mostrarDialogo.value = false
    getCategorias()
    $q.notify({ type: 'positive', message: response.data.mensaje || 'Categoria Guardado' })
    return response
  } else {
    $q.notify({ type: 'negative', message: response.data.mensaje || 'Categoria No Guardado' })
  }
}

// Cancelar
function cerrarDialogo() {
  mostrarDialogo.value = false
}

// Eliminar categoría
function eliminarCategoria(item) {
  console.log(item)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Categoria?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarCategoriaProducto/${item.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        getCategorias()

        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
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
async function changeStatus(item) {
  console.log(item)
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoCategoriaProducto/${item.id}/${nuevoEstado}`) // Cambia a tu ruta real
    console.log(response)
    getCategorias()
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
function handleKeydown(e) {
  if (e.key === 'Escape') {
    mostrarDialogo.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
onMounted(() => {
  getCategorias()
})
</script>

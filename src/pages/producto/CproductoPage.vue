<template>
  <q-page padding>
    <q-dialog v-model="showForm">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Registrar Producto o Servicio</div>
          <q-btn icon="close" @click="toggleForm" dense flat round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <producto-form
            :isEditing="isEditing"
            :model-value="formData"
            :categorias="categorias"
            :estados="estados"
            :subcategorias="subcategorias"
            :unidades="unidades"
            :medidas="medidas"
            :productoSIN="ProductoSin"
            :unidadSIN="UnidadSin"
            @submit="handleSubmit"
            @cancel="toggleForm"
            @categoria-changed="loadsubcategorias"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <producto-tabla
      :rows="productos"
      @add="toggleForm"
      @mostrarReporte="mostrarReporte"
      @edit-item="editUnit"
      @delete-item="confirmDelete"
      @toggle-status="toggleStatus"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios' // Asegúrate de tener esto configurado
import { idempresa_md5, validarUsuario } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import ProductoForm from 'src/components/producto/creacion/productoForm.vue'
import ProductoTabla from 'src/components/producto/creacion/productoTable.vue'
import { imagen } from 'src/boot/url'
import { getTipoFactura, getToken } from 'src/composables/FuncionesG'

const tipoFactura = getTipoFactura(true)
console.log('Tipo Factura:', tipoFactura)
const idempresa = idempresa_md5()
const contenidousuario = validarUsuario()
console.log(contenidousuario)
const token = getToken()
console.log('Token:', token)
const productos = ref([])

const categorias = ref([])

const estados = ref([])
const subcategorias = ref([])
const unidades = ref([])
const medidas = ref([])
const $q = useQuasar()
const isEditing = ref(false)
const showForm = ref(false)
const formData = ref({
  ver: 'registrarProducto',
  idempresa: idempresa,
})
const ProductoSin = ref([])
const UnidadSin = ref([])
async function loadRows() {
  try {
    const tipo = getTipoFactura()
    let response
    const point = `listaProducto/${idempresa}/${token}/${tipo}` // Ruta con factura

    console.log('Endpoint:', point)
    response = await api.get(`${point}`) // Cambia a tu ruta con factura
    console.log(response)
    productos.value = response.data // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

async function loadcategorias() {
  try {
    const response = await api.get(`listaCategoriaProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1 && u.idp == 0)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    categorias.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadestados() {
  try {
    const response = await api.get(`listaEstadoProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    estados.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los Estados de Producto',
    })
  }
}
async function loadsubcategorias(idcategoria) {
  console.log('idcategoria:', idcategoria)

  if (!idcategoria) {
    subcategorias.value = []
    return
  }
  try {
    const response = await api.get(`listaCategoriaProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(formData.value)
    const filtrados = response.data.filter((u) => u.estado == 1 && u.idp == idcategoria)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    subcategorias.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadunidades() {
  try {
    const response = await api.get(`listaUnidadProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1)
    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    unidades.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function ListaProductoSin() {
  if (!tipoFactura) {
    return
  }
  const contenidousuario = validarUsuario()
  const token = contenidousuario[0]?.factura?.access_token
  const tipo = contenidousuario[0]?.factura?.tipo
  const endpoint = `listaproductoSIN/productossin/${token}/${tipo}`
  try {
    const response = await api.get(endpoint) // Cambia a tu ruta real
    console.log(response)
    const res = response.data
    if (res.status == 'success') {
      const formateado = res.data.map((item) => ({
        label: item.descripcion,
        value: item.codigo,
      }))
      ProductoSin.value = formateado
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function ListaUnidadSin() {
  if (!tipoFactura) {
    return
  }
  const contenidousuario = validarUsuario()
  const token = contenidousuario[0]?.factura?.access_token
  const tipo = contenidousuario[0]?.factura?.tipo
  const endpoint = `listaproductoSIN/unidadsin/${token}/${tipo}`
  try {
    const response = await api.get(endpoint) // Cambia a tu ruta real
    console.log(response)
    const res = response.data
    if (res.status == 'success') {
      const formateado = res.data.map((item) => ({
        label: item.descripcion,
        value: item.codigo,
      }))
      UnidadSin.value = formateado
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
async function loadmedidas() {
  try {
    const response = await api.get(`listaCaracteristicaProducto/${idempresa}`) // Cambia a tu ruta real
    console.log(response)
    const filtrados = response.data.filter((u) => u.estado == 1)

    const formateado = filtrados.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
    medidas.value = formateado // Asume que la API devuelve un array
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const handleSubmit = async (data) => {
  console.log(data)
  if (data.categoria || data.categoria == '') {
    console.log('entro')
    data.categoria = data.subcategoria
  }
  console.log(data)
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    if (isEditing.value) {
      const response = await api.post(``, formData)
      console.log(response.data)
    } else {
      const response = await api.post(``, formData)

      console.log(response.data)
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
const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
    subcategorias.value = [] // limpia subcategorías
  }
}
function resetForm() {
  isEditing.value = false
  formData.value = {
    ver: 'registrarProducto',
    idempresa: idempresa,
  }
}
const editUnit = async (row) => {
  const tipo = getTipoFactura()
  const endpoint = `verificarExistenciaProducto/${row.id}/${token}/${tipo}`
  console.log(endpoint)
  const response = await api.get(endpoint) // Cambia a tu ruta real
  console.log(response.data)
  const item = response.data.datos
  console.log(item)
  formData.value = {
    ver: 'editarProducto',
    id: item.id,
    idempresa: idempresa,
    codigo: item.codigo,
    nombre: item.nombre,
    descripcion: item.descripcion,
    codigobarras: item.codbarras,
    categoria: item.idsubcategoria,
    subcategoria: item.idcategoria,
    estadoproductos: item.idestadoproducto,
    unidad: item.idunidad,
    medida: item.idmedida,
    caracteristica: item.caracteristica,
    vista: imagen + item.imagen,
    imagen: item.imagen,
    codigosin: tipoFactura ? item.productosin[0].codigo : '',
    unidadsin: tipoFactura ? item.unidadsin[0].codigo : '',
    codigoNandina: tipoFactura ? item.codigonandina : '',
  }
  loadsubcategorias(item.idcategoria)
  isEditing.value = true
  showForm.value = true
}

const confirmDelete = (row) => {
  console.log(row)

  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Proveedor "${row.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarProducto/${row.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
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
onMounted(() => {
  loadcategorias()
  loadestados()
  loadmedidas()
  loadsubcategorias()
  loadunidades()
  loadRows()
  if (getTipoFactura(true)) {
    ListaProductoSin()
    ListaUnidadSin()
  }
})
</script>

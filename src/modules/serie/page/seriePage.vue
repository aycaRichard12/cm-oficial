<template>
  <q-page padding>
    <q-dialog v-model="showForm">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white flex justify-between">
          <div class="text-h6">{{ isEditing ? 'Editar Serie' : 'Nueva Serie' }}</div>
          <q-btn icon="close" dense flat round @click="toggleForm" />
        </q-card-section>
        <q-card-section>
          <serie-form
            :model-value="formData"
            :productos="productos"
            :is-editing="isEditing"
            @submit="handleSubmit"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <serie-table
      :rows="series"
      :loading="cargando"
      :productos="productos"
      @add="toggleForm"
      @edit-item="editItem"
      @delete-item="confirmDelete"
      @toggleStatus="toggleStatus"
      @delete-variante="confirmDeleteVariante"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api, apiP } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { getTipoFactura, getToken } from 'src/composables/FuncionesG'
import { useQuasar } from 'quasar'
//import { objectToFormData } from 'src/composables/FuncionesGenerales'

import SerieForm from '../components/serieForm.vue'
import SerieTable from '../components/serieTable.vue'

const $q = useQuasar()
const idempresa = idempresa_md5()

const series = ref([])
const productos = ref([])
const cargando = ref(false)
const showForm = ref(false)
const isEditing = ref(false)

const formData = ref({
  ver: 'registrar_serie',
  serie: '',
  producto_idproducto: null,
  estado: 1,
  variantes: [],
})

const resetForm = () => {
  formData.value = {
    ver: 'registrar_serie',
    serie: '',
    producto_idproducto: null,
    estado: 1,
    variantes: [],
  }
  isEditing.value = false
}

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    resetForm()
  }
}

async function loadProductos() {
  try {
    const token = getToken()
    const tipo = getTipoFactura()
    let point = ``
    if (token && tipo && getTipoFactura(true) && getToken(true)) {
      point = `listaProducto/${idempresa}/${token}/${tipo}`
    } else {
      point = `listaProducto/${idempresa}/`
    }
    const response = await api.get(point)
    productos.value = response.data || []
  } catch (error) {
    console.error('Error al cargar productos:', error)
  }
}

async function loadSeries() {
  try {
    cargando.value = true
    const response = await apiP.get('listar_series')
    series.value = (response.data || []).map((x, indice) => ({
      ...x, // spread existing properties
      indice: indice + 1, // add/overwrite `indice`
    }))
  } catch (error) {
    console.error('Error al cargar series:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar las series' })
  } finally {
    cargando.value = false
  }
}

const handleSubmit = async (data) => {
  // const fData = new FormData()
  // for (const key in data) {
  //   if (key === 'variantes' && Array.isArray(data[key])) {
  //     data[key].forEach((v) => fData.append('variantes[]', v))
  //   } else if (data[key] !== null && data[key] !== undefined) {
  //     fData.append(key, data[key])
  //   } else {
  //     fData.append(key, '')
  //   }
  // }

  try {
    const response = await apiP.post('', data)
    const res = response.data

    // res[0] is typically status: "success" | "danger"
    if (res && res[0] === 'success') {
      $q.notify({
        type: 'positive',
        message: res[1] || 'Guardado correctamente',
      })
      loadSeries()
      toggleForm()
    } else {
      $q.notify({
        type: 'negative',
        message: res && res[1] ? res[1] : 'Ocurrió un error al guardar',
      })
    }
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({ type: 'negative', message: 'Error en la petición' })
  }
}

const editItem = (row) => {
  formData.value = {
    ver: 'editar_serie',
    id: row.idserie, // php expects 'id' in $data['id']
    serie: row.serie,
    producto_idproducto: row.producto_idproducto,
    estado: row.estado,
    variantes: row.variantes ? row.variantes.map((v) => v.id_Producto_Variante) : [],
  }
  isEditing.value = true
  showForm.value = true
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar serie "${row.serie}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await apiP.get(`eliminar_serie/${row.idserie}`)
      const res = response.data
      if (res && res[0] === 'success') {
        $q.notify({ type: 'positive', message: res[1] })
        loadSeries()
      } else {
        $q.notify({ type: 'negative', message: res[1] })
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar serie' })
    }
  })
}

const toggleStatus = async (row) => {
  try {
    const response = await apiP.get(`cambiar_estado_serie/${row.idserie}/${row.estado}`)
    const res = response.data
    if (res && res[0] === 'success') {
      $q.notify({ type: 'positive', message: res[1] })
    } else {
      $q.notify({ type: 'negative', message: res[1] || 'Error al cambiar estado' })
      loadSeries() // revert local change
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
    loadSeries()
  }
}

const confirmDeleteVariante = (payload) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Quitar la variante "${payload.sku || payload.id_Producto_Variante}" de esta serie?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await apiP.get(
        `eliminar_variante_de_serie/${payload.idserie}/${payload.id_Producto_Variante}`,
      )
      const res = response.data
      if (res && res[0] === 'success') {
        $q.notify({ type: 'positive', message: res[1] })
        loadSeries()
      } else {
        $q.notify({ type: 'negative', message: res[1] || 'Error al quitar variante' })
      }
    } catch (error) {
      console.error('Error al quitar variante:', error)
      $q.notify({ type: 'negative', message: 'Error al quitar variante de la serie' })
    }
  })
}

onMounted(() => {
  loadProductos()
  loadSeries()
})
</script>

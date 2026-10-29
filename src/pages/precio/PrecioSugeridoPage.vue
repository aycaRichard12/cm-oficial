<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <!-- Icono representativo para precios sugeridos o análisis de mercado -->
          <q-icon name="trending_up" size="md" class="q-mr-sm" />
          {{ $t('ui.precios-sugeridos-43a81c') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.gestion-de-estrategias-y-valores-de-venta-recomendad-fddc11') }}
        </div>
      </div>
    </div>
    <q-dialog v-model="showForm">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>{{ $t('ui.nuevo-precio-sugerido-e2ffb2') }}</div>
          <q-btn icon="close" flat dense rounf @click="showForm = false" />
        </q-card-section>
        <q-card-section>
          <form-precio-sugerido
            :isEditing="isEditing"
            :modalValue="ProductoSeleccionado"
            @submit="guardarPrecioBase"
            @cancel="toggleForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <table-precio-sugerido
      :rows="productos"
      :almacenes="listaAlmacenes"
      :loading="cargando"
      @edit="abrirFormularioEditar"
    />
    <RegistrarAlmacenDialog
      v-model="showWarningDialog"
      :title="$t('ui.advertencia-0ef76a')"
      :message="$t('ui.no-tienes-un-almacen-asignado-debes-asignarte-uno-o-2b40f1')"
      @accepted="redirectToAssignment"
      @closed="redirectToAssignment"
    />
  </q-page>
</template>
<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted } from 'vue'

import FormPrecioSugerido from 'src/components/precios/PrecioSugerido/FormPrecioSugerido.vue'
import TablePrecioSugerido from 'src/components/precios/PrecioSugerido/TablePrecioSugerido.vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'

const showForm = ref(false)
const isEditing = ref(false)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const listaAlmacenes = ref([])
const productos = ref([])
const ProductoSeleccionado = ref({
  ver: '',
  idempresa: idempresa,
})
const $q = useQuasar()
const router = useRouter()
const showWarningDialog = ref(false)

const cargarListaAlmacenes = async () => {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    console.log(response.data)
    console.log(idusuario)
    const filtrado = response.data.filter((u) => u.idusuario == idusuario)
    let formateado = filtrado.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    if (filtrado.length === 0) {
      showWarningDialog.value = true
    }

    listaAlmacenes.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}
const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}

const guardarPrecioBase = async (data) => {
  console.log('Datos recibidos del formulario:', data)
  const formData = objectToFormData(data)
  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }
  try {
    let response
    if (isEditing.value) {
      response = await api.post(``, formData)
    } else {
      response = await api.post(``, formData)
    }
    console.log(response)
    if (response.data.estado === 'exito') {
      loadRows()

      $q.notify({
        type: 'positive',
        message: response.data.mensaje || i18nT('ui.guardado-correctamente-ab0571'),
      })
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || i18nT('ui.hubo-un-problema-al-guardar-f513bf'),
      })
    }
  } catch (error) {
    console.error('Error al guardar: ', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.no-se-pudo-guardar-01dee4'),
    })
  }
  toggleForm()
}
const abrirFormularioEditar = async (item) => {
  console.log('Editar item:', item)
  isEditing.value = true
  showForm.value = true
  console.log(item)
  try {
    const response = await api.get(`verificarExistenciaPrecioSugerido/${item.id}`)
    console.log(response.data)
    if (response.data.estado == 'exito') {
      ProductoSeleccionado.value = {
        ver: 'editarPrecioSugerido',
        idempresa: idempresa,
        id: response.data?.datos?.id,
        descripcion: response.data?.datos?.codigo + ' ' + response.data?.datos?.descripcion,
        precioActual: response.data?.datos?.precio,
        idproducto: item.idproducto,
        afectarTodosAlmacenes: false,
        idporcentaje: item.idporcentaje,
      }

      console.log(ProductoSeleccionado.value)
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
}
async function loadRows() {
  try {
    const response = await api.get(`listaPrecioSugerido/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    if (listaAlmacenes.value.length === 0) {
      showWarningDialog.value = true
      return 0
    }
    productos.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
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
  ProductoSeleccionado.value = {
    ver: '',
    idempresa: idempresa,
  }
}
onMounted(() => {
  cargarListaAlmacenes()
  loadRows()
})
</script>

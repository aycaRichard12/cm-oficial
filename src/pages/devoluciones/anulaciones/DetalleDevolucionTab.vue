<template>
  <q-tab-panel name="detalleDevolucion">
    <div class="q-mb-md">
      <q-btn
        icon="arrow_back"
        label="Volver"
        color="primary"
        @click="$emit('volver')"
        class="q-mb-md"
      />

      <h4 class="text-h6 q-mb-md">Detalle de devolución</h4>

      <q-form @submit="actualizarDetalleDev">
        <div class="row q-col-gutter-md">
          <q-input
            v-model="formDetalleDev.producto"
            label="Producto"
            outlined
            dense
            disable
            class="col-12 col-md-4"
          />

          <q-input
            v-model="formDetalleDev.cantidadTotal"
            label="Cant. Venta"
            outlined
            dense
            disable
            class="col-12 col-md-2"
          />

          <q-input
            v-model="formDetalleDev.cantidadDevuelta"
            label="Cant. Devuelta*"
            outlined
            dense
            type="number"
            :rules="[(val) => val >= 0 || 'Debe ser un número positivo']"
            class="col-12 col-md-2"
          />

          <q-select
            v-model="formDetalleDev.perdida"
            :options="opcionesPerdida"
            label="Pérdida*"
            outlined
            dense
            emit-value
            map-options
            class="col-12 col-md-2"
          />

          <q-input
            v-model="formDetalleDev.cantidadPerdida"
            label="Cant. Pérdida*"
            outlined
            dense
            type="number"
            :rules="[(val) => val >= 0 || 'Debe ser un número positivo']"
            :disable="formDetalleDev.perdida === 2"
            class="col-12 col-md-2"
          />

          <div class="col-12">
            <div class="row q-gutter-sm">
              <q-btn label="Actualizar" type="submit" color="primary" />

              <q-btn label="Borrar" type="reset" color="primary" flat @click="resetForm" />

              <q-space />

              <q-btn
                label="Cancelar Devolución"
                color="negative"
                @click="eliminarDevolucion"
              />

              <q-btn
                label="Confirmar Devolución"
                color="positive"
                @click="confirmarAutorizarDevolucion"
              />
            </div>
          </div>
        </div>
      </q-form>
    </div>

    <q-table
      title="Devoluciones"
      :rows="detalles"
      :columns="columnas"
      row-key="id"
      :loading="loading"
      flat
    >
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn
            icon="edit"
            color="info"
            dense
            round
            @click="editarDetalle(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-tab-panel>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesG'

const props = defineProps({
  idDevolucion: { type: [Number, String], default: null }
})

const emit = defineEmits(['volver', 'finalizado'])

const $q = useQuasar()
const loading = ref(false)
const detalles = ref([])

const formDetalleDev = ref({
  idDevolucion: '',
  idDetalle: '',
  producto: '',
  cantidadTotal: 0,
  cantidadDevuelta: 0,
  perdida: 1,
  cantidadPerdida: 0,
  cantidadPerdidaHidden: 0,
})

const opcionesPerdida = ref([
  { value: 1, label: 'Si' },
  { value: 2, label: 'No' },
])

const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'cantidad', label: 'Cant. devuelta', field: 'cantidad', align: 'right' },
  {
    name: 'perdida',
    label: 'Pérdida',
    field: (row) => (row.perdida === 1 ? 'Si' : 'No'),
    align: 'center',
  },
  { name: 'cantidadperdida', label: 'Cant. pérdida', field: 'cantidadperdida', align: 'right' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

// Fetch data logic (Moved from Main Page to here as it is very specific)
const listarDatosDetalleDevolucion = async (id) => {
  if (!id) return
  loading.value = true

  try {
    const response = await api.get(`listadetalledevolicion/${id}`)
    if (response.data.estado === 'error') {
      throw new Error(response.data.error)
    }

    detalles.value = response.data.map((key, index) => ({
      ...key,
      numero: index + 1,
    }))
  } catch (error) {
    console.error('Error al listar detalle de devolución:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar detalle de devolución' })
  } finally {
    loading.value = false
  }
}

const editarDetalle = async (row) => {
  try {
    const response = await api.get(`verificarExistenciaDetalledevolucion/${row.id}`)

    if (response.data.estado === 'exito') {
      formDetalleDev.value = {
        idDevolucion: props.idDevolucion,
        idDetalle: response.data.datos.id,
        producto: response.data.datos.descripcion,
        cantidadTotal:
          parseInt(response.data.datos.cantidad) + parseInt(response.data.datos.cantidadperdida),
        cantidadDevuelta: response.data.datos.cantidad,
        perdida: response.data.datos.perdida,
        cantidadPerdida: response.data.datos.cantidadperdida,
        cantidadPerdidaHidden: response.data.datos.cantidadperdida,
      }
    }
  } catch (error) {
    console.error('Error al cargar detalle para edición:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar detalle para edición' })
  }
}

const actualizarDetalleDev = async () => {
  try {
    $q.loading.show({ message: 'Actualizando detalle...' })

    const formData = new FormData()
    formData.append('ver', 'actualizarDetalleDev')
    formData.append('id', formDetalleDev.value.idDetalle)
    formData.append('cantidad', formDetalleDev.value.cantidadDevuelta)
    formData.append('perdida', formDetalleDev.value.perdida)
    formData.append('cantidadperdida', formDetalleDev.value.cantidadPerdida)

    const response = await api.post('', formData)

    if (response.data.estado === 100) {
      $q.notify({ type: 'positive', message: 'Detalle actualizado correctamente' })
      resetForm()
      await listarDatosDetalleDevolucion(props.idDevolucion)
    } else {
      throw new Error(response.data.error || 'Error al actualizar detalle')
    }
  } catch (error) {
    console.error('Error al actualizar detalle:', error)
    $q.notify({ type: 'negative', message: 'Error al actualizar detalle' })
  } finally {
    $q.loading.hide()
  }
}

const resetForm = () => {
  formDetalleDev.value = {
    idDevolucion: props.idDevolucion,
    idDetalle: '',
    producto: '',
    cantidadTotal: 0,
    cantidadDevuelta: 0,
    perdida: 1,
    cantidadPerdida: 0,
    cantidadPerdidaHidden: 0,
  }
}

const eliminarDevolucion = () => {
  $q.dialog({
    title: '¿Está seguro?',
    message: 'No podrá recuperar este registro',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando devolución...' })
      const response = await api.get(`eliminarDevolucion/${props.idDevolucion}`)

      if (response.data.estado === 100) {
        $q.notify({ type: 'positive', message: 'Devolución eliminada con éxito' })
        emit('finalizado')
      } else {
        throw new Error(response.data.error || 'Error al eliminar devolución')
      }
    } catch (error) {
      console.error('Error al eliminar devolución:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar devolución' })
    } finally {
      $q.loading.hide()
    }
  })
}

const confirmarAutorizarDevolucion = () => {
  $q.dialog({
    title: '¿Está seguro?',
    message: 'Al aceptar el stock de productos se actualizará',
    cancel: true,
    persistent: true,
  }).onOk(autorizarDevolucion)
}

const autorizarDevolucion = async () => {
  try {
    const usuarioResponse = validarUsuario()
    const usuario = usuarioResponse[0]
    const idusuario = usuario?.idusuario
    
    $q.loading.show({ message: 'Autorizando devolución...' })

    const response = await api.get(`autorizarDevolucion/${props.idDevolucion}/1/${idusuario}`)

    if (response.data.estado === 100) {
      $q.notify({ type: 'positive', message: 'Devolución registrada con éxito' })
      emit('finalizado')
    } else {
      throw new Error(response.data.error || 'Error al autorizar devolución')
    }
  } catch (error) {
    console.error('Error al autorizar devolución:', error)
    $q.notify({ type: 'negative', message: 'Error al autorizar devolución' })
  } finally {
    $q.loading.hide()
  }
}

watch(() => props.idDevolucion, (newVal) => {
  if (newVal) {
    listarDatosDetalleDevolucion(newVal)
  }
}, { immediate: true })
</script>

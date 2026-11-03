<template>
  <q-tab-panel name="detalleDevolucion">
    <div class="q-mb-md">
      <q-btn
        icon="arrow_back"
        :label="$t('ui.volver-84a715')"
        color="primary"
        @click="$emit('volver')"
        class="q-mb-md"
      />

      <h4 class="text-h6 q-mb-md">{{ $t('ui.detalle-de-devolucion-c630c6') }}</h4>

      <q-form @submit="actualizarDetalleDev">
        <div class="row q-col-gutter-md">
          <q-input
            v-model="formDetalleDev.producto"
            :label="$t('inventario.product')"
            outlined
            dense
            disable
            class="col-12 col-md-4"
          />

          <q-input
            v-model="formDetalleDev.cantidadTotal"
            :label="$t('ui.cant-venta-c4d03b')"
            outlined
            dense
            disable
            class="col-12 col-md-2"
          />

          <q-input
            v-model="formDetalleDev.cantidadDevuelta"
            :label="$t('ui.cant-devuelta-db49f2')"
            outlined
            dense
            type="number"
            :rules="[(val) => val >= 0 || $t('ui.debe-ser-un-numero-positivo-daaec1')]"
            class="col-12 col-md-2"
          />

          <q-select
            v-model="formDetalleDev.perdida"
            :options="opcionesPerdida"
            :label="$t('ui.perdida-335820')"
            outlined
            dense
            emit-value
            map-options
            class="col-12 col-md-2"
          />

          <q-input
            v-model="formDetalleDev.cantidadPerdida"
            :label="$t('ui.cant-perdida-914125')"
            outlined
            dense
            type="number"
            :rules="[(val) => val >= 0 || $t('ui.debe-ser-un-numero-positivo-daaec1')]"
            :disable="formDetalleDev.perdida === 2"
            class="col-12 col-md-2"
          />

          <div class="col-12">
            <div class="row q-gutter-sm">
              <q-btn :label="$t('configuracion.servicios.dialog.update')" type="submit" color="primary" />

              <q-btn :label="$t('ui.borrar-d7b82b')" type="reset" color="primary" flat @click="resetForm" />

              <q-space />

              <q-btn :label="$t('ui.cancelar-devolucion-41bad0')" color="negative" @click="eliminarDevolucion" />

              <q-btn
                :label="$t('ui.confirmar-devolucion-6be543')"
                color="positive"
                @click="confirmarAutorizarDevolucion"
              />
            </div>
          </div>
        </div>
      </q-form>
    </div>

    <q-table
      :title="$t('ui.devoluciones-c4cbac')"
      :rows="detalles"
      :columns="columnas"
      row-key="id"
      :loading="loading"
      flat
    >
      <template v-slot:body="props">
        <q-tr :props="props" :class="props.expand ? 'bg-blue-1' : ''">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="primary"
              flat
              round
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            >
              <q-tooltip>{{ $t('ui.ver-detalles-de-codigos-9e0689') }}</q-tooltip>
            </q-btn>
          </q-td>

          <q-td key="codigo" :props="props">
            <q-chip outline color="primary" label-slot dense>
              <q-icon name="qr_code" size="xs" class="q-mr-xs" />
              {{ props.row.codigo }}
            </q-chip>
          </q-td>

          <q-td key="descripcion" :props="props">
            <div class="text-weight-bold">{{ props.row.descripcion }}</div>
          </q-td>

          <q-td key="precio" :props="props" class="text-right">
            {{ decimas(props.row.precio) }}
          </q-td>

          <q-td key="cantidad" :props="props" class="text-right">
            <q-badge color="grey-8">{{ props.row.cantidad }}</q-badge>
          </q-td>
          <q-td key="perdida" :props="props" class="text-right">
            <q-badge color="grey-8">{{ props.row.perdida }}</q-badge>
          </q-td>
          <q-td key="cantidadperdida" :props="props" class="text-right">
            <q-badge color="grey-8">{{ props.row.cantidadperdida }}</q-badge>
          </q-td>

          <q-td key="acciones" :props="props" align="center">
            <q-btn icon="edit" color="info" dense round @click="editarDetalle(props.row)" />
          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props" class="expanded-row-premium">
          <q-td colspan="100%" class="q-pa-lg"> </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-tab-panel>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
//import { validarUsuario } from 'src/composables/FuncionesG'

const props = defineProps({
  idDevolucion: { type: [Number, String], default: null },
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
  { value: 1, label: i18nT('ui.si-79ac29') },
  { value: 2, label: i18nT('ui.no-816c52') },
])

const columnas = [
  { name: 'exp', label: '', align: 'left' },
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'precio', label: i18nT('ui.precio-18e070'), field: 'precio', align: 'right' },
  { name: 'cantidad', label: i18nT('ui.cant-devuelta-31bd1a'), field: 'cantidad', align: 'right' },
  {
    name: 'perdida',
    label: i18nT('ui.perdida-e59387'),
    field: (row) => (row.perdida === 1 ? 'Si' : 'No'),
    align: 'center',
  },
  { name: 'cantidadperdida', label: i18nT('ui.cant-perdida-5daa1f'), field: 'cantidadperdida', align: 'right' },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
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
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-cargar-detalle-de-devolucion-c37132') })
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
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-cargar-detalle-para-edicion-fa077b') })
  }
}

const actualizarDetalleDev = async () => {
  try {
    $q.loading.show({ message: i18nT('ui.actualizando-detalle-5bff4f') })

    const formData = new FormData()
    formData.append('ver', 'actualizarDetalleDev')
    formData.append('id', formDetalleDev.value.idDetalle)
    formData.append('cantidad', formDetalleDev.value.cantidadDevuelta)
    formData.append('perdida', formDetalleDev.value.perdida)
    formData.append('cantidadperdida', formDetalleDev.value.cantidadPerdida)

    const response = await api.post('', formData)

    if (response.data.estado === 100) {
      $q.notify({ type: 'positive', message: i18nT('ui.detalle-actualizado-correctamente-2a2001') })
      resetForm()
      await listarDatosDetalleDevolucion(props.idDevolucion)
    } else {
      throw new Error(response.data.error || i18nT('ui.error-al-actualizar-detalle-4e729b'))
    }
  } catch (error) {
    console.error('Error al actualizar detalle:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-actualizar-detalle-4e729b') })
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
    title: i18nT('ui.esta-seguro-6c4824'),
    message: i18nT('ui.no-podra-recuperar-este-registro-02fdf8'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      $q.loading.show({ message: i18nT('ui.eliminando-devolucion-21f064') })
      const response = await api.get(`eliminarDevolucion/${props.idDevolucion}`)

      if (response.data.estado === 100) {
        $q.notify({ type: 'positive', message: i18nT('ui.devolucion-eliminada-con-exito-f9a54f') })
        emit('finalizado')
      } else {
        throw new Error(response.data.error || i18nT('ui.error-al-eliminar-devolucion-1e0895'))
      }
    } catch (error) {
      console.error('Error al eliminar devolución:', error)
      $q.notify({ type: 'negative', message: i18nT('ui.error-al-eliminar-devolucion-1e0895') })
    } finally {
      $q.loading.hide()
    }
  })
}

const confirmarAutorizarDevolucion = () => {
  $q.dialog({
    title: i18nT('ui.esta-seguro-6c4824'),
    message: i18nT('ui.al-aceptar-el-stock-de-productos-se-actualizara-bd067d'),
    cancel: true,
    persistent: true,
  }).onOk(autorizarDevolucion)
}

const autorizarDevolucion = async () => {
  try {
    //const usuarioResponse = validarUsuario()
    //const usuario = usuarioResponse[0]
    //const idusuario = usuario?.idusuario

    $q.loading.show({ message: i18nT('ui.autorizando-devolucion-6d61c6') })

    // const response = await api.get(`autorizarDevolucion/${props.idDevolucion}/1/${idusuario}`)

    // if (response.data.estado === 100) {
    //   $q.notify({ type: 'positive', message: Devolución registrada con éxito })
    //   emit('finalizado')
    // } else {
    //   throw new Error(response.data.error || Error al autorizar devolución)
    // }
  } catch (error) {
    console.error('Error al autorizar devolución:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.error-al-autorizar-devolucion-e607e5') })
  } finally {
    $q.loading.hide()
  }
}

watch(
  () => props.idDevolucion,
  (newVal) => {
    if (newVal) {
      listarDatosDetalleDevolucion(newVal)
    }
  },
  { immediate: true },
)
</script>

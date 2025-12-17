<template>
  <q-page padding>
    <q-dialog v-model="mostrarFormulario" persistent class="responsive-dialog">
      <q-card style="min-width: 100px; max-width: 1000px; width: 400px" class="dialog-card">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Leyendas de Factura</div>
          <q-space />
          <q-btn icon="close" flat round v-close-popup @click="toggleFormulario" />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-form @submit.prevent="handleSubmit">
            <q-input
              v-model="formData.nombre"
              label="Nombre de Leyenda"
              :rules="[(val) => (val && val.length > 0) || 'Por favor, ingrese un nombre']"
              dense
              outlined
              color="warning"
              class="q-ma-lg"
            />

            <q-select
              v-model="selectedLeyendaSIN"
              :options="leyendasSINOptions"
              label="Leyenda SIN"
              option-value="codigo"
              option-label="descripcion"
              emit-value
              map-options
              clearable
              dense
              outlined
              color="warning"
              class="q-ma-lg"
              :rules="[
                (val) => (val !== null && val !== '') || 'Por favor, seleccione una leyenda SIN',
              ]"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label
                      >{{ scope.opt.codigoActividad }} - {{ scope.opt.descripcion }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-if="false"
              filled
              v-model="formData.codigoSINLF"
              label="Código SIN"
              disable
              hint="Este campo se autocompleta al seleccionar una Leyenda SIN"
            />

            <q-card-actions align="right">
              <q-btn
                label="Cancelar"
                flat
                round
                v-close-popup
                class="q-mt-md q-ml-sm"
                color="negative"
                @click="toggleFormulario"
              />
              <q-btn label="Guardar" type="submit" color="positive" class="q-mt-md q-ml-sm" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-btn
      v-if="privilegios[1] === 1"
      :label="mostrarFormulario ? 'Cancelar Registro' : 'Nuevo Registro'"
      color="primary"
      @click="toggleFormulario"
      class="q-ma-lg"
    />
    <q-card>
      <!-- <q-input filled v-model="searchText" label="Buscar Leyenda" class="q-mb-md" clearable>
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input> -->

      <q-table
        :rows="filteredLeyendas"
        title="Leyendas Factura"
        :columns="columns"
        row-key="id"
        no-data-label="No hay datos disponibles"
        flat
        dense
        :filter="searchText"
      >
        <template v-slot:top-right>
          <q-input
            v-model="searchTerm"
            placeholder="Buscar..."
            dense
            outlined
            debounce="300"
            class="q-mb-md"
            clearable
            style="background-color: white"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td align="center">
            <q-badge color="green" v-if="Number(props.row.estado) === 1" label="Activo" outline />
            <q-badge color="red" v-else label="Inactivo" outline />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center text-nowrap">
            <q-btn
              v-if="privilegios[2] === 1"
              flat
              round
              color="info"
              icon="edit"
              @click="actualizar(props.row.id)"
              class="q-mr-sm"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="privilegios[3] === 1"
              flat
              round
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="privilegios[2] === 1"
              :icon="Number(props.row.estado) === 1 ? 'toggle_on' : 'toggle_off'"
              dense
              flat
              :color="Number(props.row.estado) === 1 ? 'green' : 'grey'"
              @click="cambiarEstado(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)"
            />
          </q-td>
        </template>
        <!-- <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-btn
              v-if="privilegios[2] === 1"
              :color="Number(props.row.estado) === 1 ? 'primary' : 'negative'"
              :icon="Number(props.row.estado) === 1 ? 'thumb_up_alt' : 'thumb_down_alt'"
              @click="cambiarEstado(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)"
            />
          </q-td>
        </template> -->
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET } from 'src/composables/peticionesFetch'
import { validarUsuario, normalizeText } from 'src/composables/FuncionesG'
import { URL_APICM } from 'src/composables/services'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
// Quasar
const $q = useQuasar()

// Estado reactivo
const formData = reactive({
  id: null,
  nombre: '',
  codigoSINLF: '',
  ver: 'registrarLeyendaFactura', // Valor por defecto
})

const formTitle = ref('Nuevo registro')
const leyendas = ref([]) // Lista de leyendas de factura
const leyendasSINOptions = ref([]) // Opciones para el select de leyendas SIN
const selectedLeyendaSIN = ref(null) // Valor seleccionado en el q-select de leyendas SIN
const privilegios = ref([1, 1, 1, 1]) // [consultar, registrar, actualizar, eliminar]
const mostrarFormulario = ref(false) // Controla la visibilidad del formulario
const searchText = ref('') // Para el filtro de la tabla

// Columnas para la q-table
const columns = [
  { name: 'c', align: 'left', label: '#', field: (row) => leyendas.value.indexOf(row) + 1 },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'nombre',
    sortable: true,
  },
  {
    name: 'descripcionSIN',
    align: 'left',
    label: 'Leyenda SIN',
    field: (row) => row.leyendasin.descripcion,
    sortable: true,
  },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones' },
]

// Computed property para filtrar la tabla
const filteredLeyendas = computed(() => {
  if (!searchText.value) {
    return leyendas.value
  }
  const lowerCaseSearchText = normalizeText(searchText.value).toLowerCase()
  return leyendas.value.filter(
    (leyenda) =>
      normalizeText(leyenda.nombre).toLowerCase().includes(lowerCaseSearchText) ||
      normalizeText(leyenda.leyendasin.descripcion).toLowerCase().includes(lowerCaseSearchText),
  )
})

// Watcher para actualizar codigoSINLF cuando selectedLeyendaSIN cambia
watch(selectedLeyendaSIN, (newVal) => {
  if (newVal) {
    const selectedOption = leyendasSINOptions.value.find((opt) => opt.codigo === newVal)
    if (selectedOption) {
      formData.codigoSINLF = selectedOption.codigo
    }
  } else {
    formData.codigoSINLF = ''
  }
})

// Funciones
const toggleFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value
  if (!mostrarFormulario.value) {
    resetearFormulario()
  }
}

const selectLeyendaSIN = async () => {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `${URL_APICM}/api/listaLeyendaSIN/leyendas/${token}/${tipo}`
    const resultado = await peticionGET(endpoint)
    if (resultado[0] === 'error') {
      $q.notify({
        type: 'negative',
        message: resultado.error || 'Error al cargar leyendas SIN',
      })
    } else {
      leyendasSINOptions.value = resultado.data.map((item) => ({
        label: `${item.codigoActividad} - ${item.descripcion}`,
        value: item.codigo,
        ...item,
      }))
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error de red al cargar leyendas SIN',
    })
  }
}
//$controlador->registroLeyendaFactura($_POST['nombre'], $_POST['codigosin'], $_POST['idempresa']);
const handleSubmit = async () => {
  try {
    console.log(formData)

    const datos = new FormData()
    datos.append('idempresa', idempresa)
    datos.append('codigosin', selectedLeyendaSIN.value)
    datos.append('nombre', formData.nombre)
    datos.append('ver', formData.ver)
    datos.append('id', formData.id)
    for (let [k, v] of datos.entries()) {
      console.log(`${k}: ${v}`)
    }
    const response = await api.post('', datos) // peticionPOST necesita el endpoint
    console.log(response)
    const data = response.data
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: 'Registro guardado exitosamente',
      })
      await listarDatos()
      resetearFormulario()
      mostrarFormulario.value = false // Cierra el formulario después de guardar
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al guardar el registro',
      })
    }
  } catch (error) {
    console.error('Error:', error)
    $q.notify({
      type: 'negative',
      message: 'Error de red al guardar el registro',
    })
  }
}

const listarDatos = async () => {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `${URL_APICM}/api/listaLeyendaFactura/${idempresa}/${token}/${tipo}`
    const resultado = await peticionGET(endpoint)
    if (resultado[0] === 'error') {
      $q.notify({
        type: 'negative',
        message: resultado.error || 'Error al cargar datos',
      })
    } else {
      leyendas.value = resultado
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error de red al listar datos',
    })
  }
}

const actualizar = async (id) => {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `${URL_APICM}/api/verificarExistenciaLeyendaFactura/${id}/${token}/${tipo}`
    const resultado = await peticionGET(endpoint)

    if (!mostrarFormulario.value) {
      mostrarFormulario.value = true
    }

    if (resultado.estado === 'exito') {
      formTitle.value = 'Editar registro'
      formData.id = resultado.datos.id
      formData.ver = 'editarLeyendaFactura'
      formData.nombre = resultado.datos.nombre
      selectedLeyendaSIN.value = resultado.datos.leyendasin.codigo // Asigna el código para que el q-select muestre la opción correcta
      formData.codigoSINLF = resultado.datos.leyendasin.codigo // Autocompleta el campo disabled
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || 'Error al obtener datos para actualizar',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error de red al actualizar',
    })
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Está seguro de que desea eliminar este registro? No podrá recuperarlo.',
    cancel: true,
    persistent: true,
    color: 'warning',
  }).onOk(() => {
    eliminar(id)
  })
}

const eliminar = async (id) => {
  try {
    const endpoint = `${URL_APICM}/api/eliminarLeyendaFactura/${id}`
    const resultado = await peticionGET(endpoint)
    if (resultado.estado === 'error') {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || 'Error al eliminar el registro',
      })
    } else {
      $q.notify({
        type: 'positive',
        message: resultado.mensaje || 'Registro eliminado exitosamente',
      })
      await listarDatos()
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error de red al eliminar',
    })
  }
}

const cambiarEstado = async (id, estado) => {
  try {
    const endpoint = `${URL_APICM}/api/actualizarEstadoLeyendaFactura/${id}/${estado}`
    const resultado = await peticionGET(endpoint)
    if (resultado.estado === 'error') {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje || 'Error al cambiar el estado',
      })
    } else {
      $q.notify({
        type: 'positive',
        message: resultado.mensaje || 'Estado actualizado exitosamente',
      })
      await listarDatos()
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error de red al cambiar el estado',
    })
  }
}

const resetearFormulario = () => {
  if (privilegios.value[1] === 1) {
    formData.verLF = 'registrarLeyendaFactura'
  }
  formData.id = null
  formData.nombre = ''
  formData.codigoSINLF = ''
  selectedLeyendaSIN.value = null
  formTitle.value = 'Nuevo registro'
}

// Hook de ciclo de vida
onMounted(() => {
  // Simular la carga inicial de privilegios (deberías pasarlos como props si vienen de fuera)
  // Por ahora, los hardcodeamos como en el archivo original si vienen de `crearFormularioLF`
  // En un componente Vue real, `permisos` se pasarían como `props`
  // Por ejemplo, si `crearFormularioLF(codigo, permisos)` se llamara así:
  // <leyendaFactura :codigo="someCode" :permisos="[1,1,1,1]" />
  // Y luego, `defineProps(['codigo', 'permisos'])` en el setup script.
  // Para este ejercicio, asumiremos que los privilegios son globales o se inicializan de alguna manera.
  // Aquí, los inicializamos para que las funciones dependientes de ellos funcionen.
  // Asumimos que los privilegios iniciales son los que permiten todas las acciones para probar la funcionalidad
  privilegios.value = [1, 1, 1, 1] // Ejemplo: consultar, registrar, actualizar, eliminar

  selectLeyendaSIN()
  listarDatos()
})
</script>

<style scoped>
/* Puedes añadir estilos específicos para este componente aquí */
.q-table__container {
  box-shadow:
    0 1px 5px rgba(0, 0, 0, 0.2),
    0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}
</style>

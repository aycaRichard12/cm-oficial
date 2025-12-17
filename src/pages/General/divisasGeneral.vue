<template>
  <q-page class="q-pa-md q-pa-md-md q-pa-lg-lg">
    <q-dialog v-model="showForm" persistent class="responsive-dialog">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Registrar Divisa</div>
          <q-btn icon="close" @click="showForm = false" flat dense round />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <form-divisa
            :modalValue="formData"
            :editing="estaEditando"
            @submit="guardarDivisa"
            @cancel="toggleForm"
            class="q-px-md q-px-md-lg q-pb-md"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <table-divisa
      :rows="listaDivisas"
      @add="toggleForm"
      @edit="editUnit"
      @delete="confirmDelete"
      @toggle-status="changeStatus"
      class="responsive-table"
    ></table-divisa>
  </q-page>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getTipoFactura, getToken } from 'src/composables/FuncionesG'
import FormDivisa from 'src/components/general/divisa/FormDivisa.vue'
import TableDivisa from 'src/components/general/divisa/TableDivisa.vue'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
const token = getToken()
console.log('Token:', token)
const tipoFactura = getTipoFactura()
const idempresa = idempresa_md5()
const showForm = ref(false)
const listaDivisas = ref([])
const $q = useQuasar()
const isEditing = ref(false)
const formData = ref({
  ver: 'registrarDivisa',
  idempresa: idempresa,
})
//=======================================Formulario
const guardarDivisa = async (data) => {
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
        message: response.data.mensaje || 'Proveedor guardado correctamente',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar el proveedor',
      })
    }
  } catch (error) {
    console.error('Error al guardar Proveedor: ', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar el Proveedor',
    })
  }
  toggleForm()
}
//=======================================Tabla
async function loadRows() {
  try {
    const point = `listaDivisa/${idempresa}/${token}/${tipoFactura}`
    const response = await api.get(`${point}`) // Cambia a tu ruta real
    listaDivisas.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const editUnit = (item) => {
  console.log(item)
  isEditing.value = true
  showForm.value = true

  formData.value = {
    ver: 'editarDivisa',
    id: item.id,
    nombre: item.nombre,
    tipo: item.tipo,
  }
}

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}
const resetForm = () => {
  isEditing.value = false

  formData.value = {
    ver: 'registrarDivisa',
    idempresa: idempresa,
  }
}
const confirmDelete = (Divisa) => {
  console.log(Divisa)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Divisa "${Divisa.nombre}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarDivisa/${Divisa.id}`) // Cambia a tu ruta real
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
async function changeStatus(item) {
  const nuevoEstado = Number(item.estado) === 2 ? 1 : 2
  try {
    const response = await api.get(`actualizarEstadoDivisa/${item.id}/${nuevoEstado}/${idempresa}`) // Cambia a tu ruta real
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
})
</script>

<style lang="scss">
// Estilos para el q-dialog
.responsive-dialog {
  .q-dialog__inner--minimized {
    padding: 0; // Elimina el padding predeterminado en pantallas pequeñas
  }

  .dialog-card {
    width: 95vw; // Ancho del 95% del viewport en pantallas pequeñas
    max-width: 800px; // Ancho máximo para pantallas grandes
    margin: 16px; // Margen alrededor de la tarjeta
    @media (min-width: $breakpoint-md-min) {
      width: auto; // Ancho automático para pantallas medianas y grandes
    }
  }
}

// Estilos para el formulario interno (asumiendo que FormDivisa.vue tiene un q-form con q-input dentro)
.form-divisa-cols {
  display: flex; // Usa flexbox para el diseño de columnas
  flex-wrap: wrap; // Permite que los elementos se envuelvan a la siguiente línea
  gap: 16px; // Espacio entre los elementos del formulario

  .form-field {
    flex: 1 1 100%; // Cada campo ocupa el 100% del ancho en móviles
    @media (min-width: $breakpoint-md-min) {
      flex: 1 1 calc(50% - 8px); // Dos columnas en pantallas medianas y grandes (considerando el gap)
    }
    @media (min-width: $breakpoint-lg-min) {
      flex: 1 1 calc(33.33% - 10.67px); // Tres columnas en pantallas grandes (ajuste de gap)
    }
  }
}

// Estilos para la tabla
.responsive-table {
  .q-table__container {
    overflow-x: auto; // Habilita el scroll horizontal en la tabla para pantallas pequeñas
  }
}

// Puedes añadir más estilos específicos para los componentes internos de FormDivisa y TableDivisa
// si es necesario, definiéndolos en sus respectivos archivos .vue o importándolos aquí.
</style>

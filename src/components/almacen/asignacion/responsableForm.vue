<template>
  <q-card>
    <q-form @submit.prevent="handleSubmit">
      <q-card-section class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="usuario">Usuario*</label>
          <q-select
            v-model="formData.usuario"
            :options="usuarios"
            dense
            outlined
            emit-value
            map-options
            id="usuario"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="nombre">Nombre</label>
          <q-input v-model="nombre" outlined disable dense id="nombre" />
        </div>
        <div class="col-12 col-md-4">
          <label for="apellido">Apellido</label>
          <q-input v-model="apellido" id="apellido" dense outlined disable />
        </div>
        <div class="col-12 col-md-4">
          <label for="cargo">Cargo</label>
          <q-input v-model="cargo" id="cargo" dense outlined disable />
        </div>
      </q-card-section>

      <q-card-actions class="flex justify-end">
        <q-btn label="Cancelar" flat color="negative" @click="$emit('cancel')" />
        <q-btn label="Aprobar" type="submit" color="primary" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { validarUsuario } from 'src/composables/FuncionesG'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { objectToFormData } from 'src/composables/FuncionesGenerales'

const $q = useQuasar()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario[0]?.empresa?.idempresa

const usuarios = ref([])
const nombre = ref('')
const apellido = ref('')
const cargo = ref('')
const isEditing = ref(false) // Puedes convertir esto en una prop si lo necesitas externo
const emit = defineEmits(['registroExitoso', 'cancel'])

const formData = ref({
  ver: 'registrarResponsable',
  idempresa: idempresa,
  usuario: null,
})

// Cargar usuarios desde API
async function loadUsuarios() {
  try {
    const response = await api.get(`usuarios/${idempresa}`)
    usuarios.value = response.data.map((item) => ({
      label: item.usuario,
      value: item.id,
      data: [item.cargo, item.nombre, item.apellido],
    }))
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

// Actualizar campos cuando cambia el usuario
watch(
  () => formData.value.usuario,
  (nuevoValor) => {
    const seleccionado = usuarios.value.find((u) => u.value === nuevoValor)
    if (seleccionado) {
      cargo.value = seleccionado.data[0]
      nombre.value = seleccionado.data[1]
      apellido.value = seleccionado.data[2]
    } else {
      cargo.value = ''
      nombre.value = ''
      apellido.value = ''
    }
  },
)

// Manejo del formulario
const handleSubmit = async () => {
  const data = {
    ...formData.value,
    nombre: nombre.value,
    apellido: apellido.value,
    cargo: cargo.value,
  }
  const form = objectToFormData(data)
  try {
    const response = await api.post('', form)
    console.log(response)
    $q.notify({
      type: 'positive',
      message: isEditing.value ? 'Editado correctamente' : 'Registrado correctamente',
    })
    emit('registroExitoso') // 🔔 Emite evento
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al guardar',
    })
  }
}

onMounted(() => {
  loadUsuarios()
})
</script>

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
            :rules="[(val) => !!val || 'Seleccione un usuario']"
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
        <q-btn label="Aprobar" type="submit" color="primary" :disable="!formData.usuario" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
/**
 * Componente para gestión de responsables de empresa
 * Permite seleccionar usuarios existentes y registrar/editar su información
 * @module components/RegistroResponsable
 */

// ==================== DEPENDENCIAS EXTERNAS ====================
import { ref, onMounted, watch } from 'vue'
import { validarUsuario } from 'src/composables/FuncionesG'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { objectToFormData } from 'src/composables/FuncionesGenerales'

// ==================== ESTADO GLOBAL Y CONFIGURACIÓN ====================
const $q = useQuasar() // Instancia de Quasar para notificaciones y UI

// Validación y obtención del usuario autenticado
const contenidousuario = validarUsuario()
// Extracción del ID de empresa del usuario actual (primer elemento del array)
const idempresa = contenidousuario[0]?.empresa?.idempresa

// ==================== ESTADOS REACTIVOS ====================
const usuarios = ref([]) // Lista de usuarios disponibles para seleccionar
const nombre = ref('') // Nombre del usuario seleccionado (solo lectura)
const apellido = ref('') // Apellido del usuario seleccionado (solo lectura)
const cargo = ref('') // Cargo del usuario seleccionado (solo lectura)
const isEditing = ref(false) // Controla si el formulario está en modo edición (potencial prop externa)
const emit = defineEmits(['registroExitoso', 'cancel']) // Eventos para comunicación con componente padre

// ==================== DATOS DEL FORMULARIO ====================
/**
 * Estructura principal del formulario
 * @property {string} ver - Acción a ejecutar en el backend
 * @property {number} idempresa - ID de la empresa del usuario autenticado
 * @property {number|null} usuario - ID del usuario seleccionado (inicialmente nulo)
 */
const formData = ref({
  ver: 'registrarResponsable',
  idempresa: idempresa,
  usuario: null,
})

// ==================== FUNCIONES API ====================
/**
 * Carga la lista de usuarios desde el backend
 * Transforma la respuesta en formato consumible por un select (label, value, data)
 * @async
 * @throws {Error} Cuando falla la petición a la API
 */
async function loadUsuarios() {
  try {
    const response = await api.get(`usuarios/${idempresa}`)
    // Mapeo de datos: label para mostrar, value para el ID, data para información adicional
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

// ==================== WATCHERS ====================
/**
 * Observa cambios en la selección del usuario
 * Actualiza automáticamente nombre, apellido y cargo basado en el usuario seleccionado
 * Limpia los campos si no hay usuario seleccionado
 */
watch(
  () => formData.value.usuario,
  (nuevoValor) => {
    const seleccionado = usuarios.value.find((u) => u.value === nuevoValor)
    if (seleccionado) {
      // Datos almacenados en el array: [cargo, nombre, apellido]
      cargo.value = seleccionado.data[0]
      nombre.value = seleccionado.data[1]
      apellido.value = seleccionado.data[2]
    } else {
      // Reset cuando se deselecciona
      cargo.value = ''
      nombre.value = ''
      apellido.value = ''
    }
  },
)

// ==================== MANEJADORES DE FORMULARIO ====================
/**
 * Procesa el envío del formulario
 * Realiza validaciones, transforma datos a FormData y envía al backend
 * Emite evento de éxito o error según el resultado
 * @async
 * @emits registroExitoso - Cuando el registro/edición es exitoso
 */
const handleSubmit = async () => {
  // Validación: usuario obligatorio
  if (!formData.value.usuario) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar un usuario',
    })
    return
  }

  // Construcción del payload combinando formData con datos complementarios
  const data = {
    ...formData.value,
    nombre: nombre.value,
    apellido: apellido.value,
    cargo: cargo.value,
  }

  // Conversión a FormData para envío multipart (necesario para el backend)
  const form = objectToFormData(data)

  try {
    const response = await api.post('', form)
    console.log(response) // Log de depuración para verificar respuesta

    // Notificación según modo (edición o registro)
    $q.notify({
      type: 'positive',
      message: isEditing.value ? 'Editado correctamente' : 'Registrado correctamente',
    })

    emit('registroExitoso') // 🔔 Notifica al componente padre para actualizar listas/estados
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al guardar',
    })
  }
}

// ==================== CICLO DE VIDA ====================
/**
 * Carga inicial de datos al montar el componente
 * Obtiene la lista de usuarios disponibles para selección
 */
onMounted(() => {
  loadUsuarios()
})
</script>

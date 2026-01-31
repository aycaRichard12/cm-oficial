<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Gestionar Permiso</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="submitForm" class="q-gutter-md">
        <div class="col-12 col-md-3">
          <label for="operacion">Seleccionar operación</label>
          <q-select
            v-model="form.menuSeleccionado"
            :options="menuOptions"
            id="operacion"
            dense
            outlined
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterFn"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="usuario">Seleccionar Usuario</label>
          <q-select
            v-model="form.usuarioSeleccionado"
            :options="usuarios"
            id="usuario"
            dense
            outlined
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterUsuarios"
            :rules="[(val) => !!val || 'Campo requerido']"
          />
        </div>

        <div class="row justify-end">
          <q-btn label="Limpiar" flat color="primary" @click="resetForm" />
          <q-btn
            :label="form.id ? 'Actualizar' : 'Crear'"
            type="submit"
            color="primary"
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMenuStore } from 'src/stores/permitidos'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const menuStore = useMenuStore()
defineProps(['loading'])
const emit = defineEmits(['on-submit'])

const idempresa = idempresa_md5()
const allUsuarios = ref([])
const usuarios = ref([])
// 1. Mantenemos una referencia a los datos originales para no perderlos al filtrar
const allMenus = ref([])
// 2. Esta es la que se vincula al :options del q-select
const menuOptions = ref([])

const form = ref({
  id: null,
  codigo: '',
  operacion: '',
  menuSeleccionado: null,
})

// Función de filtrado corregida
function filterFn(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    // Filtramos siempre sobre la lista maestra (allMenus)
    menuOptions.value = allMenus.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
  })
}
// Función de filtrado para usuarios
function filterUsuarios(val, update) {
  update(() => {
    const needle = val.toLowerCase()
    // Filtramos siempre sobre la lista maestra (allMenus)
    usuarios.value = allUsuarios.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
  })
}

onMounted(() => {
  // Mapeamos los datos del store
  console.log(menuStore.permitidos)
  const menus = [
    {
      titulo: 'Generar Pedidos Provedores',
      codigo: 'generarpedido',
    },
    {
      titulo: 'Registrar Compras',
      codigo: 'registrarcompra',
    },
    {
      titulo: 'Edición de Inventario Externo',
      codigo: 'inventarioexterno',
    }
  ]
  const mappedMenus = menus.map((menu) => {
    return {
      // Si existe la parte 2, la usamos; si no, usamos el título completo
      label: menu.titulo,
      // Obtenemos el código antes del primer guion
      value: menu.codigo,
    }
  })
  loadUsuarios()

  // Inicializamos ambas listas
  allMenus.value = mappedMenus
  menuOptions.value = mappedMenus
})

async function loadUsuarios() {
  try {
    const response = await api.get(`usuariosConfiguracion/${idempresa}`)
    usuarios.value = response.data.map((item) => ({
      label: item.usuario,
      value: item.id,
      data: [item.cargo, item.nombre, item.apellido],
    }))
    allUsuarios.value = usuarios.value
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

const submitForm = () => {
  // Antes de emitir, podemos asignar el label a 'operacion' y el value a 'codigo'
  // si es que necesitas que coincidan con tu API
  const selected = allMenus.value.find((m) => m.value === form.value.menuSeleccionado)
  const usuario = allUsuarios.value.find((m) => m.value === form.value.usuarioSeleccionado)
  if (selected) {
    form.value.codigo = selected.value
    form.value.operacion = selected.label
    form.value.idusuario = usuario.value
  }
  console.log('Formulario enviado con datos:', form.value)

  emit('on-submit', { ...form.value })
  resetForm()
}

const resetForm = () => {
  form.value = { id: null, codigo: '', operacion: '', menuSeleccionado: null }
}
</script>

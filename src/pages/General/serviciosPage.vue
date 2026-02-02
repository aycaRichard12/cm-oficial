<template>
  <q-page >
    <div class="row justify-center q-py-md">
      <div class="col-12 col-lg-10">
        <q-card class="shadow-3 rounded-borders">
          <!-- Header de la Tabla con Buscador -->
          <q-card-section class="q-pa-md bg-white text-dark">
            <div class="row items-center justify-between q-col-gutter-sm">
              <div class="col-12 col-md-auto display-flex items-center">
                <q-icon name="design_services" size="md" color="primary" class="q-mr-sm" />
                <span class="text-h6 text-weight-bold">Gestión de Servicios</span>
              </div>
              <div class="col-12 col-md-auto row q-gutter-sm items-center no-wrap">
                <q-input
                  v-model="filter"
                  dense
                  outlined
                  rounded
                  placeholder="Buscar servicio..."
                  class="bg-grey-1"
                  color="primary"
                >
                  <template v-slot:append>
                    <q-icon name="search" color="grey-7" />
                  </template>
                </q-input>
                <q-btn
                  color="primary"
                  icon="add"
                  label="Nuevo"
                  no-caps
                  unelevated
                  class="rounded-borders"
                  @click="handleCreate"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Tabla -->
          <q-table
            :rows="services"
            :columns="columns"
            row-key="id"
            :loading="loading"
            :filter="filter"
            flat
            :pagination="{ rowsPerPage: 10 }"
          >
            <!-- Slot de Numeracion -->
            <template v-slot:body-cell-id="props">
              <q-td :props="props" align="center">
                {{ props.rowIndex + 1 }}
              </q-td>
            </template>

            <!-- Slot de Icono -->
            <template v-slot:body-cell-icono="props">
              <q-td :props="props">
                <q-avatar
                  size="32px"
                  font-size="20px"
                  :icon="props.row.icono || 'extension'"
                  color="grey-2"
                  text-color="primary"
                  class="shadow-1"
                />
              </q-td>
            </template>

            <!-- Slot de Estado -->
            <template v-slot:body-cell-estado="props">
              <q-td :props="props" align="center">
                <q-chip
                  clickable
                  @click="toggleStatus(props.row)"
                  :color="props.row.estado == 1 ? 'green-1' : 'red-1'"
                  :text-color="props.row.estado == 1 ? 'green-9' : 'red-9'"
                  size="sm"
                  class="text-weight-medium cursor-pointer"
                >
                  {{ props.row.estado == 1 ? 'Activo' : 'Inactivo' }}
                </q-chip>
              </q-td>
            </template>

            <!-- Slot de Acciones -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" align="right">
                <div class="row justify-end q-gutter-x-xs">
                  <q-btn
                    flat
                    round
                    size="sm"
                    color="primary"
                    icon="edit"
                    @click="handleEdit(props.row)"
                  >
                    <q-tooltip anchor="top middle" self="bottom middle">Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="handleDelete(props.row)"
                  >
                    <q-tooltip anchor="top middle" self="bottom middle">Eliminar</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <!-- Loading State -->
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <!-- No Data State -->
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-lg text-grey-6">
                <q-icon name="sentiment_dissatisfied" size="sm" class="q-mr-sm" />
                <span>No se encontraron servicios</span>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- Dialogo Crear/Editar -->
    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 550px; max-width: 95vw" class="shadow-4 rounded-borders">
        <q-toolbar class="bg-primary text-white q-px-md">
          <q-avatar size="md" color="white" text-color="primary">
            <q-icon :name="isEditing ? 'edit' : 'add'" size="24px" />
          </q-avatar>
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            {{ isEditing ? 'Editar Servicio' : 'Nuevo Servicio' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <q-form @submit="submitForm" class="q-gutter-y-md">
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.nombre"
                  label="Nombre *"
                  outlined
                  dense
                  color="primary"
                  :rules="[(val) => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="grey-6" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.slug"
                  label="Slug *"
                  outlined
                  dense
                  color="primary"
                  hint="Solo letras, números y guiones bajos (_)"
                  @input="formatSlug"
                  :rules="[
                    (val) => !!val || 'Requerido',
                    (val) => /^[a-z0-9_]+$/.test(val) || 'Solo minúsculas, números y guiones bajos (_)'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="code" color="grey-6" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-input
              v-model="form.descripcion"
              label="Descripción"
              outlined
              dense
              color="primary"
              type="textarea"
              rows="3"
            >
              <template v-slot:prepend>
                <q-icon name="description" color="grey-6" />
              </template>
            </q-input>

            <q-input
              v-model="form.documentacion"
              label="URL Documentación"
              outlined
              dense
              color="primary"
              placeholder="https://..."
            >
              <template v-slot:prepend>
                <q-icon name="link" color="grey-6" />
              </template>
            </q-input>

            <q-input
              v-model="form.icono"
              label="Icono (Material Symbols)"
              outlined
              dense
              color="primary"
              hint="Ej: settings, home, build"
            >
              <template v-slot:prepend>
                <q-icon :name="form.icono || 'help_outline'" color="primary" />
              </template>
              <template v-slot:append>
                <q-btn flat round size="sm" icon="open_in_new" type="a" href="https://fonts.google.com/icons" target="_blank">
                  <q-tooltip>Buscar iconos</q-tooltip>
                </q-btn>
              </template>
            </q-input>

            <q-separator class="q-mt-md" />

            <div class="row justify-end q-gutter-sm q-mt-sm">
              <q-btn
                label="Cancelar"
                flat
                color="grey-8"
                v-close-popup
                no-caps
                class="text-weight-medium"
              />
              <q-btn
                :label="isEditing ? 'Actualizar' : 'Guardar'"
                type="submit"
                color="primary"
                unelevated
                no-caps
                icon="save"
                :loading="submitting"
                class="shadow-1"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Estado
const services = ref([])
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const isEditing = ref(false)
const filter = ref('') // Filtro para búsqueda

// Formulario
const form = ref({
  id: null,
  nombre: '',
  slug: '',
  descripcion: '',
  documentacion: '',
  icono: '',
})

// Columnas
const columns = [
  { name: 'id', align: 'left', label: '#', field: 'id', sortable: true, style: 'width: 60px' },
  { name: 'icono', align: 'center', label: 'Icono', field: 'icono', style: 'width: 70px' },
  { name: 'nombre', align: 'left', label: 'Nombre', field: 'nombre', sortable: true, classes: 'text-weight-bold text-grey-9' },
  { name: 'slug', align: 'left', label: 'Slug', field: 'slug', sortable: true, classes: 'text-caption text-grey-7' },
  {
    name: 'descripcion',
    align: 'left',
    label: 'Descripción',
    field: 'descripcion',
    classes: 'ellipsis text-grey-8',
    style: 'max-width: 250px',
  },
  {
    name: 'estado',
    align: 'center',
    label: 'Estado',
    field: 'estado',
    sortable: true,
  },
  { name: 'actions', align: 'right', label: 'Acciones' },
]

// Cargar Servicios
const fetchServices = async () => {
  loading.value = true
  try {
    const { data } = await api.get('services/listar')
    console.log('Servicios cargados:', data)
    services.value = data
  } catch (error) {
    console.error('Error al cargar servicios:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar la lista de servicios',
      icon: 'report_problem'
    })
  } finally {
    loading.value = false
  }
}

// Format slug to use underscores
const formatSlug = () => {
  if (form.value.slug) {
    form.value.slug = form.value.slug
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/-+/g, '_') // Replace hyphens with underscores
      .replace(/[^a-z0-9_]/g, '') // Remove any character that is not letter, number, or underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single underscore
  }
}

// Abrir modal Crear
const handleCreate = () => {
  isEditing.value = false
  form.value = {
    id: null,
    nombre: '',
    slug: '',
    descripcion: '',
    documentacion: '',
    icono: '',
  }
  showDialog.value = true
}

// Abrir modal Editar
const handleEdit = (row) => {
  isEditing.value = true
  form.value = { ...row } // Copia los datos
  showDialog.value = true
}

// Cambiar Estado
const toggleStatus = async (row) => {
  const nuevoEstado = row.estado == 1 ? 2 : 1
  try {
    // endpoint: /services/cambiarEstadoServicio/{estado}/{id}
    await api.get(`services/cambiarEstadoServicio/${nuevoEstado}/${row.id}`)
    
    // Actualizamos el estado localmente para feedback inmediato
    row.estado = nuevoEstado
    
    $q.notify({
      type: 'positive',
      message: `Estado actualizado a ${nuevoEstado == 1 ? 'Activo' : 'Inactivo'}`,
      icon: 'check_circle'
    })
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo actualizar el estado',
      icon: 'error'
    })
    // Revertir cambio en caso de error
    fetchServices()
  }
}

// Enviar Formulario
const submitForm = async () => {
  submitting.value = true
  try {
    const payload = {
      nombre: form.value.nombre,
      slug: form.value.slug,
      descripcion: form.value.descripcion,
      documentacion: form.value.documentacion,
      icono: form.value.icono,
    }

    if (isEditing.value) {
      payload.ver = 'editarServicio'
      payload.id = form.value.id
    } else {
      payload.ver = 'crearServicio'
    }

    console.log('Enviando payload:', payload)
    const { data } = await api.post('/services/', payload)

    console.log('Respuesta Post:', data)

    $q.notify({
      type: 'positive',
      message: isEditing.value
        ? 'Servicio actualizado correctamente'
        : 'Servicio creado correctamente',
      icon: 'check_circle',
    })

    showDialog.value = false
    fetchServices() // Recargar lista
  } catch (error) {
    console.error('Error al guardar servicio:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al procesar la solicitud',
      icon: 'error',
    })
  } finally {
    submitting.value = false
  }
}

// Eliminar
const handleDelete = (row) => {
  $q.dialog({
    title: 'Eliminar Servicio',
    message: `¿Realmente deseas eliminar "${row.nombre}"? Esta acción no se puede deshacer.`,
    ok: { label: 'Eliminar', color: 'negative', flat: true },
    cancel: { label: 'Cancelar', color: 'grey-8', flat: true },
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    try {
      await api.get(`services/eliminarServicio/${row.id}`)
      $q.notify({ type: 'positive', message: 'Servicio eliminado correctamente', icon: 'delete' })
      fetchServices()
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudo eliminar el servicio',
        icon: 'error'
      })
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  fetchServices()
})
</script>

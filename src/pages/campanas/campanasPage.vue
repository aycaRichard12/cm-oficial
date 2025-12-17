<template>
  <q-page padding>
    <div class="titulo">Campañas</div>
    <!-- Formulario principal de campañas -->
    <q-dialog v-model="formularioActivo">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Registrar Nueva Campaña</div>
          <q-btn icon="close" flat dense round @click="formularioActivo = false" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="registrarCampana">
            <div class="row q-col-gutter-x-md q-mb-md">
              <div class="col-12 col-md-3">
                <label for="nombre">Nombre</label>
                <q-input v-model="formData.campana" id="nombre" dense outlined required />
              </div>

              <div class="col-12 col-md-2">
                <label for="fechaini">Fecha Inicio</label>
                <q-input
                  v-model="formData.fechai"
                  id="fechaini"
                  type="date"
                  required
                  dense
                  outlined
                />
              </div>

              <div class="col-12 col-md-2">
                <label for="fechafin">Fecha Final</label>
                <q-input
                  v-model="formData.fechaf"
                  id="fechafin"
                  type="date"
                  required
                  dense
                  outlined
                />
              </div>

              <div class="col-12 col-md-2">
                <label for="porcentaje">Porcentaje</label>
                <q-input
                  v-model="formData.porcentaje"
                  id="porcentaje"
                  type="number"
                  required
                  dense
                  outlined
                />
              </div>
              <div class="col-12 col-md-3">
                <label for="almacenwe">Elija un Almacén</label>
                <q-select
                  v-model="formData.idalmacen"
                  :options="almacenesOptions"
                  id="almacenwe"
                  dense
                  outlined=""
                  option-value="idalmacen"
                  option-label="almacen"
                  emit-value
                  map-options
                  required
                />
              </div>
            </div>
            <div class="row flex justify-start">
              <q-btn type="submit" color="primary" class="btn-res">
                <q-icon name="save" class="icono" />
                <span class="texto">Registrar</span>
              </q-btn>
              <q-btn label="Cancelar" flat color="negative" @click="formularioActivo = false" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-btn color="primary" class="btn-res" @click="formularioActivo = true">
      <q-icon name="add" class="icono" />
      <span class="texto">Registrar</span>
    </q-btn>
    <!-- Filtros y acciones -->

    <div class="row q-col-gutter-x-md flex justify-between">
      <div class="col-12 col-md-2">
        <label for="almacen">Filtrar por almacén</label>
        <q-select
          v-model="idalmacenfiltro"
          :options="almacenesOptions"
          id="almacen"
          option-value="idalmacen"
          option-label="almacen"
          dense
          outlined=""
          emit-value
          map-options
          clearable
        />
      </div>

      <div class="col-12 col-md-2">
        <div>
          <label for="buscar">Buscar...</label>
          <q-input v-model="busqueda" outlined dense debounce="300">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- Tabla de campañas -->
    <q-table
      class="q-mt-md"
      :rows="campanasFiltradas"
      :columns="columns"
      row-key="id"
      :filter="busqueda"
      v-model:pagination="pagination"
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-btn
            :color="Number(props.row.estado) === 1 ? 'blue' : 'negative'"
            size="sm"
            :icon="Number(props.row.estado) === 1 ? 'thumb_up' : 'thumb_down'"
            @click="cambiarEstado(props.row.id, Number(props.row.estado) === 1 ? 2 : 1)"
            dense
          >
            <q-tooltip>
              {{ props.row.estado === 1 ? 'Desactivar esta Campaña' : 'Activar esta Campaña' }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-detalles="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            size="sm"
            icon="add_circle"
            @click="cargarcategoria(props.row.id, props.row.idalmacen)"
            dense
          >
            <q-tooltip>Agregar Categorias a la Campaña</q-tooltip>
          </q-btn>
          <q-btn
            color="primary"
            size="sm"
            icon="add_shopping_cart"
            @click="cargarPrecios(props.row.id)"
            class="q-ml-sm"
            dense
          >
            <q-tooltip>Agregar Productos a la Campaña</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn color="primary" size="sm" icon="edit" @click="editarCampana(props.row)" dense>
            <q-tooltip>Modificar</q-tooltip>
          </q-btn>
          <q-btn
            color="negative"
            size="sm"
            icon="delete"
            @click="eliminar(props.row.id)"
            class="q-ml-sm"
            dense
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo para categorías de precios -->
    <q-dialog v-model="dialogoCategorias" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Categorías de precio</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="registrarCategoria" id="categoriacampañaform">
            <q-select
              v-model="categoriaForm.idcategoriaprecio"
              :options="categoriasPrecioOptions"
              label="Categorias de precios:"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              required
            />

            <div class="q-mt-md">
              <q-btn type="submit" color="info" label="Agregar" />
            </div>
          </q-form>

          <q-table
            class="q-mt-md"
            :rows="categoriasCampana"
            :columns="columnsCategorias"
            row-key="id"
            :pagination="{ rowsPerPage: 5 }"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  color="negative"
                  size="sm"
                  icon="delete"
                  @click="eliminarCategoriaCampana(props.row.id)"
                  dense
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para precios de campaña -->
    <q-dialog v-model="dialogoPrecios" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Lista de precios</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="registrarPrecioCampaña" id="preciocampañaform">
            <input type="hidden" v-model="precioForm.ver" value="registrocategoriacampaña" />
            <input type="hidden" v-model="precioForm.idcampaña" />

            <q-input v-model="precioForm.producto" label="Producto*" disable />

            <q-input
              v-model="precioForm.precio"
              label="Nuevo precio del producto*"
              type="number"
              required
            />

            <div class="q-mt-md">
              <q-btn type="submit" color="info" label="Agregar" />
            </div>
          </q-form>

          <q-select
            v-model="filtroPrecioCampania"
            :options="categoriasCampanaPrecioOptions"
            label="Filtrar por categoría"
            option-value="idcategoriaprecio"
            option-label="tipo"
            emit-value
            map-options
            class="q-mt-md"
            @update:model-value="filtrarPrecios"
          />

          <q-table
            class="q-mt-md"
            :rows="preciosCampanaFiltrados"
            :columns="columnsPrecios"
            row-key="id"
            :pagination="{ rowsPerPage: 5 }"
          >
            <template v-slot:body-cell-opciones="props">
              <q-td :props="props">
                <q-btn
                  color="negative"
                  size="sm"
                  icon="delete"
                  @click="eliminarPrecioCampana(props.row.id)"
                  dense
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { peticionGET, peticionPOST } from 'src/composables/peticionesFetch.js'
import { URL_APICM } from 'src/composables/services'
import { api } from 'src/boot/axios'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const $q = useQuasar()
const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero')) || []
const idempresa = contenidousuario[0]?.empresa?.idempresa
const idusuario = contenidousuario[0]?.idusuario

// Estados reactivos
const formularioActivo = ref(false)
const idalmacenfiltro = ref(null)
const busqueda = ref('')
const filtroPrecioCampania = ref(0)
const dialogoCategorias = ref(false)
const dialogoPrecios = ref(false)

// Datos del formulario
const formData = ref({
  ver: 'registrarcampana',
  idusuario: idusuario,
  idalmacen: null,
  fechai: '',
  fechaf: '',
  campana: '',
  porcentaje: '',
})

const categoriaForm = ref({
  ver: 'registrocategoriacampaña',
  idcampaña: '',
  almacen: '',
  idempresa: idempresa,
  idcategoriaprecio: null,
})

const precioForm = ref({
  ver: 'registrocategoriacampaña',
  idcampaña: '',
  producto: '',
  precio: '',
})

// Datos de la API
const campanas = ref([])
const almacenes = ref([])
const categoriasPrecio = ref([])
const categoriasCampana = ref([])
const preciosCampana = ref([])

// Columnas de las tablas
const columns = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'fechainicio', label: 'Fecha Inicio', field: 'fechainicio', align: 'center' },
  { name: 'fechafinal', label: 'Fecha Final', field: 'fechafinal', align: 'center' },
  {
    name: 'porcentaje',
    label: 'Descuento',
    field: (row) => `${row.porcentaje} %`,
    align: 'center',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'detalles', label: 'Detalles', field: 'detalles', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const columnsCategorias = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'tipo', label: 'Categoria', field: 'tipo', align: 'left' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

const columnsPrecios = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'right' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'opciones', align: 'center' },
]

// Opciones computadas
const almacenesOptions = computed(() => {
  return almacenes.value.map((almacen) => ({
    idalmacen: almacen.idalmacen,
    almacen: almacen.almacen,
  }))
})

const categoriasPrecioOptions = computed(() => {
  return categoriasPrecio.value.filter((cat) => cat.idalmacen == categoriaForm.value.almacen)
})

const categoriasCampanaPrecioOptions = computed(() => {
  return categoriasCampana.value
})

const preciosCampanaFiltrados = computed(() => {
  if (filtroPrecioCampania.value === 0) {
    return preciosCampana.value.map((item, index) => ({
      ...item,
      numero: index + 1,
    }))
  }
  return preciosCampana.value
    .filter((item) => item.idcategoriaprecio == filtroPrecioCampania.value)
    .map((item, index) => ({
      ...item,
      numero: index + 1,
    }))
})

const campanasFiltradas = computed(() => {
  let filtered = campanas.value

  const almacen = idalmacenfiltro.value
  if (almacen) {
    if (almacen.idalmacen) {
      filtered = filtered.filter((camp) => camp.idalmacen == almacen.idalmacen)
    } else {
      filtered = filtered.filter((camp) => camp.idalmacen == almacen)
    }
  }

  return filtered.map((item, index) => ({
    ...item,
    numero: index + 1,
  }))
})

// Métodos
const obtenerFechaActual = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  let mm = today.getMonth() + 1
  let dd = today.getDate()

  if (dd < 10) dd = '0' + dd
  if (mm < 10) mm = '0' + mm

  return `${yyyy}-${mm}-${dd}`
}

const listarAlmacenes = async () => {
  try {
    const endpoint = `listaResponsableAlmacen/${idempresa}`
    const res = await api.get(endpoint)
    const resultado = res.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar almacenes',
      })
    } else {
      almacenes.value = resultado.filter((u) => u.idusuario == idusuario)
      idalmacenfiltro.value = almacenes.value[0]
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar almacenes',
    })
  }
}

const listarCampanas = async () => {
  try {
    const endpoint = `campanas/${idempresa}`
    const res = await api.get(endpoint)
    const resultado = res.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar campañas',
      })
    } else {
      campanas.value = resultado
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar campañas',
    })
  }
}

const listarCategoriasPrecio = async () => {
  try {
    const endpoint = `${URL_APICM}api/listaCategoriaPrecio/${idempresa}`
    const resultado = await peticionGET(endpoint)
    categoriasPrecio.value = resultado
  } catch (error) {
    console.error(error)
  }
}

const registrarCampana = async () => {
  try {
    const form = objectToFormData(formData.value)
    form.append('ver', 'registrarcampana')
    form.append('idusuario', idusuario)
    form.append('idempresa', idempresa)
    const response = await api.post('', form)
    console.log(response)
    const data = response.data
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data.mensaje || 'Campaña registrada con éxito',
      })
      await listarCampanas()
      resetearFormulario()
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al registrar campaña',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al registrar campaña',
    })
  }
}

const editarCampana = async (campana) => {
  try {
    const endpoint = `${URL_APICM}api/verificarExistenciacampana/${campana.id}`
    const resultado = await peticionGET(endpoint)

    if (resultado.estado === 'exito') {
      formData.value = {
        ...formData.value,
        id: resultado.datos.id,
        ver: 'editarcampaña',
        idalmacen: resultado.datos.idalmacen,
        fechai: resultado.datos.fechai,
        fechaf: resultado.datos.fechaf,
        campana: resultado.datos.nombre,
        porcentaje: resultado.datos.porcentaje,
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const eliminar = async (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta campaña?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const endpoint = `${URL_APICM}api/eliminarcampana/${id}`
      const resultado = await peticionGET(endpoint)

      if (resultado.estado === 'exito') {
        $q.notify({
          type: 'positive',
          message: resultado.mensaje,
        })
        await listarCampanas()
      } else {
        $q.notify({
          type: 'negative',
          message: resultado.mensaje,
        })
      }
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar campaña',
      })
    }
  })
}

const cambiarEstado = async (id, estado) => {
  try {
    const endpoint = `${URL_APICM}api/actualizarEstadocampana/${id}/${estado}`
    const resultado = await peticionGET(endpoint)

    if (resultado.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: resultado.mensaje,
      })
      await listarCampanas()
    } else {
      $q.notify({
        type: 'negative',
        message: resultado.mensaje,
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado',
    })
  }
}

const resetearFormulario = () => {
  formData.value = {
    ver: 'registrarcampana',
    idusuario: idusuario,
    idalmacen: null,
    fechai: '',
    fechaf: '',
    campana: '',
    porcentaje: '',
  }
}

const cargarcategoria = async (idCampana, idAlmacen) => {
  try {
    categoriaForm.value.idcampaña = idCampana
    categoriaForm.value.almacen = idAlmacen

    const endpoint1 = `${URL_APICM}api/listaCategoriaPrecio/${idempresa}`
    const endpoint2 = `${URL_APICM}api/listacategoriapreciocampaña/${idCampana}`

    const [resultado1, resultado2] = await Promise.all([
      peticionGET(endpoint1),
      peticionGET(endpoint2),
    ])

    categoriasPrecio.value = resultado1
    categoriasCampana.value = resultado2.map((item, index) => ({
      ...item,
      numero: index + 1,
    }))

    dialogoCategorias.value = true
  } catch (error) {
    console.error(error)
  }
}

const registrarCategoria = async () => {
  // <input type="hidden" v-model="categoriaForm.ver" value="registrocategoriacampaña" />
  //           <input type="hidden" v-model="categoriaForm.idcampaña" />
  //           <input type="hidden" v-model="categoriaForm.almacen" />
  //           <input type="hidden" v-model="categoriaForm.idempresa" />
  try {
    //const form = document.getElementById('categoriacampañaform')
    const form = objectToFormData(categoriaForm.value)
    form.append('ver', 'registrocategoriacampaña')
    form.append('idusuario', idusuario)
    form.append('idempresa', idempresa)
    const response = await api.post('', form)
    console.log(response)
    const data = response.data
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data.mensaje || 'Categoría registrada con éxito',
      })
      await cargarcategoria(categoriaForm.value.idcampaña, categoriaForm.value.almacen)
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al registrar categoría',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al registrar categoría',
    })
  }
}

const eliminarCategoriaCampana = async (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar esta categoría?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const endpoint = `${URL_APICM}api/eliminarcategoriapreciocampaña/${id}`
      const resultado = await peticionGET(endpoint)

      if (resultado.estado === 'exito') {
        $q.notify({
          type: 'positive',
          message: resultado.mensaje,
        })
        await cargarcategoria(categoriaForm.value.idcampaña, categoriaForm.value.almacen)
      } else {
        $q.notify({
          type: 'negative',
          message: resultado.mensaje,
        })
      }
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar categoría',
      })
    }
  })
}

const cargarPrecios = async (idCampana) => {
  try {
    precioForm.value.idcampaña = idCampana

    const endpoint1 = `${URL_APICM}api/listacategoriapreciocampaña/${idCampana}`
    const endpoint2 = `${URL_APICM}api/listapreciocampaña/${idCampana}`

    const [resultado1, resultado2] = await Promise.all([
      peticionGET(endpoint1),
      peticionGET(endpoint2),
    ])

    categoriasCampana.value = resultado1
    preciosCampana.value = resultado2

    dialogoPrecios.value = true
  } catch (error) {
    console.error(error)
  }
}

const registrarPrecioCampaña = async () => {
  try {
    const form = document.getElementById('preciocampañaform')
    const data = await peticionPOST(form)

    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data.mensaje || 'Precio registrado con éxito',
      })
      await cargarPrecios(precioForm.value.idcampaña)
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al registrar precio',
      })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Error al registrar precio',
    })
  }
}

const eliminarPrecioCampana = async (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este precio?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const endpoint = `${URL_APICM}api/eliminarpreciocampaña/${id}`
      const resultado = await peticionGET(endpoint)

      if (resultado.estado === 'exito') {
        $q.notify({
          type: 'positive',
          message: resultado.mensaje,
        })
        await cargarPrecios(precioForm.value.idcampaña)
      } else {
        $q.notify({
          type: 'negative',
          message: resultado.mensaje,
        })
      }
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar precio',
      })
    }
  })
}

const filtrarPrecios = () => {
  // La lógica de filtrado ya está en la propiedad computada preciosCampanaFiltrados
}
function handleKeydown(e) {
  if (e.key === 'Escape') {
    formularioActivo.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
// Inicialización
onMounted(async () => {
  formData.value.fechai = obtenerFechaActual()
  formData.value.fechaf = obtenerFechaActual()
  await listarAlmacenes()
  await listarCampanas()
  await listarCategoriasPrecio()
})
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>

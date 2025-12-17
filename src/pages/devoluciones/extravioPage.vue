<template>
  <q-page>
    <!-- Formulario principal -->
    <div v-if="vistaPrincipal">
      <q-card-section>
        <div class="row q-col-gutter-x-md q-mb-md">
          <div class="col-12 flex justify-start">
            <q-btn
              color="primary"
              :label="mostrarFormulario ? 'Cancelar Registro' : 'Nuevo Registro'"
              @click="toggleFormulario"
            />
          </div>
        </div>

        <!-- Filtros -->
        <div class="row q-col-gutter-x-md">
          <div class="col-12 col-md-4">
            <label for="almacen">Seleccione un Almacén</label>
            <q-select
              v-model="idAlmacenFiltro"
              :options="almacenesOptions"
              id="almacen"
              dense
              outlined
              emit-value
              map-options
              @update:model-value="cargarRobos"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-btn
              color="info"
              @click="generarPDF"
              :disable="datosTabla.length === 0"
              class="btn-res q-mt-lg"
            >
              <q-icon name="picture_as_pdf" class="icono" />
              <span class="texto">Vista Previa PDF</span>
            </q-btn>
          </div>
        </div>

        <!-- Formulario colapsable -->
        <q-dialog v-model="mostrarFormulario" persistent>
          <q-card class="responsive-dialog">
            <q-card-section class="bg-primary text-white text-h6 flex justify-between">
              <div>Registrar Extravio</div>
              <q-btn icon="close" @click="cancelarRegistro" dense flat round />
            </q-card-section>

            <q-card-section>
              <q-form @submit="registrarRobo" class="row q-col-gutter-x-md">
                <div class="col-12 col-md-4">
                  <label for="fecha">Fecha</label>
                  <q-input v-model="formulario.fecha" id="fecha" type="date" dense outlined />
                </div>
                <div class="col-12 col-md-4">
                  <label for="almacen">Almacén</label>
                  <q-select
                    v-model="formulario.almacen"
                    :options="almacenesOptions"
                    id="almacen"
                    emit-value
                    map-options
                    dense
                    outlined
                  />
                </div>
                <div class="col-12 col-md-4">
                  <label for="description">Descripción</label>
                  <q-input
                    v-model="formulario.descripcion"
                    id="description"
                    type="text"
                    dense
                    outlined
                  />
                </div>

                <div class="col-12 flex justify-start q-mt-md">
                  <q-btn type="submit" label="Registrar" color="primary" />
                  <q-btn flat label="Cancelar" color="negative" @click="cancelarRegistro" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>
        <div class="row flex justify-end">
          <div>
            <label for="buscaar">Buscar...</label>
            <q-input v-model="filtroTabla" dense debounce="300" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <!-- Tabla de robos -->
      <q-card-section>
        <q-table
          title="Extraviados"
          :rows="datosTabla"
          :columns="columnasTabla"
          row-key="id"
          :filter="filtroTabla"
          :pagination="paginacion"
          flat
          bordered
        >
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-btn
                v-if="Number(props.row.autorizacion) === 2 && editar"
                :icon="Number(props.row.autorizacion) === 1 ? 'toggle_on' : 'toggle_off'"
                dense
                flat
                :color="Number(props.row.autorizacion) === 1 ? 'green' : 'grey'"
                @click="cambiarEstado(props.row)"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="q-gutter-sm">
                <q-btn
                  icon="shopping_cart"
                  color="primary"
                  dense
                  flat
                  @click="
                    mostrarDetalle(
                      props.row.id,
                      props.row.idalmacen,
                      props.row.autorizacion,
                      props.row,
                    )
                  "
                />
                <q-btn
                  v-if="editar"
                  icon="edit"
                  color="primary"
                  dense
                  flat
                  @click="editarRobo(props.row.id)"
                />

                <q-btn
                  v-if="eliminar"
                  icon="delete"
                  color="negative"
                  dense
                  flat
                  @click="eliminarRobo(props.row.id)"
                />
                <q-btn
                  v-if="Number(props.row.autorizacion) === 1 && lectura"
                  icon="picture_as_pdf"
                  color="red"
                  dense
                  flat
                  @click="generarComprobante(props.row)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </div>

    <!-- Vista de detalle -->

    <q-dialog v-model="modaldetalleProductos">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Productos Extraviados</div>
          <q-btn icon="close" @click="volverALista" dense flat round />
        </q-card-section>
        <q-card-section>
          <q-form @submit="registrarDetalle" v-if="autorizadoRobo">
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-md-8">
                <label for="producto">Producto</label>

                <q-select
                  v-model="formularioDetalle.idproductoalmacen"
                  :options="productosOptions"
                  id="producto"
                  dense
                  outlined
                  option-value="id"
                  option-label="label"
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  clearable
                  @filter="filtrarProductos"
                  @update:model-value="cargarComprasLotes"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> No hay resultados </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-2">
                <label for="stock">Stock</label>
                <q-input
                  v-model.number="formularioDetalle.stock"
                  id="stock"
                  dense
                  type="number"
                  outlined
                  readonly
                />
              </div>
              <div class="col-12 col-md-2">
                <label for="cantidad">Cantidad</label>
                <q-input
                  v-model.number="formularioDetalle.cantidad"
                  id="cantidad"
                  dense
                  outlined
                  type="number"
                  :rules="[(val) => val <= formularioDetalle.stock || 'Cantidad excede stock']"
                />
              </div>
              <div class="col-12">
                <q-btn
                  :icon="lote ? 'toggle_on' : 'toggle_off'"
                  dense
                  flat
                  label="Lote"
                  :color="lote ? 'green' : 'grey'"
                  @click="lote = !lote"
                  title="CAMBIAR TIPO REPORTE"
                />
              </div>
              <div class="col-12 col-md-3" v-if="lote">
                <label for="provedor">Filtrar por proveedor:</label>
                <q-select
                  v-model="formularioDetalle.proveedor"
                  :options="filteredProveedores"
                  id="provedor"
                  dense
                  outlined
                  emit-value
                  map-options
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                  clearable
                  @clear="limpiarComprasFiltradas"
                  @filter="filterFn"
                  @update:model-value="filtrarComprasxProveedor"
                />
              </div>
              <div class="col-12 col-md-9" v-if="lote">
                <label for="compras">Seleccionar Lote de Compra/Producción:</label>
                <q-select
                  v-model="formularioDetalle.compra"
                  :options="filterCompras"
                  id="compras"
                  dense
                  outlined
                  emit-value
                  map-options
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                  clearable
                  @filter="filterlotes"
                />
              </div>
            </div>

            <div class="col-12 flex justify-end q-ma-md">
              <q-btn
                type="submit"
                label="Añadir"
                color="primary"
                :disable="!formularioDetalle.idproductoalmacen || !formularioDetalle.cantidad"
              />
              <q-btn
                flat
                label="Cerrar"
                color="negative"
                class="q-mr-md"
                @click="modaldetalleProductos = false"
              />
            </div>
          </q-form>

          <q-table :rows="detalleRobo" :columns="columnasDetalle" row-key="id" flat bordered>
            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <div class="q-gutter-sm">
                  <q-btn
                    v-if="editar"
                    icon="edit"
                    color="primary"
                    dense
                    flat
                    @click="editarDetalle(props.row.id)"
                  />

                  <q-btn
                    v-if="eliminar"
                    icon="delete"
                    color="negative"
                    dense
                    flat
                    @click="eliminarDetalle(props.row.id)"
                  />
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Modal PDF -->

    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { date } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { PDFextrabiosRobos } from 'src/utils/pdfReportGenerator'
import { PDFComprovanteExtravio } from 'src/utils/pdfReportGenerator'
import { obtenerPermisosPagina } from 'src/composables/FuncionesG'

const [lectura, escritura, editar, eliminar] = obtenerPermisosPagina()
console.log(lectura, escritura, editar, eliminar)
const lote = ref(true)
const pdfData = ref(null)
const mostrarModal = ref(false)

const $q = useQuasar()

const idempresa = idempresa_md5()
// Estados reactivos
const idusuario = idusuario_md5()
const vistaPrincipal = ref(true)
const mostrarFormulario = ref(false)
const idAlmacenFiltro = ref(null)
const datosTabla = ref([])
const detalleRobo = ref([])
const almacenesOptions = ref([])
const productosOptions = ref([])
const productosDisponibles = ref([])
const filtroTabla = ref('')
const detalleActual = ref({})

const modaldetalleProductos = ref(false)
const autorizadoRobo = ref(false)
const filteredProveedores = ref([])
const Proveedores = ref([])
const ComprasOriginales = ref([])
const Compras = ref([])
const filterCompras = ref([])
// Datos del formulario
const formulario = ref({
  id: null,
  fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  almacen: null,
  descripcion: '',
})

const formularioDetalle = ref({
  id: null,
  idproductoalmacen: null,
  cantidad: 0,
  stock: 0,
  producto: null,
  proveedor: null,
  compra: null,
})

// Privilegios del usuario

// Columnas de las tablas
const columnasTabla = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => datosTabla.value.indexOf(row) + 1,
    align: 'center',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'autorizacion', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

const columnasDetalle = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => detalleRobo.value.indexOf(row) + 1,
    align: 'center',
  },
  { name: 'codigolote', label: 'Código Lote', field: 'codigolote', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'acciones', label: 'Acciones', align: 'center' },
]

// Paginación
const paginacion = ref({
  rowsPerPage: 10,
})

// Fecha actual formateada

// Datos de empresa y usuario

// Métodos
const cargarAlmacenes = async () => {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    almacenesOptions.value = response.data
      .filter((a) => a.idusuario === idusuario)
      .map((a) => ({
        label: a.almacen,
        value: a.idalmacen,
      }))
    almacenesOptions.value.unshift({ label: 'Todos Los Almacenes', value: 0 })
    idAlmacenFiltro.value = almacenesOptions.value[0].value
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar almacenes',
    })
  }
}

const cargarRobos = async () => {
  try {
    const response = await api.get(`listarobo/${idempresa}`)
    console.log(response)
    console.log(idAlmacenFiltro.value)
    datosTabla.value = response.data.filter((r) => {
      return Number(idAlmacenFiltro.value) === 0
        ? true
        : Number(r.idalmacen) == Number(idAlmacenFiltro.value)
    })
  } catch (error) {
    console.error('Error al listar robos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al listar robos',
    })
  }
}

const registrarRobo = async () => {
  try {
    const formData = objectToFormData(formulario.value)
    for (let [k, v] of formData.entries()) {
      console.log(`${k}: ${v}`)
    }
    //     elseif ($ver == "registrarrobo") {
    //     $controlador = new ventas();
    //     $controlador->registrorobo($_POST['almacen'], $_POST['fecha'], $_POST['descripcion'], $_POST['idusuario']);
    // } elseif ($ver == "editarrobo") {
    //     $controlador = new ventas();
    //     $controlador->editarrobo($_POST['id'],$_POST['almacen'], $_POST['fecha'], $_POST['descripcion']);
    formData.append('idempresa', idempresa)
    formData.append('idusuario', idusuario)
    formulario.value.id
      ? formData.append('ver', 'editarrobo')
      : formData.append('ver', 'registrarrobo')

    const response = await api.post('', formData)
    console.log(response)
    $q.notify({
      type: 'positive',
      message: response.data.mensaje,
    })

    resetearFormulario()

    mostrarFormulario.value = false
    cargarRobos()
  } catch (error) {
    console.error('Error al registrar robo:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al registrar robo',
    })
  }
}

const editarRobo = async (id) => {
  try {
    const response = await api.get(`verificarExistenciarobo/${id}`)
    console.log(response)
    formulario.value = {
      id: response.data.datos.id,
      fecha: response.data.datos.fecha,
      almacen: response.data.datos.idalmacen,
      descripcion: response.data.datos.descripcion,
    }

    mostrarFormulario.value = true
  } catch (error) {
    console.error('Error al editar robo:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos del robo',
    })
  }
}

const eliminarRobo = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este registro?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarrobo/${id}`)
      $q.notify({
        type: 'positive',
        message: response.data.mensaje,
      })
      cargarRobos()
    } catch (error) {
      console.error('Error al eliminar robo:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al eliminar robo',
      })
    }
  })
}

const cambiarEstado = (row) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de cambiar el estado?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      console.log(row)
      const estado = Number(row.autorizacion) === 2 ? 1 : 2
      const response = await api.get(`actualizarEstadorobo/${row.id}/${estado}`)
      console.log(response)
      $q.notify({
        type: 'positive',
        message: response.data.mensaje,
      })
      cargarRobos()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al cambiar estado',
      })
    }
  })
}

const mostrarDetalle = async (idRobo, idalmacen, estado, row) => {
  console.log(idRobo, idalmacen, estado, row)
  detalleActual.value = {
    robo: idRobo,
    almacen: idalmacen,
    estado: estado,
  }
  if (Number(estado) === 2) {
    autorizadoRobo.value = true
  } else {
    autorizadoRobo.value = false
  }

  formularioDetalle.value.idRobo = idRobo
  //vistaPrincipal.value = false
  modaldetalleProductos.value = true
  await cargarProductosDisponibles(idRobo, idalmacen)
  await listarDetalleRobo(idRobo)
  await cargarProveedores()
}

const cargarProductosDisponibles = async (idRobo, idalmacen) => {
  try {
    const response = await api.get(`ListaProductosrobo/${idRobo}/${idalmacen}`)
    console.log(response)
    productosDisponibles.value = response.data.map((p) => ({
      id: p.idproductoalmacen,
      label: `${p.codigo} - ${p.descripcion}`,
      stock: p.stock,
      ...p,
    }))
    productosOptions.value = [...productosDisponibles.value]
  } catch (error) {
    console.error('Error al cargar productos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar productos disponibles',
    })
  }
}
async function cargarProveedores() {
  try {
    const response = await api.get(`listaProveedor/${idempresa}`)
    console.log(response)
    Proveedores.value = response.data.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}
async function cargarComprasLotes() {
  const d = formularioDetalle.value
  console.log(d)
  try {
    const response = await api.get(`listaLotesxProductoProveedor/${idempresa}`)
    const res = response.data
    const respuesta = res.data.filter(
      (item) => Number(item.idproducto) === Number(d.idproductoalmacen),
    )

    const filtrado = respuesta.map((item) => ({
      label:
        'Nro Fac: ' +
        item.nfactura +
        ' Com: ' +
        item.lote +
        ' Cod: ' +
        item.codigo +
        ' Prov.: ' +
        item.proveedor,
      value: item.idingreso,
      idproveedor: item.idproveedor,
      idproducto: item.idproducto,
    }))
    ComprasOriginales.value = filtrado
    Compras.value = filtrado
  } catch (error) {
    console.error('Error al cargar compras:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar las compras' })
  }
}

const filtrarProductos = (val, update) => {
  console.log(val, update)
  console.log(formularioDetalle.value)
  update(() => {
    if (val === '') {
      productosOptions.value = productosDisponibles.value
    } else {
      const needle = val.toLowerCase()
      productosOptions.value = productosDisponibles.value.filter(
        (p) => p.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}
const limpiarComprasFiltradas = () => {
  Compras.value = ComprasOriginales.value
}
const filtrarComprasxProveedor = () => {
  const d = formularioDetalle.value

  Compras.value = ComprasOriginales.value.filter(
    (v) => Number(v.idproveedor) === Number(d.proveedor),
  )
  d.compra = null
}
const filterFn = (val, update) => {
  update(() => {
    if (val === '') {
      filteredProveedores.value = Proveedores.value
    } else {
      const needle = val.toLowerCase()
      const paraFiltrar = filteredProveedores.value
      filteredProveedores.value = paraFiltrar.filter((v) => v.label.toLowerCase().includes(needle))
    }
  })
}
const filterlotes = (val, update) => {
  update(() => {
    if (val === '') {
      filterCompras.value = Compras.value
      console.log(filterCompras.value)
    } else {
      const fc = filterCompras.value
      const needle = val.toLowerCase()

      filterCompras.value = fc.filter((v) => v.label.toLowerCase().includes(needle))
    }
  })
}
const listarDetalleRobo = async (idRobo) => {
  try {
    console.log(idRobo)
    const response = await api.get(`listaDetallerobo/${idRobo}`)
    console.log(response)
    detalleRobo.value = response.data
  } catch (error) {
    console.error('Error al listar detalle:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al listar detalle del robo',
    })
  }
}

const registrarDetalle = async () => {
  try {
    const formdata = new FormData()
    formdata.append('id', formularioDetalle.value.id)
    formdata.append('idrobo', detalleActual.value.robo)
    formdata.append('idproductoalmacen', formularioDetalle.value.idproductoalmacen)
    formdata.append('cantidad', formularioDetalle.value.cantidad)
    formdata.append('compra', formularioDetalle.value.compra || 0)
    formularioDetalle.value.id
      ? formdata.append('ver', 'editarDetallerobos')
      : formdata.append('ver', 'registrarDetallerobos')
    for (let [k, v] of formdata.entries()) {
      console.log(`${k}: ${v}`)
    }
    const response = await api.post('', formdata)
    console.log(response)
    $q.notify({
      type: 'positive',
      message: response.data.mensaje,
    })

    resetearFormularioDetalle()
    await cargarProductosDisponibles(detalleActual.value.robo, detalleActual.value.almacen)
    await listarDetalleRobo(detalleActual.value.robo)
  } catch (error) {
    console.error('Error al registrar detalle:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al registrar detalle',
    })
  }
}

const editarDetalle = async (idDetalle) => {
  try {
    const response = await api.get(`verificarIDdetallerobo/${idDetalle}`)
    const detalle = response.data.datos
    const productoSeleccionado = productosOptions.value.find(
      (obj) => Number(obj.id) === Number(detalle.idproductoalmacen),
    )
    console.log(detalle)
    console.log(productosOptions.value)
    console.log(productoSeleccionado)

    formularioDetalle.value = {
      id: detalle.id,
      idproductoalmacen: {
        id: detalle.idproductoalmacen,
        label: `${detalle.codigo} - ${detalle.descripcion}`,
        stock: detalle.stock,
        ...detalle,
      },
      cantidad: detalle.cantidad,
      stock: detalle.stock,
      producto: `${detalle.codigo} - ${detalle.descripcion}`,
    }
  } catch (error) {
    console.error('Error al editar detalle:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalle',
    })
  }
}

const eliminarDetalle = (idDetalle) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de eliminar este detalle?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarDetallerobo/${idDetalle}`)
      $q.notify({
        type: 'positive',
        message: response.data.mensaje,
      })
      await cargarProductosDisponibles(detalleActual.value.robo, detalleActual.value.almacen)
      await listarDetalleRobo(detalleActual.value.robo)
    } catch (error) {
      console.error('Error al eliminar detalle:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al eliminar detalle',
      })
    }
  })
}

const volverALista = () => {
  modaldetalleProductos.value = false
  resetearFormularioDetalle()
}

const toggleFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value
  if (!mostrarFormulario.value) {
    resetearFormulario()
  }
}

const cancelarRegistro = () => {
  resetearFormulario()
  mostrarFormulario.value = false
}

const resetearFormulario = () => {
  formulario.value = {
    id: null,
    fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    idalmacen: null,
    descripcion: '',
  }
}

const resetearFormularioDetalle = () => {
  formularioDetalle.value = {
    id: null,
    idproductoalmacen: null,
    cantidad: 0,
    stock: 0,
    producto: null,
  }
}

const generarPDF = () => {
  if (datosTabla.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No hay datos para generar el reporte',
    })
    return
  }
  const almacen = almacenesOptions.value.find((obj) => obj.value == idAlmacenFiltro.value)
  const doc = PDFextrabiosRobos(datosTabla, almacen)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

const generarComprobante = async (robo) => {
  console.log(robo)
  // Cargar los detalles para el comprobante
  const response = await api.get(`listaDetallerobo/${robo.id}`)
  console.log(response.data)
  const doc = PDFComprovanteExtravio(response.data, robo)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Watchers
watch(idAlmacenFiltro, () => {
  cargarRobos()
})

watch(
  () => formularioDetalle.value.idproductoalmacen,
  (newVal) => {
    console.log(newVal, formularioDetalle.value.idproductoalmacen)
    if (newVal) {
      const producto = productosDisponibles.value.find((p) => p.id === newVal)
      if (producto) {
        formularioDetalle.value.stock = producto.stock
      }
    } else {
      formularioDetalle.value.stock = 0
    }
  },
)
function handleKeydown(e) {
  if (e.key === 'Escape') {
    mostrarFormulario.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
// Inicialización
onMounted(() => {
  cargarAlmacenes()

  cargarRobos()
})
</script>

<style scoped>
.my-card {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.invoice {
  position: relative;
  background-color: #fff;
  min-height: 680px;
  padding: 15px;
}

.invoice header {
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #3989c6;
}

.invoice .company-details {
  text-align: right;
}

.invoice .company-details .name {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .contacts {
  margin-bottom: 20px;
}

.invoice .invoice-to {
  text-align: left;
}

.invoice .invoice-to .to {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .invoice-details {
  text-align: right;
}

.invoice .invoice-details .invoice-id {
  margin-top: 0;
  color: #3989c6;
}

.invoice main {
  padding-bottom: 50px;
}

.invoice main .thanks {
  margin-top: -100px;
  font-size: 2em;
  margin-bottom: 50px;
}

.invoice main .notices {
  padding-left: 6px;
  border-left: 6px solid #3989c6;
}

.invoice main .notices .notice {
  font-size: 1.2em;
}

.invoice table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 20px;
}

.invoice table td,
.invoice table th {
  padding: 15px;
  background: #eee;
  border-bottom: 1px solid #fff;
}

.invoice table th {
  white-space: nowrap;
  font-weight: 400;
  font-size: 16px;
}

.invoice table td h3 {
  margin: 0;
  font-weight: 400;
  color: #3989c6;
  font-size: 1.2em;
}

.invoice table .qty,
.invoice table .total,
.invoice table .unit {
  text-align: right;
  font-size: 1.2em;
}

.invoice table .no {
  font-size: 1.6em;
  background: #3989c6;
  color: #fff;
}

.invoice table .unit {
  background: #ddd;
}

.invoice table .total {
  background: #3989c6;
  color: #fff;
}

.invoice table tbody tr:last-child td {
  border: none;
}

.invoice table tfoot td {
  background: 0 0;
  border-bottom: none;
  white-space: nowrap;
  text-align: right;
  padding: 10px 20px;
  font-size: 1.2em;
  border-top: 1px solid #aaa;
}

.invoice table tfoot tr:first-child td {
  border-top: none;
}

.invoice table tfoot tr:last-child td {
  color: #3989c6;
  font-size: 1.4em;
  border-top: 1px solid #3989c6;
}

.invoice table tfoot tr td:first-child {
  border: none;
}

.invoice footer {
  width: 100%;
  text-align: center;
  color: #777;
  border-top: 1px solid #aaa;
  padding: 8px 0;
}

@media print {
  .invoice {
    font-size: 11px !important;
    overflow: hidden !important;
  }

  .invoice footer {
    position: absolute;
    bottom: 10px;
    page-break-after: always;
  }

  .invoice > div:last-child {
    page-break-before: always;
  }
}
</style>

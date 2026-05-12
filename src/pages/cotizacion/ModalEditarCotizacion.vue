<template>
  <q-card style="min-width: 90vw; max-width: 95vw; border-radius: 16px">
    <q-card-section class="bg-primary text-white row items-center q-py-md">
      <div class="text-h6">
        <q-icon name="edit" class="q-mr-sm" />
        Editar Cotización #{{ props.idCotizacion }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pa-lg scroll" style="max-height: 80vh">
      <!-- Datos Generales -->
      <q-form ref="formGeneral">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <label class="text-weight-bold block q-mb-xs">Fecha *</label>
            <q-input
              v-model="form.fecha_cotizacion"
              type="date"
              outlined
              dense
              :rules="[(val) => !!val || 'Requerido']"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="text-weight-bold block q-mb-xs">Cliente *</label>
            <q-select
              v-model="selectedClient"
              :options="filteredClients"
              use-input
              outlined
              dense
              option-label="display"
              option-value="id"
              @filter="filterClient"
              @update:model-value="onClientSelected"
              :rules="[(val) => !!val || 'Requerido']"
            />
          </div>
          <div class="col-12 col-md-3">
            <label class="text-weight-bold block q-mb-xs">Sucursal *</label>
            <q-select
              v-model="selectedSucursal"
              :options="sucursalesOptions"
              outlined
              dense
              option-label="nombre"
              option-value="id"
              @update:model-value="onSucursalSelected"
              :rules="[(val) => !!val || 'Requerido']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-12 col-md-4">
            <label class="text-weight-bold block q-mb-xs">Almacén *</label>
            <q-select
              v-model="form.id_almacen"
              :options="almacenesOptions"
              outlined
              dense
              emit-value
              map-options
              option-label="almacen"
              option-value="idalmacen"
              @update:model-value="onAlmacenChanged"
              :rules="[(val) => !!val || 'Requerido']"
            />
          </div>
          <div class="col-12 col-md-4">
            <label class="text-weight-bold block q-mb-xs">Divisa *</label>
            <q-select
              v-model="form.divisas_id_divisas"
              :options="divisasOptions"
              outlined
              dense
              emit-value
              map-options
              option-label="nombre"
              option-value="id"
              :rules="[(val) => !!val || 'Requerido']"
            />
          </div>
          <div class="col-12 col-md-4">
            <label class="text-weight-bold block q-mb-xs">Punto de Venta</label>
            <q-select
              v-model="form.idpv"
              :options="puntosVentaOptions"
              outlined
              dense
              emit-value
              map-options
              option-label="label"
              option-value="value"
            />
          </div>
        </div>
      </q-form>

      <q-separator class="q-my-lg" />

      <!-- Añadir Productos -->
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-5">
          <label class="text-weight-bold block q-mb-xs">Producto / Servicio</label>
          <q-select
            v-model="selectedProduct"
            :options="filteredProducts"
            use-input
            outlined
            dense
            option-label="display"
            option-value="id"
            @filter="filterProduct"
            @update:model-value="onProductSelected"
          />
        </div>
        <div class="col-12 col-md-2">
          <label class="text-weight-bold block q-mb-xs">Cantidad</label>
          <q-input v-model.number="tempProduct.cantidad" type="number" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <label class="text-weight-bold block q-mb-xs">Precio</label>
          <q-input v-model.number="tempProduct.precio_unitario" type="number" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <label class="text-weight-bold block q-mb-xs">Categoría</label>
          <q-select
            v-model="tempProduct.categoria"
            :options="categoriasOptions"
            outlined
            dense
            emit-value
            map-options
            option-label="nombre"
            option-value="id"
          />
        </div>
        <div class="col-12 col-md-1">
          <q-btn
            icon="add"
            color="secondary"
            @click="addProduct"
            class="full-width"
            dense
            style="height: 40px"
          />
        </div>
      </div>

      <!-- Tabla de Productos -->
      <q-table
        :rows="form.detalles"
        :columns="columns"
        row-key="productos_almacen_id_productos_almacen"
        flat
        bordered
        class="q-mt-md"
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:body-cell-descripcionAdicional="props">
          <q-td :props="props">
            <q-input v-model="props.row.descripcionAdicional" dense borderless />
          </q-td>
        </template>
        <template v-slot:body-cell-cantidad="props">
          <q-td :props="props">
            <q-input
              v-model.number="props.row.cantidad"
              type="number"
              dense
              borderless
              @update:model-value="calculateTotals"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-precio_unitario="props">
          <q-td :props="props">
            <q-input
              v-model.number="props.row.precio_unitario"
              type="number"
              dense
              borderless
              @update:model-value="calculateTotals"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-right">
            {{ (props.row.cantidad * props.row.precio_unitario).toFixed(2) }}
          </q-td>
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              icon="delete"
              color="negative"
              flat
              round
              dense
              @click="removeProduct(props.row)"
            />
          </q-td>
        </template>
      </q-table>

      <!-- Totales -->
      <div class="row justify-end q-mt-md">
        <div class="col-12 col-md-3">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-weight-bold">Subtotal:</span>
            <span>{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-weight-bold">Descuento:</span>
            <q-input
              v-model.number="form.descuento"
              type="number"
              outlined
              dense
              style="width: 100px"
              @update:model-value="calculateTotals"
            />
          </div>
          <q-separator class="q-my-sm" />
          <div class="row items-center justify-between text-h6 text-primary">
            <span class="text-weight-bolder">Total:</span>
            <span class="text-weight-bolder">{{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right" class="q-pa-md bg-grey-2">
      <q-btn label="Cancelar" flat color="grey-8" v-close-popup />
      <q-btn label="Guardar Cambios" color="primary" @click="save" :loading="loading" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { validarUsuario, normalizeText } from 'src/composables/FuncionesG'

const props = defineProps({
  idCotizacion: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['saved'])
const $q = useQuasar()
const idempresa = idempresa_md5()
const loading = ref(false)
const formGeneral = ref(null)

const form = reactive({
  ver: 'editarCotizacion',
  id_cotizacion: props.idCotizacion,
  fecha_cotizacion: '',
  descuento: 0,
  cliente_id_cliente: null,
  divisas_id_divisas: null,
  id_usuario: null,
  idsucursal: null,
  estado: null,
  idpv: null,
  idcanal: null,
  num: null,
  id_almacen: null,
  condicion: 2, // Tipo NOR por defecto para edición
  detalles: [],
})

const subtotal = ref(0)
const total = ref(0)

const selectedClient = ref(null)
const selectedSucursal = ref(null)
const selectedProduct = ref(null)
const tempProduct = reactive({
  cantidad: 1,
  precio_unitario: 0,
  productos_almacen_id_productos_almacen: null,
  descripcionAdicional: '',
  categoria: null,
  display: '',
})

const clientesOptions = ref([])
const filteredClients = ref([])
const sucursalesOptions = ref([])
const almacenesOptions = ref([])
const divisasOptions = ref([])
const puntosVentaOptions = ref([])
const productosOptions = ref([])
const filteredProducts = ref([])
const categoriasOptions = ref([])

const columns = [
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  {
    name: 'descripcionAdicional',
    label: 'Nota Adic.',
    align: 'left',
    field: 'descripcionAdicional',
  },
  { name: 'cantidad', label: 'Cant.', align: 'center', field: 'cantidad' },
  { name: 'precio_unitario', label: 'Precio', align: 'right', field: 'precio_unitario' },
  { name: 'total', label: 'Total', align: 'right', field: 'total' },
  { name: 'acciones', label: 'Acciones', align: 'center', field: 'acciones' },
]

const loadData = async () => {
  $q.loading.show({ message: 'Cargando datos...' })
  try {
    const user = validarUsuario()[0]
    form.id_usuario = user.idusuario

    // 1. Fetch Almacenes
    const respAlm = await api.get(`listaResponsableAlmacen/${idempresa}`)
    almacenesOptions.value = respAlm.data.filter((u) => u.idusuario === user.idusuario)

    // 2. Fetch Divisas
    const respDiv = await api.get(`listaDivisa/${idempresa}`)
    divisasOptions.value = respDiv.data.filter((u) => Number(u.estado) === 1)

    // 3. Fetch Clientes
    const respCli = await api.get(`listaCliente/${idempresa}`)
    clientesOptions.value = respCli.data.map((c) => ({
      ...c,
      display: `${c.codigo} - ${c.nombre} - ${c.nombrecomercial} - ${c.nit}`,
    }))

    // 4. Fetch Categotias de Precio
    const respCat = await api.get(`listarCategoriaPrecioVenta/${idempresa}`)
    categoriasOptions.value = respCat.data.filter((u) => Number(u.estado) === 1)

    // 5. Fetch Cotizacion Details
    const respDet = await api.get(`detallesCotizacion/${props.idCotizacion}/${idempresa}`)
    const data = respDet.data
    console.log('Detalles de Cotización:', data)

    if (data && data.length > 0) {
      const info = data[0]
      const { cotizacion, cliente, almacen, divisa, detalle } = info

      form.fecha_cotizacion = cotizacion.fecha
      form.descuento = Number(cotizacion.descuento)
      form.cliente_id_cliente = cliente.idcliente
      form.idsucursal = cliente.idsucursal
      form.id_almacen = almacen.idalmacen
      form.divisas_id_divisas = divisa.monedasin
      form.idpv = cotizacion.idpv
      form.condicion = Number(cotizacion.condicion)

      // Find and set selected client
      selectedClient.value = clientesOptions.value.find(
        (c) => Number(c.id) === Number(cliente.idcliente),
      )
      if (selectedClient.value) {
        await fetchSucursales(cliente.idcliente)
        selectedSucursal.value = sucursalesOptions.value.find(
          (s) => Number(s.id) === Number(cliente.idsucursal),
        )
      }

      await fetchPuntosVenta(almacen.idalmacen)

      // Map details
      form.detalles = detalle.map((d) => ({
        productos_almacen_id_productos_almacen: d.idproductoalmacen,
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio),
        descripcionAdicional: d.descripcionAdicional || '',
        categoria: d.categoria,
        codigo: d.codigoProducto,
        descripcion: d.descripcion,
      }))

      calculateTotals()
      await fetchProducts()
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar la información de la cotización.' })
  } finally {
    $q.loading.hide()
  }
}

const fetchSucursales = async (clientId) => {
  try {
    const resp = await api.get(`listaSucursal/${clientId}`)
    sucursalesOptions.value = resp.data
  } catch (e) {
    console.error(e)
  }
}

const fetchPuntosVenta = async (idalmacen) => {
  try {
    const user = validarUsuario()[0]
    const { data } = await api.get(`listaPuntoVentaFacturaCotizacion/${user.idusuario}`)
    if (data && data.datos) {
      const filtrados = data.datos.filter((u) => Number(u.idalmacen) === Number(idalmacen))
      puntosVentaOptions.value = filtrados.map((item) => ({
        label: item.nombre,
        value: item.idpuntoventa,
      }))
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchProducts = async () => {
  if (!form.id_almacen) return
  try {
    const resp = await api.get(`listaProductosDisponiblesVenta/${idempresa}`)
    if (resp.data && resp.data.datos) {
      // For editing, we might need products from other categories too, but let's stick to what's available
      productosOptions.value = resp.data.datos.map((p) => ({
        ...p,
        display: `${p.codigo} - ${p.descripcion}`,
      }))
    }
  } catch (e) {
    console.error(e)
  }
}

const filterClient = (val, update) => {
  if (val === '') {
    update(() => (filteredClients.value = clientesOptions.value))
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredClients.value = clientesOptions.value.filter(
      (v) => normalizeText(v.display).toLowerCase().indexOf(needle) > -1,
    )
  })
}

const onClientSelected = (client) => {
  if (client) {
    form.cliente_id_cliente = client.id
    fetchSucursales(client.id)
    selectedSucursal.value = null
    form.idsucursal = null
  }
}

const onSucursalSelected = (suc) => {
  if (suc) form.idsucursal = suc.id
}

const onAlmacenChanged = (val) => {
  fetchPuntosVenta(val)
  fetchProducts()
}

const filterProduct = (val, update) => {
  if (val === '') {
    update(() => (filteredProducts.value = productosOptions.value))
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredProducts.value = productosOptions.value.filter(
      (v) => normalizeText(v.display).toLowerCase().indexOf(needle) > -1,
    )
  })
}

const onProductSelected = (prod) => {
  if (prod) {
    tempProduct.productos_almacen_id_productos_almacen = prod.id
    tempProduct.precio_unitario = Number(prod.precio)
    tempProduct.categoria = prod.idporcentaje
    tempProduct.codigo = prod.codigo
    tempProduct.descripcion = prod.descripcion
  }
}

const addProduct = () => {
  if (!tempProduct.productos_almacen_id_productos_almacen || tempProduct.cantidad <= 0) {
    $q.notify({ type: 'warning', message: 'Seleccione un producto y cantidad válida.' })
    return
  }

  // Check if product already exists
  const existing = form.detalles.find(
    (d) =>
      d.productos_almacen_id_productos_almacen ===
      tempProduct.productos_almacen_id_productos_almacen,
  )
  if (existing) {
    existing.cantidad += tempProduct.cantidad
  } else {
    form.detalles.push({ ...tempProduct })
  }

  calculateTotals()
  // Reset temp
  selectedProduct.value = null
  tempProduct.productos_almacen_id_productos_almacen = null
  tempProduct.cantidad = 1
  tempProduct.precio_unitario = 0
  tempProduct.descripcionAdicional = ''
}

const removeProduct = (row) => {
  form.detalles = form.detalles.filter(
    (d) => d.productos_almacen_id_productos_almacen !== row.productos_almacen_id_productos_almacen,
  )
  calculateTotals()
}

const calculateTotals = () => {
  let sub = 0
  form.detalles.forEach((d) => {
    sub += d.cantidad * d.precio_unitario
  })
  subtotal.value = sub
  total.value = sub - (form.descuento || 0)
}

const save = async () => {
  const valid = await formGeneral.value.validate()
  if (!valid) return

  if (form.detalles.length === 0) {
    $q.notify({ type: 'warning', message: 'Debe agregar al menos un producto.' })
    return
  }

  loading.value = true
  try {
    const payload = { ...form }
    // Clean up details for API
    payload.detalles = form.detalles.map((d) => ({
      cantidad: Number(d.cantidad),
      precio_unitario: Number(d.precio_unitario),
      productos_almacen_id_productos_almacen: Number(d.productos_almacen_id_productos_almacen),
      descripcionAdicional: d.descripcionAdicional || null,
      categoria: Number(d.categoria),
    }))

    // Ensure all numeric fields are correctly typed
    payload.id_cotizacion = Number(payload.id_cotizacion)
    payload.descuento = Number(payload.descuento)
    payload.cliente_id_cliente = Number(payload.cliente_id_cliente)
    payload.divisas_id_divisas = Number(payload.divisas_id_divisas)
    payload.id_usuario = Number(payload.id_usuario)
    payload.idsucursal = Number(payload.idsucursal)
    payload.id_almacen = Number(payload.id_almacen)
    payload.idpv = payload.idpv ? Number(payload.idpv) : null

    console.log('Payload a enviar para actualización:', payload)

    const response = await api.post('', payload)
    if (response.data.estado === 'exito' || response.data[0] === 'exito') {
      $q.notify({ type: 'positive', message: 'Cotización actualizada correctamente.' })
      emit('saved')
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Error al actualizar la cotización.',
      })
    }
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({ type: 'negative', message: 'Error de servidor al guardar los cambios.' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

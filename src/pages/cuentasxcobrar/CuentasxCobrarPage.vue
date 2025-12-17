<template>
  <q-page class="q-pa-md">
    <!-- Contenedor principal -->
    <div v-if="vistaActiva === 'principal'">
      <!-- Filtros y botones superiores -->
      <div class="row q-col-gutter-x-md q-mb-md">
        <div class="col-12 col-md-3">
          <label for="almacen">Almacén</label>
          <q-select
            v-model="filtroAlmacen"
            :options="opcionesAlmacenes"
            id="almacen"
            dense
            outlined
            style="min-width: 200px"
            @update:model-value="filtrarDatos"
            map-options
            class="q-mr-sm"
            clearable
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="estado">Tipo</label>
          <q-select
            v-model="filtroEstado"
            :options="opcionesEstados"
            id="estado"
            dense
            outlined
            @update:model-value="filtrarDatos"
            map-options
            clearable
          />
        </div>
      </div>

      <!-- Tabla principal -->

      <tablaCuentasxCobrar
        ref="refHijo"
        :rows="datosFiltrados"
        @cargar-formulario="cargarFormulario"
        @mostrar-detalles="mostrarDetalles"
      />
    </div>

    <!-- Formulario de registro -->
    <q-dialog v-model="mostrarForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div class="text-h6">Registrar Cobro</div>
          <q-btn icon="close" flat round dense @click="mostrarForm = false" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="registrarCobro">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label for="cliente">Cliente</label>
                <q-input v-model="formulario.cliente" id="cliente" dense outlined readonly />
              </div>
              <div class="col-12 col-md-6">
                <label for="fecha">Fecha</label>
                <q-input
                  v-model="formulario.fecha"
                  id="fecha"
                  dense
                  outlined
                  type="date"
                  :rules="[(val) => !!val || 'Campo requerido']"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="Sucursal">Sucursal</label>
                <q-input
                  v-model="formulario.sucursal"
                  id="Sucursal"
                  dense=""
                  outlined=""
                  readonly
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="nroCobros">N° Cobros</label>
                <q-input
                  v-model="formulario.numeroCobros"
                  id="nroCobros"
                  dense
                  outlined
                  :rules="[
                    (val) => !!val || 'Campo requerido',
                    (val) =>
                      val <= formulario.cuotasPendientes ||
                      'No puede ser mayor a cuotas pendientes',
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  @update:model-value="calcularTotales"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="total">Total venta</label>
                <q-input v-model="formulario.deudaTotal" id="total" dense outlined readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="totalacobrar">Total a Cobrar</label>
                <q-input
                  v-model="formulario.totalCobro"
                  id="totalacobrar"
                  dense
                  outlined
                  :rules="[
                    (val) => !!val || 'Campo requerido',
                    (val) =>
                      val <= parseFloat(formulario.saldoPendiente) || 'No puede ser mayor al saldo',
                  ]"
                  :disable="formulario.cuotasPendientes === 1"
                  @update:model-value="calcularNumeroCobros"
                >
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="saldo">Saldo</label>

                <q-input v-model="formulario.saldoPendiente" id="saldo" dense outlined="" readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="saldoporcobrar">Saldo por Cobrar</label>
                <q-input
                  v-model="formulario.saldoPorCobrar"
                  id="saldoporcobrar"
                  dense
                  outlined
                  readonly
                >
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <label for="pendiente">Cuotas pendientes</label>
                <q-input
                  v-model="formulario.cuotasPendientes"
                  id="pendiente"
                  dense
                  outlined
                  readonly
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="comprobante">Comprobante</label>
                <q-file
                  v-model="formulario.comprobante"
                  id="comprobante"
                  dense
                  outlined
                  accept=".jpg,.jpeg,.png"
                  @update:model-value="convertirImagen"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="cuota">Cuota individual</label>
                <q-input v-model="formulario.valorCuota" id="cuota" dense outlined readonly>
                  <template v-slot:append>
                    <span>{{ divisa }}</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6"></div>

              <div class="col-6"></div>
            </div>

            <div class="q-mt-md text-center">
              <q-btn label="Registrar" type="submit" color="primary" />
              <q-btn
                label="Cancelar"
                color="negative"
                flat
                @click="cerrarFormulario"
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Vista de detalles -->
    <div v-if="vistaActiva === 'detalles'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <q-btn
            label="Volver"
            icon="arrow_back"
            color="primary"
            @click="vistaActiva = 'principal'"
          />
        </div>
        <div class="col text-center">
          <div class="text-h6">Detalle de Cobros Realizados</div>
        </div>
        <div class="col"></div>
      </div>

      <q-table
        :rows="detallesCobros"
        :columns="columnasDetalles"
        row-key="id"
        @row-click="onRowClick"
        flat
        bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template v-slot:body-cell-comprobante="props">
          <q-td :props="props">
            <q-img
              :src="props.value"
              style="width: 50px; height: 50px; cursor: pointer"
              @click="mostrarImagen(props.value)"
            />
          </q-td>
        </template>
      </q-table>

      <div class="row q-mt-md">
        <div class="col-8"></div>
        <div class="col-4">
          <q-markup-table flat bordered>
            <tbody>
              <tr>
                <td class="text-right">Total Venta</td>
                <td>{{ formatoMoneda(detalleSeleccionado.totalVenta) }}</td>
              </tr>
              <tr>
                <td class="text-right">Total Cobrado</td>
                <td>{{ formatoMoneda(totalCobrado) }}</td>
              </tr>
              <tr>
                <td class="text-right">Saldo</td>
                <td>{{ formatoMoneda(detalleSeleccionado.saldo) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>

    <!-- Diálogo para mostrar imagen -->
    <q-dialog v-model="mostrarDialogoImagen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Comprobante de Cobro</div>
        </q-card-section>
        <q-card-section class="text-center">
          <q-img :src="imagenSeleccionada" style="max-width: 600px; max-height: 600px" />
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
import { URL_APICM } from 'src/composables/services'
import { obtenerFechaActualDato, validarUsuario } from 'src/composables/FuncionesG'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { redondear } from 'src/composables/FuncionesG'
import { decimas } from 'src/composables/FuncionesG'
import { obtenerFechaActual } from 'src/composables/FuncionesG'
import { convertirImagenUtil } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import emitter from 'src/event-bus'
import tablaCuentasxCobrar from './tablaCuentasxCobrar.vue'
import { obtenerPermisosPagina } from 'src/composables/FuncionesG'
const permisos = obtenerPermisosPagina()
console.log(permisos)
const $q = useQuasar()
const vistaActiva = ref('principal')
const mostrarForm = ref(false)
const cargando = ref(false)
const mostrarDialogoImagen = ref(false)
const imagenSeleccionada = ref('')
const divisa = ref('$') // Se actualizará con cargarDivisas
const rows = ref([])
// Filtros
const filtroAlmacen = ref({ value: 0, label: 'Todos los almacenes' })
const filtroEstado = ref({ value: '', label: 'Todos' })

// Datos
const datosOriginales = ref([])
const detallesCobros = ref([])
const opcionesAlmacenes = ref([])
const detalleSeleccionado = ref({
  id: null,
  totalVenta: 0,
  saldo: 0,
})

// Formulario
const formulario = ref({
  idCredito: null,
  cliente: '',
  sucursal: '',
  deudaTotal: '0.00',
  saldoPendiente: '0.00',
  cuotasPendientes: 0,
  valorCuota: '0.00',
  fecha: obtenerFechaActual(),
  numeroCobros: 0,
  totalCobro: '0.00',
  saldoPorCobrar: '0.00',
  comprobante: null,
  imagenConvertida: null,
})

// Columnas de la tabla de detalles
const columnasDetalles = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'fecha', label: 'Fecha de cobro', field: 'fecha', align: 'center' },
  {
    name: 'cuotas',
    label: 'N° cobros',
    field: 'ncuotas',
    align: 'center',
    format: (val) => decimas(val),
  },
  { name: 'comprobante', label: 'Comprobante', field: 'imagen', align: 'center' },
  {
    name: 'monto',
    label: 'Total cobro',
    field: 'monto',
    align: 'right',
    format: (val) => decimas(redondear(parseFloat(val))),
  },
]

// Opciones para filtros
const opcionesEstados = [
  { value: '', label: 'Todos' },
  { value: 'VE', label: 'Ventas-Facturadas' },
  { value: 'COT', label: 'Cotizaciones' },
]

const estados = {
  1: 'Activo',
  2: 'Finalizado',
  3: 'Atrasado',
  4: 'Anulado',
}

const onRowClick = (evt, row, index) => {
  alert('Click en fila', index, row.id, row)
}

const datosFiltrados = computed(() => {
  let datos = [...rows.value]
  if (Number(filtroAlmacen.value?.value) !== 0) {
    datos = datos.filter((item) => Number(item.idalmacen) === Number(filtroAlmacen.value?.value))
  }
  if (filtroEstado.value?.value !== '') {
    const tipo = filtroEstado.value
    datos = datos.filter((item) => item.tipo_cobro == tipo.value)
  }

  return datos
})

const totalCobrado = computed(() => {
  return detallesCobros.value.reduce((total, item) => {
    return total + parseFloat(item.monto || 0)
  }, 0)
})

// Métodos
const cargarDatos = async () => {
  cargando.value = true
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa

    const response = await api.get(`listacuentasxcobrar/${idempresa}`)
    const data = response.data

    rows.value = response.data.map((obj, index) => ({
      id: obj.id,
      fechaventa: cambiarFormatoFecha(obj.fechaventa),
      cliente: obj.cliente,
      ncuotas: Number(obj.ncuotas),
      valorcuota: obj.valorcuota,
      saldo: Number(decimas(redondear(parseFloat(obj.saldo)))),
      ventatotal: Number(decimas(redondear(parseFloat(obj.ventatotal)))),
      fechalimite: cambiarFormatoFecha(obj.fechalimite),
      idalmacen: obj.idalmacen,
      cuotaspagas: obj.cuotaspagas || 0,
      estado: obj.estado,
      estadoLabel: estados[obj.estado],
      nfactura: Number(obj.nfactura),
      estadoventa: obj.estadoventa,
      sucursal: obj.sucursal,
      totalcobrado: Number(decimas(redondear(parseFloat(obj.totalcobrado ?? 0.0)))),
      tipo_cobro: obj.tipo_cobro,
      almacen: obj.almacen,
      numero: index + 1,
    }))
    if (data.estado === 'error') throw new Error(data.error)

    await actualizarEstados(data)
    datosOriginales.value = data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Error al cargar datos: ${error.message}`,
    })
  } finally {
    cargando.value = false
  }
}

const actualizarEstados = async (data) => {
  const use = data.filter((u) => u.estado == 1 && u.saldo != 0 && u.estadoventa == 1)

  const promises = use.map(async (key) => {
    let fecha1 = new Date()
    let fecha2 = new Date(key.fechalimite)
    fecha1 = Math.floor(fecha1.getTime() / (1000 * 3600 * 24))
    fecha2 = Math.floor(fecha2.getTime() / (1000 * 3600 * 24))

    if (fecha1 > fecha2 && key.saldo > 0 && key.estado != 3 && key.estadoventa == 1) {
      await cambiarEstado(key.id, 3)
    }
  })

  await Promise.all(promises)
}

const cambiarEstado = async (id, code) => {
  try {
    const resp = await api.get(`cambiarcreditomoroso/${id}/${code}`)
    const data = resp.data
    console.log(data)
  } catch (error) {
    console.error('Error al cambiar estado:', error)
  }
}

const cargarAlmacenes = async () => {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const idusuario = contenidousuario[0]?.idusuario

    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const resultado = response.data
    if (resultado[0] == 'error') {
      throw new Error(resultado.error)
    }

    opcionesAlmacenes.value = [
      { value: 0, label: 'Todos los almacenes' },
      ...resultado
        .filter((u) => u.idusuario == idusuario)
        .map((key) => ({
          value: key.idalmacen,
          label: key.almacen,
        })),
    ]
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Error al cargar almacenes: ${error.message}`,
    })
  }
}

const cargarFormulario = (dato) => {
  formulario.value = {
    idCredito: dato.id,
    cliente: dato.cliente,
    sucursal: dato.sucursal,
    deudaTotal: decimas(dato.ventatotal),
    saldoPendiente: decimas(dato.saldo),
    cuotasPendientes: parseFloat(dato.ncuotas) - parseFloat(dato.cuotaspagas || 0),
    valorCuota: decimas(dato.valorcuota),
    fecha: obtenerFechaActualDato(),
    numeroCobros: 0,
    totalCobro: '0.00',
    saldoPorCobrar: '0.00',
    comprobante: null,
    imagenConvertida: null,
  }

  // Si solo queda 1 cuota pendiente
  if (formulario.value.cuotasPendientes === 1) {
    formulario.value.numeroCobros = 1
    formulario.value.totalCobro = decimas(redondear(parseFloat(formulario.value.saldoPendiente)))
    formulario.value.saldoPorCobrar = 0
  }

  mostrarForm.value = true
}

const calcularTotales = () => {
  const numCobros = parseFloat(formulario.value.numeroCobros || 0)
  const valorCuota = parseFloat(formulario.value.valorCuota || 0)
  const saldoPendiente = parseFloat(formulario.value.saldoPendiente || 0)

  if (numCobros <= formulario.value.cuotasPendientes) {
    if (numCobros === formulario.value.cuotasPendientes) {
      formulario.value.totalCobro = decimas(redondear(saldoPendiente))
      formulario.value.saldoPorCobrar = 0
    } else {
      formulario.value.totalCobro = decimas(redondear(numCobros * valorCuota))
      formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - numCobros * valorCuota))
    }
  } else {
    $q.notify({
      type: 'warning',
      message: 'El N°Cobros no puede ser mayor a los cobros pendientes',
    })
    formulario.value.numeroCobros = 0
    formulario.value.totalCobro = '0.00'
  }
}

const calcularNumeroCobros = () => {
  const totalCobro = parseFloat(formulario.value.totalCobro || 0)
  const saldoPendiente = parseFloat(formulario.value.saldoPendiente || 0)
  const valorCuota = parseFloat(formulario.value.valorCuota || 0)

  if (totalCobro > saldoPendiente) {
    formulario.value.totalCobro = '0.00'
    formulario.value.numeroCobros = 0
    formulario.value.saldoPorCobrar = 0

    $q.notify({
      type: 'warning',
      message: 'El monto ingresado no puede ser mayor al saldo pendiente',
    })

    if (formulario.value.cuotasPendientes === 1) {
      formulario.value.totalCobro = formulario.value.saldoPendiente
      formulario.value.numeroCobros = formulario.value.cuotasPendientes
      formulario.value.saldoPorCobrar = 0
    }
  } else {
    if (totalCobro === saldoPendiente) {
      formulario.value.totalCobro = formulario.value.saldoPendiente
      formulario.value.saldoPorCobrar = decimas(0)
      formulario.value.numeroCobros = formulario.value.cuotasPendientes
    } else {
      if (totalCobro <= valorCuota) {
        formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - totalCobro))
        formulario.value.numeroCobros = 1
      } else {
        const nrocuotas = Math.floor(totalCobro / valorCuota)
        formulario.value.saldoPorCobrar = decimas(redondear(saldoPendiente - totalCobro))
        formulario.value.numeroCobros = nrocuotas
      }
    }
  }
}

const convertirImagen = async (file) => {
  if (!file) {
    formulario.value.imagenConvertida = null
    return
  }

  try {
    const imagen = await convertirImagenUtil(file)
    formulario.value.imagenConvertida = imagen
  } catch (error) {
    console.log('error al convertir en imagen', error)
    $q.notify({
      type: 'negative',
      message: 'Error al procesar la imagen',
    })
  }
}

const registrarCobro = async () => {
  if (parseFloat(formulario.value.saldoPorCobrar) < 0) {
    $q.notify({
      type: 'negative',
      message: 'No se calculó el saldo por cobrar, inténtelo nuevamente',
    })
    return
  }

  try {
    const datos = new FormData()
    datos.append('ver', 'registroPagoCuentaxCobrar')
    datos.append('idestadocobro', formulario.value.idCredito)
    datos.append('ncuotas', formulario.value.numeroCobros)
    datos.append('total', formulario.value.totalCobro)
    datos.append('saldo', formulario.value.saldoPorCobrar)
    datos.append('fecha', formulario.value.fecha)

    if (formulario.value.imagenConvertida) {
      datos.append('imagen', formulario.value.imagenConvertida)
    } else {
      datos.append('imagen', '')
    }

    // const response = await fetch(`${URL_APICM}api/`, {
    //   method: 'POST',
    //   body: datos,
    // })
    const response = await api.post(``, datos) // Replace with your actual API endpoint
    console.log(response)

    const data = response.data

    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: 'Cobro registrado correctamente',
      })

      emitter.emit('reiniciar-notificaciones')
      cargarDatos()
      cerrarFormulario()
    } else {
      throw new Error(data.mensaje || 'Error al registrar el cobro')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Error al registrar el cobro: ${error.message}`,
    })
  }
}

const cerrarFormulario = () => {
  mostrarForm.value = false
}

const mostrarDetalles = async (dato) => {
  detalleSeleccionado.value = {
    id: dato.id,
    totalVenta: dato.ventatotal,
    saldo: dato.saldo,
  }

  try {
    const response = await api.get(`listadetallecobros/${dato.id}`)

    const data = response.data
    if (data.estado === 'error') throw new Error(data.error)

    detallesCobros.value = data.map((item, index) => ({
      ...item,
      numero: index + 1,
      imagen: `${URL_APICM}api/${item.imagen}`,
    }))

    vistaActiva.value = 'detalles'
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Error al cargar detalles: ${error.message}`,
    })
  }
}

const mostrarImagen = (imagen) => {
  imagenSeleccionada.value = imagen
  mostrarDialogoImagen.value = true
}

const formatoMoneda = (valor) => {
  return decimas(redondear(parseFloat(valor || 0)))
}
function handleKeydown(e) {
  if (e.key === 'Escape') {
    mostrarForm.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  emitter.on('realizar-pago', (Notification) => {
    console.log(Notification)
    document.getElementById(`btn-${Notification.id}`).click() // accedemos al elemento real del q-btn
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
// Inicialización
onMounted(() => {
  cargarDatos()
  cargarAlmacenes()
  // Aquí deberías cargar la divisa con cargarDivisas()
})
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>

<template>
  <q-card class="document-preview q-pa-md">
    <q-card-section class="text-center">
      <div class="text-h4 text-weight-bold">{{ $t('ui.nota-de-credito-debito-5d732c') }}</div>
      <div class="text-subtitle1 cm-text">{{ $t('ui.razon-social-6c6fb2') }} {{ nota.nombreRazonSocial }}</div>
      <div>NIT: {{ nota.numeroDocumento }}</div>
    </q-card-section>
    <q-separator inset />
    <q-card-section>
      <div class="text-h6 section-title">{{ $t('ui.datos-de-la-factura-original-6c2229') }}</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.nro-factura-2169b6') }}</q-item-label>
              <q-item-label class="text-weight-medium">{{
                nota.facturaExterna.numeroFactura
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.fecha-factura-004d53') }}</q-item-label>
              <q-item-label>{{
                new Date(nota.facturaExterna.fechaFacturaOriginal).toLocaleDateString('es-BO')
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.monto-total-original-e1662f') }}</q-item-label>
              <q-item-label class="text-weight-medium"
                >Bs. {{ nota.facturaExterna.montoTotalFacturaOriginal.toFixed(2) }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.cuf-original-0d7e37') }}</q-item-label>
              <q-item-label class="cuf-text">{{
                nota.facturaExterna.numeroAutorizacionCuf
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="text-h6 section-title">{{ $t('ui.detalle-factura-4da33c') }}</div>
      <q-table
        flat
        bordered
        :rows="nota.facturaExterna.detalleFacturaOriginal"
        :columns="columnsDetalle"
        row-key="codigoProducto"
        hide-bottom
        class="q-mt-md"
      />
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="text-h6 section-title">{{ $t('ui.datos-de-la-nota-bf0ec8') }}</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-6">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.codigo-cliente-fd5d95') }}</q-item-label>
              <q-item-label>{{ nota.codigoCliente }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.usuario-5a75b0') }}</q-item-label>
              <q-item-label>{{ nota.usuario }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-6">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.punto-de-venta-0effa9') }}</q-item-label>
              <q-item-label>{{ getPuntoVenta(nota.codigoPuntoVenta) }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.documento-de-identidad-6a60fb') }}</q-item-label>
              <q-item-label>
                {{ getTipoDocumento(nota.codigoTipoDocumentoIdentidad) }} -
                {{ nota.numeroDocumento }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.leyenda-540211') }}</q-item-label>
              <q-item-label>{{ getLeyenda(nota.codigoLeyenda) }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="text-h6 section-title">{{ $t('ui.detalle-de-la-devolucion-ajuste-a62e69') }}</div>
      <q-table
        flat
        bordered
        :rows="nota.detalles"
        :columns="ColumnsDetalleAjuste"
        row-key="codigoProducto"
        hide-bottom
        class="q-mt-md"
      >
        <!-- Edición en línea de cliente -->

        <template v-slot:body-cell-cantidad="props">
          <q-td :props="props" style="cursor: pointer; background-color: #f9f9f9">
            <q-popup-edit
              v-if="Number(props.row.cantidad) !== 1"
              v-model.number="props.row.cantidad"
              v-slot="scope"
            >
              <label for="cantidad">{{ $t('ui.cantidad-b5b6f8') }}</label>
              <q-input
                v-model.number="scope.value"
                outlined
                dense
                autofocus
                type="number"
                id="cantidad"
                @keyup.enter="validar(scope, props.row)"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit>
            {{ props.row.cantidad }}
            <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
          </q-td>
        </template>
        <template v-slot:body-cell-esPerdida="props">
          <q-td :props="props">
            <q-toggle
              v-model="props.row.esPerdida"
              checked-icon="check"
              unchecked-icon="close"
              color="red"
              @update:model-value="(val) => onTogglePerdida(props.row, val)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-cantidadPerdida="props">
          <q-td :props="props" style="background-color: #f9f9f9">
            <q-popup-edit v-model.number="props.row.cantidadPerdida" v-slot="scope">
              <label for="cantidadPerdida">{{ $t('ui.cantidad-perdida-b1d003') }}</label>
              <q-input
                v-model.number="scope.value"
                outlined
                dense
                :disable="!props.row.esPerdida"
                autofocus
                type="number"
                :max="props.row.cantidad"
                :rules="[
                  (val) => val >= 0 || $t('ui.debe-ser-mayor-o-igual-a-0-003cf7'),
                  (val) => val <= props.row.cantidad || $t('ui.no-puede-superar-la-cantidad-devuelta-6cf480'),
                ]"
                id="cantidadPerdida"
                @keyup.enter="scope.set"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit>
            {{ props.row.cantidadPerdida }}
            <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
          </q-td>
        </template>

        <template v-slot:body-cell-precioUnitario="props">
          <q-td :props="props">
            <!-- <q-popup-edit v-model.number="props.row.precioUnitario" v-slot="scope">
              <label for="preciounitario">Precio Unitario</label>
              <q-input
                v-model.number="scope.value"
                outlined
                dense
                autofocus
                type="number"
                step="0.01"
                inputmode="decimal"
                id="preciounitario"
                @keyup.enter="validar(scope, props.row)"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit> -->
            {{ props.row.precioUnitario }}
            <!-- <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" /> -->
          </q-td>
        </template>

        <template v-slot:body-cell-montoDescuento="props">
          <q-td :props="props">
            <!-- <q-popup-edit v-model.number="props.row.montoDescuento" v-slot="scope">
              <label for="descuento">Descuento</label>
              <q-input
                v-model.number="scope.value"
                outlined
                dense
                autofocus
                type="number"
                step="0.01"
                inputmode="decimal"
                id="descuento"
                @keyup.enter="validarMontoDescuento(scope, props.row)"
                @keyup.esc="scope.cancel"
              />
            </q-popup-edit> -->
            {{ props.row.montoDescuento }}
            <!-- <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" /> -->
          </q-td>
        </template>
        <template v-slot:body-cell-subTotal="props">
          <q-td :props="props">
            {{
              props.row.subTotal =
                Number(props.row.cantidad) * parseFloat(props.row.precioUnitario) -
                parseFloat(props.row.montoDescuento)
            }}
          </q-td>
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              color="negative"
              icon="delete"
              dense
              flat
              round
              @click="eliminarDetalleNota(props.pageIndex)"
              :title="$t('ui.eliminar-este-item-1ec76e')"
            />
          </q-td>
        </template>

        <!-- Edición en línea de total -->
      </q-table>
    </q-card-section>

    <q-card-section>
      <div class="row justify-end">
        <div class="col-12 col-md-5">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('ui.descuento-adicional-c87c9a') }}</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-weight-medium">
                  <q-popup-edit v-model.number="nota.montoDescuentoCreditoDebito" v-slot="scope">
                    <q-input
                      v-model.number="scope.value"
                      outlined
                      dense
                      autofocus
                      type="number"
                      step="0.01"
                      inputmode="decimal"
                      @keyup.enter="validarMonto(scope)"
                      @keyup.esc="scope.cancel"
                    />
                  </q-popup-edit>
                  {{ nota.montoDescuentoCreditoDebito.toFixed(2) }}
                  <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="cm-surface-2">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ $t('ui.monto-total-devuelto-be61ba') }}</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-h6 text-weight-bold">
                  {{ nota.montoTotalDevuelto = montoTotalDevuelto }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('ui.monto-efectivo-credito-debito-6afeaf') }}</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-weight-medium">
                  {{ nota.montoEfectivoCreditoDebito = montoefectivoCreditoDebito }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>

    <q-separator class="q-mt-md" />

    <q-card-actions align="right" class="q-pa-md">
      <q-btn flat :label="$t('common.cancel')" color="grey-8" icon="cancel" @click="$emit('cancelar')" />
      <q-btn
        unelevated
        :label="$t('ui.confirmar-registro-f23a8b')"
        color="primary"
        icon="check_circle"
        @click="confirmarNota()"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { defineProps, ref, onMounted, computed } from 'vue'
import { getfechaCodigo, validarUsuario } from 'src/composables/FuncionesG'
import { peticionGET } from 'src/composables/peticionesFetch'
import { URL_APICM } from 'src/composables/services'
import { useQuasar } from 'quasar'
import { showDialog } from 'src/utils/dialogs'
import { api } from 'boot/axios'

import axios from 'axios'
const $q = useQuasar()
// =============================================
// PROPS Y EMITS
// =============================================
const props = defineProps({
  nota: {
    type: Object,
    required: true,
    // El valor por defecto ayuda a evitar errores durante el desarrollo si el prop no se pasa
    default: () => ({
      numeroNota: 'N/A',
      codigoPuntoVenta: 0,
      nombreRazonSocial: 'S/N',
      codigoTipoDocumentoIdentidad: 1,
      numeroDocumento: '000000',
      codigoCliente: 'C001',
      codigoLeyenda: 1,
      usuario: 'admin',
      montoTotalDevuelto: 0,
      montoDescuentoCreditoDebito: 0,
      montoEfectivoCreditoDebito: 0,
      facturaExterna: {
        facturaExterna: 1,
        numeroFactura: 0,
        numeroAutorizacionCuf: 'N/A',
        fechaFacturaOriginal: new Date().toISOString(),
        descuentoFacturaOriginal: 0,
        montoTotalFacturaOriginal: 0,
        detalleFacturaOriginal: [],
      },
      detalles: [],
    }),
  },
})
const nota = ref(props.nota)
const leyendasSINOptions = ref([])
const puntosVenta = ref([])
console.log(props.nota)
const emit = defineEmits(['cancelar'])

// =============================================
// CONFIGURACIÓN DE TABLA
// =============================================
const ColumnsDetalleAjuste = [
  {
    name: 'codigoProducto',
    label: i18nT('ui.codigo-producto-24251e'),
    align: 'left',
    field: 'codigoProducto',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: i18nT('configuracion.servicios.table.descripcion'),
    align: 'left',
    field: 'descripcion',
    style: 'white-space: normal;',
  },
  { name: 'cantidad', label: i18nT('ui.cantidad-b5b6f8'), align: 'center', field: 'cantidad' },
  { name: 'esPerdida', label: i18nT('ui.es-perdida-3d6e9e'), field: 'esPerdida', align: 'center' }, // nuevo
  { name: 'cantidadPerdida', label: i18nT('ui.cantidad-perdida-b1d003'), field: 'cantidadPerdida', align: 'center' }, // nuevo
  {
    name: 'unidadMedida',
    label: i18nT('configProducto.unidadProducto.table.nombre'),
    align: 'left',
    field: 'unidadMedida',
    format: (val) => getUnidadMedida(val),
  },
  {
    name: 'precioUnitario',
    label: i18nT('ui.p-unitario-a58e75'),
    align: 'right',
    field: 'precioUnitario',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'montoDescuento',
    label: i18nT('ventas.discount'),
    align: 'right',
    field: 'montoDescuento',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'subTotal',
    label: i18nT('ui.subtotal-757ed2'),
    align: 'right',
    field: 'subTotal',
    format: (val) => `Bs. ${val.toFixed(2)}`,
    style: 'font-weight: 500',
  },
  {
    name: 'acciones',
    label: i18nT('common.actions'),
    align: 'center',
    field: 'acciones',
    style: 'font-weight: 500',
  },
]
const columnsDetalle = [
  {
    name: 'codigoProducto',
    label: i18nT('ui.codigo-producto-24251e'),
    align: 'left',
    field: 'codigoProducto',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: i18nT('configuracion.servicios.table.descripcion'),
    align: 'left',
    field: 'descripcion',
    style: 'white-space: normal;',
  },
  { name: 'cantidad', label: i18nT('ui.cantidad-b5b6f8'), align: 'center', field: 'cantidad' },
  {
    name: 'unidadMedida',
    label: i18nT('configProducto.unidadProducto.table.nombre'),
    align: 'left',
    field: 'unidadMedida',
    format: (val) => getUnidadMedida(val),
  },
  {
    name: 'precioUnitario',
    label: i18nT('ui.p-unitario-a58e75'),
    align: 'right',
    field: 'precioUnitario',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'montoDescuento',
    label: i18nT('ventas.discount'),
    align: 'right',
    field: 'montoDescuento',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'subTotal',
    label: i18nT('ventas.subtotal'),
    align: 'right',
    field: 'subTotal',
    format: (val) => `Bs. ${val.toFixed(2)}`,
    style: 'font-weight: 500',
  },
]

// =============================================
// FUNCIONES AUXILIARES (simuladas)
// =============================================
// En una aplicación real, estos datos vendrían de un store, un API o un archivo de configuración.
const getTipoDocumento = (codigo) => {
  const tipos = { 1: 'CI', 2: 'CEX', 3: 'PAS', 4: 'OD', 5: 'NIT' }
  return tipos[codigo] || i18nT('ui.otro-ada1c1')
}
const getPuntoVenta = (codigo) => {
  console.log('Puntos de Venta disponibles:', puntosVenta.value)
  return (
    puntosVenta.value.find((pv) => pv.value === codigo)?.label || i18nT('ui.punto-de-venta-no-encontrado-1e2494')
  )
}
// const calcular_montoEfectivoCreditoDebito = () => {
//   const totalTabla = nota.value.detalles.reduce((acc, item) => {
//     return (
//       acc +
//       Number(item.cantidad) * parseFloat(item.precioUnitario) -
//       parseFloat(item.montoDescuento)
//     )
//   }, 0)
//   return totalTabla - montoDescuentoCreditoDebito.value - montoTotalDevuelto.value
// }
const getLeyenda = (codigo) => {
  // Simulación de leyendas
  // const leyendas = {
  //   1: 'Ley N° 453: Tienes derecho a recibir información sobre las características y contenidos de los servicios que utilizas.',
  //   2: 'Ley N° 453: El proveedor deberá entregar el producto en las modalidades y términos ofertados o convenidos.',
  // }
  const res = leyendasSINOptions.value.find((obj) => Number(obj.value) == Number(codigo))
  console.log('Leyenda encontrada:', res)

  return res ? res.label : i18nT('ui.leyenda-no-encontrada-0fe89c')
}

const cargarPuntoVentas = async () => {
  try {
    const response = await validarUsuario()
    const idusuario = response[0]?.idusuario
    const endpoint = `${URL_APICM}/api/listaPuntoVentaFactura/${idusuario}`

    if (idusuario) {
      const response = await axios.get(endpoint)
      const data = response.data.datos

      console.log(data)
      if (data.estado == 'error') {
        console.log(data.error)
      } else {
        nota.value.codigoPuntoVenta = data.find(
          (pv) => pv.idpuntoventa === nota.value.venta.punto_venta,
        )?.codigosin
        console.log('Punto de Venta SIN asignado:', nota.value.codigoPuntoVenta)
        puntosVenta.value = data.map((item) => ({
          label: `${item.nombre} - ${item.codigosin}`,
          value: item.codigosin,
          id: item.idpuntoventa,
        }))
      }
    }
  } catch (error) {
    showError(i18nT('ui.error-al-cargar-punto-venta-sin-5a943b'), error)
  }
}
const showError = (message, error) => {
  console.error(message, error)
  $q.notify({
    type: 'negative',
    message: `${message}: ${error.message || i18nT('ui.error-desconocido-9c256e')}`,
  })
}

const cargarLeyendaSIN = async () => {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const endpoint = `${URL_APICM}/api/listaLeyendaSIN/leyendas/${token}/${tipo}`
    const resultado = await peticionGET(endpoint)
    if (resultado[0] === 'error') {
      $q.notify({
        type: 'negative',
        message: resultado.error || i18nT('ui.error-al-cargar-leyendas-sin-889429'),
      })
    } else {
      leyendasSINOptions.value = resultado.data.map((item) => ({
        label: `${item.codigoActividad} - ${item.descripcion}`,
        value: item.codigo,
        ...item,
      }))
      console.log(leyendasSINOptions.value)
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-de-red-al-cargar-leyendas-sin-dfa2c2'),
    })
  }
}

const eliminarDetalleNota = async (index) => {
  const result = await showDialog(
    $q,
    'Q',
    i18nT('ui.estas-seguro-de-que-deseas-eliminar-este-registro-es-a35dda'),
  )
  console.log('Question dialog result:', result)
  if (result) {
    if (index > -1) {
      nota.value.detalles.splice(index, 1)
    }
    await showDialog($q, 'I', i18nT('ui.la-operacion-se-completo-exitosamente-4fb636'))
  } else {
    $q.notify({ message: i18nT('ui.accion-cancelada-4177e8'), color: 'info' })
  }
}
const confirmarNota = async () => {
  const contenidousuario = validarUsuario()
  const token = contenidousuario[0]?.factura?.access_token
  const tipo = contenidousuario[0]?.factura?.tipo
  const md5E = contenidousuario[0]?.empresa?.idempresa
  const codigoFecha = getfechaCodigo()
  console.log(codigoFecha)
  const { facturaExterna, venta, idalmacen, motivo, ...resto } = nota.value
  const notaCreditoDebito = {
    ...facturaExterna,
    ...resto,
    extras: { facturaTicket: venta.ack_ticket },
  }

  const sendData = {
    ver: 'registrarNotaCreditoDebito',
    token,
    tipo,
    numNota: 0,
    md5E,
    idalmacen,
    id_punto_venta: venta?.punto_venta || 0,
    id_cliente: venta?.id_cliente || 0,
    id_leyenda: venta?.idleyendas || 0,
    id_usuario: venta?.usuario[0].idusuario || 0,
    id_venta: venta?.id || 0,
    monto_total_devuelto: resto.montoTotalDevuelto || 0,
    monto_descuento_credito_debito: resto.montoDescuentoCreditoDebito || 0,
    monto_efectivo_credito_debito: resto.montoEfectivoCreditoDebito || 0,
    detalle: resto.detalles,
    motivo,
    notaCreditoDebito,
  }
  console.log('Datos a enviar:', sendData)
  try {
    const response = await api.post('', sendData)

    const data = response.data
    console.log('Respuesta del servidor:', data)
    if (data.estado === 'error') {
      showDialog($q, 'E', data.mensaje || i18nT('ui.error-al-registrar-la-nota-de-credito-debito-099ad1'))
    } else {
      showDialog($q, 'I', i18nT('ui.la-nota-de-credito-debito-se-registro-exitosamente-d22e8b'))
      emit('cancelar') // Cerrar el formulario después de confirmar
    }
  } catch (error) {
    showDialog($q, 'E', error.message || i18nT('ui.error-inesperado-al-registrar-la-nota-de-credito-deb-a4709a'))
  }
}
const montoDescuentoCreditoDebito = computed(() => {
  return nota.value.montoDescuentoCreditoDebito
})
const montoTotalDevuelto = computed(() => {
  const total = nota.value.detalles.reduce((acc, item) => {
    return (
      acc +
      Number(item.cantidad) * parseFloat(item.precioUnitario) -
      parseFloat(item.montoDescuento || 0)
    )
  }, 0)
  return total.toFixed(2) - parseFloat(montoDescuentoCreditoDebito.value)
})
const montoefectivoCreditoDebito = computed(() => {
  console.log(montoTotalDevuelto.value)
  const total = montoTotalDevuelto.value
  const total_MDCD = (parseFloat(total || 0) * 0.13).toFixed(2)
  console.log(total_MDCD)
  return total_MDCD > 0 ? total_MDCD : 0.0
})
console.log(montoefectivoCreditoDebito.value)
const getUnidadMedida = (codigo) => {
  // Simulación de unidades
  const unidades = {
    57: 'UNIDAD (BIENES)',
    58: 'PAQUETE',
    // ... agregar más unidades según el catálogo
  }
  return unidades[codigo] || 'N/A'
}
const validarMonto = async (scope) => {
  const total = nota.value.detalles.reduce((acc, item) => {
    return (
      acc +
      Number(item.cantidad) * parseFloat(item.precioUnitario) -
      parseFloat(item.montoDescuento || 0)
    )
  }, 0)
  if (scope.value >= 0 && scope.value <= total) {
    scope.set()
  } else {
    await showDialog(
      $q,
      'E',
      i18nT('ui.el-valor-debe-ser-menor-a-dad8e6') + montoTotalDevuelto.value + i18nT('ui.y-mayor-o-igual-a-0-24cd5a'),
    )
  }
}
// const validarMontoDescuento = async (scope, row) => {
//   console.log(row)
//   const totalFila = Number(row.cantidad) * parseFloat(row.precioUnitario)
//   if (scope.value >= 0 && scope.value <= totalFila) {
//     scope.set()
//   } else {
//     await showDialog($q, 'E', 'El valor debe ser menor a ' + totalFila + ' y mayor o igual a 0')
//   }
// }

function onTogglePerdida(row, val) {
  row.esPerdida = val
  if (!val) {
    row.cantidadPerdida = 0 // 🔒 bloqueamos y reseteamos
  }
}

const validar = async (scope, row) => {
  console.log(row)

  if (scope.value > 0) {
    scope.set()
  } else {
    await showDialog($q, 'E', i18nT('ui.el-valor-debe-ser-mayor-a-0-857620'))
  }
}
onMounted(async () => {
  await cargarLeyendaSIN()
  await cargarPuntoVentas()
})
</script>

<style scoped>
.document-preview {
  max-width: 800px;
  margin: 20px auto;
  border: 1px solid var(--cm-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', sans-serif;
}

.section-title {
  border-bottom: 2px solid var(--q-primary);
  padding-bottom: 8px;
  margin-bottom: 10px;
  color: var(--q-primary);
  font-weight: 500;
}

.q-item__label--caption {
  font-weight: 500;
  color: #555;
}

.cuf-text {
  font-family: monospace;
  font-size: 0.8rem;
  word-break: break-all;
}
</style>

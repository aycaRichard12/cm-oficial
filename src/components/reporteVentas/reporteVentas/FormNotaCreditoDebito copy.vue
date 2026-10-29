<template>
  <q-card class="document-preview q-pa-md">
    <q-card-section class="text-center">
      <div class="text-h4 text-weight-bold">{{ $t('ui.nota-de-credito-debito-5d732c') }}</div>
      <div class="text-subtitle1 cm-text">{{ $t('ui.razon-social-6c6fb2') }} {{ nota.nombreRazonSocial }}</div>
      <div>NIT: {{ nota.numeroDocumento }}</div>
    </q-card-section>

    <q-separator inset />

    <q-card-section>
      <div class="text-h6 section-title">{{ $t('ui.datos-de-la-nota-bf0ec8') }}</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-6">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>{{ $t('ui.nro-nota-1b695e') }}</q-item-label>
              <q-item-label class="text-weight-medium">{{ nota.numeroNota }}</q-item-label>
            </q-item-section>
          </q-item>
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
              <q-item-label>{{ nota.codigoPuntoVenta }}</q-item-label>
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

    <q-separator />

    <q-card-section>
      <div class="text-h6 section-title">{{ $t('ui.detalle-de-la-devolucion-ajuste-a62e69') }}</div>
      <q-table
        flat
        bordered
        :rows="nota.detalles"
        :columns="columnsDetalle"
        row-key="codigoProducto"
        hide-bottom
        class="q-mt-md"
      />
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
                <q-item-label class="text-weight-medium"
                  >Bs. {{ nota.montoDescuentoCreditoDebito.toFixed(2) }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item class="cm-surface-2">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ $t('ui.monto-total-devuelto-be61ba') }}</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-h6 text-weight-bold"
                  >Bs. {{ nota.montoTotalDevuelto.toFixed(2) }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('ui.monto-efectivo-credito-debito-6afeaf') }}</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-weight-medium"
                  >Bs. {{ nota.montoEfectivoCreditoDebito.toFixed(2) }}</q-item-label
                >
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
        @click="$emit('confirmar')"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { defineProps, defineEmits } from 'vue'

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

console.log(props.nota)
defineEmits(['cancelar'])

// =============================================
// CONFIGURACIÓN DE TABLA
// =============================================
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

const getLeyenda = (codigo) => {
  // Simulación de leyendas
  const leyendas = {
    1: 'Ley N° 453: Tienes derecho a recibir información sobre las características y contenidos de los servicios que utilizas.',
    2: 'Ley N° 453: El proveedor deberá entregar el producto en las modalidades y términos ofertados o convenidos.',
  }
  return leyendas[codigo] || i18nT('ui.leyenda-no-encontrada-0fe89c')
}

const getUnidadMedida = (codigo) => {
  // Simulación de unidades
  const unidades = {
    57: 'UNIDAD (BIENES)',
    58: 'PAQUETE',
    // ... agregar más unidades según el catálogo
  }
  return unidades[codigo] || 'N/A'
}
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

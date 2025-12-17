<template>
  <q-card class="document-preview q-pa-md">
    <q-card-section class="text-center">
      <div class="text-h4 text-weight-bold">Nota de Crédito/Débito</div>
      <div class="text-subtitle1 text-grey-8">Razón Social: {{ nota.nombreRazonSocial }}</div>
      <div>NIT: {{ nota.numeroDocumento }}</div>
    </q-card-section>

    <q-separator inset />

    <q-card-section>
      <div class="text-h6 section-title">Datos de la Nota</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-6">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Nro. Nota:</q-item-label>
              <q-item-label class="text-weight-medium">{{ nota.numeroNota }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Código Cliente:</q-item-label>
              <q-item-label>{{ nota.codigoCliente }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Usuario:</q-item-label>
              <q-item-label>{{ nota.usuario }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-6">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Punto de Venta:</q-item-label>
              <q-item-label>{{ nota.codigoPuntoVenta }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Documento de Identidad:</q-item-label>
              <q-item-label>
                {{ getTipoDocumento(nota.codigoTipoDocumentoIdentidad) }} -
                {{ nota.numeroDocumento }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Leyenda:</q-item-label>
              <q-item-label>{{ getLeyenda(nota.codigoLeyenda) }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="text-h6 section-title">Datos de la Factura Original</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Nro. Factura:</q-item-label>
              <q-item-label class="text-weight-medium">{{
                nota.facturaExterna.numeroFactura
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Fecha Factura:</q-item-label>
              <q-item-label>{{
                new Date(nota.facturaExterna.fechaFacturaOriginal).toLocaleDateString('es-BO')
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 col-md-4">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>Monto Total Original:</q-item-label>
              <q-item-label class="text-weight-medium"
                >Bs. {{ nota.facturaExterna.montoTotalFacturaOriginal.toFixed(2) }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12">
          <q-item dense>
            <q-item-section>
              <q-item-label caption>CUF Original:</q-item-label>
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
      <div class="text-h6 section-title">Detalle de la Devolución / Ajuste</div>
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
                <q-item-label caption>Descuento Adicional</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-weight-medium"
                  >Bs. {{ nota.montoDescuentoCreditoDebito.toFixed(2) }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item class="bg-grey-2">
              <q-item-section>
                <q-item-label class="text-weight-bold">MONTO TOTAL DEVUELTO</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-h6 text-weight-bold"
                  >Bs. {{ nota.montoTotalDevuelto.toFixed(2) }}</q-item-label
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Monto efectivo Crédito/Débito</q-item-label>
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
      <q-btn flat label="Cancelar" color="grey-8" icon="cancel" @click="$emit('cancelar')" />
      <q-btn
        unelevated
        label="Confirmar Registro"
        color="primary"
        icon="check_circle"
        @click="$emit('confirmar')"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
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
    label: 'Código Producto',
    align: 'left',
    field: 'codigoProducto',
    sortable: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    align: 'left',
    field: 'descripcion',
    style: 'white-space: normal;',
  },
  { name: 'cantidad', label: 'Cantidad', align: 'center', field: 'cantidad' },
  {
    name: 'unidadMedida',
    label: 'Unidad',
    align: 'left',
    field: 'unidadMedida',
    format: (val) => getUnidadMedida(val),
  },
  {
    name: 'precioUnitario',
    label: 'P. Unitario',
    align: 'right',
    field: 'precioUnitario',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'montoDescuento',
    label: 'Descuento',
    align: 'right',
    field: 'montoDescuento',
    format: (val) => `Bs. ${val.toFixed(2)}`,
  },
  {
    name: 'subTotal',
    label: 'Subtotal',
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
  return tipos[codigo] || 'Otro'
}

const getLeyenda = (codigo) => {
  // Simulación de leyendas
  const leyendas = {
    1: 'Ley N° 453: Tienes derecho a recibir información sobre las características y contenidos de los servicios que utilizas.',
    2: 'Ley N° 453: El proveedor deberá entregar el producto en las modalidades y términos ofertados o convenidos.',
  }
  return leyendas[codigo] || 'Leyenda no encontrada.'
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
  border: 1px solid #ddd;
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

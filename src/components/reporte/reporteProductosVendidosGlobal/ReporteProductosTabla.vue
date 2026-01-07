<template>
  <div class="q-mt-md">
    <BaseFilterableTable
      ref="localTableRef"
      flat
      bordered
      title="Productos Vendidos"
      :rows="rows"
      :columns="columns"
      :arrayHeaders="arrayHeaders"
      :sumColumns="sumColumns"
      row-key="id"
      virtual-scroll
      style="max-height: calc(100vh - 265px)"
      :loading="loading"
      no-data-label="No se Genero el Reporte"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="numero">{{ props.rowIndex + 1 }}</q-td>
          <q-td key="fecha">{{ formatearFecha(props.row.fecha) }}</q-td>
          <q-td key="nrofactura">{{ props.row.nrofactura }}</q-td>
          <q-td key="tipoventa">{{ tipoVenta[props.row.tipoventa] }}</q-td>
          <q-td key="codigo">{{ props.row.codigo }}</q-td>
          <q-td key="codigobarra">{{ props.row.codigobarra }}</q-td>
          <q-td key="descripcion">{{ props.row.descripcion }}</q-td>
          <q-td key="preciobase" class="text-right">{{ decimas(props.row.preciobase) }}</q-td>
          <q-td key="preciounitario" class="text-right">{{
            decimas(props.row.preciounitario)
          }}</q-td>
          <q-td key="cantidad" class="text-right">{{ props.row.cantidad }}</q-td>
          <q-td key="importe" class="text-right">{{
            decimas(redondear(parseFloat(props.row.importe)))
          }}</q-td>
          <q-td key="descuento" class="text-right">{{ props.row.descuento }}</q-td>
          <q-td key="totalcosto" class="text-right">{{
            decimas(redondear(parseFloat(props.row.totalcosto)))
          }}</q-td>
          <q-td key="totalventa" class="text-right">{{
            decimas(redondear(parseFloat(props.row.totalventa)))
          }}</q-td>
          <q-td key="utilidad" class="text-right">{{
            decimas(redondear(parseFloat(props.row.utilidad)))
          }}</q-td>
          <q-td key="tipopago">{{ props.row.tipopago }}</q-td>
          <q-td key="idusuario">{{ props.row.idusuario }}</q-td>
          <q-td key="sucursalc">{{ props.row.sucursalc }}</q-td>
          <q-td key="almacen">{{ props.row.almacen }}</q-td>
          <q-td key="cliente">{{ props.row.cliente }}</q-td>
          <q-td key="tipodocumento">{{ props.row.tipodocumento }}</q-td>
          <q-td key="nrodoc">{{ props.row.nrodoc }}</q-td>
          <q-td key="nombrecomercial">{{ props.row.nombrecomercial }}</q-td>
          <q-td key="unidad">{{ props.row.unidad }}</q-td>
          <q-td key="categoria">{{ props.row.categoria }}</q-td>
          <q-td key="subcategoria">{{ props.row.subcategoria }}</q-td>
          <q-td key="canal">{{ props.row.canal }}</q-td>
          <q-td key="tipoprecio">{{ props.row.tipoprecio }}</q-td>
        </q-tr>
      </template>

      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="9" class="text-right">Sumatorias</q-td>
          <q-td class="text-right">{{ formatearNumero(sumatorias.cantidad) }}</q-td>
          <q-td class="text-right">{{ formatearNumero(sumatorias.importe) }}</q-td>
          <q-td class="text-right">{{ formatearNumero(sumatorias.descuento) }}</q-td>
          <q-td class="text-right">{{ formatearNumero(sumatorias.totalcosto) }}</q-td>
          <q-td class="text-right">{{ formatearNumero(sumatorias.totalventa) }}</q-td>
          <q-td colspan="13"></q-td>
        </q-tr>
      </template>
    </BaseFilterableTable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

defineProps({
  rows: Array,
  columns: Array,
  arrayHeaders: Array,
  sumColumns: Array,
  loading: Boolean,
  sumatorias: Object,
  tipoVenta: Object,
  formatearFecha: Function,
  formatearNumero: Function,
  decimas: Function,
  redondear: Function
})

const localTableRef = ref(null)

// Exponer obtenerDatosFiltrados delegando en la tabla base
defineExpose({
  obtenerDatosFiltrados: () => localTableRef.value?.obtenerDatosFiltrados() || []
})
</script>

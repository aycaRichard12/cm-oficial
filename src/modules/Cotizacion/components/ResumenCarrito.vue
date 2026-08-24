<template>
  <q-card-section
    class="bg-white q-py-sm q-px-lg flex items-center justify-between"
    style="border-bottom: 1px solid #e0e0e0"
  >
    <div class="flex items-center text-primary">
      <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
      <div class="text-subtitle1 text-weight-bold">Resumen de Cotización</div>
    </div>
  </q-card-section>

  <q-table
    :rows="carrito.listaProductos"
    :columns="carritoColumns"
    row-key="idproductoalmacen"
    flat
    hide-bottom
    class="custom-table q-pt-md"
    table-header-class="bg-grey-1 text-weight-bolder text-grey-9 text-uppercase"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body="props">
      <q-tr :props="props" :class="props.expand ? 'bg-blue-50' : 'hover-row'">
        <!-- Código de expansión para códigos únicos -->
        <q-td auto-width>
          <q-btn
            v-if="props.row.codigosUnicos?.length > 0"
            size="sm"
            color="primary"
            flat
            round
            @click="props.expand = !props.expand"
            :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          />
        </q-td>

        <q-td key="num" :props="props" class="text-left">
          <q-chip color="grey-2" text-color="grey-9" dense square class="radius-6">
            <span class="text-weight-bolder">{{ props.row.num }}</span>
          </q-chip>
        </q-td>
        <q-td key="codigo" :props="props" class="text-left">
          <q-chip outline color="primary" dense square class="radius-6 font-weight-600">
            {{ props.row.codigo }}
          </q-chip>
        </q-td>
        <q-td key="descripcion" :props="props">
          <div class="text-weight-bolder text-grey-10 text-subtitle2">
            {{ props.row.descripcion }}
          </div>
          <div
            class="flex items-center text-primary cursor-pointer q-mt-xs note-adicional"
            v-ripple
          >
            <q-icon name="edit_note" size="16px" class="q-mr-xs" />
            <span class="text-weight-medium">{{
              props.row.descripcionAdicional || 'Añadir nota adicional...'
            }}</span>
            <q-popup-edit
              :model-value="props.row.descripcionAdicional"
              @update:model-value="
                $emit('update:descripcionAdicional', {
                  id: props.row.idproductoalmacen,
                  value: $event,
                })
              "
              v-slot="scope"
              buttons
              label-set="Guardar"
              label-cancel="Cancelar"
            >
              <q-input
                v-model="scope.value"
                outlined
                dense
                autofocus
                counter
                @keyup.enter="validarDescripcion(scope, props.row)"
              />
            </q-popup-edit>
          </div>
        </q-td>
        <q-td key="cantidad" :props="props" class="text-right">
          <q-badge
            color="secondary"
            text-color="white"
            class="q-px-md q-py-xs text-weight-bolder text-subtitle2 shadow-1 radius-8"
          >
            {{ props.row.cantidad }}
          </q-badge>
        </q-td>
        <q-td key="precio" :props="props" class="text-right text-weight-bold text-subtitle2">
          {{ decimas(props.row.precio) }}
          <span class="text-caption text-grey-5 q-ml-xs text-weight-regular">{{
            divisa.tipo
          }}</span>
        </q-td>
        <q-td
          key="total"
          :props="props"
          class="text-right text-weight-bolder text-primary text-subtitle1"
        >
          {{ decimas(props.row.cantidad * props.row.precio) }}
          <span class="text-caption text-grey-5 q-ml-xs text-weight-regular">{{
            divisa.tipo
          }}</span>
        </q-td>
        <q-td key="options" :props="props" class="text-center">
          <q-btn
            icon="delete_outline"
            color="negative"
            flat
            round
            dense
            size="sm"
            @click="$emit('eliminar-producto', props.row.idproductoalmacen)"
            class="hover-shake"
          >
            <q-tooltip class="bg-negative text-weight-medium shadow-3">Quitar producto</q-tooltip>
          </q-btn>
        </q-td>
      </q-tr>

      <q-tr v-show="props.expand" :props="props" class="expanded-row bg-blue-50">
        <q-td colspan="100%" class="q-pa-lg">
          <TableCodigosUnicos
            v-if="esProductoUnico"
            v-model="props.row.codigosUnicos"
            :parent-row="props.row"
            :can-delete="true"
            :can-edit="true"
            :api-mode="false"
            @update-parent-quantity="
              (nuevaCant) => {
                props.row.cantidad = nuevaCant
                $emit('recalcular-totales')
              }
            "
          />
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom-row>
      <q-tr class="bg-grey-1">
        <q-td colspan="6" class="text-right text-subtitle2 text-grey-8 letter-spacing-05"
          >SUBTOTAL:</q-td
        >
        <q-td class="text-right text-subtitle1 text-grey-10 text-weight-bolder">
          {{ decimas(carrito.subtotal) }}
          <span class="text-caption text-grey-6 text-weight-medium">{{ divisa.tipo }}</span>
        </q-td>
        <q-td />
      </q-tr>

      <q-tr class="bg-grey-1">
        <q-td colspan="6" class="text-right text-subtitle2 text-grey-8">DESCUENTO:</q-td>
        <q-td class="text-right">
          <q-input
            :model-value="carrito.descuento"
            @update:model-value="$emit('update:descuento', $event)"
            type="number"
            min="0"
            :max="carrito.subtotal"
            @change="$emit('aplicar-descuento')"
            dense
            outlined
            bg-color="white"
            input-class="text-right text-weight-bolder text-negative"
            class="premium-input input-descuento"
          >
            <template v-slot:append>
              <div
                class="bg-negative text-white text-weight-bold text-caption q-px-sm rounded-borders currency-append"
              >
                {{ divisa.tipo }}
              </div>
            </template>
          </q-input>
        </q-td>
        <q-td />
      </q-tr>

      <q-tr class="bg-primary text-white bg-primary-gradient-row">
        <q-td colspan="6" class="text-right text-h6 text-weight-bolder text-uppercase"
          >TOTAL GENERAL:</q-td
        >
        <q-td class="text-right text-h5 text-weight-bolder text-shadow-light">
          {{ decimas(carrito.ventatotal) }}
          <span class="text-subtitle1 text-white text-weight-medium" style="opacity: 0.9">{{
            divisa.tipo
          }}</span>
        </q-td>
        <q-td />
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import TableCodigosUnicos from 'src/components/cotizacion/TableCodigosUnicos.vue'
import { decimas, redondear } from 'src/composables/FuncionesG'

defineProps({
  carrito: { type: Object, required: true },
  divisa: { type: Object, required: true },
  esProductoUnico: Boolean,
})

defineEmits([
  'eliminar-producto',
  'recalcular-totales',
  'aplicar-descuento',
  'update:descuento',
  'update:descripcionAdicional',
])
const carritoColumns = [
  { name: 'exp', label: '', align: 'left' },
  { name: 'num', label: 'N°', align: 'left', field: 'num' },
  { name: 'codigo', label: 'Código', align: 'center', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  { name: 'cantidad', label: 'Cantidad', align: 'center', field: (row) => decimas(row.cantidad) },
  {
    name: 'precio',
    label: 'Precio unitario',
    align: 'center',
    field: (row) => decimas(row.precio),
  },
  {
    name: 'total',
    label: 'Total',
    align: 'center',
    field: (row) => decimas(redondear(parseFloat(row.cantidad) * parseFloat(row.precio))),
  },
  { name: 'options', label: 'Opciones', align: 'center', field: 'options' },
]
</script>

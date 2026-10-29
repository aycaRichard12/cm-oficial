<template>
  <div>
    <q-table :rows="rows" :columns="columns" row-key="idserie" :loading="loading" flat bordered>
      <template v-slot:top>
        <div class="text-h6">{{ $t('ui.series-40c20d') }}</div>
        <q-space />
        <q-btn
          color="primary"
          icon="upload_file"
          :label="$t('ui.importar-masivo-2a43e3')"
          @click="$emit('import')"
          class="q-mr-sm"
        />
        <q-btn color="primary" icon="add" :label="$t('common.new')" @click="$emit('add')" />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>

          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'estado'">
              <q-toggle
                v-model="props.row.estado"
                :true-value="1"
                :false-value="0"
                color="primary"
                @update:model-value="$emit('toggleStatus', props.row)"
              />
            </template>
            <template v-else-if="col.name === 'producto'">
              {{ getProductoNombre(props.row.producto_idproducto) }}
            </template>
            <template v-else-if="col.name === 'acciones'">
              <div class="q-gutter-sm">
                <q-btn
                  dense
                  round
                  flat
                  color="primary"
                  icon="edit"
                  @click="$emit('edit-item', props.row)"
                >
                  <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  dense
                  round
                  flat
                  color="negative"
                  icon="delete"
                  @click="$emit('delete-item', props.row)"
                >
                  <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
                </q-btn>
              </div>
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" class="bg-grey-2 q-pa-md">
            <div class="text-subtitle2 q-mb-sm">{{ $t('ui.variantes-de-la-serie-3fc61c') }}</div>
            <div
              v-if="!props.row.variantes || props.row.variantes.length === 0"
              class="text-caption text-grey"
            >
              {{ $t('ui.no-hay-variantes-asignadas-36917c') }}
            </div>
            <q-table
              v-else
              :rows="props.row.variantes"
              :columns="varianteColumns"
              row-key="id_Producto_Variante"
              flat
              bordered
              dense
              :pagination="{ rowsPerPage: 0 }"
              hide-bottom
            >
              <template v-slot:body="varProps">
                <q-tr :props="varProps">
                  <q-td key="indice" :props="varProps">{{ varProps.rowIndex + 1 }}</q-td>
                  <q-td key="sku" :props="varProps">{{ varProps.row.sku || 'N/A' }}</q-td>
                  <q-td key="codigo_barras" :props="varProps">{{
                    varProps.row.codigo_barras || '-'
                  }}</q-td>
                  <q-td key="atributos" :props="varProps">
                    <div class="q-gutter-xs">
                      <q-badge
                        v-for="attr in varProps.row.valores"
                        :key="attr.id_Valor_Atributo"
                        color="primary"
                        outline
                      >
                        {{ attr.atributo }}: {{ attr.valor }}
                      </q-badge>
                      <span
                        v-if="!varProps.row.valores || varProps.row.valores.length === 0"
                        class="text-caption text-grey"
                        >{{ $t('ui.sin-atributos-9c3300') }}</span
                      >
                    </div>
                  </q-td>
                  <q-td key="precio_base" :props="varProps">{{ varProps.row.precio_base }}</q-td>
                  <q-td key="activo" :props="varProps">
                    <q-badge
                      :color="varProps.row.activo == 1 ? 'positive' : 'grey'"
                      :label="varProps.row.activo == 1 ? $t('common.active') : $t('common.inactive')"
                    />
                  </q-td>
                  <q-td key="acciones_var" :props="varProps">
                    <q-btn
                      dense
                      round
                      flat
                      color="negative"
                      icon="link_off"
                      size="sm"
                      @click="
                        $emit('delete-variante', {
                          idserie: props.row.idserie,
                          id_Producto_Variante: varProps.row.id_Producto_Variante,
                          sku: varProps.row.sku,
                        })
                      "
                    >
                      <q-tooltip>{{ $t('ui.quitar-variante-de-la-serie-7052bd') }}</q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  productos: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['add', 'edit-item', 'delete-item', 'toggleStatus', 'import', 'delete-variante'])

const columns = [
  { name: 'indice', label: i18nT('cotizacion.table.number'), field: 'indice', align: 'left', sortable: true },
  { name: 'serie', label: i18nT('ui.serie-986812'), field: 'serie', align: 'left', sortable: true },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto_idproducto', align: 'left' },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), field: 'fecha', align: 'left', sortable: true },
  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center' },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
]

const varianteColumns = [
  { name: 'indice', label: i18nT('cotizacion.table.number'), field: 'indice', align: 'left', sortable: true },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'codigo_barras', label: i18nT('ui.cod-barras-a99c05'), field: 'codigo_barras', align: 'left' },
  { name: 'atributos', label: i18nT('ui.atributos-bd9731'), align: 'left' },
  { name: 'precio_base', label: i18nT('ui.precio-18e070'), field: 'precio_base', align: 'left', sortable: true },
  { name: 'activo', label: i18nT('cotizacion.table.status'), field: 'activo', align: 'center' },
  { name: 'acciones_var', label: '', align: 'center' },
]

const getProductoNombre = (id) => {
  if (!id) return '-'
  const prod = props.productos.find((p) => p.id == id)
  return prod ? prod.descripcion : `Desconocido (${id})`
}
</script>

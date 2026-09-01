<template>
  <div>
    <q-table :rows="rows" :columns="columns" row-key="idserie" :loading="loading" flat bordered>
      <template v-slot:top>
        <div class="text-h6">Series</div>
        <q-space />
        <q-btn
          color="primary"
          icon="upload_file"
          label="Importar Masivo"
          @click="$emit('import')"
          class="q-mr-sm"
        />
        <q-btn color="primary" icon="add" label="Nuevo" @click="$emit('add')" />
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
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  dense
                  round
                  flat
                  color="negative"
                  icon="delete"
                  @click="$emit('delete-item', props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" class="bg-grey-2">
            <div class="text-subtitle2 q-mb-sm">Variantes de la serie</div>
            <div
              v-if="!props.row.variantes || props.row.variantes.length === 0"
              class="text-caption text-grey"
            >
              No hay variantes asignadas.
            </div>
            <div class="row q-col-gutter-sm" v-else>
              <div
                class="col-12 col-sm-6 col-md-4"
                v-for="v in props.row.variantes"
                :key="v.id_Producto_Variante"
              >
                <q-card bordered flat class="bg-white">
                  <q-card-section class="q-pa-sm flex justify-between items-center">
                    <div>
                      <div class="text-weight-bold">SKU: {{ v.sku || 'N/A' }}</div>
                      <div class="text-caption">Precio: {{ v.precio_base }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
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

defineEmits(['add', 'edit-item', 'delete-item', 'toggleStatus', 'import'])

const columns = [
  { name: 'idserie', label: '#', field: 'idserie', align: 'left', sortable: true },
  { name: 'serie', label: 'Serie', field: 'serie', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto', field: 'producto_idproducto', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const getProductoNombre = (id) => {
  if (!id) return '-'
  const prod = props.productos.find((p) => p.id == id)
  return prod ? prod.nombre : `Desconocido (${id})`
}
</script>

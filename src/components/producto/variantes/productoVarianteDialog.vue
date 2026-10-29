<template>
  <q-dialog
    v-model="visible"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="column no-wrap">
      <q-card-section class="bg-primary text-white row items-center justify-between">
        <div>
          <div class="text-h6">
            <q-icon name="tune" class="q-mr-sm" />
            {{ $t('ui.variantes-del-producto-2a93f9') }}
          </div>
          <div class="text-caption text-grey-3">
            {{ producto?.nombre }} {{ $t('ui.cod-b4b39a') }} {{ producto?.codigo }}
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="cerrar" />
      </q-card-section>

      <q-tabs
        v-model="tab"
        dense
        align="left"
        class="cm-surface text-primary"
        narrow-indicator
        active-color="primary"
      >
        <q-tab name="atributos" icon="list_alt" :label="$t('ui.atributos-y-valores-8f504e')" />
        <q-tab name="asignados" icon="check_circle" :label="$t('ui.atributos-del-producto-a303e4')" />
        <q-tab name="variantes" icon="inventory_2" :label="$t('ui.variantes-69a7f0')" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated class="col">
        <!-- =================== TAB: ATRIBUTOS GLOBALES =================== -->
        <q-tab-panel name="atributos">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-card flat bordered>
                <q-card-section class="text-subtitle1">
                  <q-icon name="add_circle" class="q-mr-xs" /> {{ $t('ui.nuevo-atributo-40a1bc') }}
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-input
                    v-model="nuevoAtributo.nombre"
                    :label="$t('configuracion.servicios.dialog.nombre')"
                    dense
                    outlined
                    :placeholder="$t('ui.ej-color-talla-cde80d')"
                  />
                  <q-select
                    v-model="nuevoAtributo.tipo_dato"
                    :options="tiposDato"
                    :label="$t('ui.tipo-de-dato-c8df78')"
                    dense
                    outlined
                    emit-value
                    map-options
                    class="q-mt-sm"
                  />
                  <q-btn
                    class="full-width q-mt-md"
                    color="primary"
                    unelevated
                    icon="add"
                    :label="$t('ui.registrar-atributo-8efd9c')"
                    :loading="guardandoAtributo"
                    @click="registrarAtributo"
                  />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-7">
              <q-card flat bordered>
                <q-card-section class="row items-center justify-between">
                  <div class="text-subtitle1">{{ $t('ui.atributos-existentes-127fa8') }}</div>
                  <q-btn icon="refresh" flat dense round @click="cargarAtributos" />
                </q-card-section>
                <q-separator />
                <q-card-section v-if="cargandoAtributos" class="flex flex-center q-pa-lg">
                  <q-spinner color="primary" size="2em" />
                </q-card-section>
                <q-list v-else-if="atributos.length" separator>
                  <q-expansion-item
                    v-for="attr in atributos"
                    :key="attr.id_Atributo_producto"
                    :label="attr.nombre"
                    :caption="$t('ui.tipo-99c7d2') + attr.tipo_dato"
                    icon="label"
                    group="atributos"
                  >
                    <q-card>
                      <q-card-section>
                        <div class="row items-center q-gutter-sm q-mb-sm">
                          <q-input
                            v-model="nuevoValor[attr.id_Atributo_producto]"
                            :label="$t('ui.nuevo-valor-25feb4')"
                            dense
                            outlined
                            class="col"
                            @keyup.enter="registrarValor(attr.id_Atributo_producto)"
                          />
                          <q-btn
                            color="positive"
                            icon="add"
                            dense
                            unelevated
                            :disable="!nuevoValor[attr.id_Atributo_producto]"
                            @click="registrarValor(attr.id_Atributo_producto)"
                          />
                          <q-btn
                            color="negative"
                            icon="delete"
                            flat
                            dense
                            @click="confirmarEliminarAtributo(attr)"
                          />
                        </div>
                        <div class="q-mt-sm">
                          <q-chip
                            v-for="val in attr.valores"
                            :key="val.id_Valor_Atributo"
                            removable
                            color="secondary"
                            text-color="white"
                            @remove="confirmarEliminarValor(val)"
                          >
                            {{ val.valor }}
                          </q-chip>
                          <div v-if="!attr.valores?.length" class="text-caption text-grey">
                            {{ $t('ui.sin-valores-asignados-ad421b') }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </q-list>
                <q-card-section v-else class="text-center text-grey-6 q-pa-lg">
                  {{ $t('ui.no-hay-atributos-cree-uno-para-empezar-cc89e5') }}
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- =================== TAB: ASIGNADOS AL PRODUCTO =================== -->
        <q-tab-panel name="asignados">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-card flat bordered>
                <q-card-section class="text-subtitle1">
                  <q-icon name="link" class="q-mr-xs" /> {{ $t('ui.asignar-atributo-al-producto-7e749f') }}
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-select
                    v-model="atributoSeleccionado"
                    :options="atributosDisponibles"
                    option-label="nombre"
                    option-value="id_Atributo_producto"
                    emit-value
                    map-options
                    :label="$t('ui.atributo-f30e62')"
                    dense
                    outlined
                  />
                  <q-btn
                    class="full-width q-mt-md"
                    color="primary"
                    unelevated
                    icon="link"
                    :label="$t('ui.asignar-8e935b')"
                    :disable="!atributoSeleccionado"
                    :loading="asignandoAtributo"
                    @click="asignarAtributo"
                  />
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-7">
              <q-card flat bordered>
                <q-card-section class="text-subtitle1">
                  {{ $t('ui.atributos-asignados-a-este-producto-faa496') }}
                </q-card-section>
                <q-separator />
                <q-list v-if="atributosProducto.length" separator>
                  <q-item v-for="ap in atributosProducto" :key="ap.id_Producto_Atributo">
                    <q-item-section avatar>
                      <q-icon name="label" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ ap.nombre }}</q-item-label>
                      <q-item-label caption>{{ $t('ui.tipo-99c7d2') }} {{ ap.tipo_dato }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        icon="delete"
                        color="negative"
                        flat
                        dense
                        @click="eliminarAsignacion(ap.id_Producto_Atributo)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-card-section v-else class="text-center text-grey-6 q-pa-lg">
                  {{ $t('ui.no-hay-atributos-asignados-a-este-producto-3da8bf') }}
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- =================== TAB: VARIANTES =================== -->
        <q-tab-panel name="variantes">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="text-subtitle1">
                  {{ editandoVariante ? $t('ui.editar-variante-e74cb7') : $t('ui.nueva-variante-11e755') }}
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-input
                    v-model="formVariante.sku"
                    :label="$t('ui.sku-aef8aa')"
                    dense
                    outlined
                    :hint="$t('ui.codigo-unico-de-la-variante-72dff7')"
                  />
                  <q-input
                    v-model.number="formVariante.precio_base"
                    type="number"
                    :label="$t('ui.precio-base-427900')"
                    dense
                    outlined
                    class="q-mt-sm"
                  />
                  <q-input
                    v-model="formVariante.codigo_barras"
                    :label="$t('ui.codigo-de-barras-edc5fc')"
                    dense
                    outlined
                    class="q-mt-sm"
                  />
                  <q-toggle
                    v-model="formVariante.activo"
                    :label="$t('common.active')"
                    color="positive"
                    class="q-mt-sm"
                    :true-value="1"
                    :false-value="0"
                  />

                  <div class="q-mt-md text-subtitle2 text-primary">{{ $t('ui.valores-de-atributos-c119f8') }}</div>
                  <q-banner
                    v-if="!atributosProducto.length"
                    dense
                    class="bg-warning text-white q-mt-sm"
                  >
                    {{ $t('ui.debe-asignar-al-menos-un-atributo-al-producto-4e4067') }}
                  </q-banner>
                  <div
                    v-for="ap in atributosProducto"
                    :key="ap.id_Atributo_producto"
                    class="q-mt-sm"
                  >
                    <div class="text-caption text-grey-7">{{ ap.nombre }}</div>
                    <q-select
                      v-model="formVariante.valores[ap.id_Atributo_producto]"
                      :options="valoresPorAtributo[ap.id_Atributo_producto] || []"
                      option-label="valor"
                      option-value="id_Valor_Atributo"
                      emit-value
                      map-options
                      dense
                      outlined
                      :placeholder="$t('ui.seleccione-valor-cb417f')"
                    />
                  </div>

                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      color="primary"
                      unelevated
                      icon="save"
                      :label="editandoVariante ? $t('configuracion.servicios.dialog.update') : $t('ui.registrar-caacc6')"
                      :loading="guardandoVariante"
                      :disable="!puedeGuardarVariante"
                      @click="guardarVariante"
                      class="col"
                    />
                    <q-btn
                      v-if="editandoVariante"
                      color="grey"
                      flat
                      icon="cancel"
                      :label="$t('common.cancel')"
                      @click="resetFormVariante"
                      class="col"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-8">
              <q-card flat bordered>
                <q-card-section class="row items-center justify-between">
                  <div class="text-subtitle1">{{ $t('ui.variantes-registradas-8d21bf') }}</div>
                  <q-btn icon="refresh" flat dense round @click="cargarVariantes" />
                </q-card-section>
                <q-separator />
                <q-table
                  :rows="variantes"
                  :columns="columnasVariantes"
                  row-key="id_Producto_Variante"
                  dense
                  flat
                  :loading="cargandoVariantes"
                  :rows-per-page-options="[5, 10, 25, 0]"
                >
                  <template v-slot:body-cell-valores="props">
                    <q-td :props="props">
                      <q-chip
                        v-for="v in props.row.valores || []"
                        :key="v.id_Valor_Atributo"
                        dense
                        color="secondary"
                        text-color="white"
                        :label="`${v.atributo}: ${v.valor}`"
                        class="q-ma-xs"
                      />
                      <span v-if="!props.row.valores?.length" class="text-grey-6">
                        {{ $t('ui.sin-atributos-9c3300') }}
                      </span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-activo="props">
                    <q-td :props="props" class="text-center">
                      <q-badge :color="props.row.activo == 1 ? 'positive' : 'grey'">
                        {{ props.row.activo == 1 ? $t('common.active') : $t('common.inactive') }}
                      </q-badge>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-acciones="props">
                    <q-td :props="props" class="text-center text-nowrap">
                      <q-btn
                        icon="edit"
                        color="primary"
                        flat
                        dense
                        @click="editarVariante(props.row)"
                      />
                      <q-btn
                        icon="delete"
                        color="negative"
                        flat
                        dense
                        @click="confirmarEliminarVariante(props.row)"
                      />
                    </q-td>
                  </template>
                </q-table>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, watch, computed } from 'vue'
import { apiP } from 'boot/axios'
import { useQuasar } from 'quasar'

/* ============================== PROPS & EMITS ============================== */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  producto: { type: Object, default: null },
  empresa: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

/* ============================== ESTADO LOCAL =============================== */
const $q = useQuasar()
const visible = ref(props.modelValue)
const tab = ref('atributos')

const tiposDato = [
  { label: i18nT('ui.texto-6eeba6'), value: 'texto' },
  { label: i18nT('ui.numero-1d91f4'), value: 'numero' },
  { label: i18nT('ui.decimal-e4c3a2'), value: 'decimal' },
  { label: i18nT('ui.booleano-f0f79a'), value: 'booleano' },
]

// Atributos globales
const atributos = ref([])
const cargandoAtributos = ref(false)
const guardandoAtributo = ref(false)
const nuevoAtributo = ref({ nombre: '', tipo_dato: 'texto' })
const nuevoValor = ref({})

// Atributos del producto
const atributosProducto = ref([])
const atributoSeleccionado = ref(null)
const asignandoAtributo = ref(false)

// Variantes
const variantes = ref([])
const cargandoVariantes = ref(false)
const guardandoVariante = ref(false)
const editandoVariante = ref(false)
const formVariante = ref(formVarianteInicial())

const columnasVariantes = [
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'precio_base', label: i18nT('ui.precio-18e070'), field: 'precio_base', align: 'right' },
  {
    name: 'codigo_barras',
    label: i18nT('ui.cod-barras-a99c05'),
    field: 'codigo_barras',
    align: 'left',
  },
  { name: 'valores', label: i18nT('ui.atributos-bd9731'), field: 'valores', align: 'left' },
  { name: 'activo', label: i18nT('cotizacion.table.status'), field: 'activo', align: 'center' },
  { name: 'acciones', label: i18nT('common.actions'), field: 'acciones', align: 'center' },
]

/* ============================== COMPUTED ================================== */
const atributosDisponibles = computed(() => {
  const asignados = new Set(atributosProducto.value.map((a) => a.id_Atributo_producto))
  return atributos.value.filter((a) => !asignados.has(a.id_Atributo_producto))
})

const valoresPorAtributo = computed(() => {
  const map = {}
  atributos.value.forEach((a) => {
    map[a.id_Atributo_producto] = a.valores || []
  })
  return map
})

const puedeGuardarVariante = computed(() => {
  if (!formVariante.value.sku || !formVariante.value.sku.trim()) return false
  if (!atributosProducto.value.length) return false
  // Al menos un valor seleccionado
  return Object.values(formVariante.value.valores || {}).some((v) => v != null && v !== '')
})

/* ============================== LIFECYCLE ================================= */
watch(
  () => props.modelValue,
  (v) => {
    visible.value = v
    if (v) {
      tab.value = 'atributos'
      resetFormVariante()
      cargarAtributos()
      cargarAtributosProducto()
      cargarVariantes()
    }
  },
)

watch(visible, (v) => emit('update:modelValue', v))

/* ============================== HELPERS =================================== */
function formVarianteInicial() {
  return {
    id_Producto_Variante: null,
    sku: '',
    precio_base: 0,
    codigo_barras: '',
    activo: 1,
    valores: {},
  }
}

function resetFormVariante() {
  editandoVariante.value = false
  formVariante.value = formVarianteInicial()
}

function cerrar() {
  visible.value = false
}

function notificar(tipo, mensaje) {
  $q.notify({ type: tipo, message: mensaje, position: 'top' })
}

/* ============================== ATRIBUTOS ================================= */
async function cargarAtributos() {
  if (!props.empresa) return
  cargandoAtributos.value = true
  try {
    const { data } = await apiP.get(`listar_atributos/${props.empresa}`)
    atributos.value = Array.isArray(data) ? data : []
    console.log(data)
  } catch (error) {
    console.error('Error cargando atributos:', error)
    notificar('negative', i18nT('ui.no-se-pudieron-cargar-los-atributos-ab0011'))
  } finally {
    cargandoAtributos.value = false
  }
}

async function registrarAtributo() {
  if (!nuevoAtributo.value.nombre?.trim()) {
    notificar('warning', i18nT('ui.ingrese-el-nombre-del-atributo-70c465'))
    return
  }
  guardandoAtributo.value = true
  try {
    /**const payload = {
      ver: 'registrar_atributo',
      nombre: nuevoAtributo.value.nombre.trim(),
      tipo_dato: nuevoAtributo.value.tipo_dato,
      empresa: props.empresa,
    }*/
    const payload = new FormData()
    payload.append('ver', 'registrar_atributo')
    payload.append('nombre', nuevoAtributo.value.nombre.trim())
    payload.append('tipo_dato', nuevoAtributo.value.tipo_dato)
    payload.append('empresa', props.empresa)
    const { data } = await apiP.post('', payload)
    if (Array.isArray(data) && data[0] === 'success') {
      notificar('positive', data[1] || i18nT('ui.atributo-registrado-38792e'))
      nuevoAtributo.value = { nombre: '', tipo_dato: 'texto' }
      await cargarAtributos()
    } else {
      notificar('negative', data?.[1] || i18nT('ui.error-al-registrar-atributo-485839'))
    }
  } catch (error) {
    console.error(error)
    notificar('negative', i18nT('ui.error-al-registrar-atributo-485839'))
  } finally {
    guardandoAtributo.value = false
  }
}

async function confirmarEliminarAtributo(attr) {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `¿Eliminar el atributo "${attr.nombre}" y todos sus valores?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await apiP.get(`eliminar_atributo/${attr.id_Atributo_producto}`)
      if (Array.isArray(data) && data[0] === 'success') {
        notificar('positive', data[1] || i18nT('ui.atributo-eliminado-3282a6'))
        await cargarAtributos()
        await cargarAtributosProducto()
      } else {
        notificar('negative', data?.[1] || i18nT('ui.no-se-pudo-eliminar-ffa177'))
      }
    } catch (error) {
      console.error(error)
      notificar('negative', i18nT('ui.error-al-eliminar-atributo-4cdb5b'))
    }
  })
}

/* ============================== VALORES =================================== */
async function registrarValor(idAtributo) {
  const valor = (nuevoValor.value[idAtributo] || '').trim()
  if (!valor) return
  try {
    /**const payload = {
      ver: 'registrar_valor',
      id_Atributo_producto: idAtributo,
      valor,
      orden: 0,
    }*/
    const formData = new FormData()
    formData.append('ver', 'registrar_valor')
    formData.append('id_Atributo_producto', idAtributo)
    formData.append('valor', valor)
    formData.append('orden', 0)
    const { data } = await apiP.post('', formData)
    if (Array.isArray(data) && data[0] === 'success') {
      nuevoValor.value[idAtributo] = ''
      notificar('positive', i18nT('ui.valor-registrado-04e3a0'))
      await cargarAtributos()
    } else {
      notificar('negative', data?.[1] || i18nT('ui.no-se-pudo-registrar-el-valor-9034eb'))
    }
  } catch (error) {
    console.error(error)
    notificar('negative', i18nT('ui.error-al-registrar-valor-ea4c5e'))
  }
}

async function confirmarEliminarValor(val) {
  try {
    const { data } = await apiP.get(`eliminar_valor/${val.id_Valor_Atributo}`)
    if (Array.isArray(data) && data[0] === 'success') {
      notificar('positive', i18nT('ui.valor-eliminado-836bfb'))
      await cargarAtributos()
    } else {
      notificar('negative', data?.[1] || i18nT('ui.no-se-pudo-eliminar-el-valor-83c2a5'))
    }
  } catch (error) {
    console.error(error)
    notificar('negative', i18nT('ui.error-al-eliminar-valor-8e5319'))
  }
}

/* ======================== ATRIBUTOS DEL PRODUCTO ========================== */

async function cargarAtributosProducto() {
  if (!props.producto?.id) return
  try {
    const { data } = await apiP.get(`listar_atributos_producto/${props.producto.id}`)
    atributosProducto.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando atributos del producto:', error)
  }
}

async function asignarAtributo() {
  if (!atributoSeleccionado.value) return
  asignandoAtributo.value = true
  try {
    /**const payload = {
      ver: 'asignar_atributo_producto',
      idproducto: props.producto.id,
      id_Atributo_producto: atributoSeleccionado.value,
    }*/
    const formData = new FormData()
    formData.append('ver', 'asignar_atributo_producto')
    formData.append('idproducto', props.producto.id)
    formData.append('id_Atributo_producto', atributoSeleccionado.value)
    const { data } = await apiP.post('', formData)
    if (Array.isArray(data) && data[0] === 'success') {
      notificar('positive', i18nT('ui.atributo-asignado-al-producto-61bad4'))
      atributoSeleccionado.value = null
      await cargarAtributosProducto()
    } else {
      notificar('negative', data?.[1] || i18nT('ui.no-se-pudo-asignar-e2d0e1'))
    }
  } catch (error) {
    console.error(error)
    notificar('negative', i18nT('ui.error-al-asignar-atributo-b26002'))
  } finally {
    asignandoAtributo.value = false
  }
}

async function eliminarAsignacion(idProductoAtributo) {
  try {
    const { data } = await apiP.get(`eliminar_asignacion_producto/${idProductoAtributo}`)
    if (Array.isArray(data) && data[0] === 'success') {
      notificar('positive', i18nT('ui.asignacion-eliminada-3ddcb4'))
      await cargarAtributosProducto()
    } else {
      notificar('negative', data?.[1] || i18nT('ui.no-se-pudo-eliminar-ffa177'))
    }
  } catch (error) {
    console.error(error)
    notificar('negative', i18nT('ui.error-al-eliminar-asignacion-c09a1a'))
  }
}

/* ============================== VARIANTES ================================= */
async function cargarVariantes() {
  if (!props.producto?.id) return
  cargandoVariantes.value = true
  try {
    const { data } = await apiP.get(`listar_variantes/${props.producto.id}`)
    variantes.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando variantes:', error)
    notificar('negative', i18nT('ui.no-se-pudieron-cargar-las-variantes-0bc3d7'))
  } finally {
    cargandoVariantes.value = false
  }
}

function editarVariante(row) {
  editandoVariante.value = true
  const valores = {}
  ;(row.valores || []).forEach((v) => {
    // Encontrar el atributo correspondiente en el producto
    const ap = atributosProducto.value.find((a) => a.nombre === v.atributo)
    if (ap) valores[ap.id_Atributo_producto] = v.id_Valor_Atributo
  })
  formVariante.value = {
    id_Producto_Variante: row.id_Producto_Variante,
    sku: row.sku || '',
    precio_base: row.precio_base ?? 0,
    codigo_barras: row.codigo_barras || '',
    activo: row.activo == 1 ? 1 : 0,
    valores,
  }
  tab.value = 'variantes'
}

async function guardarVariante() {
  if (!puedeGuardarVariante.value) {
    notificar('warning', i18nT('ui.complete-los-datos-requeridos-62fbc1'))
    return
  }
  guardandoVariante.value = true
  try {
    const valoresArray = Object.values(formVariante.value.valores).filter(
      (v) => v != null && v !== '',
    )
    const esEdicion = editandoVariante.value && formVariante.value.id_Producto_Variante

    /**const payload = {
      ver: esEdicion ? 'editar_variante' : 'registrar_variante',
      ...(esEdicion ? { id: formVariante.value.id_Producto_Variante } : {}),
      idproducto: props.producto.id,
      sku: formVariante.value.sku.trim(),
      precio_base: formVariante.value.precio_base ?? null,
      codigo_barras: formVariante.value.codigo_barras || null,
      activo: formVariante.value.activo,
      valores: JSON.stringify(valoresArray),
    }*/

    const payload = new FormData()

    payload.append('ver', esEdicion ? 'editar_variante' : 'registrar_variante')

    if (esEdicion) {
      payload.append('id', formVariante.value.id_Producto_Variante)
    }

    payload.append('idproducto', props.producto.id)

    payload.append('sku', formVariante.value.sku.trim())

    payload.append('precio_base', formVariante.value.precio_base ?? '')

    payload.append('codigo_barras', formVariante.value.codigo_barras || '')

    payload.append('activo', formVariante.value.activo)

    payload.append('valores', JSON.stringify(valoresArray))

    const { data } = await apiP.post('', payload)
    if (Array.isArray(data) && data[0] === 'success') {
      notificar('positive', data[1] || i18nT('ui.variante-guardada-7bac07'))
      resetFormVariante()
      await cargarVariantes()
    } else {
      notificar('negative', data?.[1] || i18nT('ui.error-al-guardar-variante-198c55'))
    }
  } catch (error) {
    console.error(error)
    notificar('negative', i18nT('ui.error-al-guardar-variante-198c55'))
  } finally {
    guardandoVariante.value = false
  }
}

function confirmarEliminarVariante(row) {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `¿Eliminar la variante "${row.sku}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await apiP.get(`eliminar_variante/${row.id_Producto_Variante}`)
      if (Array.isArray(data) && data[0] === 'success') {
        notificar('positive', i18nT('ui.variante-eliminada-169023'))
        await cargarVariantes()
      } else {
        notificar('negative', data?.[1] || i18nT('ui.no-se-pudo-eliminar-ffa177'))
      }
    } catch (error) {
      console.error(error)
      notificar('negative', i18nT('ui.error-al-eliminar-variante-cb194c'))
    }
  })
}
</script>

<style scoped>
.q-tab-panels {
  background: var(--cm-surface-2);
}
.text-nowrap {
  white-space: nowrap;
}
</style>

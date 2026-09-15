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
            Variantes del Producto
          </div>
          <div class="text-caption text-grey-3">
            {{ producto?.nombre }} — Cód: {{ producto?.codigo }}
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="cerrar" />
      </q-card-section>

      <q-tabs
        v-model="tab"
        dense
        align="left"
        class="bg-white text-primary"
        narrow-indicator
        active-color="primary"
      >
        <q-tab name="atributos" icon="list_alt" label="Atributos y Valores" />
        <q-tab name="asignados" icon="check_circle" label="Atributos del Producto" />
        <q-tab name="variantes" icon="inventory_2" label="Variantes" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated class="col">
        <!-- =================== TAB: ATRIBUTOS GLOBALES =================== -->
        <q-tab-panel name="atributos">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-card flat bordered>
                <q-card-section class="text-subtitle1">
                  <q-icon name="add_circle" class="q-mr-xs" /> Nuevo Atributo
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-input
                    v-model="nuevoAtributo.nombre"
                    label="Nombre *"
                    dense
                    outlined
                    placeholder="Ej: Color, Talla"
                  />
                  <q-select
                    v-model="nuevoAtributo.tipo_dato"
                    :options="tiposDato"
                    label="Tipo de Dato *"
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
                    label="Registrar Atributo"
                    :loading="guardandoAtributo"
                    @click="registrarAtributo"
                  />
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-7">
              <q-card flat bordered>
                <q-card-section class="row items-center justify-between">
                  <div class="text-subtitle1">Atributos Existentes</div>
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
                    :caption="'Tipo: ' + attr.tipo_dato"
                    icon="label"
                    group="atributos"
                  >
                    <q-card>
                      <q-card-section>
                        <div class="row items-center q-gutter-sm q-mb-sm">
                          <q-input
                            v-model="nuevoValor[attr.id_Atributo_producto]"
                            label="Nuevo valor"
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
                            Sin valores asignados
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-expansion-item>
                </q-list>
                <q-card-section v-else class="text-center text-grey-6 q-pa-lg">
                  No hay atributos. Cree uno para empezar.
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
                  <q-icon name="link" class="q-mr-xs" /> Asignar Atributo al Producto
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
                    label="Atributo *"
                    dense
                    outlined
                  />
                  <q-btn
                    class="full-width q-mt-md"
                    color="primary"
                    unelevated
                    icon="link"
                    label="Asignar"
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
                  Atributos asignados a este producto
                </q-card-section>
                <q-separator />
                <q-list v-if="atributosProducto.length" separator>
                  <q-item v-for="ap in atributosProducto" :key="ap.id_Producto_Atributo">
                    <q-item-section avatar>
                      <q-icon name="label" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ ap.nombre }}</q-item-label>
                      <q-item-label caption>Tipo: {{ ap.tipo_dato }}</q-item-label>
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
                  No hay atributos asignados a este producto
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
                  {{ editandoVariante ? 'Editar Variante' : 'Nueva Variante' }}
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-input
                    v-model="formVariante.sku"
                    label="SKU *"
                    dense
                    outlined
                    hint="Código único de la variante"
                  />
                  <q-input
                    v-model.number="formVariante.precio_base"
                    type="number"
                    label="Precio Base"
                    dense
                    outlined
                    class="q-mt-sm"
                  />
                  <q-input
                    v-model="formVariante.codigo_barras"
                    label="Código de Barras"
                    dense
                    outlined
                    class="q-mt-sm"
                  />
                  <q-toggle
                    v-model="formVariante.activo"
                    label="Activo"
                    color="positive"
                    class="q-mt-sm"
                    :true-value="1"
                    :false-value="0"
                  />

                  <div class="q-mt-md text-subtitle2 text-primary">Valores de Atributos</div>
                  <q-banner
                    v-if="!atributosProducto.length"
                    dense
                    class="bg-warning text-white q-mt-sm"
                  >
                    Debe asignar al menos un atributo al producto.
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
                      placeholder="Seleccione valor"
                    />
                  </div>

                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      color="primary"
                      unelevated
                      icon="save"
                      :label="editandoVariante ? 'Actualizar' : 'Registrar'"
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
                      label="Cancelar"
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
                  <div class="text-subtitle1">Variantes registradas</div>
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
                        Sin atributos
                      </span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-activo="props">
                    <q-td :props="props" class="text-center">
                      <q-badge :color="props.row.activo == 1 ? 'positive' : 'grey'">
                        {{ props.row.activo == 1 ? 'Activo' : 'Inactivo' }}
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
  { label: 'Texto', value: 'texto' },
  { label: 'Número', value: 'numero' },
  { label: 'Decimal', value: 'decimal' },
  { label: 'Booleano', value: 'booleano' },
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
  { name: 'precio_base', label: 'Precio', field: 'precio_base', align: 'right' },
  {
    name: 'codigo_barras',
    label: 'Cód. Barras',
    field: 'codigo_barras',
    align: 'left',
  },
  { name: 'valores', label: 'Atributos', field: 'valores', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
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
    notificar('negative', 'No se pudieron cargar los atributos')
  } finally {
    cargandoAtributos.value = false
  }
}

async function registrarAtributo() {
  if (!nuevoAtributo.value.nombre?.trim()) {
    notificar('warning', 'Ingrese el nombre del atributo')
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
      notificar('positive', data[1] || 'Atributo registrado')
      nuevoAtributo.value = { nombre: '', tipo_dato: 'texto' }
      await cargarAtributos()
    } else {
      notificar('negative', data?.[1] || 'Error al registrar atributo')
    }
  } catch (error) {
    console.error(error)
    notificar('negative', 'Error al registrar atributo')
  } finally {
    guardandoAtributo.value = false
  }
}

async function confirmarEliminarAtributo(attr) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar el atributo "${attr.nombre}" y todos sus valores?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await apiP.get(`eliminar_atributo/${attr.id_Atributo_producto}`)
      if (Array.isArray(data) && data[0] === 'success') {
        notificar('positive', data[1] || 'Atributo eliminado')
        await cargarAtributos()
        await cargarAtributosProducto()
      } else {
        notificar('negative', data?.[1] || 'No se pudo eliminar')
      }
    } catch (error) {
      console.error(error)
      notificar('negative', 'Error al eliminar atributo')
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
      notificar('positive', 'Valor registrado')
      await cargarAtributos()
    } else {
      notificar('negative', data?.[1] || 'No se pudo registrar el valor')
    }
  } catch (error) {
    console.error(error)
    notificar('negative', 'Error al registrar valor')
  }
}

async function confirmarEliminarValor(val) {
  try {
    const { data } = await apiP.get(`eliminar_valor/${val.id_Valor_Atributo}`)
    if (Array.isArray(data) && data[0] === 'success') {
      notificar('positive', 'Valor eliminado')
      await cargarAtributos()
    } else {
      notificar('negative', data?.[1] || 'No se pudo eliminar el valor')
    }
  } catch (error) {
    console.error(error)
    notificar('negative', 'Error al eliminar valor')
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
      notificar('positive', 'Atributo asignado al producto')
      atributoSeleccionado.value = null
      await cargarAtributosProducto()
    } else {
      notificar('negative', data?.[1] || 'No se pudo asignar')
    }
  } catch (error) {
    console.error(error)
    notificar('negative', 'Error al asignar atributo')
  } finally {
    asignandoAtributo.value = false
  }
}

async function eliminarAsignacion(idProductoAtributo) {
  try {
    const { data } = await apiP.get(`eliminar_asignacion_producto/${idProductoAtributo}`)
    if (Array.isArray(data) && data[0] === 'success') {
      notificar('positive', 'Asignación eliminada')
      await cargarAtributosProducto()
    } else {
      notificar('negative', data?.[1] || 'No se pudo eliminar')
    }
  } catch (error) {
    console.error(error)
    notificar('negative', 'Error al eliminar asignación')
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
    notificar('negative', 'No se pudieron cargar las variantes')
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
    notificar('warning', 'Complete los datos requeridos')
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
      notificar('positive', data[1] || 'Variante guardada')
      resetFormVariante()
      await cargarVariantes()
    } else {
      notificar('negative', data?.[1] || 'Error al guardar variante')
    }
  } catch (error) {
    console.error(error)
    notificar('negative', 'Error al guardar variante')
  } finally {
    guardandoVariante.value = false
  }
}

function confirmarEliminarVariante(row) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar la variante "${row.sku}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const { data } = await apiP.get(`eliminar_variante/${row.id_Producto_Variante}`)
      if (Array.isArray(data) && data[0] === 'success') {
        notificar('positive', 'Variante eliminada')
        await cargarVariantes()
      } else {
        notificar('negative', data?.[1] || 'No se pudo eliminar')
      }
    } catch (error) {
      console.error(error)
      notificar('negative', 'Error al eliminar variante')
    }
  })
}
</script>

<style scoped>
.q-tab-panels {
  background: #f5f7fa;
}
.text-nowrap {
  white-space: nowrap;
}
</style>

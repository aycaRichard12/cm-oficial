
<template>
  <q-page class="q-pa-md">
    <InventarioExteriorHeader />

    <InventarioExteriorFormDialog
      v-model="formCollapse"
      :titulo="tituloFormulario"
      v-model:form-data="formData"
      :almacen-options="almacenOptions"
      @submit="onSubmitMainForm"
    />

    <InventarioExteriorToolbar
      :form-collapse="formCollapse"
      v-model:filtro-almacen="filtroAlmacen"
      v-model:search-query="searchQuery"
      :almacen-options="almacenOptions"
      @toggle-form="onToggleForm"
    />

    <InventarioExteriorTable
      :rows="filteredInventario"
      :columns="columns"
      :editar="editar"
      :eliminar="eliminar"
      @toggleAutorizacion="toggleAutorizacion"
      @showDetail="onShowDetail"
      @editItem="onEditItem"
      @deleteItem="deleteItem"
    />

    <InventarioExteriorDetalleDialog
      v-model="showDetalle"
      v-model:detalle-form-data="detalleFormData"
      :detalle-inventario="detalleInventario"
      :detalle-columns="detalleColumns"
      :filtered-productos-options="filteredProductosOptions"
      :loading-productos="loadingProductos"
      :editar="editar"
      :eliminar="eliminar"
      @close="hideDetail"
      @submit="onSubmitDetailForm"
      @reset="resetearDetalleFormulario"
      @filter-productos="filterProductos"
      @select-product-option="onSelectProductOption"
      @edit-detail="actualizarDetalleINV"
      @delete-detail="onDeleteDetail"
    />
  </q-page>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useMenuStore } from 'src/stores/permitidos'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'

// Components
import InventarioExteriorHeader from 'src/components/inventarioExterior/InventarioExteriorHeader.vue'
import InventarioExteriorFormDialog from 'src/components/inventarioExterior/InventarioExteriorFormDialog.vue'
import InventarioExteriorToolbar from 'src/components/inventarioExterior/InventarioExteriorToolbar.vue'
import InventarioExteriorTable from 'src/components/inventarioExterior/InventarioExteriorTable.vue'
import InventarioExteriorDetalleDialog from 'src/components/inventarioExterior/InventarioExteriorDetalleDialog.vue'

// Composables
import { useCatalogosInventario } from 'src/composables/useCatalogosInventario'
import { useInventarioExterior } from 'src/composables/useInventarioExterior'
import { useInventarioExteriorDetalle } from 'src/composables/useInventarioExteriorDetalle'

const menuStore = useMenuStore()
const route = useRoute()
const idusuario = idusuario_md5()
const [, escritura, editar, eliminar] = menuStore.permisoPagina(
  route.path.replace(/^\//, '') + `-${idusuario}`,
)

// Destructure Composables
const {
  almacenOptions,
  clientesOptions,
  // filteredClientesOptions, // Not used directly in page? Used deeply in ClienteSucursal or we need to pass it? 
  // Wait, ClienteSucursal component handles its own filtering?? 
  // In original code: `filteredClientesOptions` was used for Q-Select filter but passed??
  // Looking at original template: <ClienteSucursal ... />
  // ClienteSucursal seems to be a custom component. The original code had `clientesOptions` but `ClienteSucursal` might use them or fetch its own?
  // Let's check original code usage:
  // `valores iniciales`: `await listaCliente()` populated `clientesOptions`.
  // `ClienteSucursal` components usually take `options` as props OR fetch them. 
  // The original template: `<ClienteSucursal ... v-model:client="formData.cliente" v-model:branch="formData.sucursal" />`
  // It didn't pass options? So ClienteSucursal might be fetching its own or using store?
  // WAIT. The original code had `listaCliente` filling `clientesOptions`. 
  // But `ClienteSucursal` usage in template did NOT see `clientes` passed as prop.
  // Exception: Maybe `ClienteSucursal` is not using the `clientesOptions` from this page?
  // Let's look closer at original code:
  // `const clientesOptions = ref([])` ... `await listaCliente()`
  // BUT `clientesOptions` is NOT passed to `ClienteSucursal`.
  // However, `selectSucursal` IS called when `formData.value.idcliente` changes.
  // And `editItem` uses `clientesOptions` to find the selected client object.
  // So `clientesOptions` IS needed for `editItem` logic.
  
  sucursalOptions,
  // filteredSucursalOptions,

  filteredProductosOptions,
  loadingProductos,
  listaAlmacenes,
  listaCliente,
  selectSucursal,
  listaProductosDisponibles,
  filterProductos
} = useCatalogosInventario()

const {
  formCollapse,
  tituloFormulario,
  filtroAlmacen,
  searchQuery,

  filteredInventario, // Computed
  formData,
  columns,
  listarDatos,
  handleMainFormSubmit,
  toggleAutorizacion,
  deleteItem,
  editItem,
  resetearFormulario,
  toggleFormCollapse
} = useInventarioExterior()

const {
  showDetalle,
  detalleFormData,
  detalleInventario,
  detalleColumns,
  resetearDetalleFormulario,

  handleDetailFormSubmit,
  elminarDetalleMovimiento,
  actualizarDetalleINV,
  showDetail,
  hideDetail
} = useInventarioExteriorDetalle()


// --- Lifecycle & Watchers ---

onMounted(async () => {
  const today = obtenerFechaActualDato()
  formData.value.fecha = today
  detalleFormData.value.fecha = today

  localStorage.removeItem('detalleInventario')

  await listaAlmacenes()
  await listaCliente() // Needed for edit logic mainly
  await listarDatos()
})

watch(filtroAlmacen, () => {
  listarDatos() // Re-fetch or re-filter
})

watch(formCollapse, (newVal) => {
  if (!newVal) {
    // If form is closing
    // We don't have lat/long here to pass to reset, but reset handles defaults.
    // Original: resetearFormulario() called without args when closing.
    resetearFormulario(null, null, escritura)
  }
})

watch(
  () => formData.value.cliente, // Watch the object or value? Original watched `formData.value.idcliente`? 
  // Original: `watch(() => formData.value.idcliente, ...)`
  // But `ClienteSucursal` updates `formData.cliente` (object typically).
  // We need to sync `idcliente`?
  async (newCliente) => {
     // If `ClienteSucursal` returns object, we extract ID.
     const id = newCliente?.value || newCliente
     formData.value.idcliente = id
     
    if (id) {
      // We don't have logic to populate `sucursalOptions` locally for `ClienteSucursal` 
      // if `ClienteSucursal` handles its own options.
      // But `selectSucursal` in original code populated `sucursalOptions` AND `filtered...`.
      // The original `selectSucursal` was used in `editItem`. 
      // Does `ClienteSucursal` component use `sucursalOptions`??
      // If `ClienteSucursal` is a black box, it might load its own stuff. 
      // BUT `editItem` needs to set `formData.sucursal`.
      
      // Let's assume `ClienteSucursal` handles user interaction.
      // We only strictly need `selectSucursal` for `editItem` populating (if customized).
      // Or maybe we just need `idcliente` update.
    } else {
      formData.value.sucursali = ''
      formData.value.idsucursal = ''
    }
  },
  { deep: true }
)

// --- Event Handlers ---

const onToggleForm = () => {
    toggleFormCollapse(escritura)
}

const onSubmitMainForm = () => {
    handleMainFormSubmit(escritura)
}

const onShowDetail = (row) => {
    showDetail(row, async () => {
         // Refresh products available for this warehouse/register
         // Logic inside showDetail saves to localStorage, so listaProductosDisponibles works
         await listaProductosDisponibles() 
    })
}

const onSubmitDetailForm = () => {
    handleDetailFormSubmit(async () => {
        await listaProductosDisponibles()
    })
}

const onDeleteDetail = (id) => {
    elminarDetalleMovimiento(id, async () => {
         await listaProductosDisponibles()
    })
}

const onEditItem = async (row) => {
    // editItem returns idcliente or null
    const idcliente = await editItem(row, clientesOptions.value)
    if (idcliente) {
        await selectSucursal(idcliente)
        
        // Let's replicate original behavior:
        const firstBranch = sucursalOptions.value.find(s => Number(s.clientId) === Number(idcliente))
        if(firstBranch) formData.value.sucursal = firstBranch
    }
}

const onSelectProductOption = (val) => {
    if (val) {
        detalleFormData.value.productos = val.label
        detalleFormData.value.idproductoalmacen = val.value
    } else {
        detalleFormData.value.productos = ''
        detalleFormData.value.idproductoalmacen = ''
    }
}

</script>

<style scoped>
.q-table__container {
  overflow: auto;
}
</style>

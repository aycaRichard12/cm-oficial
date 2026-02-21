<template>
  <q-page padding>
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row items-center q-pb-none">
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary"><q-icon name="campaign" size="sm" class="q-mr-sm" />Gestión de Campañas</div>
          <div class="text-caption text-grey-7">Administre campañas promocionales y descuentos</div>
        </div>
        <div class="col-auto"><q-btn unelevated color="primary" icon="add" label="Nueva Campaña" @click="() => { resetearFormulario(); formularioActivo = true }" /></div>
      </q-card-section>
      <q-card-section><div class="row q-col-gutter-md">
          <div class="col-12 col-md-4"><q-select v-model="idalmacenfiltro" :options="almacenesOptions" option-value="idalmacen" option-label="almacen" label="Filtrar por almacén" outlined dense emit-value map-options clearable><template v-slot:prepend><q-icon name="store" /></template></q-select></div>
          <div class="col-12 col-md-4"><q-input v-model="busqueda" label="Buscar campaña..." outlined dense clearable><template v-slot:prepend><q-icon name="search" /></template></q-input></div>
        </div></q-card-section>
    </q-card>

    <CampanasTabla :campanas="campanasFiltradas" :busqueda="busqueda" :cambiar-estado="cambiarEstado" :editar-campana="cargarEditarCampana" :eliminar="eliminar" :tiene-categorias="tieneCategorias" :cargarcategoria="cargarcategoria" :cargar-precios="cargarPrecios" />

    <FormularioCampanaDialog v-model="formularioActivo" :form-data="formData" @update-form="(key, val) => formData[key] = val" :almacenes-options="almacenesOptions" :resetear-formulario="resetearFormulario" :registrar-campana="registrarCampana" />
    <CategoriasCampanaDialog v-model="dialogoCategorias" :categoria-form="categoriaForm" @update-form="(val) => categoriaForm.idcategoriaprecio = val" :categorias-precio-options="categoriasPrecioOptions" :categorias-campana="categoriasCampana" :registrar-categoria="registrarCategoria" :eliminar-categoria-campana="eliminarCategoriaCampana" :resetear-form="resetearCategoriaForm" />
    <PreciosCampanaDialog 
       v-model="dialogoPrecios" 
       :precio-form="precioForm" 
       @update-form="(key, val) => precioForm[key] = val"
       :categorias-campana="categoriasCampana" 
       :productos-no-asignados-options="productosNoAsignadosOptions" 
       :precios-filtrados="preciosCampanaFiltrados" 
       :producto-seleccionado="productoSeleccionado" 
       @update:producto-seleccionado="(val) => { productoSeleccionado = val; alSeleccionarProducto(val) }"
       :categorias-opciones="categoriasCampanaPrecioOptions" 
       v-model:filtro-precio="filtroPrecioCampania" 
       :registrar-precio="registrarPrecioCampaña" 
       :cancelar-edicion="cancelarEdicionPrecio" 
       :on-categoria="onCategoriaCampañaSeleccionada" 
       :filtrar-productos="filtrarProductos" 
       :editar-precio="editarPrecioCampana" 
       :eliminar-precio="eliminarPrecioCampana" 
    />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCampanas } from './composables/useCampanas'
import { useCategoriasCampana } from './composables/useCategoriasCampana'
import { usePreciosCampana } from './composables/usePreciosCampana'
import CampanasTabla from './components/CampanasTabla.vue'
import FormularioCampanaDialog from './components/FormularioCampanaDialog.vue'
import CategoriasCampanaDialog from './components/CategoriasCampanaDialog.vue'
import PreciosCampanaDialog from './components/PreciosCampanaDialog.vue'

const q = useQuasar()
const { 
  campanas, idalmacenfiltro, busqueda, formularioActivo, formData, campanasFiltradas, almacenesOptions,
  listarAlmacenes, listarCampanas, resetearFormulario, registrarCampana, cargarEditarCampana, eliminar, cambiarEstado 
} = useCampanas(q)

const {
  dialogoCategorias, categoriasCampana, categoriaForm, categoriasPrecioOptions,
  listarCategoriasPrecio, resetearCategoriaForm, cargarcategoria, registrarCategoria, 
  eliminarCategoriaCampana, tieneCategorias, actualizarCampanasConCategorias
} = useCategoriasCampana(q, campanas)

const {
  dialogoPrecios, preciosCampanaFiltrados, filtroPrecioCampania,
  productoSeleccionado, productosNoAsignadosOptions, precioForm, categoriasCampanaPrecioOptions,
  listarProductosAlmacen, cargarPrecios, onCategoriaCampañaSeleccionada, registrarPrecioCampaña,
  eliminarPrecioCampana, editarPrecioCampana, cancelarEdicionPrecio, filtrarProductos, alSeleccionarProducto
} = usePreciosCampana(q, campanas, idalmacenfiltro)

onMounted(async () => {
  await listarAlmacenes()
  await listarCampanas()
  await listarProductosAlmacen()
  await listarCategoriasPrecio()
  await actualizarCampanasConCategorias()
})
</script>

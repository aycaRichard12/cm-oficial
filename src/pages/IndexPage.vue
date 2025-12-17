<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <template v-for="box in orderedTopBoxes" :key="box.id">
        <div class="col-xs-12 col-sm-6 col-md-3" :class="box.colorClass" :id="box.cardId">
          <q-card
            flat
            dense
            bordered
            class="full-height"
            style="background: linear-gradient(to right, #219286, #044e49)"
            :style="{ color: 'white' }"
          >
            <q-item>
              <!-- Eliminamos la prop :avatar ya que no estamos usando q-avatar directamente aquí -->
              <q-item-section>
                <template v-if="typeof box.iconComponent === 'string'">
                  <div class="svg-icon-wrapper">
                    <img :src="box.iconComponent" alt="icon" class="svg-icon" />
                  </div>
                </template>
              </q-item-section>

              <q-item-section>
                <q-item-label style="font-size: 10px">{{ box.title }}</q-item-label>
                <q-item-label
                  caption
                  style="font-family: Arial, Helvetica, sans-serif; color: white; font-size: 12px"
                >
                  {{ box.subtitle }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="q-pt-none">
              <q-item-section> </q-item-section>
              <q-item-section>
                <q-btn
                  outline=""
                  :style="{ color: componenteActivo === box.component ? '#f2c037' : 'white' }"
                  label="Ir"
                  @click="cambiarComponente(box.id)"
                />
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </template>
    </div>

    <div class="row q-col-gutter-x-md">
      <div class="col-xs-12 col-md-8" ref="componentContainer" id="carrito">
        <component :is="componenteActivo" />
      </div>
      <div class="col-xs-12 col-md-4" id="reportes-hoy">
        <div class="full-height"><ReporteVentaInicio /></div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, shallowRef, markRaw, defineAsyncComponent, computed } from 'vue'
import { useQuasar } from 'quasar'
import ReporteVentaInicio from 'src/components/reporteVentas/ReporteVentaInicio.vue'

// Importar los SVGs directamente. Con vite-svg-loader, se importan como componentes Vue.
import IconVentas from 'src/assets/Ventas.png'
import IconPedidos from 'src/assets/Compras.png'
import IconAdmin from 'src/assets/Productos.png'
import IconReportes from 'src/assets/Reportes.png'
import { verificarexistenciapagina } from 'src/composables/FuncionesG'
const $q = useQuasar()
console.log('Quasar in App.vue:', $q)
const componentContainer = ref(null)

const inicialComponent = defineAsyncComponent({
  loader: () => import('components/welcome/welcomeComp.vue'),
  loadingComponent: { template: '<div>Cargando inicio...</div>' },
  errorComponent: { template: '<div>Error al cargar inicio</div>' },
})
const PedidoComponent = defineAsyncComponent({
  loader: () => import('pages/compra/RcompraPage.vue'),
  loadingComponent: { template: '<div>Cargando pedidos...</div>' },
  errorComponent: { template: '<div>Error al cargar pedidos</div>' },
})
const CrearProductos = defineAsyncComponent({
  loader: () => import('pages/producto/CproductoPage.vue'),
  loadingComponent: { template: '<div>Cargando Productos...</div>' },
  errorComponent: { template: '<div>Error al cargar Productos</div>' },
})
const VentaComponent = defineAsyncComponent({
  loader: () => import('src/components/venta/ventaComponent.vue'),
  loadingComponent: { template: '<div>Cargando ventas...</div>' },
})
const ReporteComponent = defineAsyncComponent({
  loader: () => import('src/components/reporte/reporteComponent.vue'),
  loadingComponent: { template: '<div>Cargando reportes...</div>' },
})
const componentsMap = {
  venta: VentaComponent,
  compra: PedidoComponent,
  producto: CrearProductos,
  dashboard: ReporteComponent,
}

const componenteActivo = shallowRef(inicialComponent)

const cambiarComponente = (id) => {
  const newComponent = componentsMap[id]
  if (newComponent) {
    componenteActivo.value = markRaw(newComponent)
    if ($q.screen.lt.md && componentContainer.value) {
      componentContainer.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  // try {
  //   componenteActivo.value = markRaw(componente)
  // } catch (error) {
  //   console.error('Error al cambiar componente:', error)
  // }
}

const nombreUsuario = ref('')
const venta = ref(null)
const compra = ref(null)
const dashboard = ref(null)
const producto = ref(null)

const contenidoUsuario = localStorage.getItem('yofinanciero')
const contenidoMenus = JSON.parse(localStorage.getItem('yofinancieromenu'))

onMounted(() => {
  if (contenidoUsuario && contenidoMenus) {
    try {
      const parsedData = JSON.parse(contenidoUsuario)
      nombreUsuario.value = parsedData[0]?.nombre || 'Usuario desconocido'

      venta.value = verificarexistenciapagina('registrarventaoculto')
      compra.value = verificarexistenciapagina('registrarcompra')
      dashboard.value = verificarexistenciapagina('dashboard')
      producto.value = verificarexistenciapagina('registrarproductos')

      // Set initial component based on permissions
      if (venta.value) {
        cambiarComponente('venta')
      } else if (compra.value) {
        cambiarComponente('compra')
      } else if (producto.value) {
        cambiarComponente('producto')
      } else if (dashboard.value) {
        cambiarComponente('dashboard')
      }
    } catch (error) {
      console.error('Error al parsear los datos de localStorage:', error)
    }
  } else {
    console.warn('No hay datos en localStorage para "yofinanciero"')
  }
})
//reportes-hoy

const orderedTopBoxes = computed(() => {
  const boxes = []
  if (venta.value)
    boxes.push({
      id: 'venta',
      component: VentaComponent,
      data: venta.value,
      iconComponent: IconVentas,
      title: 'VENTAS',
      subtitle: 'Registrar Venta',
      cardId: 'venta-card',
    })
  if (compra.value)
    boxes.push({
      id: 'compra',
      component: PedidoComponent,
      data: compra.value,
      iconComponent: IconPedidos,
      title: 'COMPRAS',
      subtitle: 'Compras o Producción',
      cardId: 'compra-card',
    })
  if (producto.value)
    boxes.push({
      id: 'producto',
      component: CrearProductos,
      data: producto.value,
      iconComponent: IconAdmin,
      title: 'PRODUCTOS',
      subtitle: 'Administración Productos',
      cardId: 'producto-card',
    })
  if (dashboard.value)
    boxes.push({
      id: 'dashboard',
      component: ReporteComponent,
      data: dashboard.value,
      iconComponent: IconReportes,
      title: 'REPORTES',
      subtitle: dashboard.value.titulo || 'Reportes',
      cardId: 'reportes-card',
    })
  return boxes
})
</script>

<style scoped>
/* ======= ESTILOS GENERALES (Flexbox-friendly) ======= */
.q-page {
  overflow-x: hidden;
}

.box {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  min-width: 0;
  overflow: hidden;
}

.q-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* MODIFICACIÓN AQUÍ: Nuevos estilos para el contenedor del SVG */
.svg-icon-wrapper {
  width: 90px; /* Ancho deseado para el contenedor del SVG */
  height: 60px; /* Alto deseado para el contenedor del SVG */
  display: flex; /* Usar flexbox para centrar el SVG */
  justify-content: center; /* Centrar horizontalmente */
  align-items: center; /* Centrar verticalmente */
  overflow: hidden; /* Asegurar que el SVG no se desborde del contenedor */
  flex-shrink: 0; /* Evita que el contenedor se encoja */
}

/* Estilos para el SVG real dentro del contenedor */
.svg-icon {
  max-width: 100% !important; /* Forzar al SVG a ocupar el 100% del ancho del contenedor */
  max-height: 100% !important; /* Forzar al SVG a ocupar el 100% del alto del contenedor */
  display: block; /* Eliminar espacio extra debajo del SVG */
  color: white;
  /* El color se aplica a través de la prop `style` en el template,
     pero si el SVG usa `currentColor`, este estilo lo afectará. */
}

/* Asegurar imágenes escalan (si aún se usan img dentro de q-avatar en otros lugares) */
.q-avatar img {
  max-width: 100%;
  height: auto;
  display: block;
}

.q-item-label {
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}
</style>

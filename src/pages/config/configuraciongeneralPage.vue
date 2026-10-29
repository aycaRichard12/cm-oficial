<template>
  <q-page class="grid-container">
    <div class="box green">
      <q-card
        v-if="venta"
        flat
        dense
        bordered
        class="col"
        style="background: linear-gradient(to right, #219286, #044e49); color: #f2c037"
      >
        <q-item>
          <q-item-section> </q-item-section>
          <q-item-section id="venta-card">
            <q-btn
              flat
              style="color: #f2c037"
              :label="$t('ui.ir-96e58e')"
              @click="cambiarComponente(VentaComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box yellow">
      <q-card
        v-if="compra"
        flat
        dense
        bordered
        class="col"
        style="background: linear-gradient(to right, #219286, #044e49); color: white; /* theme-allow */"
      >
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section id="compra-card">
            <q-btn
              flat
              style="color: white; /* theme-allow */"
              :label="$t('ui.ir-96e58e')"
              @click="cambiarComponente(PedidoComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box coffee">
      <q-card
        v-if="compra"
        flat
        dense
        bordered
        class="col"
        style="background: linear-gradient(to right, #219286, #044e49); color: white; /* theme-allow */"
      >
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section id="producto-card">
            <q-btn
              flat
              style="color: white; /* theme-allow */"
              :label="$t('ui.ir-96e58e')"
              @click="cambiarComponente(CrearProductos)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box red">
      <q-card
        v-if="dashboard"
        flat
        dense
        bordered
        class="col"
        style="background: linear-gradient(to right, #219286, #044e49); color: white; /* theme-allow */"
      >
        <q-item>
          <q-item-section> </q-item-section>

          <q-item-section id="reportes-card">
            <q-btn
              flat
              style="color: white; /* theme-allow */"
              label="ir"
              @click="cambiarComponente(ReporteComponent)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
    <div class="box blue" id="venta">
      <div style="display: flex; justify-content: end">
        <q-btn icon="help_outline" color="blue" flat @click="iniciarGuia" />
      </div>
      <component :is="componenteActivo" />
    </div>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, shallowRef, markRaw, defineAsyncComponent } from 'vue'
import { useQuasar } from 'quasar'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
// import { PAGINAS, PAGINAS_ICONS } from 'src/stores/paginas'
// import { useMenuStore } from 'src/stores/permitidos'

//import { iniciarTourInicio } from 'src/utils/tourGLobal'
const $q = useQuasar()
console.log('Quasar in App.vue:', $q)
// Carga asíncrona de componentes con manejo de errores
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

const componenteActivo = shallowRef(markRaw(VentaComponent))

const cambiarComponente = (componente) => {
  try {
    componenteActivo.value = markRaw(componente)
  } catch (error) {
    console.error('Error al cambiar componente:', error)
    // Opcional: Mostrar notificación de error al usuario
  }
}
const nombreUsuario = ref('') // Variable reactiva
const venta = ref({})
const compra = ref({})
const dashboard = ref({})
const producto = ref({})
// inicialconst expanded = ref(false)

const contenidoUsuario = localStorage.getItem('mistersofts-cm')
const contenidoMenus = JSON.parse(localStorage.getItem('mistersofts-cmmenu'))

onMounted(() => {
  if (contenidoUsuario && contenidoMenus) {
    try {
      const parsedData = JSON.parse(contenidoUsuario)
      nombreUsuario.value = parsedData[0]?.nombre || i18nT('ui.usuario-desconocido-b61c02')

      venta.value = verificar_permiso_venta()
      compra.value = verificar_permiso_compra()
      dashboard.value = verificar_permiso_dashboard()
      producto.value = verificar_permiso_producto()
      console.log(venta.value) // Devuelve el objeto del submenú o null
      console.log(compra.value) // Devuelve el objeto del submenú o null
      console.log(dashboard.value) // Devuelve el objeto del submenú o null

      // Establecer componente inicial basado en permisos
      if (venta.value) componenteActivo.value = VentaComponent
      else if (compra.value) componenteActivo.value = PedidoComponent
      else if (dashboard.value) componenteActivo.value = ReporteComponent
    } catch (error) {
      console.error('Error al parsear los datos de localStorage:', error)
    }
  } else {
    console.warn('No hay datos en localStorage para "mistersofts-cm" o "mistersofts-cmmenu".')
  }
})

const verificar_permiso_compra = () => {
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'registrarcompra-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_venta = () => {
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'registrarventa-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_dashboard = () => {
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'dashboard-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const verificar_permiso_producto = () => {
  for (const modulo of contenidoMenus) {
    for (const menu of modulo.menu) {
      const sub = menu.submenu.find((sub) => sub.codigo === 'registrarproductos-' + menu.usuario)
      if (sub) return sub
    }
  }
  return null
}
const driverObj = driver()

const iniciarGuia = () => {
  driverObj.setSteps([
    {
      element: '#venta-card',
      popover: {
        title: i18nT('ui.modulo-de-ventas-ac8720'),
        description:
          i18nT('ui.aqui-puedes-gestionar-tus-ventas-y-realizar-nuevas-t-065f84'),
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '#compra-card',
      popover: {
        title: i18nT('ui.modulo-de-compras-2264ac'),
        description:
          i18nT('ui.consulta-y-administra-todas-tus-compras-de-manera-se-a273aa'),
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#reportes-card',
      popover: {
        title: i18nT('ui.reportes-y-estadisticas-6de16a'),
        description: i18nT('ui.accede-a-analisis-detallados-y-estadisticas-de-rendi-9c9dbb'),
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#producto-card',
      popover: {
        title: i18nT('ui.gestion-de-productos-2815c2'),
        description: i18nT('ui.agrega-edita-y-organiza-tus-productos-optimiza-tu-ca-0ce6c2'),
        side: 'bottom',
        align: 'start',
      },
    },

    {
      element: '#venta',
      popover: {
        title: i18nT('ui.carrito-de-ventas-062c7a'),
        description: i18nT('ui.realiza-la-venta-de-tus-productos-facilmente-desde-e-eaadd3'),
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#reportes-hoy',
      popover: {
        title: i18nT('ui.resumen-de-reportes-6616bb'),
        description:
          i18nT('ui.visualiza-rapidamente-los-reportes-y-metricas-del-di-92e745'),
        side: 'bottom',
        align: 'start',
      },
    },
  ])
  driverObj.drive()
}
</script>

<style scoped>
/* ======= ESTILOS GENERALES ======= */
.grid-container {
  display: grid;
  gap: 8px;
  padding: 10px;
}

.box {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.q-card {
  flex-grow: 2;
  display: flex;
  flex-direction: column;
}

/* ======= COLORES Y POSICIONAMIENTO ======= */
.green {
  grid-column: 1 / 1;
  grid-row: 1 / 1;
}
.yellow {
  grid-column: 2 / 2;
  grid-row: 1 / 1;
}
.red {
  grid-column: 3 / 3;
  grid-row: 1 / 1;
}
.coffee {
  grid-column: 4/4;
  grid-row: 1/1;
}

.blue {
  grid-column: 1 / 9;
  grid-row: 2 / 9;
}

/* ======= ESTILOS PARA ESCRITORIO ======= */
@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: auto auto auto auto auto auto auto auto;

    grid-template-rows: auto auto auto auto auto auto auto auto;
  }
}

/* ======= ESTILOS PARA ANDROID (MÓVILES) ======= */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr; /* Una sola columna */
    grid-template-rows: auto;
  }

  .box {
    height: auto; /* Ajustar altura automáticamente */
  }
  .green,
  .yellow,
  .red,
  .blue,
  .coffee,
  .purple {
    grid-column: 1 / 2; /* Todas las cajas en una sola columna */
    grid-row: auto;
  }
}
</style>

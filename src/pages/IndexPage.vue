<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- Contenedor de cajas con lógica condicional -->
    <div
      class="row q-col-gutter-md q-mb-lg"
      :class="{ 'no-wrap': isCompactMode }"
      :style="isCompactMode ? 'overflow-x: auto; flex-wrap: nowrap;' : ''"
    >
      <template v-for="box in finalTopBoxes" :key="box.id">
        <div
          :class="[isCompactMode ? 'col' : 'col-12 col-sm-6 col-md-3', box.colorClass]"
          :id="box.cardId"
        >
          <q-card
            flat
            bordered
            class="full-height hover-card cursor-pointer q-pa-sm flex flex-center"
            style="
              background: linear-gradient(135deg, #219286 0%, #044e49 100%);
              color: white;
              border-radius: 12px;
              transition: all 0.3s ease;
            "
            @click="cambiarComponente(box.id)"
          >
            <div class="row items-center no-wrap full-width" style="min-height: 55px">
              <div class="col-auto q-mr-md flex flex-center" style="width: 50px">
                <img
                  :src="box.iconComponent"
                  style="max-width: 100%; max-height: 48px; object-fit: contain"
                  alt="icon"
                />
              </div>
              <div class="col overflow-hidden">
                <div
                  class="text-subtitle2 text-weight-bold ellipsis text-uppercase"
                  style="letter-spacing: 0.5px; opacity: 1"
                >
                  {{ box.title }}
                </div>
              </div>
              <div class="col-auto q-pl-sm">
                <q-icon
                  :name="componenteActivo === box.component ? 'check_circle' : 'chevron_right'"
                  size="sm"
                  :style="{
                    color: componenteActivo === box.component ? '#f2c037' : 'rgba(255,255,255,0.7)',
                  }"
                />
              </div>
            </div>
          </q-card>
        </div>
      </template>
    </div>

    <!-- El resto del template se mantiene igual -->
    <div class="row q-col-gutter-md">
      <div
        :class="componenteActivo === VentaComponent ? 'col-12 col-md-8' : 'col-12'"
        ref="componentContainer"
        id="carrito"
      >
        <component :is="componenteActivo" />
      </div>
      <div v-if="componenteActivo === VentaComponent" class="col-12 col-md-4" id="reportes-hoy">
        <div class="full-height">
          <ReporteVentaInicio />
        </div>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { ref, onMounted, shallowRef, markRaw, defineAsyncComponent, computed } from 'vue'
import { useQuasar } from 'quasar'
import ReporteVentaInicio from 'src/components/reporteVentas/ReporteVentaInicio.vue'
import { verificarexistenciapagina } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { getShortcutByCodigo, shortcutsRegistry } from 'src/pages/AtajosConfig/shortcutsRegistry'

// Assets getShortcutByCodigo
import IconVentas from 'src/assets/Ventas.png'
import IconPedidos from 'src/assets/Compras.png'
import IconAdmin from 'src/assets/Productos.png'
import IconReportes from 'src/assets/Reportes.png'
import IconDefault from 'src/assets/icon-128.png'

const $q = useQuasar()
const componentContainer = ref(null)
const IDMD5 = idempresa_md5()
const isCompactMode = computed(() => finalTopBoxes.value.length >= 5)

// Componentes base (carga diferida)
const inicialComponent = defineAsyncComponent(() => import('components/welcome/welcomeComp.vue'))
const PedidoComponent = defineAsyncComponent(() => import('pages/compra/RcompraPage.vue'))
const CrearProductos = defineAsyncComponent(() => import('pages/producto/CproductoPage.vue'))
const VentaComponent = defineAsyncComponent(
  () => import('src/modules/quick-consult/pages/QuickConsultPage.vue'),
)
const ReporteComponent = defineAsyncComponent(
  () => import('src/components/reporte/reporteComponent.vue'),
)

const componentsMap = {
  venta: VentaComponent,
  compra: PedidoComponent,
  producto: CrearProductos,
  dashboard: ReporteComponent,
}

// Registrar dinámicamente todos los atajos del registry
shortcutsRegistry.forEach((shortcut) => {
  if (!componentsMap[shortcut.id]) {
    componentsMap[shortcut.id] = shortcut.component
  }
  if (!componentsMap[shortcut.codigo]) {
    componentsMap[shortcut.codigo] = shortcut.component
  }
})

const componenteActivo = shallowRef(inicialComponent)
defineExpose({ VentaComponent })

const cambiarComponente = (id) => {
  const newComponent = componentsMap[id]
  if (newComponent) {
    componenteActivo.value = markRaw(newComponent)
    if ($q.screen.lt.md && componentContainer.value) {
      componentContainer.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// Datos de permisos del usuario
const nombreUsuario = ref('')
const ventaPerm = ref(false)
const compraPerm = ref(false)
const dashboardPerm = ref(false)
const productoPerm = ref(false)

// Atajos personalizados del usuario
const userShortcuts = ref([])

// Obtener atajos guardados del usuario actual
const fetchUserShortcuts = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('mistersofts-cm') || '[]')
    const userId = userData[0]?.idusuario
    if (!userId) return

    const { data } = await api.get(`listarOperaciones/${IDMD5}`)
    const allOps = data.data || []
    const shortcuts = allOps.filter(
      (op) => op.codigo?.startsWith('shortcut_') && op.estado == 1 && op.md5 == userId,
    )
    userShortcuts.value = shortcuts
  } catch (error) {
    console.error('Error fetching shortcuts:', error)
    userShortcuts.value = []
  }
}

// Cajas por defecto (según permisos)
const defaultBoxes = computed(() => {
  const boxes = []
  if (dashboardPerm.value) {
    boxes.push({
      id: 'dashboard',
      component: ReporteComponent,
      iconComponent: IconReportes,
      title: 'ESTADÍSTICAS',
      cardId: 'reportes-card',
      colorClass: '',
    })
  }
  if (ventaPerm.value) {
    boxes.push({
      id: 'venta',
      component: VentaComponent,
      iconComponent: IconVentas,
      title: 'VENTAS',
      cardId: 'venta-card',
    })
  }
  if (compraPerm.value) {
    boxes.push({
      id: 'compra',
      component: PedidoComponent,
      iconComponent: IconPedidos,
      title: 'COMPRAS',
      cardId: 'compra-card',
    })
  }
  if (productoPerm.value) {
    boxes.push({
      id: 'producto',
      component: CrearProductos,
      iconComponent: IconAdmin,
      title: 'PRODUCTOS',
      cardId: 'producto-card',
    })
  }
  return boxes
})

// Construir cajas a partir de atajos personalizados
const customShortcutBoxes = computed(() => {
  return userShortcuts.value.slice(0, 5).map((shortcut) => {
    console.log('Construyendo caja para atajo:', shortcut)
    const registryItem = getShortcutByCodigo(shortcut.codigo)

    return {
      id: registryItem?.id || shortcut.codigo,
      component: registryItem?.component || componentsMap[shortcut.codigo] || inicialComponent,
      iconComponent: registryItem?.icon || IconDefault,
      title: shortcut.operacion || registryItem?.title || 'Acceso directo',
      cardId: `shortcut-${shortcut.id_operacion}`,
      isCustom: true,
    }
  })
})

// Reglas de visualización
const finalTopBoxes = computed(() => {
  const customCount = userShortcuts.value.length

  // Sin atajos configurados
  if (customCount === 0) {
    return defaultBoxes.value
  }
  // 1 atajo personalizado: default + ese atajo (máx 5)
  else if (customCount === 1) {
    const combined = [...defaultBoxes.value, ...customShortcutBoxes.value]
    return combined.slice(0, 5)
  }
  // 2 o más atajos: solo los atajos (máx 5)
  else {
    return customShortcutBoxes.value.slice(0, 5)
  }
})

onMounted(async () => {
  const contenidoUsuario = localStorage.getItem('mistersofts-cm')
  const contenidoMenus = JSON.parse(localStorage.getItem('mistersofts-cmmenu'))

  if (contenidoUsuario && contenidoMenus) {
    try {
      const parsedData = JSON.parse(contenidoUsuario)
      nombreUsuario.value = parsedData[0]?.nombre || 'Usuario desconocido'

      dashboardPerm.value = verificarexistenciapagina('dashboard')
      ventaPerm.value = verificarexistenciapagina('quickconsult')
      compraPerm.value = verificarexistenciapagina('registrarcompra')
      productoPerm.value = verificarexistenciapagina('registrarproductos')

      await fetchUserShortcuts()

      // Seleccionar componente inicial según el primer atajo disponible
      if (finalTopBoxes.value.length > 0) {
        cambiarComponente(finalTopBoxes.value[0].id)
      }
    } catch (error) {
      console.error('Error al parsear datos de localStorage:', error)
    }
  }
})
</script>

<style scoped>
/* Estilos existentes se mantienen */
.q-page {
  overflow-x: hidden;
}
.hover-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 12px;
}
.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>

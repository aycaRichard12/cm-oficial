<template>
  <q-page class="q-pa-md">
    <!-- Indicador de carga de permisos -->
    <div v-if="loadingPermisos" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="3em" />
    </div>

    <template v-else>
      <!-- Menú de navegación táctil y responsive -->
      <div v-if="hasAnyPermission" class="q-mb-md" style="border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1)">
        <q-tabs
          v-model="visibleChart"
          dense
          class="bg-white text-grey-8"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
          outside-arrows
          mobile-arrows
          :inline-label="$q.screen.gt.xs"
        >
          <q-tab v-if="permClientes" name="clientes" label="Clientes" icon="people" />
          <q-tab v-if="permCategoria" name="categoria" label="Categorías" icon="category" />
          <q-tab v-if="permPreferido" name="preferido" label="Preferidos" icon="star" />
          <q-tab v-if="permMonetario" name="monetario" label="Monetario" icon="payments" />
          <q-tab v-if="permMayorVenta" name="mayor_venta" label="Evolución" icon="timeline" />
          <q-tab v-if="permAlmacen" name="almacen" label="Almacén" icon="store" />
          <q-tab v-if="permTodos" name="todos" label="Todos" icon="dashboard" />
        </q-tabs>
      </div>

      <!-- Gráficos condicionales -->
      <template v-if="hasAnyPermission && visibleChart">
        <GpClientes v-if="showChart('clientes') && permClientes" class="q-my-md" />
        <GCategoria v-if="showChart('categoria') && permCategoria" />
        <GpPreferido v-if="showChart('preferido') && permPreferido" class="q-my-md" />
        <GpMonetario v-if="showChart('monetario') && permMonetario" />
        <GpMayorVenta v-if="showChart('mayor_venta') && permMayorVenta" />
        <GpAlmacen v-if="showChart('almacen') && permAlmacen" />
      </template>

      <!-- Pantalla de bloqueo -->
      <div v-else class="text-center q-pa-xl text-grey-6 text-h6">
        <q-icon name="lock" size="4rem" class="q-mb-md color-grey-4" />
        <div>No tienes permisos para visualizar los cuadros estadísticos.</div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'

import GCategoria from './por_Categoria.vue'
import GpPreferido from './producto_preferido.vue'
import GpMonetario from './producto_monetario.vue'
import GpMayorVenta from './mayor_venta.vue'
import GpAlmacen from './StockAlmacen.vue'
import GpClientes from './fecha_venta_cliente.vue'

// Verificación de Permisos
const permClientes = ref(false)
const permCategoria = ref(false)
const permPreferido = ref(false)
const permMonetario = ref(false)
const permMayorVenta = ref(false)
const permAlmacen = ref(false)
const permTodos = ref(false)

const loadingPermisos = ref(true)
const visibleChart = ref('')

const hasAnyPermission = computed(() => {
  return permClientes.value || permCategoria.value || permPreferido.value || 
         permMonetario.value || permMayorVenta.value || permAlmacen.value || permTodos.value
})

onMounted(async () => {
  loadingPermisos.value = true
  try {
    const IDMD5 = idempresa_md5()
    const idUsuarioMD5 = idusuario_md5()
    
    console.log('ID Usuario MD5:', idUsuarioMD5)
    
    // Consultamos la API fresca para no depender del store congelado en login
    const { data: response } = await api.get(`listarOperaciones/${IDMD5}`)
    console.log('Respuesta listarOperaciones:', response)
    
    if (response?.data && Array.isArray(response.data)) {
      console.log('Muestra de datos crudos (primeros 2):', response.data.slice(0, 2))
      
      // Filtrar por ID de usuario y estado activo
      const rawPerms = response.data.filter(
        item => {
          // Usamos == para permitir comparación de string vs number si fuera el caso
          return item.idusuario == idUsuarioMD5 && Number(item.estado) === 1
        }
      )
      
      console.log('Permisos filtrados para el usuario:', rawPerms)
      const permsObj = rawPerms.map(p => p.codigo)
      console.log('Codigos de permisos encontrados:', permsObj)
      
      permClientes.value = permsObj.includes('db_clientes')
      permCategoria.value = permsObj.includes('db_categoria')
      permPreferido.value = permsObj.includes('db_preferido')
      permMonetario.value = permsObj.includes('db_monetario')
      permMayorVenta.value = permsObj.includes('db_mayor_venta')
      permAlmacen.value = permsObj.includes('db_almacen')
      permTodos.value = permsObj.includes('db_todos')
    }
  } catch (error) {
    console.error('Error procesando permisos de cuadros:', error)
  } finally {
    loadingPermisos.value = false
    
    console.log('Estado final de permisos:', {
      clientes: permClientes.value,
      categoria: permCategoria.value,
      preferido: permPreferido.value,
      monetario: permMonetario.value,
      mayorVenta: permMayorVenta.value,
      almacen: permAlmacen.value,
      todos: permTodos.value
    })

    // Autoseleccionar la pestaña principal a la que tenga acceso
    if (permClientes.value) visibleChart.value = 'clientes'
    else if (permCategoria.value) visibleChart.value = 'categoria'
    else if (permPreferido.value) visibleChart.value = 'preferido'
    else if (permMonetario.value) visibleChart.value = 'monetario'
    else if (permMayorVenta.value) visibleChart.value = 'mayor_venta'
    else if (permAlmacen.value) visibleChart.value = 'almacen'
    else if (permTodos.value) visibleChart.value = 'todos'
    
    console.log('Pestaña visible seleccionada:', visibleChart.value)
  }
})

// Función para mostrar / ocultar según el currentTab
const showChart = (chartName) => {
  return visibleChart.value === 'todos' || visibleChart.value === chartName
}
</script>

<style scoped>
.q-btn-toggle {
  border-radius: 8px;
}
</style>

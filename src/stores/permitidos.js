import { defineStore } from 'pinia'
import { PAGINAS, PAGINAS_SELECT } from 'src/stores/paginas'

// Helper para identificar si un código corresponde a una pestaña (tab)
const esTab = (codigo) => {
  if (!codigo) return false
  const base = codigo.split('-')[0]
  // Combinar todos los arrays de pestañas de ambos objetos
  const todosLosTabs = [...Object.values(PAGINAS).flat(), ...Object.values(PAGINAS_SELECT).flat()]
  return todosLosTabs.includes(base)
}

// import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
// const idusuario = idusuario_md5()
export const useMenuStore = defineStore('menu', {
  state: () => {
    try {
      // 1. Obtener datos del localStorage de forma segura
      const storedData = localStorage.getItem('mistersofts-cmmenu')
      if (!storedData) {
        return {
          permitidos: [],
          usuario: null,
          menuPrincipal: [],
          permisos: {},
          todos: [],
          modulo: [],
        }
      }

      // 2. Parsear los datos
      const parsedData = JSON.parse(storedData)

      // 3. Verificar estructura básica
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        return {
          permitidos: [],
          usuario: null,
          menuPrincipal: [],
          permisos: {},
          todos: [],
          modulo: [],
        }
      }

      // 4. Extraer el módulo y datos iniciales
      const modulo = parsedData[0]
      const menuData = modulo.menu || []

      // 5. Inicializar variables del estado
      let usuario = menuData.length > 0 ? menuData[0].usuario : null
      let menuPrincipal = []
      let permisos = {}
      let todos = []
      let permitidos = []

      if (Array.isArray(menuData)) {
        // Función recursiva para procesar el menú a cualquier profundidad
        const procesarRecursivo = (items, level = 1, bajoOcultas = false) => {
          items.forEach((item) => {
            const esOcultas = item.codigo === 'opcionesocultas' || bajoOcultas

            // Agregar prefijo "--" a los títulos de nivel 3
            const prefijosReporte = [
              'Rep. de',
              'Reporte de',
              'REPORTE',
              'Reporte',
              'Reportes',
              'Rep.',
            ]

            if (level === 3 && item.titulo) {
              // Recorremos cada prefijo para ver si está al inicio
              for (const prefijo of prefijosReporte) {
                if (item.titulo.startsWith(prefijo)) {
                  // Cortamos el título desde la longitud del prefijo hacia adelante
                  // y usamos trim() para quitar el espacio sobrante al principio
                  item.titulo = item.titulo.substring(prefijo.length).trim()

                  // Usamos 'break' para salir del bucle una vez eliminado el prefijo encontrado
                  break
                }
              }
            }

            // 1. Agregar a 'todos' para búsquedas globales (existePagina, etc.)
            if (item.codigo) {
              todos.push(item)
              // Si está bajo opcionesocultas (y no es el nodo raíz de ocultas), agregar a permitidos
              if (esOcultas && item.codigo !== 'opcionesocultas') {
                permitidos.push(item)
              }
            }

            // 2. Procesar permisos si existen
            if (item.permiso && typeof item.permiso === 'string') {
              permisos[item.codigo] = item.permiso.split('').map((u) => u === '1')
            }

            // 3. Procesar submenús recursivamente
            if (Array.isArray(item.submenu)) {
              procesarRecursivo(item.submenu, level + 1, esOcultas)
            }
          })
        }

        // Ejecutar procesamiento recursivo
        procesarRecursivo(menuData)

        // Aplanar el menú principal para que el sidebar muestre nivel 2 y 3 juntos
        // Pero EXCLUYENDO aquellos que son pestañas (tabs) para evitar duplicidad
        menuPrincipal = menuData
          .filter((item) => item.codigo !== 'opcionesocultas')
          .map((item) => {
            const seccion = { ...item }
            if (Array.isArray(seccion.submenu)) {
              let subAplanado = []
              seccion.submenu.forEach((sub2) => {
                // Agregar el de nivel 2
                subAplanado.push(sub2)
                // Si tiene submenú (nivel 3), agregarlos a la misma lista SOLO si no son pestañas
                if (Array.isArray(sub2.submenu)) {
                  sub2.submenu.forEach((sub3) => {
                    if (!esTab(sub3.codigo)) {
                      subAplanado.push(sub3)
                    }
                  })
                }
              })
              seccion.submenu = subAplanado
            }
            return seccion
          })
      }

      return {
        permitidos, // Todas las subpáginas de opcionesocultas (recursivo)
        usuario,
        menuPrincipal,
        permisos,
        todos,
        modulo: menuData,
      }
    } catch (error) {
      console.error('Error al cargar datos del menú:', error)
      return {
        permitidos: [],
        usuario: null,
        menuPrincipal: [],
        permisos: {},
        todos: [],
        modulo: [],
      }
    }
  },

  getters: {
    // Verifica si una página está permitida devolver pagina
    existePagina: (state) => (codigopagina) => {
      return state.todos.find((pagina) => pagina.codigo === codigopagina)
    },
    // Verifica si existe

    verificarExistencia: (state) => (codigopagina) => {
      return state.todos.some((pagina) => pagina.codigo === codigopagina)
    },
    // Obtiene los datos completos de una página
    obtenerPagina: (state) => (codigopagina) => {
      // Primero buscar en permitidos (opciones ocultas)
      let pagina = state.permitidos.find((pagina) => pagina.codigo === codigopagina)

      // Si no está en ocultas, buscar en todos (puede ser del menú principal)
      if (!pagina) {
        pagina = state.todos.find((p) => p.codigo === codigopagina)
      }

      if (!pagina) return null

      return {
        ...pagina,
      }
    },

    // Obtiene datos del usuario
    obtenerUsuario: (state) => {
      return state.usuario
    },

    // Obtiene el menú principal (sin opciones ocultas)
    obtenerMenuPrincipal: (state) => {
      return state.menuPrincipal
    },
    obtenerPermisosMap: (state) => {
      const permisosMap = {}

      const extraerPermisos = (items) => {
        items.forEach((item) => {
          if (item.permiso) {
            permisosMap[item.codigo] = item.permiso
          }
          if (Array.isArray(item.submenu)) {
            extraerPermisos(item.submenu)
          }
        })
      }

      extraerPermisos(state.menuPrincipal)
      return permisosMap
    },
    permisoPagina: (state) => (codigopagina) => {
      return state.permisos[codigopagina]
    },
    obtenerPrimerSubmenu: (state) => (codigoMenu) => {
      // Buscar el menú recursivamente
      const buscarMenu = (items) => {
        for (const item of items) {
          if (item.codigo === codigoMenu) return item
          if (Array.isArray(item.submenu)) {
            const encontrado = buscarMenu(item.submenu)
            if (encontrado) return encontrado
          }
        }
        return null
      }

      const menu = buscarMenu(state.modulo)
      if (menu && menu.submenu && menu.submenu.length > 0) {
        return menu.submenu[0]
      }
      return null
    },
  },
})

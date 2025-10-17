import { URL_APICM } from './services'
import { useRoute } from 'vue-router'
import { useMenuStore } from 'src/stores/permitidos'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'

export function convertirAMayusculas(texto) {
  if (!texto) return ''
  return texto.toString().toUpperCase()
}

export function getfechaCodigo() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')

  // Retorna un código como: 20251009_142530
  return `${year}${month}${day}${h}${m}${s}`
}

export function getIdRubro(situacion = null) {
  //idtn
  const contenidousuario = validarUsuario()
  const rubro = contenidousuario?.[0]?.empresa?.idtn
  const esVacio = validarDatoVacio(rubro)
  if (situacion) {
    return !esVacio
  }
  return esVacio ? '' : rubro
}
export function validarDatoVacio(dato) {
  if (
    dato === null ||
    dato === undefined ||
    dato === '' ||
    dato === 'null' ||
    dato === 'undefined' ||
    dato === 0 ||
    dato === '0'
  ) {
    return true
  } else {
    return false
  }
}

export function getTipoFactura(situacion = null) {
  const contenidousuario = validarUsuario()
  const tipo = contenidousuario?.[0]?.factura?.tipo
  const esVacio = validarDatoVacio(tipo)
  if (situacion) {
    return !esVacio
  }
  return esVacio ? '' : tipo
}

export function getToken(situacion = null) {
  const contenidousuario = validarUsuario()
  const token = contenidousuario[0]?.factura?.access_token
  const esVacio = validarDatoVacio(token)
  if (situacion) {
    return !esVacio
  }
  return esVacio ? '' : token
}

export async function cargarLogoBase64(logoPath) {
  const [carpeta, imagen] = logoPath.split('/')
  try {
    const point = `getLogoBase64/${carpeta}/${imagen}`
    console.log(point)
    const response = await api.get(point)
    const data = response.data
    console.log(data)
    if (data.base64) {
      return data.base64
    }
    return null
  } catch (err) {
    console.error('Error cargando logo:', err)
    return null
  }
}

export function getPath() {
  const route = useRoute()
  const codigoPagina = route.path.replace(/^\//, '') + ``
  console.log(codigoPagina)

  return codigoPagina
}
export function obtenerPermisosPagina() {
  const menuStore = useMenuStore()
  const route = useRoute()
  const codigoPagina = route.path.replace(/^\//, '') + `-${idusuario_md5()}`
  console.log(codigoPagina)

  return menuStore.permisoPagina(codigoPagina)
}
export function verificarexistenciapagina(ruta) {
  const menuStore = useMenuStore()
  const codigoPagina = ruta + `-${idusuario_md5()}`
  return menuStore.existePagina(codigoPagina)
}

export function permisoNotificaciones() {
  const menuStore = useMenuStore()

  const id = idusuario_md5()
  const gP = `gestionPedido-${id}`
  const vnd = `procesarventaspendientes-${id}`
  const cxc = `cuentasporcobrar-${id}`

  return (
    menuStore.verificarExistencia(gP) ||
    menuStore.verificarExistencia(vnd) ||
    menuStore.verificarExistencia(cxc)
  )
}
export function generarCabeceraHTML(datos) {
  //const tableHeader = datos.tableHeader; vapp
  const columns = datos

  // Generar la fila de encabezado (thead)
  let theadHTML = '<tr class="text-center">'
  columns.forEach((column) => {
    theadHTML += `<th class="text-center">${column}</th>`
  })
  theadHTML += '</tr>'

  return theadHTML
}

export function validarUsuario() {
  const contenidousuario = JSON.parse(localStorage.getItem('yofinanciero'))
  if (contenidousuario) {
    return contenidousuario
  } else {
    alert('Hubo un problema con la sesion, Por favor vuelva a iniciar sesion.')
    console.log('Los elementos no existen en localStorage')
    localStorage.clear()
    window.location.assign('../../app/')
  }
}

export function redondear(num) {
  if (typeof num != 'number') {
    return null
  }
  let signo = num >= 0 ? 1 : -1

  return parseFloat(
    (Math.round(num * Math.pow(10, 2) + signo * 0.0001) / Math.pow(10, 2)).toFixed(2),
  )
}

export function decimas(saldo) {
  var saldocondecimas = parseFloat(saldo).toFixed(2)
  return saldocondecimas
}

export function validarNumerosEnteros(input) {
  // Reemplaza todo lo que no sea un número del 0 al 9 al principio con una cadena vacía
  input.value = input.value.replace(/^[^1-9]+/g, '')

  // También, asegúrate de que el valor no sea vacío y sea un número entero válido
  if (input.value !== '' && isNaN(parseInt(input.value, 10))) {
    // Si no es válido, restablece el valor a una cadena vacía
    input.value = ''
  } else {
    // Si el valor es un número válido, pero hay caracteres no numéricos después,
    // elimina esos caracteres
    input.value = input.value.replace(/\D/g, '')
  }
}

export function validarNumeros(input) {
  // Reemplaza todo lo que no sea un número o punto con una cadena vacía
  input.value = input.value.replace(/[^0-9.]/g, '')

  // Asegúrate de que solo haya un punto decimal permitido
  if (input.value.split('.').length > 2) {
    input.value = input.value.slice(0, -1)
  }

  // Asegúrate de que no haya ceros adicionales al inicio
  if (/^0[0-9]+/.test(input.value)) {
    input.value = input.value.slice(1)
  }
}

export function cambiarFormatoFecha(fechaOriginal) {
  const [anio, mes, dia] = fechaOriginal.split('-')

  const nuevaFecha = new Date(anio, mes - 1, dia)

  const diaFormateado = String(nuevaFecha.getDate()).padStart(2, '0')
  const mesFormateado = String(nuevaFecha.getMonth() + 1).padStart(2, '0')
  const anioFormateado = nuevaFecha.getFullYear()

  const nuevoFormato = `${diaFormateado}/${mesFormateado}/${anioFormateado}`

  return nuevoFormato
}

export function normalizeText(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function crearOpcionesAlmacen(options, input, optionClassName, mostrarVariableCallback) {
  const customOptions = input.nextElementSibling

  options.forEach((option) => {
    const optionElement = document.createElement('a')
    optionElement.className = optionClassName
    optionElement.textContent = option.nombre
    optionElement.setAttribute('data-value', option.idalmacen)

    optionElement.addEventListener('click', () => {
      input.value = option.nombre
      customOptions.style.display = 'none'
      mostrarVariableCallback(optionElement.getAttribute('data-value'))
    })

    customOptions.appendChild(optionElement)
  })
}

export function cargarDivisas(dato) {
  const clase = document.querySelectorAll(`.${dato}`)
  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa
  const token = contenidousuario[0]?.factura?.access_token
  const tipo = contenidousuario[0]?.factura?.tipo
  fetch(`${URL_APICM}api/listaDivisa/${idempresa}/${token}/${tipo}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      console.log(data)
      if (data.estado == 'error') {
        console.log(data.estado)
      } else {
        let use = data.filter((u) => u.estado == 1)
        clase.forEach(function (span) {
          span.innerHTML = use[0].tipo
        })
      }
    })
    .catch((error) => {
      console.error('Hubo un problema con la solicitud:', error)
    })
}

export function crearOpcionesUsuario(options, input, optionClassName, mostrarVariableCallback) {
  const customOptions = input.nextElementSibling

  options.forEach((option) => {
    const optionElement = document.createElement('a')
    optionElement.className = optionClassName
    optionElement.textContent = option.usuario
    optionElement.setAttribute('data-value', option.id)

    optionElement.addEventListener('click', () => {
      input.value = option.usuario
      customOptions.style.display = 'none'
      mostrarVariableCallback(optionElement.getAttribute('data-value'))
    })

    customOptions.appendChild(optionElement)
  })
}

export function obtenerHoraISO8601() {
  // Obtener la fecha y hora actual
  var currentDate = new Date()

  // Obtener el desfase horario en minutos para GMT-4 (GMT-4:00)
  var offset = -4 * 60 // -4 horas convertidas a minutos

  // Aplicar el desfase horario a la fecha y hora actual
  var gmtMinus4Date = new Date(currentDate.getTime() + offset * 60000)

  // Obtener la fecha y hora como una cadena en formato ISO
  var isoString = gmtMinus4Date.toISOString()
  return isoString
}

export function obtenerFechaActual(clase) {
  // Obtener todos los input de tipo date
  console.log(clase)
  let inputsDate = document.querySelectorAll(`.${clase}`)

  let fechaHoraActual = new Date()

  // Ajustar a la zona horaria local
  let fechaFormateada = new Date(
    fechaHoraActual.getTime() - fechaHoraActual.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split('T')[0]

  let horaFormateada = fechaHoraActual.toTimeString().split(' ')[0]

  inputsDate.forEach(function (input) {
    input.value = fechaFormateada
    console.log(horaFormateada)
  })
}
export function obtenerFechaPrimerDiaMesActual() {
  const date = new Date()
  const anio = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  return `${anio}-${mes}-01`
}

export function obtenerFechaActualDato() {
  // Obtener todos los input de tipo date

  let fechaHoraActual = new Date()

  // Ajustar a la zona horaria local
  let fechaFormateada = new Date(
    fechaHoraActual.getTime() - fechaHoraActual.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .split('T')[0]

  return fechaFormateada
}

export function filtrarTabla(input, tablaFiltro, columna) {
  const inputEntrada = document.getElementById(input)
  inputEntrada.addEventListener('keyup', (e) => {
    if (e.target.matches(`#${input}`)) {
      const searchTerm = e.target.value.toLowerCase()
      document.querySelectorAll(`.${tablaFiltro}`).forEach((dato) => {
        const columns =
          columna === 0
            ? dato.querySelectorAll('td:not(:first-child)')
            : dato.querySelectorAll(`td:nth-child(${columna + 1})`)
        let matchFound = false
        columns.forEach((column) => {
          const columnText = normalizeText(column.textContent.toLowerCase())
          if (columnText.includes(searchTerm)) {
            matchFound = true
          }
        })
        dato.style.display = matchFound ? 'table-row' : 'none'
      })
    }
  })
}

export function numeroALetras(n, divisa) {
  //***** CONFIGURACIÓN ****
  // UDS - Pesos MX - Pesos colombianos etc. determina la etiqueta de la moneda
  const moneda = divisa.toLowerCase()
  console.log(moneda)
  // puedes usar "con" o "y" Chiquipesos - centavos etc.
  const cents = ['', moneda]
  // 1 = Todo minúsculas, 2 = Todo Mayúsculas, 3 = Title case moneda Mayúscula,
  // 4 = Todo minúculas y moneda Mayúscula, 0 = Camel Case
  const format = 3
  const unidades = {
    0: '',
    1: 'Un',
    2: 'Dos',
    3: 'Tres',
    4: 'Cuatro',
    5: 'Cinco',
    6: 'Seis',
    7: 'Siete',
    8: 'Ocho',
    9: 'Nueve',
  }

  // Variables
  const temp = ['', 'Mil', 'Millones', 'Mil']
  const tem = Number.parseFloat(n).toFixed(2).split('.')
  const x = Number.parseInt(tem[0])
  const y = Number.parseInt(tem[1])
  let salidaEntero = []
  let salidaCentavos = ''

  const centenas = (num) => {
    const centena = Math.floor(num / 100)
    const decena = num - Math.floor(centena * 100)
    // console.log("centena:",centena,"decena", decena);
    switch (centena) {
      case 0:
        return '' + decenas(decena)
      case 1:
        if (decena === 0) {
          return 'Cien'
        } else {
          return 'Ciento ' + decenas(decena)
        }
      case 2:
        return 'Doscientos ' + decenas(decena)
      case 3:
        return 'Trescientos ' + decenas(decena)
      case 4:
        return 'Cuatrocientos ' + decenas(decena)
      case 5:
        return 'Quinientos ' + decenas(decena)
      case 6:
        return 'Seiscientos ' + decenas(decena)
      case 7:
        return 'Setecientos ' + decenas(decena)
      case 8:
        return 'Ochocientos ' + decenas(decena)
      case 9:
        return 'Novecientos ' + decenas(decena)
    }
  }

  const decenas = (num) => {
    const decena = Math.floor(num / 10)
    const unidad = num - decena * 10
    // console.log("decenas:",decena,"unidades:", unidad);
    switch (decena) {
      case 0:
        return '' + unidades[unidad]
      case 1:
        switch (unidad) {
          case 0:
            return 'Diez'
          case 1:
            return 'Once'
          case 2:
            return 'Doce'
          case 3:
            return 'Trece'
          case 4:
            return 'Catorce'
          case 5:
            return 'Quince'
          default:
            return 'Dieci' + unidades[unidad]
        }
      case 2:
        switch (unidad) {
          case 0:
            return 'Veinte'
          default:
            return 'Veinti' + unidades[unidad]
        }
      case 3:
        return unidad > 0 ? `Treinta y ${unidades[unidad]}` : 'Treinta'
      case 4:
        return unidad > 0 ? `Cuarenta y ${unidades[unidad]}` : 'Cuarenta'
      case 5:
        return unidad > 0 ? `Cincuenta y ${unidades[unidad]}` : 'Cincuenta'
      case 6:
        return unidad > 0 ? `Sesenta y ${unidades[unidad]}` : 'Sesenta'
      case 7:
        return unidad > 0 ? `Setenta y ${unidades[unidad]}` : 'Setenta'
      case 8:
        return unidad > 0 ? `Ochenta y ${unidades[unidad]}` : 'Ochenta'
      case 9:
        return unidad > 0 ? `Noventa y ${unidades[unidad]}` : 'Noventa'
    }
  }

  const separadorMiles = (num) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g
    const rep = '$1,'
    let arr = num.toString().split('.')
    arr[0] = arr[0].replace(exp, rep)
    return arr[0]
  }

  const procesadorEnteros = (num) => {
    let separado = separadorMiles(num).split(',')
    separado.reverse().forEach((el, index) => {
      if (el == 1 && temp[index] === 'Millones') {
        salidaEntero.push('Millón')
      } else if (el == '000' && temp[index] === 'Mil') {
        // no hace nada
      } else {
        salidaEntero.push(temp[index])
      }
      console.log(temp[index])
      console.log(el)
      salidaEntero.push(centenas(Number.parseInt(el)))
    })
  }

  const procesadorDecimales = (num) => {
    console.log(num)
    const centavos = `${dosdigitos(num)}/100`
    if (centavos.length > 0) {
      // console.log("centavos:",centavos);
      salidaCentavos = ` ${cents[0]} ${centavos} ${cents[1]}`
    }
  }

  const dosdigitos = (num) => {
    var i = ('0' + num).slice(-2)
    return i
  }

  const nombrepropio = (val) => {
    var cadena = val.toLowerCase().split(' ')

    for (var i = 0; i < cadena.length; i++) {
      cadena[i] = cadena[i].charAt(0).toUpperCase() + cadena[i].substring(1)
    }
    val = cadena.join(' ')
    return val
  }

  const salida = () => {
    const stringSalida = (salidaEntero.reverse().join(' ') + salidaCentavos).replace(/\s+/g, ' ')
    switch (format) {
      case 1:
        return stringSalida.toLowerCase()
      case 2:
        return stringSalida.toUpperCase()
      case 3:
        return nombrepropio(stringSalida)
      case 4:
        return stringSalida.toLowerCase().replace(moneda.toLocaleLowerCase(), moneda.toUpperCase())
      default:
        return stringSalida
    }
  }

  procesadorEnteros(x)
  procesadorDecimales(y)
  return salida()
}

// imageUtils.js validarUsuario

export function convertirImagenUtil(inputFileElement, width = 500, calidad = 40) {
  return new Promise((resolve, reject) => {
    const imagen_file = inputFileElement.files[0]

    if (!imagen_file) {
      reject('No se ha seleccionado ningún archivo.')
      return
    }

    const reader = new FileReader()

    reader.readAsDataURL(imagen_file)

    reader.onload = (event) => {
      const image_url = event.target.result

      const image = document.createElement('img')
      image.src = image_url

      image.onload = (e) => {
        const canvas = document.createElement('canvas')
        const ratio = width / e.target.width
        canvas.width = width
        canvas.height = e.target.height * ratio

        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        const new_image_url = context.canvas.toDataURL('image/jpeg', calidad)

        const new_image = document.createElement('img')
        new_image.src = new_image_url

        const imagenFile = urlAFile(new_image_url)
        resolve(imagenFile)
      }
    }

    reader.onerror = (error) => {
      reject(error)
    }
  })
}

function urlAFile(url) {
  const arr = url.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const data = arr[1]

  const dataStr = atob(data)
  const n = dataStr.length
  const dataArr = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    dataArr[i] = dataStr.charCodeAt(i)
  }

  return new File([dataArr], 'File.jpg', { type: mime })
}

export function establecerTextoEnSpans(clase) {
  // Obtener todos los elementos <span> con la clase especificada
  const spans = document.querySelectorAll('.' + clase)

  const contenidousuario = validarUsuario()
  const idempresa = contenidousuario[0]?.empresa?.idempresa
  const token = contenidousuario[0]?.factura?.access_token
  const tipo = contenidousuario[0]?.factura?.tipo
  const endpoint = `${URL_APICM}api/listaDivisa/${idempresa}/${token}/${tipo}`
  fetch(endpoint)
    .then((response) => {
      // Verificar si la solicitud fue exitosa
      if (!response.ok) {
        throw new Error('La solicitud a la API falló')
      }
      // Parsear la respuesta como JSON
      return response.json()
    })
    .then((data) => {
      let use = data.filter((u) => u.estado == 1)
      const textoDesdeAPI = use[0].tipo

      // Establecer el texto en los spans
      spans.forEach((span) => {
        span.textContent = textoDesdeAPI
      })
    })
    .catch((error) => {
      console.error('Error al obtener el texto desde la API:', error)
    })
}

// Llamar a la función establecerTextoEnSpans con la clase
//establecerTextoEnSpans('texto-comun');

export function alertas(data, codigo) {
  let alertClass, alertMessage, timeoutDuration
  // Determinar el tipo de alerta y su mensaje
  if (data.estado == 'exito') {
    alertClass = 'alert-success'
    alertMessage = data.mensaje
    timeoutDuration = 2000
    console.log(alertClass, alertMessage, timeoutDuration)
  } else {
    if (data.estado == 'error') {
      alertClass = 'alert-danger'
      alertMessage = data.mensaje
      timeoutDuration = 3000
    } else {
      alertClass = 'alert-primary'
      alertMessage = data.mensaje
      timeoutDuration = 3000
    }
  }
  console.log(alertClass, alertMessage, timeoutDuration)
  // Obtener el div de alerta
  let divalert = document.querySelector(`#alerta${codigo}`)
  if (divalert) {
    // Crear el nuevo contenido de la alerta
    let nuevoContenido = `<div class="alert ${alertClass}">${alertMessage}</div>`
    divalert.innerHTML = nuevoContenido

    // Eliminar la alerta después del tiempo especificado
    setTimeout(() => {
      divalert.innerHTML = ``
    }, timeoutDuration)
  }
}

export async function consultar_api(url, uk) {
  try {
    console.log(`${URL_APICM}api/${url}/${uk}`)
    const response = await fetch(`${URL_APICM}api/${url}/${uk}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al listar :${url}`, error)
    return ['Error', 'Error en el servidor']
  }
}
function cerrarModal(overlay, app) {
  overlay.remove()
  app.style.removeProperty('position')
}
export function crearModal({ code, type, x, y, id, header, body, footerButtons = [] }) {
  const app = document.querySelector(`.p-2[data-value="${code}"] .card-body`)
  app.style.position = 'relative'

  const overlay = document.createElement('div')
  overlay.style.position = 'absolute'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '150%'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  overlay.style.zIndex = '1000'
  overlay.style.display = 'flex'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.style.cursor = 'pointer'
  app.appendChild(overlay)
  const variable = document.createElement('div')
  variable.classList.add('modal-content')
  variable.style.backgroundColor = 'white'
  variable.style.padding = '20px'
  variable.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)'
  variable.style.zIndex = '1001'
  variable.style.position = 'relative'
  variable.style.maxHeight = y
  variable.style.maxWidth = x
  variable.style.overflowY = 'auto'
  variable.style.borderRadius = '8px'
  overlay.appendChild(variable)

  const existingModal = document.getElementById(id)
  if (existingModal) {
    existingModal.remove()
  }

  variable.innerHTML = `
        <div class="modal-header">
            ${header}
            
        </div>
        <div class="modal-body">
            ${body}
        </div>
        <div class="modal-footer">
            ${footerButtons
              .map(
                (button) => `
                <button type="button" class="btn ${button.class}" id="${button.id}">
                    ${button.text}
                </button>
            `,
              )
              .join('')}
        </div>
    `

  footerButtons.forEach((button) => {
    const btnElement = document.getElementById(button.id)
    if (btnElement && button.onClick) {
      btnElement.addEventListener('click', () => {
        button.onClick()
        if (button.dismiss) {
          cerrarModal(overlay, app) // Llamar a cerrarModal después
        }
      })
    }
  })

  overlay.addEventListener('click', (event) => {
    if (type) {
      if (event.target.classList.contains('cerrar') || event.target === overlay) {
        cerrarModal(overlay, app)
      }
    }
  })

  return overlay
}
export function buscarYClickearPorDataValue(dataValue) {
  // Buscar todos los enlaces que tengan un atributo data-value
  const enlaces = document.querySelectorAll('a.list-group-item.list-group-item-action')

  // Recorrer todos los enlaces encontrados
  for (let enlace of enlaces) {
    // Verificar si el data-value del enlace coincide con el parámetro
    if (enlace.getAttribute('data-value') === dataValue) {
      // Antes de hacer clic, asegurarse de que el acordeón padre esté abierto
      const acordeonItem = enlace.closest('.accordion-item')
      const collapse = acordeonItem.querySelector('.accordion-collapse')

      // Si el acordeón está cerrado, abrirlo primero
      if (!collapse.classList.contains('show')) {
        const boton = acordeonItem.querySelector('.accordion-button')
        boton.click()
      }

      // Hacer clic en el enlace encontrado
      enlace.click()

      // Retornar true para indicar que se encontró y se hizo clic
      return true
    }
  }

  // Si llegamos aquí, no se encontró el enlace
  console.log(`No se encontró ningún enlace con data-value: ${dataValue}`)
  return false
}

export function mes_a_Esp(date) {
  console.log(date)
  let formato = date.split(' ')
  let mes = formato[0]
  let respuesta = ''
  switch (mes) {
    case 'DECEMBER':
      respuesta = 'DICIEMBRE '
      break
    case 'NOVEMBER':
      respuesta = 'NOVIEMBRE '
      break
    case 'OCTOBER':
      respuesta = 'OCTUBRE '
      break
    case 'SEPTEMBER':
      respuesta = 'SEPTIEMBRE '
      break
    case 'AUGUST':
      respuesta = 'AGOSTO '
      break
    case 'JULY':
      respuesta = 'JULIO '
      break

    case 'JUNE':
      respuesta = 'JUNIO '
      break
    case 'MAY':
      respuesta = 'MAYO '
      break
    case 'APRIL':
      respuesta = 'ABRIL '
      break
    case 'MARCH':
      respuesta = 'MARZO '
      break
    case 'FEBRUARY':
      respuesta = 'FEBRERO '
      break
    case 'JANUARY':
      respuesta = 'ENERO '
      break
    default:
      respuesta = date
      break
  }
  return respuesta
}
export function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('La geolocalización no está disponible en este navegador'))
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (err) => {
        let mensaje = ''

        switch (err.code) {
          case 1:
            mensaje = 'Permiso de geolocalización denegado. Habilita el permiso desde el navegador.'
            break
          case 2:
            mensaje = 'La ubicación no está disponible. Verifica tu conexión o señal GPS.'
            break
          case 3:
            mensaje = 'La solicitud de ubicación ha expirado. Intenta nuevamente.'
            break
          default:
            mensaje = 'Error desconocido al obtener la ubicación.'
        }

        console.error('Error en geolocation:', err)
        reject(new Error(mensaje))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  })
}

export function msgNegative($q) {
  $q.notify({
    message:
      'Su usuario no tiene habilitado el permiso. Solicite acceso al administrador del sistema.',
    color: 'warning',
    icon: 'info',
    position: 'top-right',
  })
}

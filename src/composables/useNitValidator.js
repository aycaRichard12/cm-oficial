import { Notify } from 'quasar'
import axios from 'axios'
import { validarUsuario } from './FuncionesGenerales'

export function useNitValidator() {
  const validarNIT = async (
    nit,
    inputCRef,
    inputIDCRef,
    inputSRef,
    inputIDSRef,
    optionsC,
    optionsS,
  ) => {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo
    const datos = JSON.parse(localStorage.getItem('carrito'))

    Notify.create({
      message: 'Verificación en proceso...',
      type: 'info',
      spinner: true,
      timeout: 1000,
    })

    try {
      const response = await axios.get(`ValidarNit/${nit}/${token}/${tipo}`)
      const data = response.data
      console.log(response)
      if (data.status === 'success') {
        if (data.data.descripcion === 'NIT ACTIVO') {
          datos.listaFactura.codigoExcepcion = 0
          localStorage.setItem('carrito', JSON.stringify(datos))
          Notify.create({
            message: 'Verificación exitosa: NIT ACTIVO',
            type: 'positive',
          })
        } else {
          datos.listaFactura.codigoExcepcion = 1
          localStorage.setItem('carrito', JSON.stringify(datos))
          Notify.create({
            message: 'Se encontró un error: ' + data.data.descripcion,
            type: 'negative',
          })

          inputCRef.value = ''
          inputIDCRef.value = ''
          inputSRef.value = ''
          inputIDSRef.value = ''

          optionsC.value.forEach((opt) => (opt.hidden = false))
          optionsS.value.forEach((opt) => (opt.hidden = false))
        }
      }
    } catch (error) {
      console.error('Error al validar NIT:', error)
      Notify.create({
        message: 'Error en la solicitud',
        type: 'negative',
      })
    }
  }

  return {
    validarNIT,
  }
}

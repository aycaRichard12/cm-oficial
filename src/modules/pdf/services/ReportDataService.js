// src/modules/pdf/services/ReportDataService.js
import { validarUsuario } from 'src/composables/FuncionesG'
import { cargarLogoBase64 } from 'src/composables/FuncionesG'

export class ReportDataService {
  async getUserData() {
    const userData = validarUsuario() // retorna array o null
    if (!userData || !Array.isArray(userData) || !userData[0]?.empresa) {
      throw new Error('Datos de empresa no disponibles. Verifique su sesión.')
    }
    const [contenido] = userData
    const empresa = contenido.empresa
    const logoBase64 = await cargarLogoBase64(empresa.logo)

    return {
      logoBase64,
      nombreEmpresa: empresa.nombre,
      direccionEmpresa: empresa.direccion,
      encargadoNombre: contenido.nombre,
      cargo: contenido.cargo,
      pais: empresa.opais,
      estado: empresa.oestado,
      ciudad: empresa.ociudad,
      nit: empresa.nit,
      telefono: empresa.telefono,
      celular: empresa.ocelular,
      email: empresa.email,
      web: empresa.ositioweb,
    }
  }
}

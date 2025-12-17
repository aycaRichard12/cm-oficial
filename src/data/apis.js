// src/data/apis.js

/**
 * Define los colores de las insignias para cada método HTTP.
 * Esto centraliza la configuración visual.
 */
export const methodColors = {
  GET: 'positive',
  POST: 'info',
  PUT: 'warning',
  DELETE: 'negative',
  PATCH: 'orange',
}

/**
 * Array principal que contiene toda la documentación de la API, agrupada por categorías.
 * Para agregar una nueva API, simplemente añade un nuevo objeto al array `endpoints` de un grupo existente
 * o crea un nuevo grupo.
 */
export const apiGroups = [
  {
    groupName: 'Autenticación',
    endpoints: [
      {
        id: 'auth-login',
        name: 'Crear Token de Autenticación',
        method: 'POST',
        endpoint: '/api/out',
        description:
          'Genera un token JWT para autenticar al usuario. Este token es necesario para acceder a las rutas protegidas de la API.',
        params: [
          { name: 'ver', type: 'String', required: true, example: 'generarTokenJWT' },
          {
            name: 'idmd5',
            type: 'String',
            required: true,
            example: 'MyS3cr3tP@c0c7c76d30bd3dcaefc96f40275bdc0a',
          },
        ],
        requestExample: JSON.stringify(
          {
            ver: 'generarTokenJWT',
            idmd5: 'c0c7c76d30bd3dcaefc96f40275bdc0a',
          },
          null,
          2,
        ),
        responseExample: JSON.stringify(
          {
            estado: 'success',
            token:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtaXN0ZXJzb2Z0cy5jb20iLCJhdWQiOiJtb2R1bG9jbSIsImlhdCI6MTc1NTgwNTk3OSwiZXhwIjoxNzg3NDI4Mzc5LCJkYXRhIjp7ImlkX2VtcHJlc2EiOjUwL......',
          },
          null,
          2,
        ),
        errors: [
          {
            code: 404,
            message: 'Not Found: No se encontró el parámetro con los valores proporcionados ',
          },
          { code: 500, message: 'Internal Server Error: Error inesperado en el servidor.' },
        ],
        notes:
          'El token JWT es válido únicamente hasta que su licencia de usuario empresa expire. Manténgalo seguro y no lo comparta.',
      },
    ],
  },
  {
    groupName: 'Productos',
    endpoints: [
      {
        id: 'user-get-by-id',
        name: 'Obtener Productos por Codigo Almacen',
        method: 'GET',
        endpoint: 'api/out/productos/{Codigo Almacen}',
        description: 'Recupera los Productos del almacen en un formato JSON.',
        params: [
          {
            name: 'Autorizacion Bearer',
            type: 'token',
            required: true,
            example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtaXN0ZXJzb2Z0cy5j.....',
          },
        ],
        requestExample: null, // No hay cuerpo de solicitud para un GET
        responseExample: JSON.stringify({
          id: 5023,
          nombre_producto: 'Pan hamburguesa',
          descripcion_producto: 'de harina fina importada',
          codigo_sin: '99100',
          actividad_sin: '610000',
          unidad_sin: '17',
          codigo_nandina: null,
          url_imagen: 'images/Pan hamburguesa343791.jpg',
          stock_actual: 46,
          codigo_barras: '777746535001',
          categoria: 'Producto Terminado',
          subcategoria: '',
          origen_producto: 'Panadería',
          estado_producto: 'Óptimo',
          unidad_medida: 'pzas',
          caracteristicas_extra: 'aprox. 70g',
        }),
        errors: [
          { code: 404, message: 'Not Found: Usuario no encontrado.' },
          { code: 401, message: 'Unauthorized: Se requiere token de autenticación.' },
        ],
        notes: 'Solo los que tengan los token pueden obtener los productos en formato Jsonn.',
      },
    ],
  },
  {
    groupName: 'Ventas',
    endpoints: [
      {
        id: 'sales-register',
        name: 'Registrar Venta',
        method: 'POST',
        endpoint: '/api/out',
        description:
          'Permite registrar una venta en el sistema con los datos del cliente, detalles de productos y método de pago.',
        params: [
          { name: 'ver', type: 'String', required: true, example: 'registrarVenta' },
          { name: 'codigoAlmacen', type: 'String', required: true, example: 'SDKFN4' },
          {
            name: 'idusuario',
            type: 'String',
            required: true,
            example: '96da2f590cd7246bbde0051047b0d6f7',
          },
          { name: 'fecha', type: 'String (YYYY-MM-DD)', required: true, example: '2025-09-05' },
          { name: 'codigoMetodoPago', type: 'String', required: true, example: '6' },
          { name: 'codigoDivisa', type: 'Number', required: true, example: 31 },
          { name: 'codigoPuntoVentaSin', type: 'String', required: true, example: '8' },
          {
            name: 'fechaEmision',
            type: 'String (YYYY-MM-DD HH:mm:ss)',
            required: true,
            example: '2025-09-09 12:20:10',
          },
          { name: 'descuentoAdicional', type: 'Number', required: false, example: 100 },
          { name: 'montoTotal', type: 'Number', required: true, example: 2000 },
          {
            name: 'datosCliente',
            type: 'Object',
            required: true,
            example: {
              nombre: 'Andres Chiang',
              tipoDocumento: '5',
              nit: '6410259014',
            },
          },
          {
            name: 'detalle',
            type: 'Array<Object>',
            required: true,
            example: [
              {
                id: '5cbba2d075f0d1648e0851e1467ba79f',
                descripcionProducto: 'Pantalla pulgadas x',
                codigoProducto: 'SIS123',
                codigoStock: 62372,
                stock: 148,
                cantidad: 1,
                codigoPorcentaje: 214,
                CategoriaPrecio: 'Menor',
                precioUnitario: 12,
                subTotal: 2,
                montoDescuento: 0,
              },
            ],
          },
        ],
        requestExample: JSON.stringify(
          {
            ver: 'registrarVenta',
            codigoAlmacen: 'SDKFN4',
            idusuario: '96da2f590cd7246bbde0051047b0d6f7',
            fecha: '2025-09-05',
            codigoMetodoPago: '6',
            codigoDivisa: 31,
            codigoPuntoVentaSin: '8',
            fechaEmision: '2025-09-09 12:20:10',
            descuentoAdicional: 100,
            montoTotal: 2000,
            datosCliente: {
              nombre: 'Andres Chiang',
              tipoDocumento: '5',
              nit: '6410259014',
            },
            detalle: [
              {
                id: '5cbba2d075f0d1648e0851e1467ba79f',
                descripcionProducto: 'Pantalla pulgadas x',
                codigoProducto: 'SIS123',
                codigoStock: 62372,
                stock: 148,
                cantidad: 1,
                codigoPorcentaje: 214,
                CategoriaPrecio: 'Menor',
                precioUnitario: 12,
                subTotal: 2,
                montoDescuento: 0,
              },
            ],
          },
          null,
          2,
        ),
        responseExample: JSON.stringify(
          {
            estado: 'exito',
            mensaje: 'Venta registrada correctamente.',
            idventa: 5787,
            idcliente: 2079,
            productos: [
              {
                idproductoalmacen: '4948',
                cantidad: 1,
                precio: 12,
                idstock: 62372,
                idporcentaje: 214,
                candiponible: 148,
                descripcion: 'Pantalla pulgadas x',
                codigo: 'SIS123',
                subtotal: 2,
                datosAdicionales: '',
                despachado: 1,
              },
            ],
            tipoventa: 'No Facturado',
            pagosDivididos: {
              estado: 'exito',
              mensaje: 'Pagos divididos registrados correctamente.',
            },
          },
          null,
          2,
        ),
        errors: [
          {
            code: 400,
            message: 'Bad Request: Parámetros inválidos o faltantes.',
          },
          {
            code: 404,
            message: 'Not Found: No se encontró el parámetro con los valores proporcionados.',
          },
          {
            code: 500,
            message: 'Internal Server Error: Error inesperado en el servidor.',
          },
        ],
        notes:
          'El campo `detalle` debe contener al menos un producto. Los subtotales y descuentos deben enviarse como números. El campo `tipoventa` puede variar según la configuración del sistema.',
      },
      {
        id: 'get-document-types',
        name: 'Listar Tipos de Documento',
        method: 'GET',
        endpoint: '/api/out/tipos-documento',
        description:
          'Obtiene el listado de tipos de documentos permitidos en el sistema (por ejemplo, CI, NIT, Pasaporte, etc.).',
        headers: [
          {
            name: 'Authorization',
            type: 'String',
            required: true,
            example: 'Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3',
          },
        ],
        params: [],
        requestExample: `GET /api/out/tipos-documento
Authorization: Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3`,
        responseExample: JSON.stringify(
          [
            {
              id: 1,
              codigo: '1',
              descripcion: 'Cédula de Identidad',
            },
            {
              id: 5,
              codigo: '5',
              descripcion: 'NIT',
            },
            {
              id: 7,
              codigo: '7',
              descripcion: 'Pasaporte',
            },
          ],
          null,
          2,
        ),
        errors: [
          {
            code: 401,
            message: 'Unauthorized: Token inválido o ausente.',
          },
          {
            code: 403,
            message: 'Forbidden: No tiene permisos para acceder a este recurso.',
          },
          {
            code: 500,
            message: 'Internal Server Error: Error inesperado en el servidor.',
          },
        ],
        notes:
          'Este endpoint requiere un token válido generado previamente mediante `generarTokenJWT`. El token debe enviarse en el header `Authorization` con el formato `Bearer <TOKEN>`.',
      },
      {
        id: 'get-payment-methods',
        name: 'Listar Métodos de Pago',
        method: 'GET',
        endpoint: '/api/out/metodos-pago',
        description:
          'Obtiene el listado de métodos de pago disponibles en el sistema (por ejemplo: efectivo, tarjeta, transferencia, QR, etc.).',
        headers: [
          {
            name: 'Authorization',
            type: 'String',
            required: true,
            example: 'Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3',
          },
        ],
        params: [],
        requestExample: `GET /api/out/metodos-pago
Authorization: Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3`,
        responseExample: JSON.stringify(
          [
            {
              id: 1,
              codigo: '1',
              descripcion: 'Efectivo',
            },
            {
              id: 6,
              codigo: '6',
              descripcion: 'Tarjeta de Débito',
            },
            {
              id: 7,
              codigo: '7',
              descripcion: 'Transferencia Bancaria',
            },
          ],
          null,
          2,
        ),
        errors: [
          {
            code: 401,
            message: 'Unauthorized: Token inválido o ausente.',
          },
          {
            code: 403,
            message: 'Forbidden: No tiene permisos para acceder a este recurso.',
          },
          {
            code: 500,
            message: 'Internal Server Error: Error inesperado en el servidor.',
          },
        ],
        notes:
          'Este endpoint requiere un token válido generado mediante `generarTokenJWT`. El token debe enviarse en el header `Authorization` con el formato `Bearer <TOKEN>`.',
      },
      {
        id: 'get-sale-points',
        name: 'Listar Puntos de Venta',
        method: 'GET',
        endpoint: '/api/out/puntos-venta/{idempresa}',
        description:
          'Obtiene los puntos de venta asociados a una empresa determinada. El parámetro `idempresa` se envía en la URL como hash.',
        headers: [
          {
            name: 'Authorization',
            type: 'String',
            required: true,
            example: 'Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3',
          },
        ],
        params: [
          {
            name: 'idempresa',
            type: 'String',
            required: true,
            example: 'eb160de1de89d9058fcb0b968dbbbd68',
          },
        ],
        requestExample: `GET /api/out/puntos-venta/eb160de1de89d9058fcb0b968dbbbd68
Authorization: Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3`,
        responseExample: JSON.stringify(
          {
            estado: 'exito',
            mensaje: 'Lista encontradas',
            datos: [
              {
                idresponsable: '12',
                idpuntoventa: '32',
                nombre: 'General',
                idalmacen: '93',
                codigosin: '1',
              },
              {
                idresponsable: '4',
                idpuntoventa: '4',
                nombre: 'prueba_eliminar',
                idalmacen: '93',
                codigosin: '2',
              },
            ],
          },

          null,
          2,
        ),
        errors: [
          {
            code: 400,
            message: 'Bad Request: El parámetro `idempresa` es inválido o está vacío.',
          },
          {
            code: 401,
            message: 'Unauthorized: Token inválido o ausente.',
          },
          {
            code: 403,
            message: 'Forbidden: No tiene permisos para acceder a este recurso.',
          },
          {
            code: 404,
            message:
              'Not Found: No se encontraron puntos de venta para el idempresa proporcionado.',
          },
          {
            code: 500,
            message: 'Internal Server Error: Error inesperado en el servidor.',
          },
        ],
        notes:
          'Este endpoint requiere un token válido generado mediante `generarTokenJWT`. El `idempresa` es obligatorio y debe enviarse en la URL. El token se pasa en el header `Authorization` con el formato `Bearer <TOKEN>`.',
      },
      {
        id: 'get-divisas',
        name: 'Listar Divisas',
        method: 'GET',
        endpoint: '/api/out/divisa',
        description:
          'Obtiene el listado de divisas disponibles en el sistema (ejemplo: Bolivianos, Dólares, Euros, etc.).',
        headers: [
          {
            name: 'Authorization',
            type: 'String',
            required: true,
            example: 'Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3',
          },
        ],
        params: [],
        requestExample: `GET /api/out/divisa
Authorization: Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3`,
        responseExample: JSON.stringify(
          {
            divisa: 'Bolivianos',
            codigoDivisa: 31,
            codigoDivisaSin: 1,
            Estado: 'Activo',
          },
          null,
          2,
        ),
        errors: [
          {
            code: 401,
            message: 'Unauthorized: Token inválido o ausente.',
          },
          {
            code: 403,
            message: 'Forbidden: No tiene permisos para acceder a este recurso.',
          },
          {
            code: 500,
            message: 'Internal Server Error: Error inesperado en el servidor.',
          },
        ],
        notes:
          'Este endpoint requiere un token válido generado previamente mediante `generarTokenJWT`. El token debe enviarse en el header `Authorization` con el formato `Bearer <TOKEN>`.',
      },
    ],
  },
  {
    groupName: 'Compras',
    endpoints: [
      {
        id: 'register-provider',
        name: 'Registrar Compra',
        method: 'POST',
        endpoint: '/api/out',
        description:
          'Registra un nuevo proveedor en el sistema junto con los detalles de la compra, lote y factura asociada.',
        headers: [
          {
            name: 'Authorization',
            type: 'String',
            required: true,
            example: 'Bearer lajsdhflakjdshflajsdfajsdfl.sfas8d723.as3',
          },
          {
            name: 'Content-Type',
            type: 'String',
            required: true,
            example: 'application/json',
          },
        ],
        params: [
          { name: 'ver', type: 'String', required: true, example: 'registrarCompra' },
          {
            name: 'idusuario',
            type: 'String',
            required: true,
            example: '96da2f590cd7246bbde0051047b0d6f7',
          },
          { name: 'codigoAlmacen', type: 'String', required: true, example: 'SDKFN4' },
          {
            name: 'fecha_ingreso',
            type: 'String (YYYY-MM-DD)',
            required: true,
            example: '2025-12-12',
          },
          { name: 'Lote', type: 'String', required: true, example: 'PLEn123' },
          { name: 'codigoCompra', type: 'String', required: true, example: 'C4531D' },
          { name: 'nfactura', type: 'String', required: true, example: '1233242' },
          {
            name: 'proveedor',
            type: 'Object',
            required: true,
            example: {
              nombre: 'Felix',
              codigo: 'LSDJAOSI2',
              nit: '1324654321',
            },
          },
          {
            name: 'detalle',
            type: 'Array<Object>',
            required: true,
            example: [
              {
                id: '5cbba2d075f0d1648e0851e1467ba79f',
                cantidad: 1,
                precioUnitario: 12,
              },
            ],
          },
        ],
        requestExample: JSON.stringify(
          {
            ver: 'registroproveedor',
            idusuario: '96da2f590cd7246bbde0051047b0d6f7',
            codigoAlmacen: 'SDKFN4',
            fecha_ingreso: '2025-12-12',
            Lote: 'PLEn123',
            codigoCompra: 'C4531D',
            nfactura: '1233242',
            proveedor: {
              nombre: 'Felix',
              codigo: 'LSDJAOSI2',
              nit: '1324654321',
            },
            detalle: [
              {
                id: '5cbba2d075f0d1648e0851e1467ba79f',
                cantidad: 1,
                precioUnitario: 12,
              },
            ],
          },
          null,
          2,
        ),
        responseExample: JSON.stringify(
          {
            status: 'ok',
            message:
              'Compra procesada exitosamente. Se registraron 0 nuevos precios base y 0 nuevos precios sugeridos.',
            new_prices_registered: 0,
            new_suggested_prices_registered: 0,
          },
          null,
          2,
        ),
        errors: [
          {
            code: 400,
            message: 'Bad Request: Parámetros inválidos o faltantes.',
          },
          {
            code: 401,
            message: 'Unauthorized: Token inválido o ausente.',
          },
          {
            code: 403,
            message: 'Forbidden: No tiene permisos para acceder a este recurso.',
          },
          {
            code: 500,
            message: 'Internal Server Error: Error inesperado en el servidor.',
          },
        ],
        notes:
          'El endpoint requiere un token válido generado mediante `generarTokenJWT`. El token debe enviarse en el header `Authorization` con el formato `Bearer <TOKEN>`. El campo `detalle` debe contener al menos un producto.',
      },
    ],
  },
]

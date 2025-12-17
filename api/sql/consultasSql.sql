





SELECT
    v.fecha_venta,
    v.nfactura,
    v.tipo_venta,
    p.descripcion,
    u.nombre,
    COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
    pb.precio,
    dv.precio_unitario,
    dv.cantidad,
    (dv.precio_unitario * dv.cantidad) AS importe, 
    0 AS descuento,
    (dv.precio_unitario * dv.cantidad) AS ventatotal,
    (pb.precio * dv.cantidad) AS costototal,
    (dv.precio_unitario * dv.cantidad)-(pb.precio * dv.cantidad) AS utilidad,
    v.tipo_pago,
    v.id_usuario,
    a.idsucursal,
    a.nombre,
    c.nombre,
    c.tipodocumento,
    c.nit,
    c.nombrecomercial,
    cv.canal,
    po.tipo,
    pa.almacen_id_almacen,
    v.estado,
    su.nombre,
    v.id_usuario,
    COALESCE(sca.nombre, '') AS nombre_subcategoria,
    p.codigo,
    p.cod_barras,
    v.idsucursal,
    v.cliente_id_cliente1
FROM detalle_venta dv
LEFT JOIN venta v ON dv.venta_id_venta = v.id_venta
LEFT JOIN sucursal su ON v.idsucursal = su.id_sucursal
LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
LEFT JOIN precio_base pb ON pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen
LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
LEFT JOIN canalventa cv ON v.idcanal = cv.idcanalventa
LEFT JOIN porcentajes po ON dv.categoria = po.id_porcentajes
LEFT JOIN unidad u ON p.unidad_id_unidad = u.id_unidad
LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
WHERE v.fecha_venta BETWEEN '2025-01-01' AND '2025-02-01' AND a.idempresa = 74 AND pb.estado = 1 AND v.estado = 1
ORDER BY
v.id_venta ASC,
v.fecha_venta ASC
































SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
            LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
            LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
            WHERE r.id_empresa=50
            ORDER BY ra.idresponsablealmacen desc
 select id_productos, nombre, descripcion from productos  where idempresa = 74 and descripcion like '%Molido%';




 Microsoft Windows [Versión 10.0.26100.4349]
(c) Microsoft Corporation. Todos los derechos reservados.

C:\Windows\System32>mysql -h 145.14.151.51 -u u335921272_vcomercial -p
Enter password: ***************
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 61799677
Server version: 5.5.5-10.11.10-MariaDB-log MariaDB Server

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> use u335921272_vcomercial
Database changed
mysql> update venta set nfactura =1535 where id_venta =1395
    -> ;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61815153
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.12 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1535 where id_venta =1395;
Query OK, 0 rows affected (0.20 sec)
Rows matched: 1  Changed: 0  Warnings: 0

mysql> update venta set nfactura =55 where id_venta =1266;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61826226
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.15 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1526 where id_venta =1391;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61830226
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.21 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1521 where id_venta =1390;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61833817
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.15 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1481 where id_venta =1364;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61840258
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.11 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1450 where id_venta =1361;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61848717
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.49 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1404 where id_venta =1352;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61853457
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.15 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1235 where id_venta =1319;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61856954
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.14 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1055 where id_venta =1302;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61861866
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.13 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =1042 where id_venta =1299;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61865772
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.40 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =973 where id_venta =1294;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61872564
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.10 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =818 where id_venta =1286;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61876562
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.17 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura =819 where id_venta =1287;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61880890
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.06 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 664 where id_venta =1278;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61885243
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.05 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 584 where id_venta =1274;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61889045
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.10 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 583 where id_venta =1276;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61893041
Current database: u335921272_vcomercial

Query OK, 1 row affected (4.63 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 470 where id_venta =1272;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61897557
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.09 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> update venta set nfactura = 471 where id_venta =1273;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    61901843
Current database: u335921272_vcomercial

Query OK, 1 row affected (1.07 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql>





CREATE TABLE
  `cierre_puntoVenta` (
    `id_cierre` int(11) NOT NULL AUTO_INCREMENT,
    `id_usuario` int(11) NOT NULL,
    `fecha_inicio` date NOT NULL,
    `fecha_fin` date NOT NULL,
    `observacion` text DEFAULT NULL,
    `creado_en` timestamp NOT NULL,
    `estado` int(11) NOT NULL,
    `autorizado` int(11) NOT NULL,
    `id_punto_venta` int(11) NOT NULL,
    PRIMARY KEY (`id_cierre`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci

CREATE TABLE
  `cierre_conceptos` (
    `id_concepto` int(11) NOT NULL AUTO_INCREMENT,
    `id_cierre` int(11) NOT NULL,
    `concepto` varchar(50) NOT NULL,
    `sistema` decimal(15, 2) NOT NULL,
    `contado` decimal(15, 2) NOT NULL,
    `diferencia` decimal(15, 2) NOT NULL,
    PRIMARY KEY (`id_concepto`),
    KEY `id_cierre` (`id_cierre`),
    CONSTRAINT `cierre_conceptos_ibfk_1` FOREIGN KEY (`id_cierre`) REFERENCES `cierre_puntoVenta` (`id_cierre`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 13 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci


CREATE TABLE
  `cierre_metodos_pago` (
    `id_cierre_metodos_pago` int(11) NOT NULL AUTO_INCREMENT,
    `id_cierre` int(11) NOT NULL,
    `id_metodo` int(11) NOT NULL,
    `metodo` varchar(50) NOT NULL,
    `total_sistema` decimal(15, 2) NOT NULL,
    `total_contado` decimal(15, 2) NOT NULL,
    `diferencia` decimal(15, 2) NOT NULL,
    `tipo` varchar(50) DEFAULT NULL,
    PRIMARY KEY (`id_cierre_metodos_pago`),
    KEY `id_cierre` (`id_cierre`),
    CONSTRAINT `cierre_metodos_pago_ibfk_1` FOREIGN KEY (`id_cierre`) REFERENCES `cierre_puntoVenta` (`id_cierre`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci

CREATE TABLE
  `cierre_arqueo_fisico` (
    `id_arqueo` int(11) NOT NULL AUTO_INCREMENT,
    `id_cierre` int(11) NOT NULL,
    `valor_moneda` decimal(10, 2) NOT NULL,
    `cantidad` int(11) NOT NULL,
    `label` varchar(50) NOT NULL,
    PRIMARY KEY (`id_arqueo`),
    KEY `id_cierre` (`id_cierre`),
    CONSTRAINT `cierre_arqueo_fisico_ibfk_1` FOREIGN KEY (`id_cierre`) REFERENCES `cierre_puntoVenta` (`id_cierre`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 23 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci










ALTER TABLE nota_debito_credito 
ADD COLUMN cuf text DEFAULT '',
ADD COLUMN ack_ticket text DEFAULT '',
ADD COLUMN urlSin text DEFAULT '',
ADD COLUMN emision_type_code int DEFAULT 0,
ADD COLUMN fechaEmision timestamp,
ADD COLUMN numeroFactura int DEFAULT 0,
ADD COLUMN shortLink varchar(100) DEFAULT '',
ADD COLUMN codigoEstado int DEFAULT 0;




CREATE TABLE `nota_debito_credito` (
  `id_nota_debito_credito` INT(11) NOT NULL AUTO_INCREMENT,
  `numNota` INT(11) NOT NULL,
  `id_usuario` INT(11) NOT NULL,
  `monto_total_devuelto` DECIMAL(10,2) NOT NULL,
  `monto_descuento_credito_debito` DECIMAL(10,2) NOT NULL,
  `monto_efectivo_credito_debito` DECIMAL(10,2) NOT NULL,
  `id_venta` INT(11) NOT NULL,
  `cuf` text DEFAULT '',
    `ack_ticket` text DEFAULT '',
    `urlSin` text DEFAULT '',
    `emision_type_code` int(11) DEFAULT 0,
    `fechaEmision` timestamp NULL DEFAULT NULL,
    `numeroFactura` int(11) DEFAULT 0,
    `shortLink` varchar(200) DEFAULT '',
    `codigoEstado` int(11) DEFAULT 0,
  PRIMARY KEY (`id_nota_debito_credito`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `detalle_nota_debito_credito` (
  `id_detalle_nota_debito_credito` INT(11) NOT NULL AUTO_INCREMENT,
  `productos_almacen_id_productos_almacen` INT(11) NOT NULL,
  `cantidad` INT(11) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  `sub_total` DECIMAL(10,2) NOT NULL,
  `monto_descuento` DECIMAL(10,2) NOT NULL,
  `id_nota_debito_credito` INT(11) NOT NULL,
  PRIMARY KEY (`id_detalle_nota_debito_credito`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE TABLE
--   `detalle_devolucion` (
--     `iddetalle_devolucion` int(11) NOT NULL AUTO_INCREMENT,
--     `cantidad` int(11) NOT NULL,
--     `precio` float NOT NULL,
--     `perdida` int(11) NOT NULL,
--     `cantidadperdida` int(11) NOT NULL,
--     `devoluciones_id_devoluciones` int(11) NOT NULL,
--     `producto_almacen_id_producto_almacen` int(11) NOT NULL,
--     PRIMARY KEY (`iddetalle_devolucion`)
--   ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci





-- INSERT INTO stock (
--     cantidad,
--     fecha,
--     codigo,
--     estado,
--     productos_almacen_id_productos_almacen,
--     idorigen
-- ) VALUES (
--     0,               -- cantidad
--     '2025-09-08',     -- fecha (YYYY-MM-DD)
--     'NUE',    -- código (puede ser un identificador único)
--     1,                -- estado (ej: 1 = activo, 0 = inactivo)
--     5371,             -- FK: productos_almacen_id_productos_almacen
--     NULL              -- idorigen (puede ser NULL o un id válido)
-- );




-- INSERT INTO productos_almacen (
--     fecha_registro,
--     estado,
--     stock_minimo,
--     stock_maximo,
--     pais,
--     almacen_id_almacen,
--     productos_id_productos
-- ) VALUES (
--     '2025-09-08',   -- fecha_registro (YYYY-MM-DD)
--     '1',       -- estado
--     10,             -- stock_minimo
--     100,            -- stock_maximo
--     'Bolivia',      -- pais (puede ser NULL)
--     41,              -- almacen_id_almacen (FK)
--     759               -- productos_id_productos (FK)
-- );
-- select 
-- i.nfactura as 'nrofactura',
-- a.id_almacen as 'idalmacen',
-- a.nombre as 'almacen',
-- i.id_ingreso as 'idingreso',
-- i.fecha_ingreso as 'fecha',
-- i.codigo, 
-- i.proveedor_id_proveedor as 'idproveedor',
-- prb.nombre as 'proveedor',
-- p.id_pago as 'idpago',
-- p.monto_total,
-- p.saldo_actual
-- from almacen a 
-- left join ingreso i on a.id_almacen = i.almacen_id_almacen
-- left join detalle_ingreso di on i.id_ingreso = di.ingreso_id_ingreso
-- left join proveedor prb on prb.id_proveedor = i.proveedor_id_proveedor
-- inner join pagos p on p.compra_id = i.id_ingreso
-- where a.id_almacen = 109

-- SELECT 
-- i.nfactura as 'nrofactura',
-- a.id_almacen as 'idalmacen',
-- a.nombre as 'almacen',
-- i.id_ingreso as 'idingreso',
-- i.fecha_ingreso as 'fecha',
-- i.codigo, 
-- i.proveedor_id_proveedor as 'idproveedor',
-- prb.nombre as 'proveedor',
-- p.id_pago, p.compra_id, p.monto_total, p.saldo_actual, p.nro_cuotas, p.fecha_inicio, p.fecha_fin_estimada, p.estado AS estado_pago,
--     c.id_cuota, c.nro_cuota, c.monto_cuota, c.fecha_vencimiento, c.fecha_pago, c.monto_pagado, c.estado AS estado_cuota,
--     tp.id_transaccion, tp.fecha_pago AS fecha_transaccion, tp.monto AS monto_transaccion, tp.referencia
-- from almacen a 
-- left join ingreso i on a.id_almacen = i.almacen_id_almacen
-- left join detalle_ingreso di on i.id_ingreso = di.ingreso_id_ingreso
-- left join proveedor prb on prb.id_proveedor = i.proveedor_id_proveedor
-- inner join pagos p on p.compra_id = i.id_ingreso
-- LEFT JOIN cuotas c ON p.id_pago = c.pago_id
-- LEFT JOIN transacciones_pago tp ON c.id_cuota = tp.cuota_id
 -- INSERT INTO venta (
 --   fecha_venta,
 --   tipo_venta,
 --   monto_total,
 --   descuento,
 --   tipo_pago,
 --   cliente_id_cliente1,
 --   divisas_id_divisas,
 --   id_usuario,
 --   nfactura,
 --   idsucursal,
 --   idcampaña,
 --   nroventa,
 --   estado,
 --   idcanal,
 --   codigoventa
 -- ) VALUES (
 --   '2025-07-07',    -- fecha_venta
 --   1,               -- tipo_venta
 --   175,          -- monto_total
 --   0,           -- descuento
 --   'contado',      -- tipo_pago
 --   1819,               -- cliente_id_cliente1
 --   31,               -- divisas_id_divisas
 --   22,               -- id_usuario
 --   1146,            -- nfactura (puede ser NULL)
 --   1522,               -- idsucursal
 --   0,               -- idcampaña
 --   1674,     -- nroventa
 --   1,               -- estado
 --   4,               -- idcanal
 --   '00153220250707001674' -- codigoventa
 -- );



 -- INSERT INTO detalle_venta (
 --   cantidad,
 --   precio_unitario,
 --   productos_almacen_id_productos_almacen,
 --   venta_id_venta,
 --   categoria
 -- ) VALUES (
 --   1,        -- cantidad
 --   175,    -- precio_unitario
 --  3349,     -- productos_almacen_id_productos_almacen (debe existir en productos_almacen)
 --   5262,     -- venta_id_venta (debe existir en venta)
 --   128       -- categoria (según tu lógica)
 -- );


 -- INSERT INTO ventas_facturadas (
 --   ack_ticket,
 --   codigoEstado,
 --   cuf,
 --   emission_type_cede,
 --   fechaEmission,
 --   numeroFactura,
 --   shortLink,
 --   urlSin,
 --   xml_url,
 --   venta_id_venta
 -- ) VALUES (
 --   '686c20c2c5a13',                             -- ack_ticket
 --   'VALIDADA',                              -- codigoEstado (puede ser NULL)
 --   '86DCEAF56773783A4479A7157528A4989C7BD285C2AAEAF2829E1F74', -- cuf (Código Único de Factura)
 --   1,                                       -- emission_type_cede (tipo de emisión)
 --   '2025-07-07 15:32:18',                   -- fechaEmission (fecha y hora)
 --  1146,                                    -- numeroFactura
 --   'https://fel.emizor.com/inv/686c20c2c5a13',           -- shortLink
 --   'https://siat.impuestos.gob.bo/consulta/QR?nit=123189023&cuf=86DCEAF56773783A4479A7157528A4989C7BD285C2AAEAF2829E1F74&numero=1146&t=2', -- urlSin
 --   'https://emizor-web-prod.s3.amazonaws.com/company/100317/branch/451/86DCEAF56773783A4479A7157528A4989C7BD285C2AAEAF2829E1F74.xml', -- xml_url
 --   5262                                     -- venta_id_venta (debe existir en la tabla venta)
 -- );











-- -- Tabla principal de pagos (créditos)
-- CREATE TABLE pagos (
--     id_pago INT PRIMARY KEY AUTO_INCREMENT,
--     compra_id INT NOT NULL,
--     monto_total DECIMAL(15,2) NOT NULL,
--     saldo_actual DECIMAL(15,2) NOT NULL,
--     nro_cuotas INT NOT NULL,
--     fecha_inicio DATE NOT NULL,
--     pago_cada_ciertos_dias INT NOT NULL,
--     fecha_fin_estimada DATE NOT NULL,
--     estado INT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- );

-- -- Tabla de cuotas individuales
-- CREATE TABLE cuotas (
--     id_cuota INT PRIMARY KEY AUTO_INCREMENT,
--     pago_id INT NOT NULL,
--     nro_cuota INT NOT NULL,
--     monto_cuota DECIMAL(15,2) NOT NULL,
--     fecha_vencimiento DATE NOT NULL,
--     fecha_pago DATE NULL,
--     monto_pagado DECIMAL(15,2) DEFAULT 0.00,
--     estado INT NOT NULL
-- );

-- CREATE TABLE transacciones_pago (
--     id_transaccion INT PRIMARY KEY AUTO_INCREMENT,
--     cuota_id INT NOT NULL,
--     fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     monto DECIMAL(15,2) NOT NULL,
--     referencia VARCHAR(100),
--     comprobante_path VARCHAR(255),
--     estado INT NOT NULL,
--     usuario_id INT,
--     observaciones TEXT
-- );

-- DROP TABLE transacciones_pago, cuotas, pagos;



-- SELECT id_almacen FROM almacen WHERE codigo = AAAW
-- SELECT 
--     pa.id_productos_almacen AS id,
--     p.nombre AS nombre_producto,
--     p.descripcion AS descripcion_producto,
--     p.codigosin AS codigo_sin,
--     p.actividadsin AS actividad_sin,
--     p.unidadsin AS unidad_sin,
--     p.codigonandina AS codigo_nandina,
--     p.imagen AS url_imagen,
--     s.cantidad AS stock_actual,
--     p.cod_barras AS codigo_barras,
--     COALESCE(ca.nombre, sca_padre.nombre) AS categoria,
--     COALESCE(sca.nombre, '') AS subcategoria,
--     me.nombre_medida AS origen_producto,
--     ep.tipos_estado AS estado_producto,
--     un.nombre AS unidad_medida,
--     p.caracteristicas AS caracteristicas_extra, 
--     po.tipo, 
--     ps.precio
-- FROM productos_almacen pa
-- LEFT JOIN almacen a ON a.id_almacen = pa.almacen_id_almacen
-- LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
-- LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
-- LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
-- LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
-- LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
-- LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
-- LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
-- LEFT JOIN precio_sugerido ps ON ps.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- LEFT join porcentajes AS po ON ps.porcentajes_id_porcentajes=po.id_porcentajes
-- LEFT JOIN (
--     SELECT id_stock, estado, productos_almacen_id_productos_almacen, cantidad, ROW_NUMBER() OVER (PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
--     FROM
--         stock
--     WHERE
--         estado = '1' 
-- ) AS s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1 
-- WHERE p.codigosin IS NOT NULL 
-- AND p.codigosin <> 0 
-- AND p.codigosin <> '' 
-- AND p.idempresa = 74 
-- AND s.cantidad <> 0
-- AND a.id_almacen = 64





--   SELECT pa.id_productos_almacen,
--         al.nombre AS nombre_almacen,
--         p.codigo,
--         p.cod_barras,
--         p.nombre AS nombre_producto,
--         p.descripcion,
--         pa.pais,
--         u.nombre AS nombre_unidad,
--         p.caracteristicas,
--         pa.stock_minimo,
--         s.cantidad AS ultima_cantidad_stock,
--         pa.fecha_registro,
--         al.id_almacen,
--         pa.estado,
--         m.nombre_medida,
--         c.nombre AS nombre_categoria,
--         pa.productos_id_productos,
--         ep.tipos_estado,
--         pa.stock_maximo,
--         p.imagen,
--         s.id_stock, 
--         po.id_porcentajes,
--         po.tipo, 
--         prsu.precio,
--         p.codigosin,
--         p.actividadsin,
--         p.unidadsin,
--         p.codigonandina
--         FROM productos_almacen AS pa
--             LEFT JOIN almacen AS al ON pa.almacen_id_almacen = al.id_almacen
--             LEFT JOIN productos AS p ON pa.productos_id_productos = p.id_productos
--             LEFT JOIN unidad AS u ON u.id_unidad = p.unidad_id_unidad
--             LEFT JOIN medida AS m ON m.id_medida = p.medida_id_medida
--             LEFT JOIN categorias AS c ON c.id_categorias = p.categorias_id_categorias
--             LEFT JOIN estados_productos AS ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
--             LEFT JOIN precio_sugerido AS prsu ON pa.id_productos_almacen=prsu.productos_almacen_id_productos_almacen
--             LEFT join porcentajes AS po ON prsu.porcentajes_id_porcentajes=po.id_porcentajes
--             LEFT JOIN (
--                 SELECT id_stock, productos_almacen_id_productos_almacen, cantidad, ROW_NUMBER() OVER (PARTITION BY productos_almacen_id_productos_almacen ORDER BY id_stock DESC) AS rn
--                 FROM
--                     stock
--                 WHERE
--                     estado = '1'
--             ) AS s ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen AND s.rn = 1
--             WHERE
--                         p.idempresa= 74 and al.id_almacen = 64
--             ORDER BY `pa`.`id_productos_almacen` DESC;
-- select 
--   pa.id_productos_almacen, 
--   p.nombre, 
--   p.descripcion, 
--   p.codigosin, 
--   p.actividadsin, 
--   p.unidadsin, 
--   p.codigonandina,
--   p.imagen,
--   s.cantidad,
--   p.cod_barras,  
--   COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria, 
--   COALESCE(sca.nombre, '') AS nombre_subcategoria, 
--   me.nombre_medida as origen_producto, 
--   ep.tipos_estado as estado_producto, 
--   un.nombre AS nombre_unidad, 
--   p.caracteristicas as caracteristicas_extra, 
-- from productos p 
-- left join productos_almacen pa on pa.productos_id_productos = p.id_productos
-- LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
-- LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
-- LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
-- LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
-- LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
-- LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
-- left join stock s on s.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- left join almacen a on a.id_almacen = pa.almacen_id_almacen
-- where p.codigosin is not null and  p.codigosin <> 0 and p.codigosin <> '' and p.idempresa = 74 and s.estado = 1 and a.id_almacen = 84;



-- select * from almacen a where a.idempresa = 74

-- select p.nombre,p.descripcion,a.id_almacen,a.nombre, s.cantidad as stock from almacen a 
-- left join productos_almacen pa on pa.almacen_id_almacen = a.id_almacen
-- left join productos p on p.id_productos = pa.productos_id_productos
-- left join stock s on s.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
-- LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
-- LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
-- LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
-- LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
-- LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
-- where p.codigosin is not null and  p.codigosin <> 0 and p.codigosin <> '' and p.idempresa = 74 and a.id_almacen = 84

-- CREATE TABLE auth_tokens (
--     id_token INT AUTO_INCREMENT PRIMARY KEY,
--     id_empresa INT NOT NULL,
--     token_hash TEXT NOT NULL,
--     creado_en TIMESTAMP NOT NULL,
--     expira_en DATETIME NOT NULL,
--     activo INT DEFAULT 1 NOT NULL
-- ) ENGINE=InnoDB;

-- SELECT 
--     c.id_cierre, c.fecha_inicio, c.fecha_fin, c.observacion, 
--     c.creado_en, c.estado, c.autorizado, c.id_punto_venta,
--     pv.nombre AS punto_venta
-- FROM cierre_puntoVenta c
-- LEFT JOIN punto_venta pv ON c.id_punto_venta = pv.idpunto_venta
-- WHERE c.id_cierre = 2


-- SELECT id_concepto, concepto, sistema, contado, diferencia 
--                                             FROM cierre_conceptos 
--                                             WHERE id_cierre = 2
-- select 
--   cpv.id_cierre,
--   cpv.fecha_inicio, 
--   cpv.fecha_fin, 
--   cpv.observacion,
--   cpv.creado_en,
--   cpv.estado,
--   cpv.autorizado,
--   cpv.id_punto_venta,
--   pv.nombre as punto_venta
-- from cierre_puntoVenta cpv
-- inner join responsable r on r.id_usuario = cpv.id_usuario
-- left join punto_venta pv on cpv.id_punto_venta = pv.idpunto_venta
-- where  r.id_empresa = 50 and r.id_usuario = 117;









-- select c.nombre, c.nombrecomercial as nombre_comercial, c.ciudad, s.nombre as nombre_sucursal from cliente c 
-- left join sucursal s on s.cliente_id_cliente = c.id_cliente
--   where c.idempresa = 54;
-- SELECT DISTINCT
--             c.id_cotizacion
--             FROM punto_venta pv 
--             inner JOIN almacen a on pv.idalmacen = a.id_almacen
--             inner JOIN productos_almacen pa on pa.almacen_id_almacen = a.id_almacen 
--             inner JOIN productos p on p.id_productos = pa.productos_id_productos
--             inner JOIN detalle_cotizacion dc on dc.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
--             inner JOIN cotizacion c on c.id_cotizacion = dc.cotizacion_id_cotizacion
--             where c.fecha_cotizacion = '2025-08-13'  and pv.idpunto_venta = 29 and c.estado =1;

-- select pv.*, r.* from punto_venta pv
-- left join responsable_puntoventa rpv on rpv.idpuntoventa = pv.idpunto_venta 
-- left join responsable r on r.id_responsable = rpv.idresponsable
-- where r.id_empresa = 50;



-- select p.nombre,p.descripcion,a.id_almacen,a.nombre, s.cantidad as stock from almacen a 
-- left join productos_almacen pa on pa.almacen_id_almacen = a.id_almacen
-- left join productos p on p.id_productos = pa.productos_id_productos
-- left join stock s on s.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
-- LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
-- LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
-- LEFT JOIN medida me ON p.medida_id_medida = me.id_medida
-- LEFT JOIN estados_productos ep ON p.estados_productos_id_estados_productos = ep.id_estados_productos
-- LEFT JOIN unidad un ON p.unidad_id_unidad = un.id_unidad
-- where p.codigosin is not null and  p.codigosin <> 0 and p.codigosin <> '' and p.idempresa = 74 and a.id_almacen = 84  


-- select p.id_productos, p.nombre, p.descripcion, p.codigosin from  productos p where p.codigosin is not null and  p.codigosin <> 0 and p.codigosin <> '' and p.idempresa = 74;

-- -- select -v

-- select * from productos_almacen pa 
-- left join detalle_ingreso di on pa.id_productos_almacen = di.productos_almacen_id_productos_almacen
-- left join detalle_venta dv on pa.id_productos_almacen = dv.productos_almacen_id_productos_almacen


-- CREATE TABLE inventario (
--   id_inventario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
--   productos_almacen_id_productos_almacen INT NOT NULL,
--   fecha DATE NOT NULL,
--   tipo_movimiento VARCHAR(60) NOT NULL,
--   id_origen INT NOT NULL,
--   detalle_inventario VARCHAR(100),
--   cantidad DOUBLE NOT NULL,
--   precio DOUBLE NOT NULL
-- );


-- CREATE TABLE cierre_puntoVenta (
--     id_cierre INT AUTO_INCREMENT PRIMARY KEY,
--     id_usuario INT NOT NULL,
--     fecha_inicio DATETIME NOT NULL,
--     fecha_fin DATETIME NOT NULL,
--     observacion TEXT,
--     creado_en TIMESTAMP NOT NULL,
--     estado INT NOT NULL,
--     autorizado INT NOT NULL,
--     id_punto_venta INT NOT NULL
-- ) ENGINE=InnoDB;


-- CREATE TABLE cierre_conceptos (
--     id_concepto INT AUTO_INCREMENT PRIMARY KEY,
--     id_cierre INT NOT NULL,
--     concepto VARCHAR(50) NOT NULL,  -- ingresos, egresos, etc.
--     sistema DECIMAL(15,2) NOT NULL,
--     contado DECIMAL(15,2) NOT NULL,
--     diferencia DECIMAL(15,2) NOT NULL,
--     FOREIGN KEY (id_cierre) REFERENCES cierre_puntoVenta(id_cierre) ON DELETE CASCADE
-- ) ENGINE=InnoDB;


-- CREATE TABLE cierre_metodos_pago (
--     id_cierre_metodos_pago INT AUTO_INCREMENT PRIMARY KEY,
--     id_cierre INT NOT NULL,
--     id_metodo INT NOT NULL,
--     metodo VARCHAR(50) NOT NULL,   -- cheque, efectivo, QR, etc.
--     total_sistema DECIMAL(15,2) NOT NULL,
--     total_contado DECIMAL(15,2) NOT NULL,
--     diferencia DECIMAL(15,2) NOT NULL,
--     tipo VARCHAR(50) NOT NULL,
--     FOREIGN KEY (id_cierre) REFERENCES cierre_puntoVenta(id_cierre) ON DELETE CASCADE
-- ) ENGINE=InnoDB;


-- CREATE TABLE cierre_arqueo_fisico (
--     id_arqueo INT AUTO_INCREMENT PRIMARY KEY,
--     id_cierre INT NOT NULL,
--     valor_moneda DECIMAL(10,2) NOT NULL,
--     cantidad INT NOT NULL,
--     label VARCHAR(50) NOT NULL,
--     FOREIGN KEY (id_cierre) REFERENCES cierre_puntoVenta(id_cierre) ON DELETE CASCADE
-- ) ENGINE=InnoDB;
-- select s.id_stock, s.productos_almacen_id_productos_almacen, s.cantidad, s.codigo, s.fecha, 
-- (select di.precio_unitario from ingreso i
-- left join detalle_ingreso di on i.id_ingreso=di.ingreso_id_ingreso
-- where di.productos_almacen_id_productos_almacen=5019 and i.autorizacion = 1
-- and i.fecha_ingreso < '2025-08-01'
-- order by di.id_detalle_ingreso desc limit 1) as precio, pa.almacen_id_almacen
-- from productos_almacen pa 
-- left join stock s on pa.id_productos_almacen=s.productos_almacen_id_productos_almacen
-- left join detalle_venta dv on pa.id_productos_almacen=dv.productos_almacen_id_productos_almacen
-- left join venta v on dv.venta_id_venta=v.id_venta
-- where s.productos_almacen_id_productos_almacen=5019 and s.fecha between (DATE_ADD('2025-08-01', interval -1 month)) and (DATE_ADD('2025-08-01', interval -1 day))
--   and pa.almacen_id_almacen=93
-- group by s.id_stock
-- order by s.id_stock desc limit 1



  

-- SELECT 
--     s.id_stock,
--     s.productos_almacen_id_productos_almacen, 
--     s.cantidad, 
--     s.codigo, 
--     s.fecha,  
--     pa.almacen_id_almacen,
--     di.precio_unitario
-- FROM productos_almacen pa 
-- LEFT JOIN stock s 
--     ON pa.id_productos_almacen = s.productos_almacen_id_productos_almacen
-- LEFT JOIN detalle_ingreso di 
--     ON di.id_detalle_ingreso = s.idorigen
-- WHERE s.productos_almacen_id_productos_almacen = 5019
--   AND s.fecha BETWEEN '2025-08-01' AND '2025-08-30'
-- GROUP BY s.id_stock;

-- CREATE TABLE control_inventario (
--   id_control_inventario INT NOT NULL AUTO_INCREMENT PRIMARY KEY, -- Clave primaria
--   metodo_control VARCHAR(10) NOT NULL,                           -- Método de control (por ejemplo, 'PEPS')
--   idempresa INT NOT NULL,                                        -- ID de la empresa
--   estado INT NOT NULL DEFAULT 1,                                 -- Estado del registro (activo por defecto)
--   fecha_creacion DATE NOT NULL,                                  -- Fecha en que se crea el control
--   fecha_finalizacion DATE NOT NULL                               -- Fecha en que finaliza el control
-- );
-- select sum(pv.monto) from pagoVenta pv
-- left join venta v on v.id_venta = pv.id_venta
-- where v.fecha_venta between '2025-07-01' and '2025-08-01' and pv.id_canalventa = 7;
-- INSERT INTO control_inventario (metodo_control, idempresa, fecha_creacion, fecha_finalizacion)
-- VALUES ('UEPS', 50, CURDATE(), CURDATE());





-- select 
--     c.fecha_cotizacion,
--     0 as nfactura,
--     0 as tipo_venta,
--     p.descripcion,
--     u.nombre,
--     COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
--     pb.precio,
--     dc.precio_unitario,
--     dc.cantidad,
--     (dc.precio_unitario * dc.cantidad) AS importe, 
--     0 AS descuento,
--     (dc.precio_unitario * dc.cantidad) AS ventatotal,
--     (pb.precio * dc.cantidad) AS costototal,
--     (dc.precio_unitario * dc.cantidad)-(pb.precio * dc.cantidad) AS utilidad,
--     'contado' as tipo_pago,
--     c.id_usuario,
--     a.idsucursal,
--     a.nombre,
--     cl.nombre,
--     cl.tipodocumento,
--     '-' as canal,
--     '-' as tipo,
--     cl.nit,
--     cl.nombrecomercial,
--     pa.almacen_id_almacen,
--     1 as estado,
--     s.nombre,
--     c.id_usuario,
--     COALESCE(sca.nombre, '') AS nombre_subcategoria,
--     p.codigo,
--     p.cod_barras,
--     c.idsucursal,
--     c.cliente_id_cliente
-- from detalle_cotizacion dc 
-- left join cotizacion c on c.id_cotizacion = dc.cotizacion_id_cotizacion
-- left join sucursal s on s.id_sucursal = c.idsucursal
-- left join productos_almacen pa on pa.id_productos_almacen = dc.productos_almacen_id_productos_almacen
-- left join almacen a on a.id_almacen = pa.almacen_id_almacen
-- left join productos p on p.id_productos = pa.productos_id_productos
-- left join precio_base pb on pb.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- left join cliente cl on cl.id_cliente = c.cliente_id_cliente
-- left join unidad u on u.id_unidad = p.unidad_id_unidad
-- LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
-- LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
-- LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
-- WHERE c.fecha_cotizacion BETWEEN '2025-07-01' AND '2025-08-01' AND a.idempresa = 50 AND pb.estado = 1
-- ORDER BY
-- c.id_cotizacion ASC,
-- c.fecha_cotizacion ASC










 






-- SELECT
-- v.fecha_venta,
-- v.nfactura,
-- v.tipo_venta,
-- p.descripcion,
-- u.nombre,
-- COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
-- pb.precio,
-- dv.precio_unitario,
-- dv.cantidad,
-- (dv.precio_unitario * dv.cantidad) AS importe, 0 AS descuento,
-- (dv.precio_unitario * dv.cantidad) AS ventatotal,
-- (pb.precio * dv.cantidad) AS costototal,
-- (dv.precio_unitario * dv.cantidad)-(pb.precio * dv.cantidad) AS utilidad,
-- v.tipo_pago,
-- v.id_usuario,
-- a.idsucursal,
-- a.nombre,
-- c.nombre,
-- c.tipodocumento,
-- c.nit,
-- c.nombrecomercial,
-- cv.canal,
-- po.tipo,
-- pa.almacen_id_almacen,
-- v.estado,
-- su.nombre,
-- v.id_usuario,
-- COALESCE(sca.nombre, '') AS nombre_subcategoria,
-- p.codigo,
-- p.cod_barras,
-- v.idsucursal,
-- v.cliente_id_cliente1
-- FROM detalle_venta dv
-- LEFT JOIN venta v ON dv.venta_id_venta = v.id_venta
-- LEFT JOIN sucursal su ON v.idsucursal = su.id_sucursal
-- LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
-- LEFT JOIN productos p ON pa.productos_id_productos = p.id_productos
-- LEFT JOIN precio_base pb ON pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen
-- LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
-- LEFT JOIN canalventa cv ON v.idcanal = cv.idcanalventa
-- LEFT JOIN porcentajes po ON dv.categoria = po.id_porcentajes
-- LEFT JOIN unidad u ON p.unidad_id_unidad = u.id_unidad
-- LEFT JOIN categorias sca ON p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0
-- LEFT JOIN categorias sca_padre ON sca.idp = sca_padre.id_categorias
-- LEFT JOIN categorias ca ON p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0
-- WHERE v.fecha_venta BETWEEN '2025-01-01' AND '2025-02-01' AND a.idempresa = 74 AND pb.estado = 1 AND v.estado = 1
-- ORDER BY
-- v.id_venta ASC,
-- v.fecha_venta ASC



-- SELECT mp.idmetodopago FROM metodopago mp WHERE mp.idempresa = 50;

-- alter table add column tipo int AFTER monto

-- alter table ventas_no_despachadas add column tipo int After estado

-- # SELECT DISTINCT
-- # v.id_venta
-- # FROM punto_venta pv 
-- # inner JOIN almacen a on pv.idalmacen = a.id_almacen
-- # inner JOIN productos_almacen pa on pa.almacen_id_almacen = a.id_almacen 
-- # inner JOIN productos p on p.id_productos = pa.productos_id_productos
-- # inner JOIN detalle_venta dv on dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
-- # inner JOIN venta v on v.id_venta = dv.venta_id_venta
-- # WHERE v.fecha_venta = '2025-07-09'  and pv.idpunto_venta = 58


-- # select sum(v.monto_total) from venta v where v.id_venta in (5276,5277,5278) and v.id_venta not in (5276)

-- # select 
-- # v.*
-- # from venta v 
-- # inner join detalle_venta dv on dv.venta_id_venta = v.id_venta
-- # inner join productos_almacen pa on pa.id_productos_almacen = dv.productos_almacen_id_productos_almacen
-- # inner join almacen a on a.id_almacen = pa.almacen_id_almacen
-- # inner join punto_venta pv on pv.idalmacen = a.id_almacen
-- # where v.fecha_venta = '2025-07-09'  and pv.idpunto_venta = 58


-- # SELECT DISTINCT
-- # ig.id_ingreso
-- # AS monto
-- # FROM punto_venta pv
-- # LEFT JOIN almacen a ON pv.idalmacen = a.id_almacen 
-- # LEFT JOIN ingreso ig ON ig.almacen_id_almacen = a.id_almacen
-- # LEFT JOIN detalle_ingreso di ON di.ingreso_id_ingreso = ig.id_ingreso
-- # WHERE ig.fecha_ingreso = '2025-07-09' 
-- #   AND pv.idpunto_venta = 58; -- sum(di.precio_unitario * di.cantidad)

-- # SELECT sum(di.precio_unitario * di.cantidad) FROM ingreso i 
-- # inner join detalle_ingreso di on di.ingreso_id_ingreso = i.id_ingreso
-- # where i.id_ingreso in (1567,1568) 

-- # SELECT 
-- # v.id_venta
-- # FROM punto_venta pv 
-- # LEFT JOIN almacen a on pv.idalmacen = a.id_almacen
-- # LEFT JOIN productos_almacen pa on pa.almacen_id_almacen = a.id_almacen 
-- # LEFT JOIN productos p on p.id_productos = pa.productos_id_productos
-- # LEFT JOIN detalle_venta dv on dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen 
-- # LEFT JOIN venta v on v.id_venta = dv.venta_id_venta
-- # inner JOIN anulaciones anl on anl.venta_id_venta = dv.venta_id_venta
-- # WHERE v.fecha_venta = '2025-07-09' and pv.idpunto_venta = 58





-- # alter table inv_externo
-- # add column  latitud double,
-- # add column longitud double;




-- # 				select 
-- #         co.id_cotizacion,
-- #         c.id_cliente as idcliente,
-- #         c.nombre as cliente,
-- #         c.nombrecomercial,
-- #         s.id_sucursal as idsucursal,
-- #         s.nombre as sucursal,
-- #         co.fecha_cotizacion,
-- #         c.direccion, 
-- #         c.nit, 
-- #         c.email, 
-- #         co.monto_total, 
-- #         co.descuento,
-- #         co.id_usuario,
-- #         d.nombre as divisa,
-- #         d.monedasin, 
-- #         a.id_almacen as idalmacen,
-- #         a.nombre as almacen
-- #         from cotizacion co
-- #         inner join cliente c on co.cliente_id_cliente=c.id_cliente
-- #         inner join sucursal s on co.idsucursal=s.id_sucursal
-- #         inner join divisas d on co.divisas_id_divisas=d.id_divisas
-- #         inner join detalle_cotizacion dc on dc.cotizacion_id_cotizacion = co.id_cotizacion
-- #         inner join productos_almacen pa on pa.id_productos_almacen = dc.productos_almacen_id_productos_almacen
-- #         inner join almacen a on a.id_almacen = pa.almacen_id_almacen
-- #         where co.id_cotizacion = 111








-- # SELECT 
-- #   ec.id_estado_cobro AS idcredito,
-- #   v.cliente_id_cliente1 AS idcliente,
-- #   CONCAT(c.nombre, ' - ', c.nombrecomercial, ' - ', c.ciudad) AS razonsocial,
-- #   ec.venta_id_venta AS idventa,
-- #   ec.Ncuotas AS ncuotas,
-- #   ec.valorcuotas AS valorcuotas,
-- #   ec.saldo,
-- #   ec.fecha_limite AS fechalimite,
-- #   ec.estado,
-- #   v.fecha_venta AS fechaventa,
-- #   pa.almacen_id_almacen AS idalmacen,
-- #   v.monto_total AS montoventa,
-- #   (
-- #       SELECT SUM(dc.ncuotas) 
-- #       FROM detalle_cobro dc 
-- #       WHERE dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro and dc.fecha_actual <= '2025-07-06'
-- #   ) AS cuotaspagadas,
-- #   s.nombre AS sucursal,
-- #   (
-- #       SELECT SUM(dc.monto) 
-- #       FROM detalle_cobro dc 
-- #       WHERE dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro and dc.fecha_actual <= '2025-07-06'
-- #   ) AS totalcobrado,
-- #   v.idsucursal
-- # FROM estado_cobro ec
-- # LEFT JOIN venta v ON ec.venta_id_venta = v.id_venta
-- # LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal
-- # LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
-- # LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- # LEFT JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
-- # LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
-- # WHERE pa.almacen_id_almacen IN (93,97,103,18)
-- # AND v.fecha_venta <= '2025-07-06'
-- # GROUP BY ec.id_estado_cobro
-- # ORDER BY ec.id_estado_cobro ASC


-- # SELECT
-- #   dc.fecha_actual,
-- #   c.id_cliente AS idcliente,
-- #   c.nombre ,
-- #   c.nombrecomercial,
-- #   v.tipo_venta,
-- #   v.monto_total,
-- #   v.descuento,
-- #   ec.saldo,
-- #   dc.iddetalle_cobro,
-- #   dc.monto AS detalle_monto,
-- #   dc.foto,
-- #   pa.almacen_id_almacen AS idalmacen,
-- #   a.nombre AS nombre_almacen,
-- #   s.nombre AS sucursal,
-- #   v.idsucursal
-- # FROM detalle_cobro dc
-- # INNER JOIN estado_cobro ec ON dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro
-- # INNER JOIN venta v ON ec.venta_id_venta = v.id_venta
-- # INNER JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
-- # LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
-- # LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- # LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
-- # LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal
-- # WHERE dc.fecha_actual BETWEEN '2020-01-01' AND '2025-06-01'
-- # AND pa.almacen_id_almacen IN (73)
-- # GROUP BY dc.iddetalle_cobro
-- # ORDER BY dc.fecha_actual













-- # INSERT INTO venta (
-- #   fecha_venta,
-- #   tipo_venta,
-- #   monto_total,
-- #   descuento,
-- #   tipo_pago,
-- #   cliente_id_cliente1,
-- #   divisas_id_divisas,
-- #   id_usuario,
-- #   nfactura,
-- #   idsucursal,
-- #   idcampaña,
-- #   nroventa,
-- #   estado,
-- #   idcanal,
-- #   codigoventa
-- # ) VALUES (
-- #   '2025-07-07',    -- fecha_venta
-- #   1,               -- tipo_venta
-- #   175,          -- monto_total
-- #   0,           -- descuento
-- #   'contado',      -- tipo_pago
-- #   1819,               -- cliente_id_cliente1
-- #   31,               -- divisas_id_divisas
-- #   22,               -- id_usuario
-- #   1146,            -- nfactura (puede ser NULL)
-- #   1522,               -- idsucursal
-- #   0,               -- idcampaña
-- #   1674,     -- nroventa
-- #   1,               -- estado
-- #   4,               -- idcanal
-- #   '00153220250707001674' -- codigoventa
-- # );



-- # INSERT INTO detalle_venta (
-- #   cantidad,
-- #   precio_unitario,
-- #   productos_almacen_id_productos_almacen,
-- #   venta_id_venta,
-- #   categoria
-- # ) VALUES (
-- #   1,        -- cantidad
-- #   175,    -- precio_unitario
-- #   3349,     -- productos_almacen_id_productos_almacen (debe existir en productos_almacen)
-- #   5262,     -- venta_id_venta (debe existir en venta)
-- #   128       -- categoria (según tu lógica)
-- # );


-- # INSERT INTO ventas_facturadas (
-- #   ack_ticket,
-- #   codigoEstado,
-- #   cuf,
-- #   emission_type_cede,
-- #   fechaEmission,
-- #   numeroFactura,
-- #   shortLink,
-- #   urlSin,
-- #   xml_url,
-- #   venta_id_venta
-- # ) VALUES (
-- #   '686c20c2c5a13',                             -- ack_ticket
-- #   'VALIDADA',                              -- codigoEstado (puede ser NULL)
-- #   '86DCEAF56773783A4479A7157528A4989C7BD285C2AAEAF2829E1F74', -- cuf (Código Único de Factura)
-- #   1,                                       -- emission_type_cede (tipo de emisión)
-- #   '2025-07-07 15:32:18',                   -- fechaEmission (fecha y hora)
-- #   1146,                                    -- numeroFactura
-- #   'https://fel.emizor.com/inv/686c20c2c5a13',           -- shortLink
-- #   'https://siat.impuestos.gob.bo/consulta/QR?nit=123189023&cuf=86DCEAF56773783A4479A7157528A4989C7BD285C2AAEAF2829E1F74&numero=1146&t=2', -- urlSin
-- #   'https://emizor-web-prod.s3.amazonaws.com/company/100317/branch/451/86DCEAF56773783A4479A7157528A4989C7BD285C2AAEAF2829E1F74.xml', -- xml_url
-- #   5262                                     -- venta_id_venta (debe existir en la tabla venta)
-- # );

-- # INSERT INTO stock (
-- #   cantidad,
-- #   fecha,
-- #   codigo,
-- #   estado,
-- #   productos_almacen_id_productos_almacen
-- # ) VALUES (
-- #   9,                          -- cantidad de stock
-- #   '2025-07-07',                -- fecha del registro
-- #   'VE',          -- código identificador (puede seguir una lógica propia)
-- #   1,                           -- estado (por ejemplo: 1 = activo, 0 = inactivo)
-- #   3349                         -- productos_almacen_id_productos_almacen (clave foránea)
-- # );

-- # select * from cliente c where c.nombrecomercial like '%Paola Asis%'

-- # select pa.*, a.nombre from productos p 
-- # inner join productos_almacen pa on pa.productos_id_productos = p.id_productos 
-- # inner join almacen a on a.id_almacen = pa.almacen_id_almacen
-- # where p.codigo like '%CYG-02%' and a.idempresa = 74;
-- # 			SELECT
-- #             dc.fecha_actual,
-- #             c.id_cliente AS idcliente,
-- #             c.nombre ,
-- #             c.nombrecomercial,
-- #             v.tipo_venta,
-- #             v.monto_total,
-- #             v.descuento,
-- #             ec.saldo,
-- #             dc.iddetalle_cobro,
-- #             dc.monto AS detalle_monto,
-- #             dc.foto,
-- #             pa.almacen_id_almacen AS idalmacen,
-- #             a.nombre AS nombre_almacen,
-- #             s.nombre AS sucursal,
-- #             v.idsucursal
-- #         FROM detalle_cobro dc
-- #         INNER JOIN estado_cobro ec ON dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro
-- #         INNER JOIN venta v ON ec.venta_id_venta = v.id_venta
-- #         INNER JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
-- #         LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
-- #         LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- #         LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
-- #         LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal
-- #         WHERE dc.fecha_actual BETWEEN '2020-01-01' AND '2025-06-01'
-- #         AND pa.almacen_id_almacen IN (73)
-- #         GROUP BY dc.iddetalle_cobro
-- #         ORDER BY dc.fecha_actual
        
-- #         SELECT 
-- #         vnd.id_ventas_no_despachadas,
-- #         vnd.id_venta,
-- #         vnd.productos_almacen_id_productos_almacen,
-- #         CONCAT(p.codigo, ' - ', p.descripcion) AS producto,
-- #         al.id_almacen,
-- #         al.nombre as almacen,
-- #         vnd.cantidad_pendiente,
-- #         vnd.precio_unitario,
-- #         vnd.categoria,
-- #         vnd.fecha_venta,
-- #         vnd.estado 
-- #         FROM ventas_no_despachadas vnd 
-- #         LEFT JOIN productos_almacen pa ON pa.id_productos_almacen = vnd.productos_almacen_id_productos_almacen
-- #         LEFT JOIN almacen al ON al.id_almacen = pa.almacen_id_almacen
-- #         LEFT JOIN productos p on p.id_productos = pa.productos_id_productos  
-- #         where al.idempresa = 50;
        
        
-- # CREATE TABLE ventas_no_despachadas (
-- #   id_ventas_no_despachadas SERIAL PRIMARY KEY,
-- #   id_venta INT NOT NULL,               -- Relación con venta original
-- #   id_producto INT NOT NULL,            -- Producto vendido
-- #   cantidad_pendiente double NOT NULL, -- Cantidad vendida sin stock
-- # 	fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- #   estado INT DEFAULT 2 -- pendiente, completado, parcial
-- # );


-- # 			select
-- #             dco.id_detalle_cotizacion,
-- #             pa.id_productos_almacen as idproductoalmacen,
-- #             p.nombre,
-- #             p.descripcion,
-- #             p.caracteristicas,
-- #             p.codigo as  codigoProducto,
-- #             p.codigosin as codigoProductoSin,
-- #             p.actividadsin as codigoActividadSin,
-- #             p.unidadsin as unidadMedida,
-- #             p.codigonandina as codigoNandina
-- #             dco.cantidad,
-- #             dco.precio_unitario as precio,
-- #             dco.precio_unitario
-- #         from detalle_cotizacion dco 
-- #         LEFT join cotizacion co on dco.cotizacion_id_cotizacion=co.id_cotizacion
-- #         LEFT join productos_almacen pa on dco.productos_almacen_id_productos_almacen=pa.id_productos_almacen
-- #         LEFT join productos p on pa.productos_id_productos=p.id_productos
-- #         where dco.cotizacion_id_cotizacion='$id'
-- #         order by p.nombre desc



-- # 				select 
-- #         co.id_cotizacion,
-- #         c.id_cliente as idcliente,
-- #         c.nombre as cliente,
-- #         c.nombrecomercial,
-- #         s.id_sucursal as idsucursal,
-- #         s.nombre as sucursal,
-- #         co.fecha_cotizacion,
-- #         c.direccion, 
-- #         c.nit, 
-- #         c.email, 
-- #         co.monto_total, 
-- #         co.descuento,
-- #         co.id_usuario,
-- #         d.nombre as divisa
-- #         from cotizacion co
-- #         inner join cliente c on co.cliente_id_cliente=c.id_cliente
-- #         inner join sucursal s on co.idsucursal=s.id_sucursal
-- #         inner join divisas d on co.divisas_id_divisas=d.id_divisas
-- #         where co.id_cotizacion=67;
        
        
-- #         select * from cotizacion;



-- # select * from productos_almacen  //


-- # SELECT ra.idresponsablealmacen, ra.responsable_id_responsable, ra.almacen_id_almacen, a.nombre , ra.fecha, MD5(r.id_usuario), MD5(ra.almacen_id_almacen), a.idsucursal FROM responsablealmacen ra
-- #             LEFT JOIN responsable r on ra.responsable_id_responsable=r.id_responsable
-- #             LEFT JOIN almacen a on ra.almacen_id_almacen=a.id_almacen
-- #             WHERE r.id_empresa=74 and a.nombre like '%Santa%' and  r.id_usuario = 22 
-- #             ORDER BY ra.idresponsablealmacen desc   -- respon 14  almacen 64 santa cruz
            
            
-- # select * from productos_almacen pa where pa.almacen_id_almacen = 64
-- # select * from productos p where p.descripcion like '%Café Yungas, Molido , 250g%'; 61 

-- # update detalle_venta 
-- # set productos_almacen_id_productos_almacen = 3275 , cantidad = 12, precio_unitario = 76
-- # where id_detalle_venta = 17879;



-- # select * from productos p where p.descripcion like '%Molido'; 
-- # select v.id_venta, v.fecha_venta, concat(c.nombre, ' - ' , c.nombrecomercial) as nombre, v.tipo_venta, v.tipo_pago, v.monto_total, v.nfactura, v.descuento, pa.almacen_id_almacen, v.cliente_id_cliente1, d.tipo_divisa, s.nombre, v.estado, vf.shortLink, vf.urlSin, v.idcanal, cv.canal, v.idsucursal from venta v 
-- #         left join cliente c on v.cliente_id_cliente1=c.id_cliente
-- #         left join detalle_venta dv on v.id_venta=dv.venta_id_venta
-- #         left join sucursal s on v.idsucursal=s.id_sucursal
-- #         left join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
-- #         left join divisas d on v.divisas_id_divisas=d.id_divisas
-- #         left join canalventa cv on v.idcanal=cv.idcanalventa
-- #         LEFT JOIN ventas_facturadas vf ON v.id_venta=vf.venta_id_venta
-- #         where pa.almacen_id_almacen in ($arrayid) and v.fecha_venta between '2025-05-20' and '2025-06-27' 
-- #         group by v.id_venta
-- #         order by v.id_venta asc, v.fecha_venta ASC


-- # select * from cliente c where c.nombre like '%Iber paco%' 732 2025-05-20/2025-06-27

-- # select * from sucursal s where s.cliente_id_cliente = 732  579
-- # select * from venta v where v.id_venta = 5126
-- # select v.fecha_venta, v.monto_total, c.nombre, c.nombrecomercial from venta v 
-- # inner join cliente c on c.id_cliente = v.cliente_id_cliente1
-- # where v.nfactura = 55 and v.fecha_venta = '2021-04-13';




-- # select v.fecha_venta, v.monto_total, c.nombre, c.nombrecomercial from venta v 
-- # inner join cliente c on c.id_cliente = v.cliente_id_cliente1
-- # where v.nfactura = 1625 and v.fecha_venta = '2023-08-11';


-- # select v.fecha_venta, v.monto_total, c.nombre, c.nombrecomercial from venta v 
-- # inner join cliente c on c.id_cliente = v.cliente_id_cliente1
-- # where v.nfactura = 104 and v.fecha_venta = '2023-12-15';




-- # select v.fecha_venta, v.monto_total, c.nombre, c.nombrecomercial from venta v 
-- # inner join cliente c on c.id_cliente = v.cliente_id_cliente1
-- # where v.nfactura = 1798 and v.fecha_venta = '2023-10-31';



-- # select v.fecha_venta, v.monto_total, c.nombre, c.nombrecomercial from venta v 
-- # inner join cliente c on c.id_cliente = v.cliente_id_cliente1
-- # where v.nfactura = 1803 and v.fecha_venta = '2023-10-31';


-- # select v.fecha_venta, v.monto_total, c.nombre, c.nombrecomercial from venta v 
-- # inner join cliente c on c.id_cliente = v.cliente_id_cliente1
-- # where v.nfactura = 1792 and v.fecha_venta = '2023-10-26';


-- # select v.fecha_venta, v.monto_total, c.nombre, c.nombrecomercial from venta v 
-- # inner join cliente c on c.id_cliente = v.cliente_id_cliente1
-- # where v.nfactura = 1782 and v.fecha_venta = '2023-10-19';




-- # select * from ventas_facturadas vf where vf.numeroFactura = 1030



-- # select * from cliente c where c.nombre like "%Sociedad Inversora%" and c.idempresa = 74

-- # select * from venta v where v.cliente_id_cliente1 = 727  and v.monto_total = 1056 and v.fecha_venta = '2021-04-13'
-- # 1266	2021-04-13	0	1056	0	credito	727	31	23	27	574	0	32	1	9	00072720210413000032

-- # select * from cliente c where c.nombre like "%IC Norte S.A.%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 395 and v.fecha_venta = '2023-08-11' and v.monto_total = 2256 -- ninguno en el mes 08

-- # select * from cliente c where c.nombre like "%SUPERMERCADOS MIXTURA SRL%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 1129 and v.fecha_venta = '2023-12-15' and v.monto_total = 265 -- ninguno en el AÑO 2023


-- # select * from cliente c where c.nombre like "%WALTER POL SALINAS%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 582 and v.fecha_venta = '2023-10-31' and v.monto_total = 90 -- 
-- # 1601	2023-12-30	1	90	0	contado	582	31	19	126	323	0	331	1	4	00058220231230000331 -- SOLO HAY UNA VENTA 12 30 NRO FACTURA 126


-- # select * from cliente c where c.nombre like "%Villarroel%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 578 and v.fecha_venta = '2023-10-30' and v.monto_total = 75 -- 
-- # select * from venta v where v.cliente_id_cliente1 = 579 and v.fecha_venta = '2023-10-30' and v.monto_total = 75 --
-- # 1601	2023-12-30	1	90	0	contado	582	31	19	126	323	0	331	1	4	00058220231230000331 -- SOLO HAY UNA VENTA 12 30 NRO FACTURA 126



-- # select * from cliente c where c.nombre like "%IC Norte S.A.%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 395 and v.fecha_venta = '2023-10-26' and v.monto_total = 760 -- ninguno en el mes 10


-- # select * from cliente c where c.nombre like "%IC Norte S.A.%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 395 and v.fecha_venta = '2023-10-19' and v.monto_total = 1290 -- ninguno en el mes 10

-- # select * from cliente c where c.nombre like "%Brian Callejas Mamani%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 713 and v.fecha_venta = '2023-10-15' and v.monto_total = 420 -- ninguno en el mes 10



-- # select * from cliente c where c.nombre like "%KETAL S.A.%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 630 and v.fecha_venta = '2023-10-09' and v.monto_total = 8124 -- ninguno en el mes 10


-- # select * from cliente c where c.nombre like "%Brian Callejas Mamani%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 713 and v.fecha_venta = '2023-10-03' and v.monto_total = 370 -- ninguno en el mes 10


-- # select * from cliente c where c.nombre like "%Raul Rocha Orellana%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 1128 and v.fecha_venta = '2023-09-29' and v.monto_total = 85 -- ninguno venta



-- # select * from cliente c where c.nombre like "%Brian Callejas Mamani%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 713 and v.fecha_venta = '2023-09-20' and v.monto_total = 79 -- ninguno en el mes 9


-- # select * from cliente c where c.nombre like "%Carlos Vargas%" and c.idempresa = 74
-- # select * from venta v where v.cliente_id_cliente1 = 762 and v.fecha_venta = '2023-09-18' and v.monto_total = 30 -- ninguno
-- # select * from venta v where v.cliente_id_cliente1 = 1003 and v.fecha_venta = '2023-09-18' and v.monto_total = 30 -- solo mes 09-07




-- # select * from venta v where v.nfactura = 1029 and v.fecha_venta = '2025-05-14';  -- 4594  1809
-- # select * from venta v where v.nfactura = 1030 and v.fecha_venta = '2025-05-14';  -- 4595	3236
-- # select * from venta v where v.nfactura = 1067 and v.fecha_venta = '2025-05-28';  -- 4744	1656


-- # INSERT INTO `estado_cobro` (
-- #   `Ncuotas`,
-- #   `valorcuotas`,
-- #   `tipo_credito`,
-- #   `estado`,
-- #   `venta_id_venta`,
-- #   `fecha_limite`,
-- #   `saldo`
-- # ) VALUES
-- # (1, 1809, 45, 1, 4594, '2025-06-25', 1809),
-- # (1, 3236, 45, 1, 4595, '2025-06-25', 3236),
-- # (1, 1656, 45, 1, 4744, '2025-06-25', 1656);



-- # SELECT
-- #             dc.fecha_actual,
-- #             c.id_cliente AS idcliente,
-- #             c.nombre ,
-- #             c.nombrecomercial,
-- #             v.tipo_venta,
-- #             v.monto_total,
-- #             v.descuento,
-- #             ec.saldo,
-- #             dc.iddetalle_cobro,
-- #             dc.monto AS detalle_monto,
-- #             dc.foto,
-- #             pa.almacen_id_almacen AS idalmacen,
-- #             a.nombre AS nombre_almacen,
-- #             s.nombre AS sucursal,
-- #             v.idsucursal
-- #         FROM detalle_cobro dc
-- #         INNER JOIN estado_cobro ec ON dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro
-- #         INNER JOIN venta v ON ec.venta_id_venta = v.id_venta
-- #         INNER JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
-- #         LEFT JOIN detalle_venta dv ON v.id_venta = dv.venta_id_venta
-- #         LEFT JOIN productos_almacen pa ON dv.productos_almacen_id_productos_almacen = pa.id_productos_almacen
-- #         LEFT JOIN almacen a ON pa.almacen_id_almacen = a.id_almacen
-- #         LEFT JOIN sucursal s ON v.idsucursal = s.id_sucursal
-- #         WHERE dc.fecha_actual BETWEEN '2020-01-01' AND '2025-06-01'
-- #         AND pa.almacen_id_almacen IN (73)
-- #         GROUP BY dc.iddetalle_cobro
-- #         ORDER BY dc.fecha_actual




-- # SELECT 
-- # 	dc.fecha_actual,
-- #   c.id_cliente,
-- #   c.nombre,
-- #   c.nombrecomercial,
-- #   v.tipo_venta,
-- #   v.monto_total,
-- #   v.descuento,
-- #   ec.saldo,
-- #   dc.iddetalle_cobro,
-- #   dc.monto AS detalle_monto,
-- #   dc.foto
-- # FROM detalle_cobro dc
-- # INNER JOIN estado_cobro ec ON dc.estado_cobro_id_estado_cobro = ec.id_estado_cobro
-- # INNER JOIN venta v ON ec.venta_id_venta = v.id_venta
-- # INNER JOIN cliente c ON v.cliente_id_cliente1 = c.id_cliente
-- # WHERE dc.fecha_actual BETWEEN '2025-05-01' AND '2025-05-31' and c.idempresa = 74
-- # ORDER BY dc.fecha_actual ;



-- # SELECT pe.id_pedidos, pe.fecha_pedido, pe.observacion, pe.codigo, pe.almacen_id_almacen, ad.nombre, pe.almacen_origen, ao.nombre, pe.estado, pe.tipopedido, pe.usuario, pe.nropedido FROM pedidos pe
-- #         LEFT JOIN almacen ao on pe.almacen_origen=ao.id_almacen
-- #         LEFT JOIN almacen ad on pe.almacen_id_almacen=ad.id_almacen
-- #         WHERE pe.id_pedidos = 1882


-- # 		6		2897
-- # 		6		2898
-- # 		4		3015
-- # 		1		2893
-- # INSERT INTO `stock` (
-- #   `cantidad`,
-- #   `fecha`,
-- #   `codigo`,
-- #   `estado`,
-- #   `productos_almacen_id_productos_almacen`
-- # ) VALUES
-- # (2, '2025-06-11', 'MIC', 0, 2893);

-- # select * from ingreso i where i.codigo = "184" and i.nfactura = "1091" -- 1480
-- # select * from detalle_ingreso di where di.ingreso_id_ingreso = 1480

-- # 4330	2025-04-30	1	85	0	contado	377	31	19	1003	105	0	1445	1	4	00037720250430001445
-- # 4207	2025-04-24	1	710	0	contado	572	31	19	989	313	0	1429	1	9	00057220250424001429
-- # 4171	2025-04-22	1	230	0	contado	572	31	19	982	313	0	1417	1	9	00057220250422001417
-- # 4106	2025-04-15	1	89	0	contado	1571	31	22	968	1307	0	1395	1	4	00157120250415001395
-- # 4103	2025-04-14	1	72	0	contado	1527	31	158	967	1265	0	1394	1	4	00152720250414001394
-- # 4101	2025-04-14	3	22040	0	contado	871	31	22	15	728	0	1392	1	2	00087120250414001392
-- # 4097	2025-04-12	1	175	0	contado	1536	31	164	964	1272	0	1388	1	4	00153620250412001388
-- # 4094	2025-04-10	3	4940	0	contado	871	31	19	14	728	0	1385	1	2	00087120250410001385
-- # 4083	2025-04-10	1	87	0	contado	1536	31	164	961	1272	0	1384	1	4	00153620250410001384
-- # 3986	2025-04-03	1	750	0	contado	780	31	22	949	631	0	1368	1	4	00078020250403001368
-- # select * from cliente c where c.id_cliente = 1537
-- # INSERT INTO `estado_cobro` (
-- #   `Ncuotas`,
-- #   `valorcuotas`,
-- #   `tipo_credito`,
-- #   `estado`,
-- #   `venta_id_venta`,
-- #   `fecha_limite`,
-- #   `saldo`
-- # ) VALUES
-- # (1, 85, 45, 1, 4330, '2025-05-30', 85),
-- # (1, 710, 45, 1, 4207, '2025-05-30', 710),
-- # (1, 230, 45, 1, 4171, '2025-05-30', 230),
-- # (1, 89, 45, 1, 4106, '2025-05-30', 89),
-- # (1, 72, 45, 1, 4103, '2025-05-30', 72),
-- # (1, 22040, 45, 1, 4101, '2025-05-30', 22040),
-- # (1, 175, 45, 1, 4097, '2025-05-30', 175),
-- # (1, 4940, 45, 1, 4094, '2025-05-30', 4940),
-- # (1, 87, 45, 1, 4083, '2025-05-30', 87),
-- # (1, 750, 45, 1, 3986, '2025-05-30', 750);

-- # select ec.id_estado_cobro, v.fecha_venta,c.ciudad, concat(c.nombre , ' | ' ,  c.nombrecomercial, ' | ', c.ciudad) as cliente, ec.Ncuotas, ec.valorcuotas, ec.saldo, (v.monto_total+descuento), ec.fecha_limite, pa.almacen_id_almacen, 
-- #         (select sum(dc.ncuotas) as ncuotas from detalle_cobro dc where dc.estado_cobro_id_estado_cobro=ec.id_estado_cobro) as cuotaspagadas, ec.estado, v.nfactura, v.estado, su.nombre, (select sum(dc.monto) as cobro from detalle_cobro dc where dc.estado_cobro_id_estado_cobro=ec.id_estado_cobro) as totalcobro from estado_cobro ec
-- #                 LEFT join venta v on ec.venta_id_venta=v.id_venta
-- #                 LEFT join cliente c on v.cliente_id_cliente1=c.id_cliente
-- #                 LEFT JOIN sucursal su ON v.idsucursal=su.id_sucursal
-- #                 LEFT join detalle_venta dv on v.id_venta=dv.venta_id_venta
-- #                 LEFT join productos_almacen pa on dv.productos_almacen_id_productos_almacen=pa.id_productos_almacen
-- #                 where c.idempresa=74
-- #                 group by ec.id_estado_cobro
-- #                 order by ec.id_estado_cobro DESC


-- # select * from venta v where v.nfactura = 1027

-- # select * from cliente c where c.id_cliente = 336

-- # select * from canalventa cv where cv.idempresa = 74
-- # select * from email limit 1
-- # select * from proveedor p where p.nombre like '%luz y fuerza%'
-- # SELECT
-- #         pa.id_productos_almacen,
-- #         al.nombre AS nombre_almacen,
-- #         p.codigo,
-- #         p.cod_barras,
-- #         p.nombre AS nombre_producto,
-- #         p.descripcion,
-- #         pa.pais,
-- #         u.nombre AS nombre_unidad,
-- #         p.caracteristicas,
-- #         pa.stock_minimo,
-- #         s.cantidad AS ultima_cantidad_stock,
-- #         pa.fecha_registro,
-- #         al.id_almacen,
-- #         pa.estado,
-- #         m.nombre_medida,
-- #         pa.productos_id_productos,
-- #         ep.tipos_estado,
-- #         pa.stock_maximo,
-- #         p.imagen,
-- #         s.id_stock,
-- #         COALESCE(
-- #             ca.id_categorias,
-- #             sca_padre.id_categorias
-- #         ) AS id_categoria,
-- #         COALESCE(sca.id_categorias, '') AS id_subcategoria,
-- #         COALESCE(ca.nombre, sca_padre.nombre) AS nombre_categoria,
-- #         COALESCE(sca.nombre, '') AS nombre_subcategoria,
-- #         pb.precio,
-- #         pa.pais
-- #     FROM
-- #         productos_almacen AS pa
-- #     LEFT JOIN almacen AS al
-- #     ON
-- #         pa.almacen_id_almacen = al.id_almacen
-- #     LEFT JOIN productos AS p
-- #     ON
-- #         pa.productos_id_productos = p.id_productos
-- #     LEFT JOIN precio_base AS pb
-- #     ON
-- #         pa.id_productos_almacen = pb.productos_almacen_id_productos_almacen and pb.estado = 1
-- #     LEFT JOIN unidad AS u
-- #     ON
-- #         u.id_unidad = p.unidad_id_unidad
-- #     LEFT JOIN medida AS m
-- #     ON
-- #         m.id_medida = p.medida_id_medida
-- #     LEFT JOIN categorias sca ON
-- #         p.categorias_id_categorias = sca.id_categorias AND sca.idp != 0 AND sca.id_empresa = 54
-- #     LEFT JOIN categorias sca_padre ON
-- #         sca.idp = sca_padre.id_categorias
-- #     LEFT JOIN categorias ca ON
-- #         p.categorias_id_categorias = ca.id_categorias AND ca.idp = 0 AND ca.id_empresa = 54
-- #     LEFT JOIN estados_productos AS ep
-- #     ON
-- #         p.estados_productos_id_estados_productos = ep.id_estados_productos
-- #    LEFT JOIN(
-- #         SELECT
-- #             id_stock,
-- #             productos_almacen_id_productos_almacen,
-- #             cantidad,
            
-- #             ROW_NUMBER() OVER(
-- #                 PARTITION BY productos_almacen_id_productos_almacen
-- #                 ORDER BY
                   
-- #                     id_stock DESC
-- #             ) AS rn
-- #         FROM
-- #             stock
-- #         WHERE
-- #             (estado = '2' or estado = '1') and fecha <= '2025-05-31' ORDER BY fecha DESC                 -- ADD THIS LINE FOR THE DATE FILTER
-- #     ) AS s
-- #         ON
-- #             pa.id_productos_almacen = s.productos_almacen_id_productos_almacen  AND s.rn = 1 AND pb.estado = 1
-- #         WHERE
-- #             p.idempresa = 54  and pa.almacen_id_almacen=41
-- #         ORDER BY
-- #             pa.id_productos_almacen
-- #         DESC

--  -- select * from stock s where s.productos_almacen_id_productos_almacen = 4956 and s.fecha <= '2025-05-31'
-- -- 54 41

-- -- select * from stock s where s.productos_almacen_id_productos_almacen = 4831 and s.fecha <= '2025-05-31'

-- # INSERT INTO email(idempresa,credencial)
-- # values(50,'#Richard456')



-- # # select * from cliente c
-- # # inner join venta v on c.id_cliente = v.cliente_id_cliente1
-- # # where c.id_cliente = 1656

-- # # CREATE TABLE
-- # #   `email` (
-- # #     `idemail` int(11) NOT NULL AUTO_INCREMENT,
-- # #     `idempresa` int(11) NOT NULL,
-- # #     `credencial` varchar(100) NOT NULL,

-- # #     PRIMARY KEY (`idemail`)
-- # #   ) ENGINE = InnoDB AUTO_INCREMENT = 1721 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci



-- # # INSERT INTO precio_base(precio, fecha,estado,productos_almacen_id_productos_almacen) values 
-- # # (0,'2025-06-05',1,3658),
-- # # (0,'2025-06-05',1,3657),
-- # # (0,'2025-06-05',1,3656),
-- # # (0,'2025-06-05',1,3655),
-- # # (0,'2025-06-05',1,3651);

-- # select vf.* from venta v 
-- # inner join canalventa cv on cv.idcanalventa = v.idcanal
-- # inner join ventas_facturadas vf on vf.venta_id_venta = v.id_venta
-- # where cv.idempresa = 51 and v.fecha_venta like '%2025-02%'

-- # select * from venta //4877




-- # create table vfrecuentes(
-- # 	id_vfrecuentes INT AUTO_INCREMENT PRIMARY KEY,
-- #   id_cliente INT NOT NULL,
-- #   fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  
-- # );
-- # CREATE TABLE detalle_vfrecuentes(
-- # 	iddetalle INT AUTO_INCREMENT PRIMARY KEY,
-- #   id_vfrecuentes INT NOT NULL,
-- #   id_producto INT NOT NULL,
-- #   cantidad INT NOT NULL
-- # );


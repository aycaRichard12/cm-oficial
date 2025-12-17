-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 145.14.151.51    Database: u335921272_vcomercial
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.10-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `almacen`
--

DROP TABLE IF EXISTS `almacen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `almacen` (
  `id_almacen` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `telefono` varchar(45) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `tipo_almacen_id_tipo_almacen` int(11) NOT NULL,
  `region_id_region` int(11) NOT NULL,
  `fecha_creacion` date NOT NULL,
  `stockmin` int(11) NOT NULL,
  `stockmax` int(11) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `idempresa` int(11) NOT NULL,
  `idsucursal` int(11) NOT NULL,
  PRIMARY KEY (`id_almacen`),
  KEY `fk_almacen_tipo_almacen1_idx` (`tipo_almacen_id_tipo_almacen`),
  KEY `fk_almacen_region1_idx` (`region_id_region`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `anulaciones`
--

DROP TABLE IF EXISTS `anulaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anulaciones` (
  `idanulaciones` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `motivo` varchar(100) NOT NULL,
  `venta_id_venta` int(11) NOT NULL,
  `idusuario` varchar(45) NOT NULL,
  PRIMARY KEY (`idanulaciones`)
) ENGINE=InnoDB AUTO_INCREMENT=378 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_anulaciones_inv_insert
AFTER INSERT ON anulaciones
FOR EACH ROW
BEGIN
    
    INSERT INTO inventario (
        productos_almacen_id_productos_almacen,
        fecha,
        tipo_movimiento,
        id_origen,
        detalle_inventario,
        cantidad,
        precio
    )
    SELECT
        dv.productos_almacen_id_productos_almacen,
        NEW.fecha,
        'ANULADA',
        NEW.venta_id_venta,
        NEW.motivo,
        dv.cantidad,
        dv.precio_unitario
    FROM detalle_venta dv
    WHERE dv.venta_id_venta = NEW.venta_id_venta;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cambios`
--

DROP TABLE IF EXISTS `cambios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cambios` (
  `id_cambios` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(45) NOT NULL,
  `autorizacion` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `productos_id_productos` int(11) NOT NULL,
  PRIMARY KEY (`id_cambios`),
  KEY `fk_cambios_almacen1_idx` (`almacen_id_almacen`),
  KEY `fk_cambios_productos1_idx` (`productos_id_productos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campañas`
--

DROP TABLE IF EXISTS `campañas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campañas` (
  `id_campañas` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `fechainicio` date NOT NULL,
  `fechafinal` date NOT NULL,
  `porcentage` float NOT NULL,
  `estado` int(11) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_campañas`),
  KEY `fk_campañas_almacen1_idx` (`almacen_id_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `canalventa`
--

DROP TABLE IF EXISTS `canalventa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `canalventa` (
  `idcanalventa` int(11) NOT NULL AUTO_INCREMENT,
  `canal` varchar(100) NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `estado` int(11) NOT NULL,
  `idempresa` int(11) NOT NULL,
  PRIMARY KEY (`idcanalventa`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categorias` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `idp` int(11) NOT NULL,
  PRIMARY KEY (`id_categorias`)
) ENGINE=InnoDB AUTO_INCREMENT=583 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categorias_campañas`
--

DROP TABLE IF EXISTS `categorias_campañas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_campañas` (
  `id_categorias_campañas` int(11) NOT NULL AUTO_INCREMENT,
  `porcentajes_id_porcentajes` int(11) NOT NULL,
  `campañas_id_campañas` int(11) NOT NULL,
  PRIMARY KEY (`id_categorias_campañas`),
  KEY `fk_categorias_campañas_porcentajes1_idx` (`porcentajes_id_porcentajes`),
  KEY `fk_categorias_campañas_campañas1_idx` (`campañas_id_campañas`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `nombrecomercial` varchar(100) NOT NULL,
  `tipo` int(11) NOT NULL,
  `codigo` varchar(100) NOT NULL,
  `nit` varchar(45) NOT NULL,
  `detalle` text DEFAULT NULL,
  `direccion` varchar(45) NOT NULL,
  `telefono` varchar(45) DEFAULT NULL,
  `mobil` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `web` varchar(45) DEFAULT NULL,
  `pais` varchar(45) NOT NULL,
  `ciudad` varchar(45) NOT NULL,
  `zona` varchar(45) DEFAULT NULL,
  `contacto` varchar(45) DEFAULT NULL,
  `idempresa` int(11) NOT NULL,
  `tipodocumento` varchar(45) NOT NULL,
  `canal` int(11) NOT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=1907 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `condiciones`
--

DROP TABLE IF EXISTS `condiciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `condiciones` (
  `id_condiciones` int(11) NOT NULL AUTO_INCREMENT,
  `texto` varchar(240) NOT NULL,
  `estado` int(11) NOT NULL,
  `idempresa` int(11) NOT NULL,
  PRIMARY KEY (`id_condiciones`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configuracion_inicial`
--

DROP TABLE IF EXISTS `configuracion_inicial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_inicial` (
  `idempresa` int(11) NOT NULL,
  `fecha_ejecucion` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` varchar(20) NOT NULL DEFAULT 'Ejecutado',
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`idempresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `control_inventario`
--

DROP TABLE IF EXISTS `control_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `control_inventario` (
  `id_control_inventario` int(11) NOT NULL AUTO_INCREMENT,
  `metodo_control` varchar(10) NOT NULL,
  `idempresa` int(11) NOT NULL,
  `estado` int(11) NOT NULL DEFAULT 1,
  `fecha_creacion` date NOT NULL,
  `fecha_finalizacion` date NOT NULL,
  PRIMARY KEY (`id_control_inventario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cotizacion`
--

DROP TABLE IF EXISTS `cotizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cotizacion` (
  `id_cotizacion` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_cotizacion` date NOT NULL,
  `monto_total` float NOT NULL,
  `descuento` float NOT NULL,
  `cliente_id_cliente` int(11) NOT NULL,
  `divisas_id_divisas` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `idsucursal` int(11) NOT NULL,
  `estado` int(11) DEFAULT NULL,
  `idcanal` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_cotizacion`),
  KEY `fk_venta_cliente1_idx` (`cliente_id_cliente`),
  KEY `fk_cotizacion_divisas1_idx` (`divisas_id_divisas`)
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_campañas`
--

DROP TABLE IF EXISTS `detalle_campañas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_campañas` (
  `id_detalle_campañas` int(11) NOT NULL AUTO_INCREMENT,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  `precio` float NOT NULL,
  `categorias_campañas_id_categorias_campañas` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_campañas`),
  KEY `fk_detalle_campañas_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`),
  KEY `fk_detalle_campañas_categorias_campañas1_idx` (`categorias_campañas_id_categorias_campañas`)
) ENGINE=InnoDB AUTO_INCREMENT=252 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_cobro`
--

DROP TABLE IF EXISTS `detalle_cobro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_cobro` (
  `iddetalle_cobro` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_actual` date NOT NULL,
  `ncuotas` int(11) NOT NULL,
  `valor_cuotas` float NOT NULL,
  `monto` float NOT NULL,
  `estado_cobro_id_estado_cobro` int(11) NOT NULL,
  `foto` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`iddetalle_cobro`),
  KEY `fk_detalle_cobro_estado_cobro1_idx` (`estado_cobro_id_estado_cobro`)
) ENGINE=InnoDB AUTO_INCREMENT=1246 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_cotizacion`
--

DROP TABLE IF EXISTS `detalle_cotizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_cotizacion` (
  `id_detalle_cotizacion` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` float NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  `cotizacion_id_cotizacion` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_cotizacion`),
  KEY `fk_detalle_venta_venta1_idx` (`cotizacion_id_cotizacion`),
  KEY `fk_detalle_venta_productos1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_devolucion`
--

DROP TABLE IF EXISTS `detalle_devolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_devolucion` (
  `iddetalle_devolucion` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio` float NOT NULL,
  `devoluciones_iddevoluciones` int(11) NOT NULL,
  `cantidadperdida` int(11) NOT NULL,
  `devoluciones_id_devoluciones` int(11) NOT NULL,
  `producto_almacen_id_producto_almacen` int(11) NOT NULL,
  PRIMARY KEY (`iddetalle_devolucion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_ingreso`
--

DROP TABLE IF EXISTS `detalle_ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ingreso` (
  `id_detalle_ingreso` int(11) NOT NULL AUTO_INCREMENT,
  `precio_unitario` float NOT NULL,
  `cantidad` int(11) NOT NULL,
  `ingreso_id_ingreso` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_ingreso`),
  KEY `fk_detalle_ingreso_ingreso1_idx` (`ingreso_id_ingreso`),
  KEY `fk_detalle_ingreso_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=6505 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_invexterno`
--

DROP TABLE IF EXISTS `detalle_invexterno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_invexterno` (
  `id_detalle_invexterno` int(11) NOT NULL AUTO_INCREMENT,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  `fechavencimiento` date NOT NULL,
  `cantidad` int(11) NOT NULL,
  `inv_externo_id_inv_externo` int(11) NOT NULL,
  `latitud` double(10,7) DEFAULT NULL,
  `longitud` double(10,7) DEFAULT NULL,
  PRIMARY KEY (`id_detalle_invexterno`),
  KEY `fk_detalle_invexterno_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`),
  KEY `fk_detalle_invexterno_inv_externo1_idx` (`inv_externo_id_inv_externo`)
) ENGINE=InnoDB AUTO_INCREMENT=2766 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_mermas`
--

DROP TABLE IF EXISTS `detalle_mermas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_mermas` (
  `id_detalle_mermas` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `mermas_desperdicios_id_mermas_desperdicios` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_mermas`),
  KEY `fk_detalle_mermas_mermas_desperdicios1_idx` (`mermas_desperdicios_id_mermas_desperdicios`),
  KEY `fk_detalle_mermas_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=2018 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_mermas_inv_insert
AFTER INSERT ON detalle_mermas
FOR EACH ROW
BEGIN
    DECLARE fecha_merma_actual DATETIME;
    
    SELECT fecha_informe INTO fecha_merma_actual
    FROM mermas_desperdicios
    WHERE id_mermas_desperdicios = NEW.mermas_desperdicios_id_mermas_desperdicios;
    
    INSERT INTO inventario (
        productos_almacen_id_productos_almacen,
        fecha,
        tipo_movimiento,
        id_origen,
        detalle_inventario,
        cantidad
    )
    VALUES (
        NEW.productos_almacen_id_productos_almacen,
        fecha_merma_actual,
        'MERMA',
        NEW.mermas_desperdicios_id_mermas_desperdicios,
        'Salida de inventario por pérdida',
        NEW.cantidad 
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `detalle_movimiento`
--

DROP TABLE IF EXISTS `detalle_movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_movimiento` (
  `id_detalle_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `movimiento_id_movimiento` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_movimiento`),
  KEY `fk_detalle_movimiento_movimiento1_idx` (`movimiento_id_movimiento`),
  KEY `fk_detalle_movimiento_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=14728 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalle_robo`
--

DROP TABLE IF EXISTS `detalle_robo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_robo` (
  `id_detalle_robo` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `robos_id_robos` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_robo`),
  KEY `fk_detalle_robo_robos1_idx` (`robos_id_robos`),
  KEY `fk_detalle_robo_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_robos_inv_insert
AFTER INSERT ON detalle_robo
FOR EACH ROW
BEGIN
    DECLARE fecha_robo_actual DATETIME;
    
    SELECT fecha_registro INTO fecha_robo_actual
    FROM robos
    WHERE id_robos = NEW.robos_id_robos;
    
    INSERT INTO inventario (
        productos_almacen_id_productos_almacen,
        fecha,
        tipo_movimiento,
        id_origen,
        detalle_inventario,
        cantidad
    )
    VALUES (
        NEW.productos_almacen_id_productos_almacen,
        fecha_robo_actual,
        'ROBO',
        NEW.robos_id_robos,
        'Salida de inventario por pérdida',
        NEW.cantidad 
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` float NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  `venta_id_venta` int(11) NOT NULL,
  `categoria` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `fk_detalle_venta_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`),
  KEY `fk_detalle_venta_venta2_idx` (`venta_id_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=20315 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_venta_inv_insert
AFTER INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    DECLARE fecha_venta_actual DATETIME;

    
    SELECT fecha_venta INTO fecha_venta_actual
    FROM venta
    WHERE id_venta = NEW.venta_id_venta;

    
    INSERT INTO inventario (
        productos_almacen_id_productos_almacen,
        fecha,
        tipo_movimiento,
        id_origen,
        detalle_inventario,
        cantidad,
        precio
    )
    VALUES (
        NEW.productos_almacen_id_productos_almacen,
        fecha_venta_actual,
        'VENTA',
        NEW.venta_id_venta,
        'Salida por venta',
        NEW.cantidad, 
        NEW.precio_unitario
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `detalle_vfrecuentes`
--

DROP TABLE IF EXISTS `detalle_vfrecuentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_vfrecuentes` (
  `iddetalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_vfrecuentes` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  PRIMARY KEY (`iddetalle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalles_pedidos`
--

DROP TABLE IF EXISTS `detalles_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalles_pedidos` (
  `id_detalle_pedido` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `observacion` varchar(200) NOT NULL,
  `pedidos_id_pedidos` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_pedido`),
  KEY `fk_detalles_pedidos_pedidos1_idx` (`pedidos_id_pedidos`),
  KEY `fk_detalles_pedidos_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=4895 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `devoluciones`
--

DROP TABLE IF EXISTS `devoluciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devoluciones` (
  `id_devoluciones` int(11) NOT NULL AUTO_INCREMENT,
  `autorizacion` int(11) NOT NULL,
  `fecha_devolucion` datetime NOT NULL,
  `motivo` varchar(500) NOT NULL,
  `venta_id_venta` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  PRIMARY KEY (`id_devoluciones`),
  KEY `fk_devoluciones_venta1_idx` (`motivo`),
  KEY `fk_devoluciones_factura1_idx` (`venta_id_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `divisas`
--

DROP TABLE IF EXISTS `divisas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `divisas` (
  `id_divisas` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `tipo_divisa` varchar(45) NOT NULL,
  `estado` int(11) NOT NULL,
  `idempresa` varchar(45) NOT NULL,
  `monedasin` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_divisas`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email`
--

DROP TABLE IF EXISTS `email`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email` (
  `idemail` int(11) NOT NULL AUTO_INCREMENT,
  `credencial` varchar(100) NOT NULL,
  `sendemail` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idemail`)
) ENGINE=InnoDB AUTO_INCREMENT=1722 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estado_cobro`
--

DROP TABLE IF EXISTS `estado_cobro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_cobro` (
  `id_estado_cobro` int(11) NOT NULL AUTO_INCREMENT,
  `Ncuotas` int(11) NOT NULL,
  `valorcuotas` float NOT NULL,
  `tipo_credito` int(11) NOT NULL,
  `estado` int(11) NOT NULL,
  `venta_id_venta` int(11) NOT NULL,
  `fecha_limite` date NOT NULL,
  `saldo` float NOT NULL,
  PRIMARY KEY (`id_estado_cobro`),
  KEY `fk_estado_cobro_factura1_idx` (`estado`),
  KEY `fk_estado_cobro_venta1_idx` (`venta_id_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=1902 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estados_productos`
--

DROP TABLE IF EXISTS `estados_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_productos` (
  `id_estados_productos` int(11) NOT NULL AUTO_INCREMENT,
  `tipos_estado` varchar(45) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `estado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  PRIMARY KEY (`id_estados_productos`)
) ENGINE=InnoDB AUTO_INCREMENT=200 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ingreso`
--

DROP TABLE IF EXISTS `ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingreso` (
  `id_ingreso` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_ingreso` date NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `codigo` varchar(45) NOT NULL,
  `autorizacion` varchar(45) NOT NULL,
  `proveedor_id_proveedor` int(11) NOT NULL,
  `pedidos_id_pedidos` int(11) NOT NULL,
  `estado` int(11) NOT NULL,
  `nfactura` varchar(45) NOT NULL,
  `tipocompra` int(11) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_ingreso`),
  KEY `fk_ingreso_proveedor1_idx` (`proveedor_id_proveedor`),
  KEY `fk_ingreso_pedidos1_idx` (`pedidos_id_pedidos`)
) ENGINE=InnoDB AUTO_INCREMENT=1665 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_compra_inv_insert
AFTER UPDATE ON ingreso
FOR EACH ROW
BEGIN
    
    IF OLD.autorizacion <> 1 AND NEW.autorizacion = 1 THEN
        INSERT INTO inventario (
            productos_almacen_id_productos_almacen,
            fecha,
            tipo_movimiento,
            id_origen,
            detalle_inventario,
            cantidad,
            precio
        )
        SELECT
            di.productos_almacen_id_productos_almacen,
            NEW.fecha_ingreso,
            'COMPRA',
            NEW.id_ingreso,
            'Ingreso por compra',
            di.cantidad,
            di.precio_unitario
        FROM detalle_ingreso di
        WHERE di.ingreso_id_ingreso = NEW.id_ingreso;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `inv_externo`
--

DROP TABLE IF EXISTS `inv_externo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inv_externo` (
  `id_inv_externo` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_control` date NOT NULL,
  `cliente_id_cliente` int(11) NOT NULL,
  `idsucursal` int(11) DEFAULT NULL,
  `observaciones` varchar(250) NOT NULL,
  `foto` varchar(100) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `id_almacen` int(11) NOT NULL,
  `estado` int(11) NOT NULL,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  PRIMARY KEY (`id_inv_externo`),
  KEY `fk_inv_externo_cliente1_idx` (`cliente_id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=548 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_inventario` int(11) NOT NULL AUTO_INCREMENT,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo_movimiento` varchar(60) NOT NULL,
  `id_origen` int(11) NOT NULL,
  `detalle_inventario` varchar(100) DEFAULT NULL,
  `cantidad` double NOT NULL,
  `precio` double NOT NULL,
  PRIMARY KEY (`id_inventario`)
) ENGINE=InnoDB AUTO_INCREMENT=475 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leyendas`
--

DROP TABLE IF EXISTS `leyendas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leyendas` (
  `idleyendas` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `codigosin` int(11) NOT NULL,
  `estado` int(11) NOT NULL,
  `idempresa` int(11) NOT NULL,
  PRIMARY KEY (`idleyendas`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_errores`
--

DROP TABLE IF EXISTS `log_errores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_errores` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `modulo` varchar(100) DEFAULT NULL,
  `tipo_error` varchar(50) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `datos_entrada` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_entrada`)),
  `usuario_id` int(11) DEFAULT NULL,
  `idempresa` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_log`)
) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `log_eventos`
--

DROP TABLE IF EXISTS `log_eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_eventos` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `accion` varchar(10) NOT NULL,
  `tabla_afectada` varchar(50) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha_evento` date NOT NULL,
  `hora_evento` time NOT NULL,
  `observaciones` text DEFAULT NULL,
  `datos_anteriores` text DEFAULT NULL,
  `datos_nuevos` text DEFAULT NULL,
  PRIMARY KEY (`id_log`)
) ENGINE=InnoDB AUTO_INCREMENT=572 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medida`
--

DROP TABLE IF EXISTS `medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medida` (
  `id_medida` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_medida` varchar(45) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `estado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  PRIMARY KEY (`id_medida`)
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `medidores`
--

DROP TABLE IF EXISTS `medidores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medidores` (
  `idmedidores` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `valor` float NOT NULL,
  `color` varchar(45) NOT NULL,
  `tipo` int(11) NOT NULL,
  `idempresa` int(11) NOT NULL,
  PRIMARY KEY (`idmedidores`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mermas_desperdicios`
--

DROP TABLE IF EXISTS `mermas_desperdicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mermas_desperdicios` (
  `id_mermas_desperdicios` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_informe` date NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `autorizacion` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `devoluciones_id_devoluciones` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_mermas_desperdicios`),
  KEY `fk_mermas_desperdicios_almacen1_idx` (`almacen_id_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=617 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metodopago`
--

DROP TABLE IF EXISTS `metodopago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodopago` (
  `idmetodopago` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `codigosin` int(11) DEFAULT NULL,
  `estado` int(11) NOT NULL,
  `idempresa` int(11) NOT NULL,
  PRIMARY KEY (`idmetodopago`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `movimiento`
--

DROP TABLE IF EXISTS `movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_movimiento` date NOT NULL,
  `almacen_destino` int(11) NOT NULL,
  `autorizacion` int(11) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `codigo` varchar(45) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_movimiento_almacen1_idx` (`almacen_id_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=2228 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagoVenta`
--

DROP TABLE IF EXISTS `pagoVenta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagoVenta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `id_canalventa` int(11) NOT NULL,
  `porcentaje` decimal(10,2) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_id_venta` (`id_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id_pedidos` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_pedido` date NOT NULL,
  `autorizacion` int(11) NOT NULL,
  `observacion` varchar(200) DEFAULT NULL,
  `codigo` varchar(45) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `estado` int(11) NOT NULL,
  `tipopedido` int(11) NOT NULL,
  `almacen_origen` int(11) NOT NULL,
  `usuario` int(11) NOT NULL,
  `nropedido` int(11) NOT NULL,
  `ruta_recibo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_pedidos`),
  KEY `fk_pedidos_almacen1_idx` (`almacen_id_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=1944 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `porcentajes`
--

DROP TABLE IF EXISTS `porcentajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `porcentajes` (
  `id_porcentajes` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(45) NOT NULL,
  `porcentaje` varchar(45) NOT NULL,
  `autorizado` int(11) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_porcentajes`)
) ENGINE=InnoDB AUTO_INCREMENT=227 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `precio_base`
--

DROP TABLE IF EXISTS `precio_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `precio_base` (
  `id_precio_base` int(11) NOT NULL AUTO_INCREMENT,
  `precio` float NOT NULL,
  `fecha` date NOT NULL,
  `estado` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  PRIMARY KEY (`id_precio_base`),
  KEY `fk_precio_base_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=2627 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `precio_sugerido`
--

DROP TABLE IF EXISTS `precio_sugerido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `precio_sugerido` (
  `id_precio_sugerido` int(11) NOT NULL AUTO_INCREMENT,
  `precio` float NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  `porcentajes_id_porcentajes` int(11) NOT NULL,
  PRIMARY KEY (`id_precio_sugerido`),
  KEY `fk_precio_sugerido_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`),
  KEY `fk_precio_sugerido_porcentajes1_idx` (`porcentajes_id_porcentajes`)
) ENGINE=InnoDB AUTO_INCREMENT=4576 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_productos` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `codigo` varchar(45) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `cod_barras` varchar(100) NOT NULL,
  `fecha_registro` date NOT NULL,
  `imagen` varchar(200) NOT NULL,
  `categorias_id_categorias` int(11) NOT NULL,
  `medida_id_medida` int(11) NOT NULL,
  `estados_productos_id_estados_productos` int(11) NOT NULL,
  `unidad_id_unidad` int(11) NOT NULL,
  `caracteristicas` varchar(150) DEFAULT NULL,
  `idempresa` varchar(45) NOT NULL,
  `codigosin` varchar(45) DEFAULT NULL,
  `actividadsin` varchar(45) DEFAULT NULL,
  `unidadsin` varchar(45) DEFAULT NULL,
  `codigonandina` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_productos`),
  KEY `fk_productos_categorias1_idx` (`categorias_id_categorias`),
  KEY `fk_productos_medida1_idx` (`medida_id_medida`),
  KEY `fk_productos_estados_productos1_idx` (`estados_productos_id_estados_productos`),
  KEY `fk_productos_unidad1_idx` (`unidad_id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=856 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productos_almacen`
--

DROP TABLE IF EXISTS `productos_almacen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos_almacen` (
  `id_productos_almacen` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_registro` date NOT NULL,
  `estado` varchar(45) NOT NULL,
  `stock_minimo` int(11) NOT NULL,
  `stock_maximo` int(11) NOT NULL,
  `pais` varchar(45) DEFAULT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `productos_id_productos` int(11) NOT NULL,
  PRIMARY KEY (`id_productos_almacen`),
  KEY `fk_productos_almacen_almacen1_idx` (`almacen_id_almacen`),
  KEY `fk_productos_almacen_productos1_idx` (`productos_id_productos`)
) ENGINE=InnoDB AUTO_INCREMENT=5260 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `codigo` varchar(45) DEFAULT NULL,
  `nit` varchar(45) DEFAULT NULL,
  `detalle` text DEFAULT NULL,
  `direccion` varchar(45) NOT NULL,
  `telefono` varchar(45) DEFAULT NULL,
  `mobil` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `web` varchar(45) DEFAULT NULL,
  `pais` varchar(45) DEFAULT NULL,
  `ciudad` varchar(45) DEFAULT NULL,
  `zona` varchar(45) DEFAULT NULL,
  `contacto` varchar(45) DEFAULT NULL,
  `id_empresa` int(11) NOT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=1714 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `punto_venta`
--

DROP TABLE IF EXISTS `punto_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `punto_venta` (
  `idpunto_venta` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(90) NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `tipo` int(11) DEFAULT NULL,
  `codigoSucursal` varchar(45) DEFAULT NULL,
  `idalmacen` int(11) NOT NULL,
  `estadosin` int(11) NOT NULL,
  `codigosin` varchar(11) DEFAULT NULL,
  PRIMARY KEY (`idpunto_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `responsable`
--

DROP TABLE IF EXISTS `responsable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsable` (
  `id_responsable` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `id_empresa` int(11) NOT NULL,
  PRIMARY KEY (`id_responsable`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `responsable_puntoventa`
--

DROP TABLE IF EXISTS `responsable_puntoventa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsable_puntoventa` (
  `idreponsable_puntoventa` int(11) NOT NULL AUTO_INCREMENT,
  `idresponsable` int(11) NOT NULL,
  `idpuntoventa` int(11) NOT NULL,
  PRIMARY KEY (`idreponsable_puntoventa`)
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `responsablealmacen`
--

DROP TABLE IF EXISTS `responsablealmacen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsablealmacen` (
  `idresponsablealmacen` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `responsable_id_responsable` int(11) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`idresponsablealmacen`)
) ENGINE=InnoDB AUTO_INCREMENT=292 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `robos`
--

DROP TABLE IF EXISTS `robos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `robos` (
  `id_robos` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_registro` date NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `almacen_id_almacen` int(11) NOT NULL,
  `autorizacion` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  PRIMARY KEY (`id_robos`,`fecha_registro`),
  KEY `fk_robos_almacen1_idx` (`almacen_id_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `id_stock` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `codigo` varchar(45) NOT NULL,
  `estado` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) NOT NULL,
  `idorigen` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_stock`),
  KEY `fk_stock_productos_almacen1_idx` (`productos_almacen_id_productos_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=59788 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursal` (
  `id_sucursal` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `cliente_id_cliente` int(11) NOT NULL,
  PRIMARY KEY (`id_sucursal`),
  KEY `fk_sucursal_cliente1_idx` (`cliente_id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=1585 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_almacen`
--

DROP TABLE IF EXISTS `tipo_almacen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_almacen` (
  `id_tipo_almacen` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_almacen` varchar(45) NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `estado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  PRIMARY KEY (`id_tipo_almacen`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER trg_tipo_almacen_insert
AFTER INSERT ON tipo_almacen
FOR EACH ROW
BEGIN
  INSERT INTO log_eventos (
    accion,
    tabla_afectada,
    id_usuario,
    fecha_evento,
    hora_evento,
    observaciones,
    datos_anteriores,
    datos_nuevos
  ) VALUES (
    'INSERT',
    'tipo_almacen',
    NULL,
    CURDATE(),
    CURTIME(),
    'Nuevo registro en tipo_almacen',
    NULL,
    CONCAT(
      '{',
      '"id_tipo_almacen":', NEW.id_tipo_almacen, ', ',
      '"tipo_almacen":"', NEW.tipo_almacen, '", ',
      '"descripcion":"', NEW.descripcion, '", ',
      '"estado":', NEW.estado, ', ',
      '"id_empresa":', NEW.id_empresa,
      '}'
    )
  );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER trg_tipo_almacen_update
AFTER UPDATE ON tipo_almacen
FOR EACH ROW
BEGIN
  INSERT INTO log_eventos (
    accion,
    tabla_afectada,
    id_usuario,
    fecha_evento,
    hora_evento,
    observaciones,
    datos_anteriores,
    datos_nuevos
  ) VALUES (
    'UPDATE',
    'tipo_almacen',
    NULL,
    CURDATE(),
    CURTIME(),
    'Modificaci�n en tipo_almacen',
    CONCAT(
      '{',
      '"id_tipo_almacen":', OLD.id_tipo_almacen, ', ',
      '"tipo_almacen":"', OLD.tipo_almacen, '", ',
      '"descripcion":"', OLD.descripcion, '", ',
      '"estado":', OLD.estado, ', ',
      '"id_empresa":', OLD.id_empresa,
      '}'
    ),
    CONCAT(
      '{',
      '"id_tipo_almacen":', NEW.id_tipo_almacen, ', ',
      '"tipo_almacen":"', NEW.tipo_almacen, '", ',
      '"descripcion":"', NEW.descripcion, '", ',
      '"estado":', NEW.estado, ', ',
      '"id_empresa":', NEW.id_empresa,
      '}'
    )
  );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER trg_tipo_almacen_delete
AFTER DELETE ON tipo_almacen
FOR EACH ROW
BEGIN
  INSERT INTO log_eventos (
    accion,
    tabla_afectada,
    id_usuario,
    fecha_evento,
    hora_evento,
    observaciones,
    datos_anteriores,
    datos_nuevos
  ) VALUES (
    'DELETE',
    'tipo_almacen',
    NULL,
    CURDATE(),
    CURTIME(),
    'Eliminaci�n en tipo_almacen',
    CONCAT(
      '{',
      '"id_tipo_almacen":', OLD.id_tipo_almacen, ', ',
      '"tipo_almacen":"', OLD.tipo_almacen, '", ',
      '"descripcion":"', OLD.descripcion, '", ',
      '"estado":', OLD.estado, ', ',
      '"id_empresa":', OLD.id_empresa,
      '}'
    ),
    NULL
  );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tipocliente`
--

DROP TABLE IF EXISTS `tipocliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipocliente` (
  `idtipocliente` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(45) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` int(11) NOT NULL,
  `idempresa` int(11) NOT NULL,
  PRIMARY KEY (`idtipocliente`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unidad`
--

DROP TABLE IF EXISTS `unidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidad` (
  `id_unidad` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `estado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  PRIMARY KEY (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id_venta` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_venta` date NOT NULL,
  `tipo_venta` int(11) NOT NULL,
  `monto_total` float NOT NULL,
  `descuento` float NOT NULL,
  `tipo_pago` varchar(45) NOT NULL,
  `cliente_id_cliente1` int(11) NOT NULL,
  `divisas_id_divisas` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nfactura` int(11) DEFAULT NULL,
  `idsucursal` int(11) NOT NULL,
  `idcampaña` int(11) NOT NULL,
  `nroventa` int(11) NOT NULL,
  `estado` int(11) NOT NULL,
  `idcanal` int(11) NOT NULL,
  `codigoventa` varchar(45) NOT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `fk_factura_cliente1_idx` (`cliente_id_cliente1`),
  KEY `fk_factura_divisas1_idx` (`divisas_id_divisas`),
  KEY `fk_venta_responsable1_idx` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=5642 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_venta_after_insert
AFTER INSERT ON venta
FOR EACH ROW
BEGIN
    INSERT INTO log_eventos (
        accion,
        tabla_afectada,
        id_usuario,
        fecha_evento,
        hora_evento,
        observaciones,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        'INSERT',
        'venta',
        NEW.id_usuario,
        CURDATE(),
        CURTIME(),
        CONCAT('Nueva venta registrada con ID: ', NEW.id_venta),
        NULL,
        JSON_OBJECT(
            'id_venta', NEW.id_venta,
            'fecha_venta', NEW.fecha_venta,
            'tipo_venta', NEW.tipo_venta,
            'monto_total', NEW.monto_total,
            'descuento', NEW.descuento,
            'tipo_pago', NEW.tipo_pago,
            'cliente_id_cliente1', NEW.cliente_id_cliente1,
            'divisas_id_divisas', NEW.divisas_id_divisas,
            'id_usuario', NEW.id_usuario,
            'nfactura', NEW.nfactura,
            'idsucursal', NEW.idsucursal,
            'idcampaña', NEW.idcampaña,
            'nroventa', NEW.nroventa,
            'estado', NEW.estado,
            'idcanal', NEW.idcanal,
            'codigoventa', NEW.codigoventa
        )
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_venta_after_update
AFTER UPDATE ON venta
FOR EACH ROW
BEGIN
    INSERT INTO log_eventos (
        accion,
        tabla_afectada,
        id_usuario,
        fecha_evento,
        hora_evento,
        observaciones,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        'UPDATE',
        'venta',
        NEW.id_usuario,
        CURDATE(),
        CURTIME(),
        CONCAT('Venta actualizada con ID: ', OLD.id_venta),
        JSON_OBJECT(
            'id_venta', OLD.id_venta,
            'fecha_venta', OLD.fecha_venta,
            'tipo_venta', OLD.tipo_venta,
            'monto_total', OLD.monto_total,
            'descuento', OLD.descuento,
            'tipo_pago', OLD.tipo_pago,
            'cliente_id_cliente1', OLD.cliente_id_cliente1,
            'divisas_id_divisas', OLD.divisas_id_divisas,
            'id_usuario', OLD.id_usuario,
            'nfactura', OLD.nfactura,
            'idsucursal', OLD.idsucursal,
            'idcampaña', OLD.idcampaña,
            'nroventa', OLD.nroventa,
            'estado', OLD.estado,
            'idcanal', OLD.idcanal,
            'codigoventa', OLD.codigoventa
        ),
        JSON_OBJECT(
            'id_venta', NEW.id_venta,
            'fecha_venta', NEW.fecha_venta,
            'tipo_venta', NEW.tipo_venta,
            'monto_total', NEW.monto_total,
            'descuento', NEW.descuento,
            'tipo_pago', NEW.tipo_pago,
            'cliente_id_cliente1', NEW.cliente_id_cliente1,
            'divisas_id_divisas', NEW.divisas_id_divisas,
            'id_usuario', NEW.id_usuario,
            'nfactura', NEW.nfactura,
            'idsucursal', NEW.idsucursal,
            'idcampaña', NEW.idcampaña,
            'nroventa', NEW.nroventa,
            'estado', NEW.estado,
            'idcanal', NEW.idcanal,
            'codigoventa', NEW.codigoventa
        )
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`u335921272_vcomercial`@`%`*/ /*!50003 TRIGGER tr_venta_after_delete
AFTER DELETE ON venta
FOR EACH ROW
BEGIN
    INSERT INTO log_eventos (
        accion,
        tabla_afectada,
        id_usuario,
        fecha_evento,
        hora_evento,
        observaciones,
        datos_anteriores,
        datos_nuevos
    )
    VALUES (
        'DELETE',
        'venta',
        OLD.id_usuario,
        CURDATE(),
        CURTIME(),
        CONCAT('Venta eliminada con ID: ', OLD.id_venta),
        JSON_OBJECT(
            'id_venta', OLD.id_venta,
            'fecha_venta', OLD.fecha_venta,
            'tipo_venta', OLD.tipo_venta,
            'monto_total', OLD.monto_total,
            'descuento', OLD.descuento,
            'tipo_pago', OLD.tipo_pago,
            'cliente_id_cliente1', OLD.cliente_id_cliente1,
            'divisas_id_divisas', OLD.divisas_id_divisas,
            'id_usuario', OLD.id_usuario,
            'nfactura', OLD.nfactura,
            'idsucursal', OLD.idsucursal,
            'idcampaña', OLD.idcampaña,
            'nroventa', OLD.nroventa,
            'estado', OLD.estado,
            'idcanal', OLD.idcanal,
            'codigoventa', OLD.codigoventa
        ),
        NULL
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ventas_facturadas`
--

DROP TABLE IF EXISTS `ventas_facturadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_facturadas` (
  `idventas_facturadas` int(11) NOT NULL AUTO_INCREMENT,
  `ack_ticket` varchar(45) NOT NULL,
  `codigoEstado` varchar(45) DEFAULT NULL,
  `cuf` text NOT NULL,
  `emission_type_cede` int(11) NOT NULL,
  `fechaEmission` datetime NOT NULL,
  `numeroFactura` int(11) NOT NULL,
  `shortLink` text NOT NULL,
  `urlSin` text NOT NULL,
  `xml_url` text NOT NULL,
  `venta_id_venta` int(11) NOT NULL,
  PRIMARY KEY (`idventas_facturadas`)
) ENGINE=InnoDB AUTO_INCREMENT=1600 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ventas_no_despachadas`
--

DROP TABLE IF EXISTS `ventas_no_despachadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_no_despachadas` (
  `id_ventas_no_despachadas` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `productos_almacen_id_productos_almacen` int(11) DEFAULT NULL,
  `cantidad_pendiente` double NOT NULL,
  `precio_unitario` float DEFAULT NULL,
  `categoria` float DEFAULT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` int(11) DEFAULT 2,
  `tipo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_ventas_no_despachadas`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vfrecuentes`
--

DROP TABLE IF EXISTS `vfrecuentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vfrecuentes` (
  `id_vfrecuentes` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_vfrecuentes`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-13 13:46:52

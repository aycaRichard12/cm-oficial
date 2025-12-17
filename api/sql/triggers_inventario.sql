DELIMITER //

-- Eliminación de los triggers existentes para recrearlos
DROP TRIGGER IF EXISTS tr_venta_inv_insert;
DROP TRIGGER IF EXISTS tr_compra_inv_insert;
DROP TRIGGER IF EXISTS tr_anulaciones_inv_insert;
DROP TRIGGER IF EXISTS tr_robos_inv_insert;
DROP TRIGGER IF EXISTS tr_mermas_inv_insert;

-- ---
-- Trigger: Registra un movimiento de tipo 'VENTA' en el inventario
-- cada vez que se inserta un registro en la tabla 'detalle_venta'.
-- Se corrige la cantidad para que sea un valor negativo, como indica el comentario.
-- ---
CREATE TRIGGER tr_venta_inv_insert
AFTER INSERT ON detalle_venta
FOR EACH ROW
BEGIN
    DECLARE fecha_venta_actual DATETIME;

    -- Obtener la fecha de la venta
    SELECT fecha_venta INTO fecha_venta_actual
    FROM venta
    WHERE id_venta = NEW.venta_id_venta;

    -- Insertar en la tabla de inventario
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
        NEW.cantidad, -- Se usa un valor negativo para representar una salida
        NEW.precio_unitario
    );
END;
//

-- ---
-- Trigger: Registra un movimiento de tipo 'COMPRA' en el inventario
-- cada vez que se inserta un registro en la tabla 'detalle_ingreso'.
-- Se corrige el error de sintaxis en el IF y se usa el operador '='.
-- ---
CREATE TRIGGER tr_compra_inv_insert
AFTER UPDATE ON ingreso
FOR EACH ROW
BEGIN
    -- Solo registrar si el estado pasó de !=1 a 1
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
END;
//

-- ---
-- Trigger: Registra un movimiento de tipo 'ANULADA' en el inventario
-- cada vez que se inserta una anulación en la tabla 'anulaciones'.
-- Optimizado para usar una única sentencia INSERT...SELECT, sin cursor.
-- ---
CREATE TRIGGER tr_anulaciones_inv_insert
AFTER INSERT ON anulaciones
FOR EACH ROW
BEGIN
    -- Insertar los movimientos de inventario para la venta anulada
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
END;
//

-- ---
-- Trigger: Registra un movimiento de tipo 'ROBO' en el inventario
-- cada vez que se inserta un registro en la tabla 'detalle_robo'.
-- Se corrige la cantidad para que sea un valor negativo, como indica el comentario.
-- ---
CREATE TRIGGER tr_robos_inv_insert
AFTER UPDATE ON detalle_robo
FOR EACH ROW
BEGIN
    
    IF OLD.autorizacion <> 1 AND NEW.autorizacion = 1 THEN 
        INSERT INTO inventario (
            productos_almacen_id_productos_almacen,
            fecha,
            tipo_movimiento,
            id_origen,
            detalle_inventario,
            cantidad
        )
        VALUES (
            dr.productos_almacen_id_productos_almacen,
            NEW.fecha_registro,
            'ROBO',
            NEW.id_robos,
            'Salida de inventario por pérdida',
            dr.cantidad -- Se usa un valor negativo para representar una salida
        );
        SELECT
        FROM detalle_robo dr
        WHERE dr.robos_id_robos = NEW.id_robos
    END IF;
    
END;
//

-- ---
-- Trigger: Registra un movimiento de tipo 'MERMA' en el inventario
-- cada vez que se inserta un registro en la tabla 'detalle_mermas'.
-- Se corrige la cantidad para que sea un valor negativo, como indica el comentario.
-- ---
CREATE TRIGGER tr_mermas_inv_insert
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
        NEW.cantidad -- Se usa un valor negativo para representar una salida
    );
END;
//

DELIMITER ;
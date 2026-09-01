<?php
require_once __DIR__ . "/../db/conexion.php";
require_once __DIR__ . "/../funcionesGenerales.php";

class Serie_conf extends FuncionesGenerales {
    private Conexion $conexion;

    public function __construct() {
        $this->conexion = Conexion::getInstance();
    }

    public function __get(string $name) {
        return $this->conexion->$name;
    }

    
    /**
     * Registrar una nueva serie y opcionalmente asociar variantes
     * @param array $data {serie, estado, fecha, producto_idproducto, variantes:[id_Producto_Variante,...]}
     */
    public function registrar_serie($data) {
        $serie = $data['serie'] ?? null;
        $estado = $data['estado'] ?? 1;
        $fecha = $data['fecha'] ?? date('Y-m-d H:i:s');
        $producto_id = $data['producto_idproducto'] ?? null; // puede ser null
        $variantes = isset($data['variantes']) && is_array($data['variantes']) ? $data['variantes'] : [];

        if (empty($serie)) {
            echo json_encode(["danger", "El nombre de la serie es obligatorio", "registrar_serie"]);
            return;
        }

        $this->dbp->begin_transaction();
        try {
            // Insertar serie
            $query = "INSERT INTO serie (serie, estado, fecha, producto_idproducto) VALUES (?,?,?,?)";
            $stmt = $this->dbp->prepare($query);
            if ($stmt === false) throw new Exception("Error preparando inserción de serie: " . $this->dbp->error);
            $stmt->bind_param("sisi", $serie, $estado, $fecha, $producto_id);
            $stmt->execute();
            if ($stmt->affected_rows <= 0) throw new Exception("No se pudo insertar la serie");
            $idserie = $stmt->insert_id;
            $stmt->close();

            // Asociar variantes si hay
            if (!empty($variantes)) {
                $this->asociar_variantes($idserie, $variantes);
            }

            $this->dbp->commit();
            echo json_encode(["success", "Serie registrada correctamente", "registrar_serie"]);
        } catch (Exception $e) {
            $this->dbp->rollback();
            echo json_encode(["danger", $e->getMessage(), "registrar_serie"]);
        }
    }

    /**
     * Editar serie y reemplazar variantes asociadas
     * @param int $idserie
     * @param array $data {serie, estado, fecha, producto_idproducto, variantes:[...]}
     */
    public function editar_serie($idserie, $data) {
        $serie = $data['serie'] ?? null;
        $estado = $data['estado'] ?? null;
        $fecha = $data['fecha'] ?? null;
        $producto_id = $data['producto_idproducto'] ?? null;
        $variantes = isset($data['variantes']) && is_array($data['variantes']) ? $data['variantes'] : null;

        if (empty($idserie)) {
            echo json_encode(["danger", "ID de serie requerido", "editar_serie"]);
            return;
        }

        // Construir dinámicamente campos a actualizar
        $campos = [];
        $tipos = "";
        $valores = [];

        if ($serie !== null) { $campos[] = "serie = ?"; $tipos .= "s"; $valores[] = $serie; }
        if ($estado !== null) { $campos[] = "estado = ?"; $tipos .= "i"; $valores[] = $estado; }
        if ($fecha !== null) { $campos[] = "fecha = ?"; $tipos .= "s"; $valores[] = $fecha; }
        if ($producto_id !== null) { $campos[] = "producto_idproducto = ?"; $tipos .= "i"; $valores[] = $producto_id; }

        if (empty($campos) && $variantes === null) {
            echo json_encode(["Info", "No hay cambios para actualizar", "editar_serie"]);
            return;
        }

        $this->dbp->begin_transaction();
        try {
            // Actualizar campos de serie si hay
            if (!empty($campos)) {
                $query = "UPDATE serie SET " . implode(", ", $campos) . " WHERE idserie = ?";
                $tipos .= "i";
                $valores[] = $idserie;
                $stmt = $this->dbp->prepare($query);
                if ($stmt === false) throw new Exception("Error preparando actualización: " . $this->dbp->error);
                $stmt->bind_param($tipos, ...$valores);
                $stmt->execute();
                $stmt->close();
            }

            // Reemplazar variantes si se proporcionó el arreglo
            if ($variantes !== null) {
                // Eliminar asociaciones actuales
                $stmt = $this->dbp->prepare("DELETE FROM serie_producto_variante WHERE idserie = ?");
                $stmt->bind_param("i", $idserie);
                $stmt->execute();
                $stmt->close();
                // Insertar nuevas
                if (!empty($variantes)) {
                    $this->asociar_variantes($idserie, $variantes);
                }
            }

            $this->dbp->commit();
            echo json_encode(["success", "Serie actualizada correctamente", "editar_serie"]);
        } catch (Exception $e) {
            $this->dbp->rollback();
            echo json_encode(["danger", $e->getMessage(), "editar_serie"]);
        }
    }

    /**
     * Asociar múltiples variantes a una serie (método auxiliar)
     */
    private function asociar_variantes($idserie, array $idsVariantes) {
        $stmt = $this->dbp->prepare("INSERT INTO serie_producto_variante (idserie, id_Producto_Variante) VALUES (?, ?)");
        if ($stmt === false) throw new Exception("Error preparando inserción de variantes: " . $this->dbp->error);
        foreach ($idsVariantes as $idVariante) {
            $stmt->bind_param("ii", $idserie, $idVariante);
            $stmt->execute();
        }
        $stmt->close();
    }

    /**
     * Listar series con sus variantes asociadas y datos de Producto_Variante
     * @param int|null $idproducto Filtro opcional por producto
     */
    public function listar_series($idproducto = null) {
        $lista = [];

        // 1. Consulta de series
        $sqlSeries = "SELECT s.idserie, s.serie, s.estado, s.fecha, s.producto_idproducto
                    FROM serie s";
        $params = [];
        $tipos = "";
        if ($idproducto !== null) {
            $sqlSeries .= " WHERE s.producto_idproducto = ?";
            $tipos .= "i";
            $params[] = $idproducto;
        }

        $stmt = $this->dbp->prepare($sqlSeries);
        if ($stmt === false) {
            echo json_encode(["danger", "Error en consulta: " . $this->dbp->error, "listar_series"]);
            return;
        }
        if (!empty($params)) {
            $stmt->bind_param($tipos, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $series = [];
        $idsSeries = [];
        while ($row = $result->fetch_assoc()) {
            $row['variantes'] = []; // se llenará después
            $series[$row['idserie']] = $row;
            $idsSeries[] = $row['idserie'];
        }
        $stmt->close();

        // Si no hay series, devolver vacío
        if (empty($idsSeries)) {
            echo json_encode([]);
            return;
        }

        // 2. Obtener todas las variantes de las series encontradas
        $placeholdersSeries = implode(',', array_fill(0, count($idsSeries), '?'));
        $sqlVariantes = "
            SELECT 
                spv.idserie,
                pv.id_Producto_Variante,
                pv.idproducto,
                pv.sku,
                pv.precio_base,
                pv.codigo_barras,
                pv.activo
            FROM serie_producto_variante spv
            INNER JOIN Producto_Variante pv 
                ON pv.id_Producto_Variante = spv.id_Producto_Variante
            WHERE spv.idserie IN ($placeholdersSeries)
            ORDER BY spv.idserie, pv.id_Producto_Variante
        ";

        $stmt = $this->dbp->prepare($sqlVariantes);
        $typesSeries = str_repeat('i', count($idsSeries));
        $stmt->bind_param($typesSeries, ...$idsSeries);
        $stmt->execute();
        $resultVariantes = $stmt->get_result();

        $variantesPorSerie = [];
        $idsVariantes = [];
        while ($var = $resultVariantes->fetch_assoc()) {
            $idSerie = $var['idserie'];
            $idVariante = $var['id_Producto_Variante'];
            // Guardar referencia rápida de la variante
            $var['valores'] = []; // se llenará después
            $series[$idSerie]['variantes'][$idVariante] = $var;
            $variantesPorSerie[$idSerie][$idVariante] = &$series[$idSerie]['variantes'][$idVariante];
            $idsVariantes[] = $idVariante;
        }
        $stmt->close();

        // Si no hay variantes, devolver series sin variantes
        if (empty($idsVariantes)) {
            echo json_encode(array_values($series));
            return;
        }

        // 3. Obtener todos los atributos de las variantes encontradas
        $placeholdersVariantes = implode(',', array_fill(0, count($idsVariantes), '?'));
        $sqlValores = "
            SELECT 
                vv.id_Producto_Variante,
                vv.id_Valor_Atributo,
                va.valor,
                ap.nombre AS atributo
            FROM Variante_Valor vv
            JOIN Valor_Atributo va ON vv.id_Valor_Atributo = va.id_Valor_Atributo
            JOIN Atributo_producto ap ON va.id_Atributo_producto = ap.id_Atributo_producto
            WHERE vv.id_Producto_Variante IN ($placeholdersVariantes)
            ORDER BY vv.id_Producto_Variante, ap.nombre
        ";

        $stmt = $this->dbp->prepare($sqlValores);
        $typesVariantes = str_repeat('i', count($idsVariantes));
        $stmt->bind_param($typesVariantes, ...$idsVariantes);
        $stmt->execute();
        $resultValores = $stmt->get_result();

        // Mapa temporal para relacionar variante -> serie
        $varianteASerie = [];
        foreach ($variantesPorSerie as $idSerie => $variantes) {
            foreach ($variantes as $idVariante => $v) {
                $varianteASerie[$idVariante] = $idSerie;
            }
        }

        while ($fila = $resultValores->fetch_assoc()) {
            $idVariante = $fila['id_Producto_Variante'];
            if (isset($varianteASerie[$idVariante])) {
                $idSerie = $varianteASerie[$idVariante];
                // Agregar el atributo a la variante correspondiente
                $series[$idSerie]['variantes'][$idVariante]['valores'][] = [
                    'id_Valor_Atributo' => $fila['id_Valor_Atributo'],
                    'valor' => $fila['valor'],
                    'atributo' => $fila['atributo']
                ];
            }
        }
        $stmt->close();

        // Convertir 'variantes' de mapa a lista indexada y devolver series como lista
        foreach ($series as &$serie) {
            $serie['variantes'] = array_values($serie['variantes']);
        }
        unset($serie); // romper referencia

        echo json_encode(array_values($series));
    }

    /**
     * Eliminar serie y sus asociaciones
     */
    public function eliminar_serie($idserie) {
        if (empty($idserie)) {
            echo json_encode(["danger", "ID requerido", "eliminar_serie"]);
            return;
        }
        $this->dbp->begin_transaction();
        try {
            $stmt = $this->dbp->prepare("DELETE FROM serie_producto_variante WHERE idserie = ?");
            $stmt->bind_param("i", $idserie);
            $stmt->execute();
            $stmt->close();

            $stmt = $this->dbp->prepare("DELETE FROM serie WHERE idserie = ?");
            $stmt->bind_param("i", $idserie);
            $stmt->execute();
            $stmt->close();

            $this->dbp->commit();
            echo json_encode(["success", "Serie eliminada correctamente", "eliminar_serie"]);
        } catch (Exception $e) {
            $this->dbp->rollback();
            echo json_encode(["danger", $e->getMessage(), "eliminar_serie"]);
        }
    }

    /**
     * Cambiar estado de una serie
     */
    public function cambiar_estado_serie($idserie, $estado) {
        if (empty($idserie) || $estado === null) {
            echo json_encode(["danger", "Parámetros incompletos", "cambiar_estado_serie"]);
            return;
        }
        $stmt = $this->dbp->prepare("UPDATE serie SET estado = ? WHERE idserie = ?");
        if ($stmt === false) {
            echo json_encode(["danger", "Error en preparación: " . $this->dbp->error, "cambiar_estado_serie"]);
            return;
        }
        $stmt->bind_param("ii", $estado, $idserie);
        $stmt->execute();
        $stmt->close();
        echo json_encode(["success", "Estado actualizado", "cambiar_estado_serie"]);
    }

    /**
     * Método para eliminar una variante específica de una serie
     */
    public function eliminar_variante_de_serie($idserie, $idVariante) {
        if (empty($idserie) || empty($idVariante)) {
            echo json_encode(["danger", "Parámetros incompletos", "eliminar_variante_de_serie"]);
            return;
        }
        $stmt = $this->dbp->prepare("DELETE FROM serie_producto_variante WHERE idserie = ? AND id_Producto_Variante = ?");
        $stmt->bind_param("ii", $idserie, $idVariante);
        $stmt->execute();
        $stmt->close();
        echo json_encode(["success", "Variante eliminada de la serie", "eliminar_variante_de_serie"]);
    }
}
?>
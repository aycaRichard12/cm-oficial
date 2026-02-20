# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE

## Sistema de Gestión de Pedidos y Producción

**Versión:** 1.0  
**Fecha:** 21 de febrero de 2026  
**Tipo:** Sistema Web de Gestión de Producción

---

## 1. REQUERIMIENTOS FUNCIONALES

### 1.1 Módulo de Catálogos (Maestros)

#### RF-CAT-001: Gestión de Productos

**Descripción:** Administración del catálogo de productos terminados.

**Atributos:**

- Código interno (ej: #0104, #0128) - Único, inmutable
- Familia: YUNGAS | NE | ALMA
- Línea: M (Mediano) | G (Grande)
- Presentación: 70 | 150 | 250 | 340 | 400 | 500 | 1000
- Unidad de medida: unidades | kg | gr
- Factor de conversión a unidad base
- Estado: activo | inactivo

**Reglas de negocio:**

- La combinación Familia + Línea + Presentación debe ser única
- Productos inactivos no aparecen en nuevos pedidos pero conservan historial

---

#### RF-CAT-002: Gestión de Ubicaciones/Clientes

**Descripción:** Puntos de distribución donde se entregan los pedidos.

**Atributos:**

- Código corto (ej: GUAR, BRIS, SMig) - Único, máx 10 caracteres
- Nombre completo
- Tipo: cliente_final | deposito | sucursal | distribuidor
- Región/Zona (04, 09, 11, 19...)
- Dirección, contacto, teléfono
- Estado: activo | inactivo

---

#### RF-CAT-003: Gestión de Usuarios y Roles

**Roles definidos:**

1. **ADMINISTRADOR:** Acceso total al sistema
2. **PRODUCCION:** Crea/edita pedidos, confirma producción, cierra lotes
3. **ALMACEN:** Gestiona inventarios, genera despachos, confirma entregas
4. **VENTAS:** Crea pedidos, consulta estado, no modifica producción
5. **CONSULTA:** Solo reportes y dashboards, sin capacidad de edición

---

### 1.2 Módulo de Pedidos

#### RF-PED-001: Registro de Pedidos

**Descripción:** Ingreso de pedidos por región con distribución por ubicación.

**Flujo principal:**

1. Usuario selecciona fecha de pedido (default: fecha actual)
2. Selecciona región/grupo de ubicaciones
3. Sistema presenta grid editable con:
   - Filas: Productos activos
   - Columnas: Ubicaciones de la región seleccionada
   - Celdas: Input numérico para cantidad solicitada
4. Sistema calcula totales por fila y columna en tiempo real
5. Usuario guarda como "Borrador" o "Confirmado"

**Validaciones:**

- Cantidades: números enteros ≥ 0
- Mínimo: una ubicación con cantidad &gt; 0
- No duplicar (fecha, región) en estado "Confirmado"

---

#### RF-PED-002: Estados del Pedido

**Diagrama de estados:**

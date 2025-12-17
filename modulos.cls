Public Sub ReporteIngresos()
    Dim rs As ADODB.Recordset
    Dim ws As Worksheet
    Dim sqlQuery As String
    Dim tbl As ListObject
    Dim i As Long
    Dim pagoPendienteCol As ListColumn
    
    ' Conectar a la base de datos
    If Not ConectarDB() Then Exit Sub
    
    On Error GoTo ErrorHandler
    
    ' Definir la hoja de destino
    Set ws = ThisWorkbook.Sheets("Reporte Ingresos")
    
    ' --- 1. Limpieza de la hoja ---
    ' Elimina la tabla anterior si existe para evitar errores y limpiar datos antiguos.
    On Error Resume Next
    ws.ListObjects("tblIngresos").Delete
    On Error GoTo ErrorHandler
    ws.Cells.Clear
    
    ' --- 2. Consulta SQL Optimizada ---
    ' Se agrupan los resultados por ingreso para calcular el total cobrado y el pago pendiente.
    ' La función Nz() de Access convierte los valores nulos (ingresos sin cobros) a 0.
    ' --- 2. Consulta SQL Optimizada (CORREGIDA)---
    ' Se reemplaza la función Nz() por COALESCE() para máxima compatibilidad
    ' al ejecutar la consulta desde Excel.
    ' --- 2. Consulta SQL Optimizada (Solución Definitiva)---
    ' Se reemplaza COALESCE() por IIF(), la función condicional nativa de Access,
    ' para asegurar la máxima compatibilidad con el proveedor de datos.
    sqlQuery = "SELECT " & _
               "  i.orden_recibo AS [Orden de Recibo], " & _
               "  i.fecha AS [Fecha de Ingreso], " & _
               "  c.nombre AS [Cliente], " & _
               "  v.nombre & ' ' & v.apellido AS [Vendedor], " & _
               "  i.total_ingreso AS [Total Ingreso], " & _
               "  SUM(IIF(cob.monto IS NULL, 0, cob.monto)) AS [Total Cobrado], " & _
               "  (i.total_ingreso - SUM(IIF(cob.monto IS NULL, 0, cob.monto))) AS [Pago Pendiente] " & _
               "FROM (((ingreso AS i " & _
               "INNER JOIN cliente AS c ON i.idcliente = c.idcliente) " & _
               "INNER JOIN vendedor AS v ON i.idvendedor = v.idvendedor) " & _
               "LEFT JOIN cobros AS cob ON i.idingreso = cob.idingreso) " & _
               "GROUP BY " & _
               "  i.idingreso, " & _
               "  i.orden_recibo, " & _
               "  i.fecha, " & _
               "  c.nombre, " & _
               "  v.nombre, " & _
               "  v.apellido, " & _
               "  i.total_ingreso " & _
               "ORDER BY i.fecha DESC;"

    ' Abrir recordset
    Set rs = New ADODB.Recordset
    rs.Open sqlQuery, cn, adOpenKeyset, adLockReadOnly
    
    ' Si no hay datos, informar al usuario y salir.
    If rs.EOF And rs.BOF Then
        MsgBox "No se encontraron datos para el reporte.", vbInformation
        rs.Close
        Set rs = Nothing
        Call DesconectarDB
        Exit Sub
    End If
    
    ' --- 3. Pegar Encabezados y Datos ---
    ' Pegar los nombres de los campos como encabezados en la fila 1
    For i = 0 To rs.Fields.Count - 1
        ws.Cells(1, i + 1).Value = rs.Fields(i).Name
    Next i
    
    ' Pegar los registros desde la celda A2
    ws.Cells(2, 1).CopyFromRecordset rs
    
    ' --- 4. Crear y Formatear la Tabla (ListObject) ---
    ' Crear el objeto de tabla estructurada
    Set tbl = ws.ListObjects.Add(xlSrcRange, ws.Range("A1").CurrentRegion, , xlYes)
    tbl.Name = "tblIngresos"
    tbl.TableStyle = "TableStyleMedium2" ' Un estilo limpio que se adapta bien a la personalización
    
    ' Encabezados en negrita y con fondo gris claro
    With tbl.HeaderRowRange
        .Font.Bold = True
        .Interior.Color = RGB(230, 230, 230)
    End With
    
    ' Ajustar automáticamente el ancho de las columnas
    tbl.Range.Columns.AutoFit
    
    ' --- 5. Formatear Columnas Específicas ---
    ' Alinear montos a la derecha y aplicar formato de moneda
    With tbl.ListColumns("Total Ingreso").DataBodyRange
        .NumberFormat = "$#,##0.00;[Red]-$#,##0.00"
        .HorizontalAlignment = xlRight
    End With
    With tbl.ListColumns("Total Cobrado").DataBodyRange
        .NumberFormat = "$#,##0.00;[Red]-$#,##0.00"
        .HorizontalAlignment = xlRight
    End With
    With tbl.ListColumns("Pago Pendiente").DataBodyRange
        .NumberFormat = "$#,##0.00;[Red]-$#,##0.00"
        .HorizontalAlignment = xlRight
    End With
    
    ' --- 6. Aplicar Formato Condicional ---
    ' Resaltar en rojo los valores de PagoPendiente mayores a 0
    Set pagoPendienteCol = tbl.ListColumns("Pago Pendiente")
    With pagoPendienteCol.DataBodyRange.FormatConditions.Add(Type:=xlCellValue, Operator:=xlGreater, Formula1:="0")
        .Font.Color = vbRed
        .Font.Bold = True
    End With
    
    ' --- 7. Agregar Fila de Totales ---
    tbl.ShowTotals = True
    tbl.ListColumns("Total Ingreso").TotalsCalculation = xlTotalsCalculationSum
    tbl.ListColumns("Total Cobrado").TotalsCalculation = xlTotalsCalculationSum
    tbl.ListColumns("Pago Pendiente").TotalsCalculation = xlTotalsCalculationSum
    
    ' Limpiar objetos
    rs.Close
    Set rs = Nothing
    Set ws = Nothing
    Set tbl = Nothing
    
    ' Desconectar al final
    Call DesconectarDB
    MsgBox "El reporte de ingresos ha sido actualizado exitosamente.", vbInformation
    Exit Sub

ErrorHandler:
    MsgBox "Ocurrió un error al generar el reporte de ingresos: " & vbCrLf & Err.Description, vbCritical
    If Not rs Is Nothing Then
        If rs.State = adStateOpen Then rs.Close
        Set rs = Nothing
    End If
    Call DesconectarDB
End Sub








Public Sub ExportarIngresosEnUnaHoja()
    ' Requiere las referencias a "Microsoft ActiveX Data Objects 6.1 Library" o similar
    
    Dim rsIngresosConDetalle As Object ' ADODB.Recordset
    Dim rsCobrosDetalle As Object ' ADODB.Recordset
    Dim ws As Worksheet
    Dim lngIdIngreso As Long
    Dim orden As String
    Dim r As Long
    Dim strSQLIngresos As String
    Dim strSQLCobros As String
    If Not ConectarDB() Then Exit Sub
    On Error GoTo ErrorHandler

    ' Verificar si la conexión está activa. Si no, intentar conectar.
    On Error Resume Next
    If cn Is Nothing Or cn.State <> 1 Then ' 1 = adStateOpen
        On Error GoTo ErrorHandler
        If Not ConectarDB() Then Exit Sub
    End If
    On Error GoTo ErrorHandler

    ' *** INICIO DE LA MODIFICACIÓN: Preparar la hoja de reporte única ***
    Const SHEET_NAME As String = "Reporte de Ingresos con Detalle"
    Set ws = ThisWorkbook.Sheets("Reporte de Ingresos con Detalle")
    ws.Cells.Clear ' Limpia hoja antes de cargar
    
    'On Error Resume Next
    'ws.ListObjects("tblIngresos").Delete
    'On Error GoTo ErrorHandler
    'ws.Cells.Clear
    ' Eliminar la hoja si ya existe para empezar de cero
    'Application.DisplayAlerts = False
    'On Error Resume Next
    'ThisWorkbook.Sheets(SHEET_NAME).Delete
    'On Error GoTo ErrorHandler
    'Application.DisplayAlerts = True
    
    ' Crear la nueva hoja de reporte
    'Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ' ws.Name = SHEET_NAME
    ' *** FIN DE LA MODIFICACIÓN ***
    
    ' Inicializar el contador de fila
    r = 1
    
    ' Consulta SQL para el resumen de ingresos
     ' *** INICIO DE LA CORRECCIÓN SQL ***
    ' Consulta SQL para el resumen de ingresos (con 'i.orden_recibo' añadido al GROUP BY)
    strSQLIngresos = "SELECT i.idingreso, i.orden_recibo, i.fecha, i.total_ingreso, " & _
                     "cli.nombre AS cliente, v.nombre & ' ' & v.apellido AS vendedor, " & _
                     "IIF(SUM(c.monto),0) AS cobrado, (i.total_ingreso - IIF(SUM(c.monto),0)) AS pendiente " & _
                     "FROM ((ingreso AS i " & _
                     "LEFT JOIN cliente AS cli ON i.idcliente = cli.idcliente) " & _
                     "LEFT JOIN vendedor AS v ON i.idvendedor = v.idvendedor) " & _
                     "LEFT JOIN cobros AS c ON i.idingreso = c.idingreso " & _
                     "GROUP BY i.idingreso, i.orden_recibo, i.fecha, i.total_ingreso, cli.nombre, v.nombre, v.apellido " & _
                     "ORDER BY i.fecha DESC, i.idingreso ASC;"
    ' *** FIN DE LA CORRECCIÓN SQL ***
                     
    ' Ejecutar la consulta principal
    Set rsIngresosConDetalle = CreateObject("ADODB.Recordset")
    rsIngresosConDetalle.Open strSQLIngresos, cn, 3, 1 ' adOpenStatic, adLockReadOnly
    
    If Not rsIngresosConDetalle.EOF Then
        Do While Not rsIngresosConDetalle.EOF
            lngIdIngreso = rsIngresosConDetalle.Fields("idingreso").Value
            orden = rsIngresosConDetalle.Fields("orden_recibo").Value
            ' Insertar los datos principales del ingreso
            ws.Range("A" & r).Value = "Ingreso:  " & orden
            ws.Range("A" & r).Font.Bold = True
            
            r = r + 2
            
            ' Encabezados de la tabla de resumen
            ws.Range("A" & r & ":H" & r).Value = Array("ID Ingreso", "Recibo", "Fecha", "Total", "Cliente", "Vendedor", "Cobrado", "Pendiente")
            ws.Range("A" & r & ":H" & r).Font.Bold = True
            
            r = r + 1
            
            ' Insertar los datos del registro actual
            ws.Range("A" & r & ":H" & r).Value = Array(rsIngresosConDetalle.Fields("idingreso").Value, rsIngresosConDetalle.Fields("orden_recibo").Value, _
                                                       rsIngresosConDetalle.Fields("fecha").Value, rsIngresosConDetalle.Fields("total_ingreso").Value, _
                                                       rsIngresosConDetalle.Fields("cliente").Value, rsIngresosConDetalle.Fields("vendedor").Value, _
                                                       rsIngresosConDetalle.Fields("cobrado").Value, rsIngresosConDetalle.Fields("pendiente").Value)
            
            ' Formatear como tabla los datos principales
            ws.Range("A" & (r - 1) & ":H" & r).Borders.LineStyle = 1 ' xlContinuous
            
            r = r + 3
            
            ' Consulta SQL para los cobros detallados
            strSQLCobros = "SELECT c.idingreso, c.idcobro, t.tipo AS tipocobro, c.monto AS monto_cobrado, c.fecha, " & _
                           "c.fecha_sistema, cu.cuenta_banco " & _
                           "FROM (((cobros AS c " & _
                           "LEFT JOIN tipo AS t ON c.idtipo = t.idtipo) " & _
                           "LEFT JOIN cobros_banco AS cb ON c.idcobro = cb.idcobro) " & _
                           "LEFT JOIN cuenta AS cu ON cb.idcuenta = cu.idcuenta) " & _
                           "WHERE c.idingreso = " & lngIdIngreso & ";"
            
            ' Ejecutar la consulta de detalle
            Set rsCobrosDetalle = CreateObject("ADODB.Recordset")
            rsCobrosDetalle.Open strSQLCobros, cn, 3, 1 ' adOpenStatic, adLockReadOnly
            
            ' Insertar los datos de los cobros si existen
            If Not rsCobrosDetalle.EOF Then
                ws.Range("A" & r).Value = "Detalle de Cobros"
                ws.Range("A" & r).Font.Bold = True
                
                r = r + 2
                
                Dim i As Integer
                For i = 0 To rsCobrosDetalle.Fields.Count - 1
                    ws.Cells(r, i + 1).Value = rsCobrosDetalle.Fields(i).Name
                Next i
                ws.Range(ws.Cells(r, 1), ws.Cells(r, rsCobrosDetalle.Fields.Count)).Font.Bold = True
                
                r = r + 1
                
                ws.Cells(r, 1).CopyFromRecordset rsCobrosDetalle
                
                ' Actualizar 'r' a la última fila después de pegar los datos
                r = ws.Cells(ws.Rows.Count, 1).End(-4162).Row ' -4162 = xlUp
                
                ' Formatear como tabla los datos de cobros
                ws.Range(ws.Cells(r - (rsCobrosDetalle.RecordCount), 1).Offset(-1, 0), ws.Cells(r, rsCobrosDetalle.Fields.Count)).Borders.LineStyle = 1
            End If
            
            rsCobrosDetalle.Close
            Set rsCobrosDetalle = Nothing
            
            ' *** MODIFICACIÓN: Añadir espacio antes del siguiente registro ***
            r = r + 3
            
            rsIngresosConDetalle.MoveNext
        Loop
    End If
    
    ' Cerrar el recordset principal
    rsIngresosConDetalle.Close
    Set rsIngresosConDetalle = Nothing
    
    ' Ajustar el ancho de las columnas al final para todo el contenido
    ws.Columns.AutoFit
    
    MsgBox "Reporte completado exitosamente en la hoja '" & SHEET_NAME & "'.", 64, "Proceso Finalizado" ' 64 = vbInformation
    
    Exit Sub
    
ErrorHandler:
    MsgBox "Se ha producido un error: " & Err.Description, 16, "Error" ' 16 = vbCritical
    If Not rsIngresosConDetalle Is Nothing Then
        If rsIngresosConDetalle.State = 1 Then rsIngresosConDetalle.Close
        Set rsIngresosConDetalle = Nothing
    End If
    If Not rsCobrosDetalle Is Nothing Then
        If rsCobrosDetalle.State = 1 Then rsCobrosDetalle.Close
        Set rsCobrosDetalle = Nothing
    End If
End Sub






                "SELECT " & _
               "  i.orden_recibo AS [Orden de Recibo], " & _
               "  i.fecha AS [Fecha de Ingreso], " & _
               "  c.nombre AS [Cliente], " & _
               "  v.nombre & ' ' & v.apellido AS [Vendedor], " & _
               "  i.total_ingreso AS [Total Ingreso], " & _
               "  SUM(IIF(cob.monto IS NULL, 0, cob.monto)) AS [Total Cobrado], " & _
               "  (i.total_ingreso - SUM(IIF(cob.monto IS NULL, 0, cob.monto))) AS [Pago Pendiente] " & _
               "FROM (((ingreso AS i " & _
               "INNER JOIN cliente AS c ON i.idcliente = c.idcliente) " & _
               "INNER JOIN vendedor AS v ON i.idvendedor = v.idvendedor) " & _
               "LEFT JOIN cobros AS cob ON i.idingreso = cob.idingreso) " & _
               "GROUP BY " & _
               "  i.idingreso, " & _
               "  i.orden_recibo, " & _
               "  i.fecha, " & _
               "  c.nombre, " & _
               "  v.nombre, " & _
               "  v.apellido, " & _
               "  i.total_ingreso " & _
               "ORDER BY i.fecha DESC;




                    "SELECT 
                    i.idingreso, 
                    
                    i.orden_recibo, 
                    i.fecha,
                     i.total_ingreso, " & _
                     "cli.nombre AS cliente, v.nombre & ' ' & v.apellido AS vendedor, " & _
                     "SUM(IIF(c.monto),0) AS cobrado, (i.total_ingreso - SUM(IIF(c.monto),0)) AS pendiente " & _
                     "FROM ((ingreso AS i " & _
                     "LEFT JOIN cliente AS cli ON i.idcliente = cli.idcliente) " & _
                     "LEFT JOIN vendedor AS v ON i.idvendedor = v.idvendedor) " & _
                     "LEFT JOIN cobros AS c ON i.idingreso = c.idingreso " & _
                     "GROUP BY i.idingreso, i.orden_recibo, i.fecha, i.total_ingreso, cli.nombre, v.nombre, v.apellido " & _
                     "ORDER BY i.fecha DESC, i.idingreso ASC;
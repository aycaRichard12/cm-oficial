# Instrucciones para el asistente en este proyecto

- Responde de manera breve y directa, evitando rodeos.
- Usa listas con viñetas o numeradas en lugar de párrafos largos.
- No repitas información que ya está en el historial de la conversación.
- Evita saludos, despedidas y frases de cortesía innecesarias.
- Si una pregunta es ambigua, pide aclaración en una sola línea.
- Prioriza fragmentos de código, nombres de archivos o comandos exactos por encima de explicaciones extensas.
- Cuando sea posible, usa herramientas de resumen o caché para evitar reprocesar contenido.
- No incluyas ejemplos genéricos a menos que se soliciten explícitamente.
- Mantén el foco en el contexto del proyecto y no añadas información externa irrelevante.

# Instrucciones de edición eficiente (bajo consumo de tokens)

- **Usa siempre diff/patch**: Para modificar archivos, genera un bloque diff unificado (formato `---`/`+++` con contexto mínimo) en lugar de reescribir el archivo completo.
- **Muestra solo fragmentos modificados**: No incluyas líneas sin cambios, salvo 1-2 líneas de contexto si es necesario para ubicar el cambio.
- **Evita explicar el código**: No comentes cada línea cambiada. Si se requiere explicación, hazlo en una sola frase al final, no en el diff.
- **Sé quirúrgico**: Aplica el cambio más pequeño posible que resuelva la tarea. No reformatees, reordenes ni renombres nada que no sea estrictamente necesario.
- **Usa nombres de archivo y números de línea**: Referencia archivos como `src/app.js:25` y no repitas todo el código circundante.
- **No preguntes confirmación obvia**: Si la instrucción es clara, aplica el cambio directamente y muestra el resultado.
- **Evita saludos y cortesías**: Comienza directamente con el diff o la respuesta.
- **Prioriza un solo bloque de código**: Si hay varios cambios, agrúpalos en un solo diff o lista de diffs, sin narrativa intermedia.
- **No generes código de ejemplo adicional**: Solo produce el cambio solicitado, nada más.

Si el usuario pide una explicación más detallada, puedes ampliar, pero por defecto asume que solo quiere la edición.

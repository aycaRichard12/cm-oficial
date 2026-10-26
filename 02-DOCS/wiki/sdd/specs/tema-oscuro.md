---
type: spec
title: Spec — Tema oscuro con preferencia guardada
description: WHAT and WHY for a light/dark theme with a remembered per-device preference.
tags: [sdd, spec]
timestamp: 2026-10-26T12:30:00Z
topic: sdd
slug: tema-oscuro
status: draft
---

# Spec — Tema oscuro con preferencia guardada

> Slug: `tema-oscuro` · Status: draft · Created: 2026-10-26
> Inherits: [constitution](../constitution.md)

## Problem & why

El sistema se usa durante jornadas largas, a veces de noche o en ambientes con poca luz. Hoy la interfaz es siempre clara: fondos beige, paneles blancos y tablas blancas. El usuario que trabaja de noche baja el brillo del monitor o activa el modo oscuro del sistema operativo, pero la aplicación lo ignora y sigue deslumbrando. No poder reducir el brillo de la propia interfaz cansa la vista y disminuye la comodidad en el uso prolongado.

## Cost of not building it

Quien trabaja de noche o en mostrador con poca luz sigue forzando la vista o bajando el brillo de todo el equipo, lo que también oscurece otras herramientas. No hay pérdida de datos ni riesgo operativo: el coste es incomodidad sostenida y fatiga visual en el turno. Es un coste real pero moderado, no crítico.

## The cheapest alternative

Bajar el brillo del monitor o usar el modo oscuro del sistema operativo. No cuesta nada y no toca el código, pero no cambia la aplicación: los fondos claros siguen ahí. Un atajo del navegador para forzar contraste invertido tampoco sirve, porque rompe imágenes, logos y colores de estado. La alternativa barata alivia el brillo general, no la interfaz concreta.

## Goals

- El usuario puede alternar toda la aplicación entre apariencia clara y oscura desde cualquier pantalla autenticada.
- La apariencia elegida (o la del sistema) también se aplica en el acceso y en las pantallas de error, aunque el interruptor solo esté disponible tras autenticarse.
- La elección se recuerda en el mismo dispositivo y se aplica en la siguiente apertura.
- Si el usuario nunca eligió, la aplicación respeta la preferencia de apariencia del sistema operativo.
- En oscuro, todas las pantallas siguen siendo legibles y coherentes: sin paneles claros sueltos ni textos que desaparecen.
- Las facturas, reportes y PDFs exportados o impresos siguen saliendo claros y legibles (guard de regresión: ya ocurre y no debe romperse).

## Non-goals / out of scope

- Sincronizar la preferencia entre dispositivos o cuentas.
- Temas por empresa, sucursal o rol.
- Un selector de temas con más de dos opciones, colores personalizables o programación horaria automática.
- Cambiar el diseño, la marca o la disposición de las pantallas.
- Adaptar al oscuro los documentos exportados o impresos.

## Users & context

Usuario operativo autenticado — ventas, almacén, producción o administración — que pasa horas en el sistema en mostrador, oficina o almacén. A veces trabaja de noche o con luz baja. Quiere reducir el brillo de la interfaz sin cambiar de equipo ni tocar la configuración del monitor en mitad del turno.

## Behaviour

- Main path: desde cualquier pantalla autenticada, el usuario pulsa el interruptor de tema; toda la interfaz cambia de claro a oscuro o al revés de inmediato, sin recargar.
- Main path: al volver a abrir la aplicación en el mismo dispositivo, se aplica la última elección guardada.
- Edge: si no hay elección guardada, la aplicación adopta la apariencia del sistema operativo en ese momento.
- Edge: si la preferencia guardada no es reconocible, se ignora y se vuelve a la preferencia del sistema, sin mensaje de error.
- Edge: si el usuario cambia la apariencia del sistema operativo mientras la aplicación está abierta y nunca eligió manualmente, la aplicación acompaña el cambio.
- Edge: una vez que el usuario elige manualmente, su elección manda sobre el sistema operativo hasta que la cambie.
- Edge: no hay forma de volver a "seguir al sistema" dentro de esta entrega; esa opción queda para un ciclo posterior.
- Edge: al cargar la aplicación no se muestra un destello del tema contrario antes de aplicar el guardado.
- Error path: si el dispositivo no permite guardar la preferencia, la aplicación sigue funcionando y cambia de tema durante la sesión, pero no lo recuerda; no se bloquea ni se muestra un error técnico.
- Print/export path: con el tema oscuro activo, la impresión y los PDFs de facturas, reportes y documentos mantienen fondo claro, texto oscuro y contenido completo.
- Accessibility: el interruptor tiene nombre accesible, se puede operar con teclado y anuncia su estado actual.

## Acceptance criteria

- Given un usuario sin preferencia guardada y un sistema operativo en oscuro, When abre la aplicación, Then la interfaz aparece en oscuro desde el primer render.
- Given un usuario sin preferencia guardada y un sistema operativo en claro, When abre la aplicación, Then la interfaz aparece en claro.
- Given cualquier pantalla autenticada en claro, When el usuario pulsa el interruptor, Then toda la interfaz visible pasa a oscuro sin recargar la página.
- Given el tema oscuro activo, When el usuario pulsa de nuevo el interruptor, Then toda la interfaz vuelve a claro sin recargar.
- Given que el usuario eligió oscuro, When cierra y vuelve a abrir la aplicación en el mismo dispositivo, Then la interfaz aparece en oscuro.
- Given que el usuario eligió claro mientras el sistema está en oscuro, When vuelve a abrir, Then la interfaz aparece en claro.
- Given el tema oscuro activo, When recorre login, layout, dashboard, ventas, compras, inventario, reportes, formularios, tablas y diálogos, Then no queda ningún panel claro suelto y el texto normal alcanza contraste mínimo AA (4.5:1) sobre su fondo.
- Given el tema oscuro activo, When exporta o imprime una factura, un reporte o un PDF, Then la salida tiene fondo claro y todo el contenido es legible.
- Given un lector de pantalla o navegación por teclado, When enfoca y activa el interruptor, Then se anuncia su nombre y su estado (claro/oscuro) y el cambio se produce.
- Given una preferencia guardada corrupta o desconocida, When abre la aplicación, Then no se produce error y se aplica la preferencia del sistema.
- Given una preferencia guardada en oscuro, When recarga la página, Then no se observa un destello del tema claro antes de aplicar el oscuro.

## Points to clarify

- **suposición tomada** — el contraste mínimo aceptado es AA 4.5:1 para texto normal. *Base:* es el estándar de accesibilidad habitual y el coste de llegar a AAA no aporta valor operativo claro. *Riesgo:* si el equipo exige AAA 7:1, sube el esfuerzo de ajuste de paleta y algunos grises quedarían fuera.
- **suposición tomada** — el tema oscuro aplica también en login y pantallas de error (404) para evitar saltos bruscos. *Base:* la cobertura elegida fue "toda la app". *Riesgo:* si login debe quedar siempre claro, se excluye y se ajusta la aceptación.
- **suposición tomada** — la preferencia guardada se aplica antes del primer pintado de la interfaz. *Base:* es la única forma de cumplir el criterio de no-destello; el mecanismo concreto de guardado corresponde al plan. *Riesgo:* si la plataforma no permite aplicarla a tiempo, el criterio de no-destello se degrada a "destello mínimo".
- **suposición tomada** — se adopta operabilidad por teclado y anuncio de estado como requisito de esta entrega, por encima del floor mínimo de §7 de la constitución. *Base:* accesibilidad estándar para un control de tema. *Riesgo:* si no se ratifica, el requisito baja a solo nombre accesible.
- **suposición tomada** — la preferencia se guarda por navegador/perfil del dispositivo, incluyendo la PWA instalada. *Base:* es la opción elegida (por dispositivo) y no requiere backend. *Riesgo:* en navegación privada o al limpiar datos no se recuerda entre sesiones; si se exige persistencia ahí, cambia el criterio de aceptación.
- **suposición tomada** — "toda la app" incluye diálogos, menús, tablas, notificaciones y estados vacíos, no solo páginas completas. *Base:* el alcance elegido fue cobertura total. *Riesgo:* si se descubre un componente de terceros imposible de tematizar, habría que declararlo excepción visible.
- **decisión diferida** — sincronizar la preferencia por usuario entre dispositivos; fuera de este ciclo.
- **decisión diferida** — atajo de teclado para alternar el tema; fuera de este ciclo.
- **decisión diferida** — una opción explícita para volver a "seguir al sistema" tras haber elegido manualmente; fuera de este ciclo.
- **área no formulable** — el tratamiento de imágenes, logos y fondos con transparencia que pierdan visibilidad sobre oscuro. Sé que habrá que revisarlos uno a uno, pero todavía no puedo enumerar cuáles ni con qué criterio exacto.

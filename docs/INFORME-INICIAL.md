# Informe inicial · Aves UAO

Fecha de consulta: 9 de octubre de 2026. El análisis de fuentes está completo; el desarrollo se limita al entorno y una prueba de cubo. No se han producido las cinco aves.

## Resultado de la primera tarea

| Acción | Resultado |
|---|---|
| Revisar documentos completos | 6 diapositivas y 40 páginas PDF; texto y revisión visual |
| Extraer requerimientos | [Matriz oficial y del usuario](REQUISITOS.md), con criterios de aceptación |
| Estudiar 8th Wall actual | [Estado y APIs](8TH-WALL-ACTUAL.md); se descarta el flujo Cloud Editor retirado |
| Verificar nuevo proyecto | Flujo oficial Desktop documentado; integración Engine local elegida para prueba reproducible |
| Investigar modelos de cinco especies | [Tablas por ave](MODELOS-INVESTIGACION.md); licencias pendientes excluyen la importación |
| Arquitectura y roadmap | [Arquitectura](../ARCHITECTURE.md) y [hitos](ROADMAP.md) |
| Iniciar HITO 0/1 | Runtime local, interfaz mínima, vista 3D y colocación XR8; ver resultados reales en TESTING |

## Decisión de implementación inicial

Usar el motor actual de 8th Wall y three.js, alojados localmente para desarrollo y después en HTTPS. Es una ruta oficial del ecosistema pedido. Desktop ya está instalado y se pudo leer la escena abierta, pero el control de la ventana devolvió avisos de minimización/interacción humana durante la recuperación. No se editó el proyecto abierto ni se acredita la creación de otro proyecto Studio. Mantener una sola implementación de la prueba evita duplicar lógica entre ECS y three.js.

HITO 1 está sujeto a validar cámara, puntos/superficies y colocación en un teléfono real. Una vista 3D de escritorio o una prueba con XR8 simulado solo verifica lógica e interfaz. No acredita SLAM, permisos reales, planos ni rendimiento móvil.

## Recomendación de assets

Crear Bichofué y Pellar desde malla propia en Blender, salvo que aparezca un recurso mejor con licencia verificada. Evaluar modificación de la base CC del colibrí, sin confundir especies. Crear el Carpintero Habado para evitar depender de un repost con licencias distintas. La Guacamaya Cariseca tiene candidato exacto comercial apto para evaluación, pero requiere adquisición autorizada y optimización; la alternativa sin compra es creación propia. No es necesario decidir una compra para continuar HITO 0/1.

## Dependencias externas reales

Android e iPhone físicos para aceptación; URL HTTPS confiable para abrir la prueba; canto del Bichofué identificado y con licencia antes del HITO 2/3. Mapa 3D y panoramas no son dependencias del MVP. No se necesitan credenciales del antiguo 8th Wall.

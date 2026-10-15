> Aclaración del usuario, 14 octubre 2026: el campus es un mapa 3D navegable SIN cámara. Seleccionar un pin ofrece abrir únicamente el ave en RA. Volver al campus detiene la cámara y reabre la vista 3D. El quiz RA se conserva. Esta aclaración reemplaza las referencias anteriores a campus en RA.

# Estado de implementación — 14 de octubre de 2026

## Implementado

Interfaz institucional, navegación, cinco fichas, campus y pines ilustrativos, cuatro aves con clip seleccionado y Carpintero estático, cantos locales, cinco actividades, colección persistente, quiz con opciones en la escena y resultado. Información completa abandona la sesión. Originales intactos.

Se ajustaron encuadres y opciones para escritorio/portrait; se corrigieron iconos, render del inicio, selección estable de clips, cancelaciones de carga, errores de cámara y reintentos. Las respuestas de percha, bosque y jardín producen elementos ilustrativos. Los controles del Carpintero son etiquetas de observación, no puntos anatómicos calibrados. Ver CONTENIDO-VIGENTE.md.

## Comprobado

- 21 pruebas automáticas aprobadas; build de aplicación y diagnóstico correcto.
- Cinco GLB de aves cargados en navegador; disparo de clips y sonido por controles. No se certifica todo el clip cuadro a cuadro.
- Cinco actividades completadas y colección 5/5 en almacenamiento QA separado.
- Quiz completo con un error intencional: 80/100, guardado tras recarga, práctica identificada como 3D.
- Selección directa de opciones 3D, referencia fotográfica, fichas y audio detenido al salir.
- Interfaz revisada en escritorio y viewport 393×852; esto no es prueba de Safari físico.
- La cámara solicitada desde escritorio presenta explicación y alternativa 3D, sin errores de consola observados.

## Prueba temporal autorizada

El usuario autorizó explícitamente compartir la aplicación compilada mediante Cloudflare para probar en iPhone. Enlace generado: https://picking-clean-ventures-lenses.trycloudflare.com/ . Es temporal, no permanente. Sirve dist mediante preview en 127.0.0.1:4173; el host permitido es exclusivamente el dominio de esta prueba mediante UAO_PREVIEW_HOST. No se comparten los documentos originales.

Sesiones de trabajo: preview 48101 y túnel 15720. Mantenerlos durante la prueba autorizada; detener el túnel al terminar. No reutilizar esta URL en una sesión futura sin verificar su vigencia.

## Aceptación pendiente

Solo iPhone 16 Pro disponible, confirmado por el usuario. Se envió el enlace y se pidió observar si abre cámara y coloca campus. Primera prueba física: Safari solicita permiso, pero el usuario no ve la imagen de cámara ni modelos RA. Reportó el mensaje «Toca un pin para conocer un ave. Zonas sugeridas.». Android no disponible.

Pendientes: tracking y anclaje, pérdida/recuperación, permisos, rendimiento cinco minutos, orientación/safe areas en Safari, estabilidad de clips completos, tiempos de carga y red lenta. El campus tiene 1,23 millones de triángulos y las aves texturas hasta 4096²; los 96,13 MB de modelos no son memoria gráfica total.

Del equipo: ubicaciones reales y quinto punto; identidad de Peregrine; apariencia de Colibrí; identificación de audios; permisos/atribuciones. Publicación permanente no autorizada. La preparación técnica no corrige especies ni apariencia.

## Continuación

1. Atender resultado del iPhone; reproducir y corregir cualquier fallo concreto.
2. Completar matriz de TESTING.md sin atribuir resultados de escritorio a cámara real.
3. Revisar clips completos y decidir optimizaciones según medidas del dispositivo.
4. Cerrar confirmaciones del equipo y autorizar entrega pública solo con versión revisada.

README, arquitectura, recursos, modelos, pruebas y roadmap actualizados. Guion de cinco minutos en PITCH-Y-DEMO.md. No afirmar entrega final aprobada.

## Incidencia de cámara · corrección en prueba

Se retiró setPixelRatio del renderer compartido de XR8. El motor administra dimensiones físicas del canvas y su callback de redimensionado llama renderer.setSize; introducir otro factor de píxeles puede desajustar viewport y buffer. Es un defecto de integración identificado en código, pero la relación causal con el fallo físico aún requiere el reintento del usuario.

Se añadieron mensajes para requesting, hasStream, hasVideo y onStart. Tres pruebas con un adaptador simulado verifican que la aplicación no cambia DPR, que se libera el motor ante fallo y que los errores posteriores se propagan. Estas pruebas no simulan cámara ni certifican renderizado en iPhone.

Build actualizado y entregado por el mismo túnel con ?v=camara-2; el HTML HTTPS carga main-B2UTudKR.js. Usuario invitado a cerrar la pestaña anterior y reabrir. Pendiente su respuesta: no declarar cámara corregida todavía.

Referencia contrastada: https://github.com/8thwall/threejs-world-effects-example/blob/main/src/app.js y src/threejs-scene-init.js; código local del motor distribuido, sin modificar sus binarios.

Versión ?v=aves-ra-3: campus siempre preview, pines con botón Ver ave en realidad aumentada, salida de RA al volver al campus. Conserva la corrección de canvas de camara-2. Pendiente comprobar imagen en vivo del ave en iPhone.

## Corrección de cámara y vistas residuales · 14 octubre 2026

El código instalado de XRExtras.FullWindowCanvas mueve el canvas a document.body durante onAttach. Esto lo separaba de #scene-host y lo dejaba detrás del overlay opaco de la experiencia. Además, podía permanecer en la página al cerrar RA, como una imagen congelada. No se encontró una función de captura ni guardado automático de fotos.

Se conserva el dimensionado de FullWindowCanvas, restaurando inmediatamente el canvas a su contenedor mediante src/ar/canvas-host.js. La salida del runtime retira explícitamente el canvas y libera el renderer. El botón para aves animadas dice «Reproducir animación y canto»; Carpintero sigue estático por decisión del equipo. Campus permanece en 3D sin cámara.

Validación: 23 pruebas automáticas aprobadas, incluidas restauración del contenedor y retirada única al salir; compilación correcta (main-Cwe5mU5X.js). El nuevo enlace carga la ficha de Reinita y su control de animación/canto avanza la actividad sin errores de consola en escritorio. Esto no certifica cámara, tracking ni animación en Safari físico: queda pendiente repetir la prueba en iPhone 16 Pro.

El túnel anterior ya no resolvía. Nuevo enlace temporal autorizado: https://productivity-adopt-consolidation-joint.trycloudflare.com/?v=camara-4 . Sesión del túnel 26264; preview 19969, puerto 4173. El host permitido es exclusivamente el nuevo dominio. Sustituye al enlace anterior para esta prueba.

## Ajuste solicitado tras prueba física · versión aves-5

El usuario confirmó cámara visible y aportó capturas: ave sin colocar, opciones de actividad innecesarias y botones sobredimensionados.

- Escuchar el canto con reproducción iniciada descubre la historia, tanto en escena como en ficha. Se retiraron las elecciones de hábitat, percha y rasgos del recorrido; el quiz conserva sus preguntas y puntuación.
- XRExtras inyecta .icon-button con padding 4vmin. Los controles propios ahora usan .uao-icon-button con padding cero y tamaño 44×44; panel móvil más compacto.
- Tras cargar el modelo y recibir tracking, el ave se coloca automáticamente delante de la cámara, con distancia calculada desde la matriz de proyección. Es un punto del mundo y no una superficie detectada. Recolocar calcula una nueva posición; pérdida de tracking oculta el ave hasta recuperación. No se usa una imagen pegada a la pantalla.
- Verificación: 25 pruebas aprobadas y build correcto; prueba HTTPS del Cernícalo en 3D confirma Historia descubierta al reproducir, ausencia de elecciones intermedias, botones 44×44 y consola sin errores. Imagen docs/evidence/descubrimiento-simple-2026-10-14.png.
- Pendiente: confirmar aparición y estabilidad del ave en Safari del iPhone 16 Pro. Enlace vigente: https://productivity-adopt-consolidation-joint.trycloudflare.com/?v=aves-5 . La comprobación de escritorio no acredita RA física.

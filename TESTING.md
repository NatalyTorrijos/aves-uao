> Aclaración del usuario, 14 octubre 2026: el campus es un mapa 3D navegable SIN cámara. Seleccionar un pin ofrece abrir únicamente el ave en RA. Volver al campus detiene la cámara y reabre la vista 3D. El quiz RA se conserva. Esta aclaración reemplaza las referencias anteriores a campus en RA.

# Validación · 14 octubre 2026

## Evidencia local

21 pruebas Node aprobadas: selección honesta de hits; progreso corrupto, desconocido, bloqueado o duplicado; puntuación y reintentos; cinco especies y medios existentes; relación catálogo/quiz/pines; clips seleccionados presentes en cada GLB y Carpintero estático.

Comprobación interactiva en navegador de escritorio: cinco actividades completadas y colección 5/5; fichas con reproducción detenida al salir; carga de campus y transición a ave; carga de las cinco aves durante el quiz; referencia fotográfica; cinco desafíos completados con un error intencional y resultado 80/100; persistencia tras recargar; selección directa de una opción 3D por raycast. Práctica identificada como vista 3D, sin acreditar RA ni desbloquear aves solo por hacer el quiz. Diseño revisado a 1280×720 y 393×852 (emulación de tamaño, no Safari físico).

Las pruebas usan `?qa=1` para separar la colección del usuario. Ejecutar `node --test tests/*.test.js`, después `node scripts/copy-runtime.mjs` y `node node_modules/vite/bin/vite.js build`.

## Prueba necesaria en iPhone 16 Pro

Único teléfono disponible confirmado por el usuario. Estado: primer intento fallido (permiso solicitado, imagen de cámara no visible). Corrección del canvas publicada para reintento, sin confirmar aún. Registrar versión iOS, navegador, fecha, red y enlace temporal utilizado. Android/Chrome: pendiente por falta de dispositivo.

1. Abrir enlace HTTPS autorizado en Safari. Abrir cámara y conceder permiso. Repetir denegando permiso: debe aparecer explicación y opción de reintento/vista 3D.
2. Probar primero `/diagnostico.html`: mover suavemente, colocar cubo, registrar el tipo de hit. Un punto visual no es una superficie confirmada.
3. Volver al inicio y abrir campus 3D: no debe solicitar cámara. Girar, ampliar y seleccionar pines. Elegir Ver ave en realidad aumentada y entonces conceder permiso, colocar el ave y comprobar anclaje/recolocación. Volver al campus debe apagar cámara.
4. Abrir cada ave. Solo el ave debe quedar visible. Tocar: canto y un clip en cuatro aves; Carpintero estático. Revisar deformaciones, volumen y duración.
5. Completar las cinco actividades. Comprobar colección persistida. Ir a información/ficha completa: cámara y canto deben detenerse; foto, video externo y canto accesibles.
6. Completar quiz en RA tocando las opciones del entorno. Probar incorrecto, corregir, correcto repetido y cambio de orientación. Revisar resultado y persistencia.
7. Ocultar Safari, bloquear y volver; pérdida de tracking/recolocación. Salir durante una carga y volver a entrar. Comprobar ausencia de cámara/audio residuales.
8. Sesión de cinco minutos: registrar tiempo de carga inicial, cambio de modelo, FPS sostenidos, calentamiento o cierres. Heap JS no es memoria total y puede no estar disponible.

## Pendiente de verificar

Safari real, cámara/permisos, tracking, estabilidad/escala, cinco minutos, rendimiento del campus pesado, red lenta/carga fallida, clip completo de cada ave y recuperación de ciclo de vida. La compilación y el render de escritorio no sustituyen estas pruebas.

## Enlace temporal

Servir exclusivamente `dist` con preview en 4173. Un túnel Cloudflare permite HTTPS temporal y hace esos archivos accesibles a quien tenga el enlace. Obtener autorización concreta antes de abrirlo; no usar una URL antigua. No compartir el servidor de desarrollo ni la raíz del proyecto. Al terminar, detener el túnel. Mantener certificados y firewall sin cambios.

El 14 de octubre el usuario autorizó la prueba temporal de Cloudflare. Enlace y sesiones registrados en docs/ESTADO-IMPLEMENTACION.md. Se verificó apertura HTTPS en escritorio; resultado físico aún pendiente.

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

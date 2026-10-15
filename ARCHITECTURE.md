> Aclaración del usuario, 14 octubre 2026: el campus es un mapa 3D navegable SIN cámara. Seleccionar un pin ofrece abrir únicamente el ave en RA. Volver al campus detiene la cámara y reabre la vista 3D. El quiz RA se conserva. Esta aclaración reemplaza las referencias anteriores a campus en RA.

# Arquitectura vigente · 14 octubre 2026

Aplicación Vite con JavaScript, CSS y catálogo JSON. Sin cuentas, backend, geolocalización ni micrófono. Los videos se abren en YouTube tras una acción del usuario.

- `src/app.js`: rutas por hash, interfaz, diálogos, coordinación de sesión, actividades y quiz.
- `src/ar/experience.js`: escena compartida, GLTFLoader, AnimationMixer, raycast, pines, opciones y elementos ilustrativos. Vista 3D con OrbitControls; RA con cámara XR8.
- `src/ar/runtime.js`: espera xrloaded, carga SLAM local, cámara, tracking, pausa y errores. El inicio tiene tiempo límite y cancelación.
- `src/ar/placement.js`: selección de hit validado. FEATURE_POINT no se presenta como superficie detectada.
- `src/audio.js`: un reproductor por aplicación, inicio por gesto, pausa al cambiar de vista o esconder pestaña; evita errores tardíos de una reproducción cancelada.
- `src/state/progress.js`: persistencia versionada, IDs científicos, tolerancia a corrupción/cuota. Colección separada de resultados.
- `src/state/quiz.js`: cinco preguntas, 20 puntos al primer acierto, reintento educativo sin puntos extra ni avance antes del acierto.
- `src/data/birds.json`: contenido, rutas y créditos. `quiz.json`: respuestas, explicaciones y fuentes. `scene-layout.json`: pines provisionales. `animation-clips.json`: índice y nombre esperado por modelo.

Los módulos 3D se importan bajo demanda. Solo se carga un campus o un ave a la vez. Las cargas obsoletas se cancelan o descartan; al descargar se liberan geometrías, texturas, materiales, skeletons y mixers. Salir destruye la sesión, detiene audio y cámara. Cambiar de ave mantiene el anclaje, pero libera el modelo anterior. Tras perder tracking se solicita recolocar.

La normalización se aplica a un contenedor y no modifica el GLB ni sus huesos. La escala responsive no representa centímetros. Las opciones son objetos seleccionables de la escena y disponen de botones HTML de apoyo. En preview se ajusta el encuadre a la proporción de pantalla; RA conserva la proyección del motor.

`diagnostico.html` y `src/diagnostic.js` preservan el prototipo independiente. El build contiene ambas entradas. No confundir el diagnóstico ni una vista 3D con validación física del recorrido.

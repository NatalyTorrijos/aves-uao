# Modelos integrados

Ver pesos, triángulos, hashes y extracción conservadora en [RECURSOS-WEB](docs/RECURSOS-WEB.md).

| Modelo | Animación de aplicación | Estado |
|---|---|---|
| Cernícalo / Peregrine | Índice 0 del GLB limpio | Identidad visual pendiente del equipo |
| Reinita Tropical | Índice 0 | Revisión visual completa del clip pendiente |
| Mosquerito Silbón | Índice 0 | Revisión visual completa del clip pendiente |
| Carpintero Cariblanco | Ninguna | Estático por decisión del equipo |
| Colibrí Esmeralda | Índice 0 | Garganta y especie pendientes del equipo, sin retoques |
| Campus | Ninguna | Pines ilustrativos; ubicaciones por confirmar |

El manifiesto `src/data/animation-clips.json` exige índice y nombre concordantes; se rechaza un clip ausente o sin variación. Se reproduce un solo clip con LoopOnce al tocar; no se asigna un comportamiento biológico solo por su nombre. Se conservan los demás clips disponibles.

Se comprobó estructuralmente la correspondencia del manifiesto con los cinco GLB. La carga web está comprobada para las cinco aves. Estos controles no certifican ausencia de deformaciones durante todos los cuadros ni rendimiento móvil. No declarar animaciones aprobadas hasta revisar en pantalla y dispositivo.

Los originales no se alteraron. Campus: 1,23 millones de triángulos; texturas de aves de hasta 4096². Medir primero en el teléfono antes de decidir reducción visual. No bajar resolución ni cambiar apariencia sin justificarlo con mediciones y conservar una copia recuperable.

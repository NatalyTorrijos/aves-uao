# Revisión de recursos AvesRA

13 de octubre de 2026. Se recibieron seis GLB y un Word. Los archivos originales permanecen intactos. La carpeta se llama `AvesRA`, no `AverRA`.

## Cambio de selección confirmado

Durante esta revisión el usuario confirmó cambiar a las cinco especies del nuevo Word. Esta decisión reemplaza la selección anterior en la planificación futura:

| Especie objetivo | Nombre científico del Word | Archivo recibido |
|---|---|---|
| Cernícalo Americano | Falco sparverius | Peregrine.glb, identidad visual pendiente de aceptar |
| Reinita Tropical | Setophaga pitiayumi | ReinitaTropical.glb |
| Mosquerito Silbón | Camptostoma obsoletum | MosquiteroSilbon.glb |
| Carpintero Cariblanco | Colaptes rubiginosus | CarpinteroBlanco.glb |
| Colibrí Esmeralda / Esmeralda Occidental | Chlorostilbon melanorhynchus | ColibiEsmeralda.glb |

No se ha migrado todavía el catálogo de la aplicación ni implementado estas aves. Los documentos anteriores describen la planificación inicial y deben leerse con esta modificación. La primera experiencia completa será una de las nuevas especies; no se seguirá produciendo el Bichofué como si el alcance no hubiera cambiado.

## Modelos recibidos

Se comprobaron cabeceras GLB 2.0, tamaños declarados, límites básicos de bufferViews, recursos externos, geometría, materiales, esqueletos y animaciones. Se importaron los seis en Blender 5.2.1 y se inspeccionaron renders de las cinco aves y el campus. No se ejecutó el validador completo de Khronos ni se probaron estos recursos en iPhone/Android.

| Archivo | Peso decimal MB | Triángulos de la escena predeterminada | Huesos del ave principal | Clips |
|---|---:|---:|---:|---:|
| CarpinteroBlanco.glb | 64,29 | 6.303 | 40 | 0 |
| ColibiEsmeralda.glb | 74,72 | 5.348 | 16 | 0 |
| MosquiteroSilbon.glb | 89,89 | 5.305 | 36 | 0 |
| Peregrine.glb | 99,35 | 4.827 | 28 | 0 |
| ReinitaTropical.glb | 99,46 | 5.304 | 30 | 0 |
| universidad2.glb | 64,16 | 1.230.091 | No aplica | 0 |

Total de GLB: aproximadamente 491,87 MB. Todos contienen materiales e imágenes embebidas y no declaran archivos externos requeridos. La existencia de skin/huesos acredita estructura para deformación, no que los pesos o las articulaciones estén bien preparados para las acciones que necesitamos.

### Exportación con escenas adicionales

Cada GLB contiene seis escenas: carpintero blanco, Colibri esmeralda, MapaU, Mosquitero Silbon, PeregrinePrueba y Reinita Tropical. Cambia cuál es la escena predeterminada. Se identificaron 304 mallas de geometría del campus compartidas por los archivos de aves mediante hashes de datos de posición/índices.

Los GLB almacenan aproximadamente 1,24–1,26 millones de triángulos de geometría única entre todas sus mallas, aunque la escena predeterminada de cada ave solo muestra una malla de unos 5.000–6.300 triángulos. No confundir contenido almacenado, geometría visible y número de triángulos que realmente dibujaría el navegador. El archivo completo sigue transfiriéndose y el cargador puede preparar otras escenas; debe limpiarse antes de integrarlo.

Acción: exportar solo la escena del ave y los objetos necesarios —malla, armature y soportes deliberados—; excluir escenas y recursos del campus y otras aves. Optimizar una copia y volver a medir. No hace falta reducir indiscriminadamente las mallas de las aves, que ya tienen una cantidad razonable de triángulos. El campus sí necesita evaluación de complejidad y simplificación.

### Aspecto e identidad

- Carpintero: modelo reconocible como carpintero sobre un tronco; revisar patrones, colores y extensión del rojo contra la ficha. El nombre científico del Word, Colaptes rubiginosus, coincide con el Carpintero Cariblanco de la guía UAO aportada. «CarpinteroBlanco» es un nombre de archivo, no evidencia de una identificación taxonómica distinta.
- Colibrí: el render muestra un parche rojo amplio en la garganta. No coincide con el macho verde esmeralda de la referencia aportada. Requiere corrección de material/textura y revisión de anatomía antes de presentarlo como Chlorostilbon melanorhynchus.
- Mosquerito: referencia general reconocible; hay soporte/ramas y un elemento inferior voluminoso incorporados a la misma malla. Separarlos si necesitamos movimiento independiente del ave. Revisar pico, cresta, patas y manchas.
- Cernícalo: el nombre `Peregrine` sugiere otro objetivo de generación. El render es una rapaz con alas extendidas; no se acepta como Falco sparverius solo por cambiarle el nombre. Contrastar cara, patrón de alas, cola y colores con la foto. La revisión visual actual no constituye identificación ornitológica definitiva.
- Reinita: silueta de ave pequeña con dorso/cabeza azul y vientre amarillo. Revisar rasgos de Setophaga pitiayumi, espalda verdosa y marcas alares. Rama integrada: verificar cómo se deforma al animar.
- Campus: importación y render correctos como maqueta. No se acreditó exactitud arquitectónica, orientación geográfica, escala métrica ni posiciones reales de rutas/avistamientos.

Las aves aparecen con escalas de exportación cercanas a 1,7 unidades de altura en varios archivos; no equivalen a tamaños biológicos aprobados. Calibrar escala, pivote, orientación y apoyo durante integración.

## Revisión del Word

Se leyó el texto y los hipervínculos completos y se revisaron las 13 páginas renderizadas mediante Word y Poppler. La última página está vacía. Hay cinco fotografías embebidas, fichas, enlaces de cantos/videos, un pitch y ocho preguntas de selección múltiple. No se modificó el Word.

Problemas de contenido y trazabilidad:

1. Referencias de páginas inconsistentes con el PDF entregado: este tiene 40 páginas, por lo que no existen páginas PDF 47, 55 o 65. Si las referencias corresponden a otra edición, falta esa fuente.
2. En la guía local: Cernícalo está en página PDF 24; Reinita Tropical en 29; Mosquerito Silbón en 37; Carpintero Cariblanco en 22; Esmeralda Occidental en 18. Verificar siempre la página PDF frente a numeración impresa u otra edición.
3. La guía local llama Mosquerito Silbón a Camptostoma obsoletum; no respalda la afirmación de que se llama Tiranuelo Silbador en su página 47.
4. Hábitat y comportamiento del carpintero requieren edición: la guía lo describe en niveles medios/altos de selvas tropicales/subtropicales; la ficha mezcla esto con espacios abiertos y actividad conspicua. Lo complementario debe tener fuente propia, no atribuirse automáticamente a la guía.
5. Las ubicaciones en canchas, lagos, jardines y parqueaderos son propuestas sin registros georreferenciados aportados. Pueden mostrarse como zonas sugeridas por hábitat, sin afirmar avistamientos confirmados.
6. El dato del Esmeralda como migratorio aparece en la guía, pero requiere contraste especializado antes de publicarlo; no convertir una posible errata en una pregunta puntuable. Revisar también cola y comparación de tamaño.
7. La cifra de 84 especies debe contextualizarse como registro de la edición 2023; el dato de 561 para Cali necesita fuente y fecha. El pitch de 45 segundos es una base, no cubre por sí mismo la presentación requerida de cinco minutos.
8. Las fotografías no incluyen un registro completo de fuente/licencia por imagen; algunas conservan marcas de autor. Tenerlas embebidas no equivale a permiso de publicación.
9. Hay ocho preguntas HTML/documentales. Deben seleccionarse/adaptarse a aproximadamente cinco actividades contestadas en RA, con feedback y puntuación. Evitar evaluar afirmaciones aún no verificadas.
10. Corregir numeración de Carpintero (figura como 1), enlaces/citas y notas editoriales como «Conviene que pongas…» antes de convertir el texto en fichas públicas.

## Audios y derechos

| Ave según el Word | Ficha enlazada | Estado |
|---|---|---|
| Cernícalo | https://xeno-canto.org/1103884 | Pendiente de verificar especie, autor, licencia y archivo |
| Reinita | https://xeno-canto.org/1184753 | Pendiente de verificar especie, autor, licencia y archivo |
| Mosquerito | https://xeno-canto.org/1140314 | Pendiente de verificar especie, autor, licencia y archivo |
| Carpintero | https://xeno-canto.org/615457 | Pendiente de verificar especie, autor, licencia y archivo |
| Esmeralda | https://xeno-canto.org/527987 | Pendiente de verificar especie, autor, licencia y archivo |

Se intentó abrir las cinco fichas. La herramienta de navegación no recuperó su contenido y las peticiones directas devolvieron HTTP 200 con una página de verificación de visitante, no la ficha de grabación. Por tanto no se acredita especie correcta, disponibilidad de descarga ni licencia. No se intentó saltar esa verificación. No hay archivos de audio en AvesRA.

El usuario informa que los modelos fueron generados con Meshy. Registrar por cada uno enlace/ID de generación, procedencia de la imagen de referencia, fecha y condiciones aplicables a la cuenta utilizada. No se inspeccionó una cuenta privada ni se asume permiso a partir de la extensión GLB. Para el campus, identificar autor y procedencia de elementos de terceros: varios objetos conservan nombres Sketchfab_model, lo cual requiere aclaración de origen y no prueba por sí solo una infracción.

## Qué falta y qué podemos resolver

- Limpiar las exportaciones de aves y optimizar texturas; conservar originales.
- Revisar deformación del rig y crear los clips necesarios. Ver [flujo de animación](ANIMACION-MESHY-GLB.md).
- Corregir identidad visual del colibrí y confirmar la rapaz frente a la foto de Falco sparverius.
- Optimizar la maqueta y definir pines/rutas basados en su geometría real.
- Editar las fichas, fuentes y quiz; migrar catálogo y planificación a la selección confirmada.
- Obtener MP3/WAV de los cantos con especie, autor y licencia documentados. La verificación interactiva de Xeno-canto puede requerir acceso del usuario.
- Documentar derechos de modelos, imágenes y campus. Los editables `.blend`, si existen, facilitarán edición y conservación de acciones que pudieron perderse en exportación, pero no son imprescindibles para inspeccionar los GLB.
- Validar cámara, tracking, colocación y rendimiento en los teléfonos. La aprobación física de H1 continúa pendiente.

La auditoría no integra recursos en la web, no cambia los originales ni acredita animación, optimización, licencia o validación móvil completas.

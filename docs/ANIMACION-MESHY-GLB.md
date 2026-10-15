# Animaciones de Meshy y exportación GLB

13 de octubre de 2026. Los cinco GLB recibidos tienen skin/esqueleto para su ave principal, pero ninguno declara clips en el array `animations`. No se puede determinar solo a partir de estos archivos si nunca se animaron o si las animaciones se perdieron al exportar.

## Formatos de trabajo

- `.blend`: conservar escena editable, rig, pesos y acciones de Blender.
- `.fbx`: intercambio opcional de Meshy a Blender con esqueleto y animación, si esa descarga está disponible.
- `.glb`: entrega para la web, con modelo, materiales/texturas, skin y clips dentro del mismo archivo.

Cambiar de extensión o activar una casilla no crea movimientos inexistentes. Los cantos se mantienen como audio separado.

## Si se anima en Meshy

La [guía oficial Animate](https://docs.meshy.ai/en/webapp/guides/animate) indica abrir el modelo, entrar en Animate, preparar el rig, seleccionar un movimiento, previsualizarlo y exportar FBX o GLB con datos de animación. Descargar el personaje con rig y descargar un resultado animado son operaciones diferentes.

La guía web documenta principalmente humanoides y cuadrúpedos y advierte sobre anatomías no reconocidas. La [API de rigging](https://docs.meshy.ai/en/api/rigging) describe limitaciones aún más específicas para humanoides. No extrapolar la compatibilidad de una interfaz a otra ni prometer aleteo/picoteo automático de aves. Si el movimiento no funciona con la anatomía del ave, usar Blender en vez de aplicar movimientos humanos a sus alas.

Si la cuenta permite crear y descargar un movimiento adecuado, exportar ese resultado animado. Si entrega varios archivos, conservarlos junto con el personaje original para reunir los clips en Blender. Confirmar después que el GLB realmente contiene animaciones y que se reproducen en el motor.

## Flujo recomendado para estas aves

1. Importar el GLB en Blender y aislar su escena. Excluir las otras cinco escenas almacenadas en cada archivo.
2. Revisar armature, pesos y pivotes de cuerpo, cabeza, alas, cola y patas. Separar ramas/soportes si su deformación acompaña indebidamente al ave.
3. Crear acciones nombradas por comportamiento, por ejemplo `Idle`, `Canto`, `Aleteo` o `Picoteo`, según la especie e interacción elegida. No todas las aves necesitan todos los clips.
4. Probar cada acción en la línea de tiempo; hornear constraints/controles al esqueleto deformador cuando sea necesario. Conservar el `.blend` antes de exportar.
5. Usar File → Export → glTF 2.0; formato glTF Binary (`.glb`). Incluir la malla y su armature, exportar solo la selección/escena necesaria y activar exportación de animaciones y skinning. Escoger el modo de acciones o pistas NLA adecuado a la organización del archivo; comprobar nombres y separación de clips.
6. Reimportar una copia del GLB exportado y reproducir sus clips. Verificar que no aparezcan otras escenas, que los materiales estén presentes y que el modelo no se deforme incorrectamente.
7. Revisar los clips en three.js y probar en móvil, activando cada uno por nombre. Guardar peso, triángulos y duración reales.

Referencia del exportador mantenido por Khronos: [documentación glTF Blender IO](https://github.com/KhronosGroup/glTF-Blender-IO/blob/main/docs/blender_docs/scene_gltf2.rst).

Es posible animar reposo, mirada, aleteo o picoteo a partir de una malla generada por IA si la geometría y el rig lo permiten; la complejidad y la calidad de deformación solo se conocen tras probarlos. No hace falta regenerar todas las aves únicamente porque los GLB actuales carezcan de clips.

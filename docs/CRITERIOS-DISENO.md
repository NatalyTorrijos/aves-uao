> Estado histórico: para el alcance vigente del 14 de octubre de 2026 consultar PROMPT-MAESTRO-ASTRA.md, CONTENIDO-VIGENTE.md y ESTADO-IMPLEMENTACION.md.

# Ideas incorporadas del prompt de referencia

**Actualización del 13 de octubre de 2026:** recibida la carpeta AvesRA; el usuario confirmó cambiar a Cernícalo Americano, Reinita Tropical, Mosquerito Silbón, Carpintero Cariblanco y Colibrí Esmeralda. Esta decisión sustituye la selección conservada en el texto histórico de abajo. Ver [auditoría de recepción](AUDITORIA-AVESRA.md). La implementación y los textos actuales de la web aún requieren migración.

Fecha: 13 de octubre de 2026. El usuario aporta un prompt de una amiga como referencia para seleccionar ideas relevantes, no como sustitución del alcance ni como orden de implementar toda la aplicación. Anuncia que entregará los cinco modelos de aves y el modelo de la universidad en GLB, un documento con fotografías y los audios. Estos recursos siguen pendientes de recepción e inspección.

## Ideas para integrar en próximos hitos

La explicación transcrita posterior concreta el recorrido campus → pin → ave → ficha y los accesos Inicio/Mis Aves/UAO Sostenible. Se registra como [flujo de referencia](FLUJO-EXPERIENCIA.md), con estados de permisos, regreso al mapa y requisitos educativos que no aparecen en la transcripción. No se presenta como funcionalidad ya implementada.

- Interfaz inspirada en Material Design: tarjetas, botones táctiles claros, iconos coherentes, diálogos y paneles inferiores con esquinas redondeadas. Aplicar una jerarquía consistente y comprobar legibilidad, contraste y tamaño táctil.
- Navegación entre Inicio, Exploración RA, Mis Aves y UAO Sostenible. El mapa podrá tener su propio acceso cuando esté integrado. Mantener cámara y controles esenciales despejados durante la experiencia.
- Colección Mis Aves con estado vacío útil, tarjetas de especies descubiertas y progreso persistente mediante localStorage, separado del catálogo científico.
- Ficha breve sobre la cámara y ficha ampliada con nombres, familia, rasgos, hábitat, fotografía y reproductor de canto. Incluir videos solo si se aportan y contribuyen al aprendizaje.
- Controles separados de canto, información, salida y retorno a la exploración. Detener audio y animaciones al cambiar de modo o salir.
- Sección UAO Sostenible para biodiversidad del campus y propósito educativo. Créditos de los autores reales del proyecto; confirmar nombres e imágenes antes de mostrarlos.
- Futuro mapa GLB con pines y rutas como objetos separados, unidos al mismo grupo para acompañar sus transformaciones. Calibrar posiciones sobre el modelo real y verificar las ubicaciones; distinguir rutas propuestas de observaciones confirmadas.

## Criterios que se mantienen

- Tecnología actual: 8th Wall Engine con three.js. Las ideas visuales no requieren sustituir la integración por A-Frame ni copiar componentes específicos de ese framework.
- Especies: Bichofué, Pellar, Colibrí Colirufo, Carpintero Habado y Guacamaya Cariseca. Las especies del prompt de referencia no se incorporan.
- Desarrollo incremental: validar H1, completar el flujo del Bichofué y después escalar. El mapa no condiciona el primer MVP.
- Paleta natural verde/verde azulado y fondos claros como dirección vigente. El vinotinto de la referencia puede evaluarse como acento; no se declara un color oficial UAO verificado ni sustituye automáticamente la dirección previa.
- Descubrimiento ligado a una acción educativa significativa, no simplemente abrir un pin. Una interacción diferente por ave y quiz RA permanecen en el alcance; el prompt de referencia no los reemplaza por un único botón de reproducir.
- Reproducir clips elegidos por nombre y acción, sin activar todas las animaciones simultáneamente con un comodín.
- Iconos y fuentes deberán comprobarse por licencia y rendimiento; no añadir dependencias externas automáticamente por estar citadas en el prompt.
- No atribuir el proyecto a la persona nombrada en la referencia, usar fotografías ajenas, asumir licencias ni copiar coordenadas de ejemplo como ubicaciones reales.

## Recepción de recursos anunciados

| Recurso | Revisión al recibirlo |
|---|---|
| Cinco aves GLB | Correspondencia de especie, materiales/texturas, dimensiones, orientación, peso, triángulos, rig y clips realmente incluidos |
| Universidad GLB | Peso y complejidad, texturas, origen/escala, partes identificables y calibración de pines/rutas |
| Documento con fotos | Identificar fotografía por especie, calidad, autor, fuente y permiso de uso |
| Audios | Identificar especie y autor, licencia, formato, duración, calidad y volumen; optimizar una copia para web |

GLB es el formato de los modelos, no el formato de entrega exigido para fotografías o cantos. La extensión no garantiza rig, animaciones o texturas correctas. Conservar originales y crear copias optimizadas. Los archivos editables Blender, si existen, son útiles para modificaciones posteriores, pero no se consideran recibidos ni obligatorios para inspeccionar un GLB.

Esta nota registra decisiones de diseño y recursos futuros. No acredita implementación de pantallas, mapa, colección, aves, audio o quiz ni aceptación de pruebas móviles.

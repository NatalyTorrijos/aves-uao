> Aclaración del usuario, 14 octubre 2026: el campus es un mapa 3D navegable SIN cámara. Seleccionar un pin ofrece abrir únicamente el ave en RA. Volver al campus detiene la cámara y reabre la vista 3D. El quiz RA se conserva. Esta aclaración reemplaza las referencias anteriores a campus en RA.

> Estado histórico: para el alcance vigente del 14 de octubre de 2026 consultar PROMPT-MAESTRO-ASTRA.md, CONTENIDO-VIGENTE.md y ESTADO-IMPLEMENTACION.md.

# Flujo de experiencia propuesto

13 de octubre de 2026. Basado en la explicación transcrita de la amiga del usuario, como referencia de diseño. No acredita implementación ni sustituye los requisitos oficiales. La selección vigente es Cernícalo Americano, Reinita Tropical, Mosquerito Silbón, Carpintero Cariblanco y Colibrí Esmeralda, confirmada por el usuario.

## Navegación general

Encabezado con identidad del proyecto, logo UAO autorizado y accesos a Inicio, Mis Aves y UAO Sostenible. Cuerpo con la vista activa y pie de página con créditos. Interfaz inspirada en Material Design; no confundir este sistema de componentes con un manual de identidad institucional. Antes de usar logo/colores como oficiales, obtener los recursos y criterios institucionales correspondientes.

## Recorrido de referencia

1. Inicio: tarjeta «Explora el campus de la UAO», con acceso a la experiencia aumentada e instrucciones breves.
2. Entrada a RA: solicitud de permisos por gesto, carga identificada, guía para explorar el entorno y colocación de la maqueta. No mostrar la maqueta como anclada a una superficie si solo se dispone de un punto visual.
3. Campus aumentado: pines correspondientes a las cinco especies. Posiciones calibradas sobre el modelo real; las ubicaciones por hábitat se presentan como sugeridas hasta disponer de registros de avistamiento.
4. Selección de pin: diálogo «¿Quieres observar el ave de esta zona?» con «Ver ave» y «Seguir explorando el mapa».
5. Modo ave: ocultar la maqueta y mostrar el ave con escala/orientación adecuadas. Mantener una referencia de retorno a la colocación del mapa. Instrucción breve «Toca el ave para observarla».
6. Interacción: tocar activa el comportamiento específico de esa especie y, cuando corresponde, el canto. Cargar y elegir clips por nombre. Ofrecer control de sonido independiente y feedback visual; no iniciar todas las animaciones a la vez.
7. Información breve: panel inferior con nombre, un rasgo y contexto. «Ver ficha completa» conduce a la ficha de la especie en Mis Aves; salir del modo RA detiene cámara, sonidos y animaciones.
8. Mis Aves: colección persistente con estado vacío, fotos, nombres, información y canto. Video opcional si se aporta y tiene condiciones de uso adecuadas. Marcar descubrimiento tras la interacción educativa definida, no automáticamente por abrir un pin.
9. Volver al mapa: detener actividad del ave y recuperar la maqueta en su posición si la sesión y el tracking lo permiten. Si se perdió la referencia, pedir recolocar; no prometer conservar un anclaje entre sesiones independientes.
10. UAO Sostenible: propósito educativo, biodiversidad del campus y autores reales, con fuentes y créditos. No usar nombres de ejemplo del prompt anterior.

## Requisitos que completan esta referencia

La transcripción describe navegación y presentación, pero no desarrolla el quiz RA ni cinco interacciones diferenciadas. Ambos siguen en el alcance. La primera interacción táctil común puede abrir la experiencia de cada ave; el comportamiento y desafío central deben diferenciarse por especie. El quiz debe comprobar aprendizaje de aves y entorno UAO mediante contenido aumentado, con feedback, puntuación y resultado.

## Orden de implementación

Mantener el desarrollo por hitos: validar cámara/tracking/colocación, preparar una sola ave con animación y canto, comprobar su interacción y ficha, incorporar la transición campus–ave y después escalar. Usar la maqueta como entrada propuesta de la experiencia final no obliga a cargarla para las pruebas iniciales de cámara o del primer modelo.

Estado actual: solo existe el prototipo del cubo H0/1. Este flujo, las pantallas completas, los pines, las aves, la colección y el quiz aún no están implementados. Antes de integrar recursos, resolver los hallazgos de [la auditoría](AUDITORIA-AVESRA.md).

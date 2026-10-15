# 8th Wall verificado · 2026-10-09

## Cambio de plataforma

El acceso al antiguo portal terminó el 28-02-2026; el hosting legado tiene fecha de cierre 28-02-2027. Para un proyecto nuevo se utiliza Desktop o el motor distribuible con alojamiento propio. No crear cuentas/workspaces ni usar app keys del flujo Cloud Editor antiguo. [FAQ de transición](https://8thwall.org/docs/migration/faq).

Desktop instalado: **1.0.202609241937**, coincide con la release oficial consultada. El editor abierto mostró una escena existente con Box y runtime Studio 3.2.1. No se modificó esa escena. [Release oficial](https://github.com/8thwall/desktop/releases/tag/v1.0.202609241937).

## Dos rutas oficiales

1. **Desktop/Studio visual:** Home → New Project → título → World Effects → Create. La plantilla incluye colocación. Preview/Simulator → abrir navegador. Connect Device acepta una URL HTTPS y genera acceso al teléfono. Exportar mediante Publishing; no copiar directamente archivos de Studio al hosting. [Creación](https://8thwall.org/docs/getting-started/create-project), [pruebas](https://8thwall.org/docs/getting-started/testing), [publicación](https://8thwall.org/docs/getting-started/publishing).
2. **Engine con código:** instalar engine-binary, copiar todos sus archivos dist y cargar xr.js con chunk slam. Integrar three.js mediante módulos de pipeline. Es la ruta elegida para la prueba reproducible en esta carpeta: permite trabajar sin depender del control de la ventana Desktop. [Integración oficial](https://8thwall.org/docs/engine/overview), [ejemplo oficial](https://github.com/8thwall/threejs-world-effects-example).

No mezclar componentes ECS de Studio con módulos three.js. Una migración posterior del código de interacción requiere un adaptador y validación, no copiar scripts a ciegas.

## APIs utilizadas y límites

- XR8.GlTextureRenderer, XR8.Threejs y XR8.XrController: feed, escena y tracking.
- XR8.run, módulos de lifecycle y actualización de proyección: inicio y sincronización.
- XrController.configure: World Tracking activo; escala responsive inicialmente, sin prometer centímetros reales.
- XrController.hitTest: coordenadas normalizadas; la documentación actual muestra FEATURE_POINT como filtro y enumera otros tipos posibles en los resultados. Un punto visual **no acredita un plano**. La prueba intenta consulta sin filtro y consulta FEATURE_POINT; conserva el tipo real y exige validar en teléfonos qué devuelve este binario.
- No se añaden VPS, mapas Niantic ni Hand Tracking. El mapa UAO futuro sería un asset propio independiente.

[configure](https://8thwall.org/docs/api/engine/xrcontroller/configure), [hitTest](https://8thwall.org/docs/api/engine/xrcontroller/hittest), [pipeline](https://8thwall.org/docs/api/engine/camerapipelinemodule).

Versiones npm comprobadas: engine-binary 1.0.0, xrextras 1.0.0, landing-page 1.0.0. three 0.183.2 y Vite 8.0.8 coinciden con el ejemplo oficial consultado. Se fijan versiones y lockfile. La versión del binario distribuible, la versión Desktop y el runtime ECS son identificadores distintos.

El motor SLAM es binario cerrado con acuerdo propio; no describir todo 8th Wall como MIT/open source. Conservar binarios y atribuciones sin modificación. [Licencia del motor](https://github.com/8thwall/engine/blob/main/LICENSE). El uso académico gratuito previsto no requiere las funcionalidades cloud retiradas.

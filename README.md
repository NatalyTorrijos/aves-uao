> Aclaración del usuario, 14 octubre 2026: el campus es un mapa 3D navegable SIN cámara. Seleccionar un pin ofrece abrir únicamente el ave en RA. Volver al campus detiene la cámara y reabre la vista 3D. El quiz RA se conserva. Esta aclaración reemplaza las referencias anteriores a campus en RA.

# Aves UAO · WebAR

Aplicación local de descubrimiento de cinco aves del campus UAO. Estado: 14 de octubre de 2026. El recorrido y el quiz están implementados; la aceptación física de cámara, tracking y rendimiento sigue pendiente en el iPhone 16 Pro del equipo. Android no está disponible.

## Abrir en este computador

Desde PowerShell, en esta carpeta:

```powershell
.\scripts\abrir-proyecto.ps1 -Modo preview
```

Abre http://127.0.0.1:4173. Mantén esa terminal abierta. El script localiza Node instalado o el runtime de Codex; no requiere que pnpm esté en PATH. Si PowerShell bloquea scripts, no cambies la política global: utiliza Node directamente como se explica abajo. La vista 3D funciona sin cámara.

Para desarrollo, pruebas y nueva compilación: sustituir `preview` por `dev`, `test` o `build`. Preview utiliza la última carpeta dist; ejecutar build después de editar.

## Entorno habitual

Node >=22.12, pnpm y dependencias del lockfile. Vite 8.0.8, three.js 0.183.2 y paquetes 8th Wall 1.0.0. Es una integración Engine + three.js; no un proyecto de Studio/Cloud Editor.

```sh
pnpm install --frozen-lockfile
pnpm prepare:runtime
pnpm dev
pnpm test
pnpm build
pnpm preview --port 4173
```

Sin pnpm en PATH y con dependencias ya instaladas:

```powershell
$nodePath = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
& $nodePath scripts/copy-runtime.mjs
& $nodePath node_modules/vite/bin/vite.js build
& $nodePath node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort
```

## Recorrido

Inicio → campus y cinco pines orientativos → confirmación → ave sola → canto y actividad → información breve → ficha completa con fotografía, canto y enlace al video → colección → quiz de cinco preguntas → resultado. La cámara se detiene al abrir la ficha completa o salir. El Carpintero se conserva estático.

Especies: Cernícalo Americano, Reinita Tropical, Mosquerito Silbón, Carpintero Cariblanco y Colibrí Esmeralda. Los archivos recibidos como Peregrine se asignan provisionalmente a Cernícalo según el equipo; revisar identidad antes de publicar.

## Comprobar y entregar

- [Estado y pendientes](docs/ESTADO-IMPLEMENTACION.md)
- [Pruebas y protocolo iPhone](TESTING.md)
- [Contenido y decisiones](docs/CONTENIDO-VIGENTE.md)
- [Arquitectura](ARCHITECTURE.md), [modelos](MODELS.md), [recursos](ASSETS.md), [licencias](LICENSES.md)
- [Guion de presentación](docs/PITCH-Y-DEMO.md)
- [Prompt maestro autorizado](docs/PROMPT-MAESTRO-ASTRA.md)

`diagnostico.html` conserva la prueba independiente del cubo y la colocación. `?qa=1` aísla el progreso de comprobación bajo claves distintas; no usarlo para la colección normal.

Para iPhone se necesita HTTPS confiable. 127.0.0.1 en el teléfono apunta al propio teléfono. Compartir únicamente dist mediante un enlace temporal autorizado; no exponer esta carpeta de trabajo. No se ha publicado la aplicación. Los créditos/permisos, puntos reales del campus y validación de especies siguen pendientes.

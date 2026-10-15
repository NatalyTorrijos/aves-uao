# HITO 0 · Registro del entorno

9 de octubre de 2026. Workspace nuevo: solo estaban los dos documentos originales. No había código, Git, modelos ni audio. No se encontró AGENTS.md.

## Herramientas detectadas

- 8th Wall Desktop: 1.0.202609241937, instalado y ventana detectada. Se leyó una escena existente fuera de esta carpeta, sin modificarla. Su runtime mostrado era 3.2.1.
- Blender: ejecutable instalado en C:/Program Files/Blender Foundation/Blender 5.2/blender.exe. No utilizado para crear aves en esta fase.
- Node: 24.19.0. pnpm: 11.25.0, runtime suministrado por Codex.
- Git disponible. Versionado local inicial, sin remoto ni publicación.
- Python/pypdf/python-pptx y Poppler usados para revisar fuentes; PowerPoint exportó una copia PDF de las diapositivas para inspección.

## Ruta Desktop comprobada en documentación

Abrir Home, New Project, título «Aves UAO», plantilla World Effects, Create. Esa es la opción correcta de partida para Studio; Empty tiene cámara 3D sin RA. Vista previa desde Simulator. Connect Device usa HTTPS. El proyecto visual no se creó aquí: la automatización devolvió minimización/interacción humana al recuperar la ventana; no se continuó a ciegas.

## Ruta ejecutada en esta carpeta

Integración oficial Engine con three.js. package.json fija versiones. scripts/copy-runtime.mjs copia los archivos distribuidos sin cambios. La prueba tiene preview 3D explícito, cámara RA por gesto, cubo, estado de hit y diagnóstico. Fuente y build separados. Esta ruta conserva 8th Wall como tecnología principal y no requiere cuenta del portal retirado.

## Reproducción en este equipo

Si pnpm no está en PATH, el ejecutable verificado es:

```powershell
& 'C:\Users\juand\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' install --frozen-lockfile
& 'C:\Users\juand\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' build
& 'C:\Users\juand\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dev
```

No instalar de nuevo Desktop ni Blender. No se añadieron credenciales, servicios cloud o mapa. Ver TESTING para resultados y pendientes.

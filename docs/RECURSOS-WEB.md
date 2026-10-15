# Recursos preparados para la aplicación web

Preparación: 14 de octubre de 2026. Los archivos recibidos en `recursos-originales` y el Word original permanecen intactos. Las copias de distribución están en `public/assets`. El inventario verificable se encuentra en `public/assets/asset-manifest.json` y contiene rutas públicas, tamaños, hashes SHA-256, procedencia, clips y resultados de decodificación.

## Modelos

| Especie o recurso | Archivo público bajo `/assets/models/` | MB decimales | Triángulos | Clips conservados | Clips con valores de huesos variables |
|---|---|---:|---:|---:|---:|
| Cernícalo Americano | `cernicalo-americano.glb` | 9,68 | 4.827 | 8 | 6 |
| Reinita Tropical | `reinita-tropical.glb` | 11,02 | 5.910 | 8 | 7 |
| Mosquerito Silbón | `mosquerito-silbon.glb` | 13,66 | 5.734 | 8 | 6 |
| Carpintero Cariblanco | `carpintero-cariblanco.glb` | 17,56 | 6.303 | 0 | 0 |
| Colibrí Esmeralda | `colibri-esmeralda.glb` | 10,56 | 5.348 | 7 | 5 |
| Campus UAO | `campus.glb` | 33,65 | 1.228.455 | 0 | 0 |

Total de los seis modelos: **96,13 MB**. Deben descargarse según la vista que se abre; evitar precargar todos los GLB.

La extracción conservadora elimina escenas ajenas a la escena principal y recursos inaccesibles desde ella. Se preservaron los bytes de geometría, índices, pesos, matrices de huesos, imágenes y curvas de animación; además, la jerarquía, los materiales y las transformaciones originales. La verificación independiente del grafo activo coincide antes y después, y los canales y muestreadores de las animaciones retenidas coinciden con la extracción esperada. Se decodificaron todas las imágenes embebidas. Reinita y campus ya estaban preparados: se validaron y se conservaron sin sobrescribirlos.

Los clips que solamente animaban otras escenas no se incluyen. Los índices del manifiesto corresponden al **GLB limpio**, no a los índices del archivo original con seis escenas. El índice sugerido para una vista previa técnica es `0` en las cuatro aves animadas; es el primer clip con variación en huesos, sin atribuirle un comportamiento biológico. El número de clips no equivale a ese número de acciones distintas. El Carpintero permanece estático por decisión del equipo.

Cada ave conserva tres imágenes de textura: dos de 2048 × 2048 y una de 4096 × 4096. No se redujo su resolución ni se recomprimieron. Las texturas y el campus requieren medición en el iPhone: los MB descargados no expresan toda la memoria gráfica utilizada. La colocación o escala de presentación debe aplicarse a un grupo contenedor, sin alterar el archivo fuente ni las articulaciones.

Se conservó la correspondencia aportada por el equipo entre `Peregrine.glb` y Cernícalo Americano. La preparación técnica no acredita la identificación visual de la especie ni corrige rasgos de los modelos, incluida la garganta del colibrí.

## Audios

Todos se sirven como `/assets/audio/<slug>.mp3`, con los mismos cinco identificadores de los modelos.

| Ave | Duración decodificada | Peso MB | Tratamiento |
|---|---:|---:|---|
| Cernícalo Americano | 154,239 s | 2,469 | Copia de WAV a MP3, 128 kbps, mono, 48 kHz |
| Reinita Tropical | 16,960 s | 0,273 | MP3 original copiado, estéreo, 44,1 kHz |
| Mosquerito Silbón | 43,733 s | 0,701 | Copia de WAV a MP3, 128 kbps, estéreo, 44,1 kHz |
| Carpintero Cariblanco | 5,907 s | 0,244 | MP3 original copiado, estéreo, 44,1 kHz |
| Colibrí Esmeralda | 6,323 s | 0,261 | MP3 original copiado, estéreo, 44,1 kHz |

Total: **3,947 MB**. Las dos conversiones emplearon el codificador MP3 incluido en Blender 5.2.1 mediante `aud`. Se conservaron duración completa, frecuencia de muestreo y canales; no hubo recorte ni normalización. La compresión MP3 de las dos copias es con pérdida; los WAV originales se conservan. Los tres MP3 ya recibidos son copias exactas.

Se decodificaron **completamente** originales y copias, sin muestras no finitas, y se comprobó duración y número de canales. La duración decodificada de los MP3 puede diferir ligeramente de la auditoría anterior de cabeceras porque se descuenta el retardo y relleno del codificador. Esto no representa un recorte nuevo. La verificación técnica no sustituye escucha, identificación acústica experta ni reproducción en Safari/Chrome móvil.

Para la interfaz: reproducir solamente tras un gesto del usuario, permitir pausar y detener el audio anterior al cambiar de ave o abandonar la vista. El canto del Carpintero no debe etiquetarse como sonido de picoteo.

### Créditos y pendientes de fuente

- **Reinita:** Étienne Leroy, 2026; [XC1184753](https://xeno-canto.org/1184753), según metadatos. Licencia particular pendiente de contrastar.
- **Carpintero:** Jerome Fischer, 2020; [XC615457](https://xeno-canto.org/615457). Metadatos declaran [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). El grabador indica «90% likely this species» y ave no vista: no presentarlo como identificación acústica incuestionable.
- **Colibrí:** Jerome Fischer, 2020; [XC527987](https://xeno-canto.org/527987). Metadatos declaran CC BY-NC-SA 4.0.
- **Mosquerito:** autor, fuente exacta y licencia pendientes. El Word enlaza XC1140314, pero no se confirmó que el WAV sea esa grabación.
- **Cernícalo:** el ID3 indica «Cernicalo», Cristian Pinto Fernandez, 2022. Fuente exacta y licencia pendientes; el nombre `Peregrine.wav` tampoco prueba por sí solo la especie. No atribuir automáticamente el WAV al enlace XC1103884 del Word.

Los créditos recuperados quedan almacenados en el manifiesto, también para las copias convertidas cuyos contenedores no mantienen todos los metadatos del original. Revisar licencias y atribuciones concretas antes de la publicación; la integración local no afirma que esos pendientes se hayan resuelto.

## Fotografías del Word

Las cinco fotografías de `AvesRA/PROPUESTA DE EXPERIENCIA INTERACTIVA.docx` se extrajeron directamente de su archivo interno y se copiaron sin recorte, edición ni reexportación:

| Ruta bajo `/assets/images/` | Imagen interna | Dimensiones |
|---|---|---|
| `cernicalo-americano.jpg` | `word/media/image5.jpg` | 640 × 480 |
| `reinita-tropical.jpg` | `word/media/image3.jpg` | 678 × 452 |
| `mosquerito-silbon.jpg` | `word/media/image4.jpg` | 649 × 472 |
| `carpintero-cariblanco.jpg` | `word/media/image1.jpg` | 630 × 487 |
| `colibri-esmeralda.jpg` | `word/media/image2.jpg` | 1200 × 708 |

Los hashes de las copias coinciden con los bytes extraídos del Word. Se comprobó decodificación completa JPEG. Se preservan marcas y créditos visibles; autoría y licencia exactas están pendientes de documentar. En las fichas, mostrar la foto completa sin recortar marcas existentes. Las imágenes `campus.png` y `reinita-modelo.png` ya existentes son renders locales y no sustituyen la fotografía de referencia de cada especie.

## Reproducción y alcance de las comprobaciones

Ejecutar `scripts/prepare_web_assets.py` con Python que disponga de NumPy y Pillow. Usa por defecto Blender instalado en `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`; se puede especificar otro ejecutable con `--blender`.

El script usa `scripts/clean_glb.py` y `scripts/verify_clean_glb.py`. Si un archivo copiado ya existe con bytes distintos, o un GLB existente no conserva su grafo visual y animaciones, falla antes de sobrescribirlo. Actualiza solamente el manifiesto propio y los registros técnicos en `tmp/asset-preparation`.

Comprobado: integridad GLB, equivalencia del grafo visual y rig, preservación exacta de curvas y bytes retenidos, decodificación de texturas/JPEG/audio, identidad de originales y rerun de preparación. Pendiente: revisión visual de los movimientos, selección semántica de clips, ensayo de cámara/SLAM y consumo sostenido en dispositivos físicos. No se realizó publicación.

export function createMetrics(element, mode) {
  const start = performance.now()
  let last = start, frames = 0, placement = 'sin colocación'
  return {
    placed(type) {placement = type},
    tick() {
      frames++
      const now = performance.now()
      if (now-last < 1000) return
      const fps = Math.round(frames*1000/(now-last))
      const heap = performance.memory ? `${Math.round(performance.memory.usedJSHeapSize/1048576)} MB (heap JS, no memoria total)` : 'no disponible en este navegador'
      element.textContent = `Modo: ${mode}\nFPS de render: ${fps}\nColocación: ${placement}\nSesión: ${Math.round((now-start)/1000)} s\nMemoria: ${heap}`
      frames = 0; last = now
    },
  }
}

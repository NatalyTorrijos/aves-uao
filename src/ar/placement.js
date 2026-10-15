const priorities = {DETECTED_SURFACE: 0, ESTIMATED_SURFACE: 1, FEATURE_POINT: 2}
export function chooseHit(results, surfaceOnly = false) {
  return (results || []).filter(hit => {
    if (!(hit.type in priorities)) return false
    if (surfaceOnly && hit.type === 'FEATURE_POINT') return false
    return ['x','y','z'].every(k => Number.isFinite(hit.position?.[k]))
      && Number.isFinite(hit.distance) && hit.distance > 0 && hit.distance <= 10
  }).sort((a,b) => priorities[a.type]-priorities[b.type] || a.distance-b.distance)[0] || null
}
export const hitLabels = {
  FEATURE_POINT: 'Punto visual del entorno · no confirma un plano',
  ESTIMATED_SURFACE: 'Superficie estimada por el motor',
  DETECTED_SURFACE: 'Superficie detectada por el motor',
}

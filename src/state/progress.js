export const PROGRESS_KEY = 'uao-birds-progress-v2'

function browserStorage() {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

function quizResult(value, useCurrentDate = false) {
  if (!value || !Number.isFinite(value.score) || !Number.isFinite(value.total)
    || value.total <= 0 || value.score < 0 || value.score > value.total) return null
  const completedAt = value.completedAt ?? (useCurrentDate ? new Date().toISOString() : null)
  if (typeof completedAt !== 'string' || !Number.isFinite(Date.parse(completedAt))) return null
  const mode = value.mode === 'ar' || value.mode === 'preview' ? value.mode : 'unknown'
  return {score: value.score, total: value.total, completedAt, mode}
}

/** The current catalogue is the only source of valid bird IDs. */
export function createProgress(storage = browserStorage(), validIds = []) {
  const allowed = new Set(validIds.filter(id => typeof id === 'string' && id.length > 0))
  let discovered = new Set()
  let lastQuiz = null

  try {
    const saved = JSON.parse(storage?.getItem(PROGRESS_KEY) ?? 'null')
    if (saved?.version === 2) {
      discovered = new Set(Array.isArray(saved.discovered)
        ? saved.discovered.filter(id => allowed.has(id)) : [])
      lastQuiz = quizResult(saved.lastQuiz)
    }
  } catch {
    // Private browsing, damaged JSON and blocked storage must not break the tour.
  }

  function get() {
    return {discovered: [...discovered], lastQuiz: lastQuiz ? {...lastQuiz} : null}
  }

  function persist() {
    try {
      storage?.setItem(PROGRESS_KEY, JSON.stringify({version: 2, ...get()}))
    } catch {
      // The current visit remains usable when persistence is unavailable.
    }
  }

  return {
    get,
    discover(id) {
      if (!allowed.has(id) || discovered.has(id)) return false
      discovered.add(id)
      persist()
      return true
    },
    isDiscovered(id) {
      return discovered.has(id)
    },
    saveQuiz(result) {
      const checked = quizResult(result, true)
      if (!checked) return false
      lastQuiz = checked
      persist()
      return true
    },
    reset() {
      discovered.clear()
      lastQuiz = null
      persist()
      return get()
    },
  }
}

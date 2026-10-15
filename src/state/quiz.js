export const POINTS_PER_QUESTION = 20

function copyQuestion(question) {
  return question ? {...question, options: question.options.map(option => ({...option}))} : null
}

/** Corrective attempts teach the answer but never recover first-attempt points. */
export function createQuiz(questions) {
  if (!Array.isArray(questions)) throw new TypeError('El quiz necesita una lista de preguntas.')
  const catalogue = questions.map(question => {
    const optionIds = question?.options?.map(option => option?.id)
    if (!Array.isArray(question?.options) || !optionIds.length
      || optionIds.some(id => typeof id !== 'string' || !id)
      || new Set(optionIds).size !== optionIds.length
      || !optionIds.includes(question.correctId)) {
      throw new TypeError('Cada pregunta necesita opciones únicas y una respuesta correcta válida.')
    }
    return copyQuestion(question)
  })

  let index = 0
  let attempts = 0
  let correct = null
  let score = 0

  function get() {
    return {
      index,
      question: copyQuestion(catalogue[index]),
      answered: attempts > 0,
      correct,
      attempts,
      score,
      done: index >= catalogue.length,
    }
  }

  return {
    get,
    answer(optionId) {
      const question = catalogue[index]
      if (!question || correct === true || !question.options.some(option => option.id === optionId)) {
        return {accepted: false, correct, explanation: question?.explanation ?? '', score}
      }
      attempts += 1
      correct = optionId === question.correctId
      if (correct && attempts === 1) score += POINTS_PER_QUESTION
      return {accepted: true, correct, explanation: question.explanation ?? '', score}
    },
    next() {
      if (correct === true && index < catalogue.length) {
        index += 1
        attempts = 0
        correct = null
      }
      return get()
    },
    reset() {
      index = 0
      attempts = 0
      correct = null
      score = 0
      return get()
    },
  }
}

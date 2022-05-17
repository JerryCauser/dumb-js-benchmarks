export const DEFAULT_ITERATIONS_NUMBER = 10_000

/**
 *
 * @param {function} suiteFn
 * @param {object?} options
 * @param {boolean?} options.warm
 * @param {number?} options.number
 * @param {boolean?} options.isPromiseAllStep
 * @returns {Promise<void>}
 */
export async function check (suiteFn, {
  warm = true,
  number = DEFAULT_ITERATIONS_NUMBER,
  isPromiseAllStep = false
} = {}) {
  if (warm) {
    const suite = await suiteFn()

    await suite.before?.(number)

    if (!suite.oneTime) {
      for (let i = 0; i < 100; ++i) {
        await suite.fn(i)
      }
    } else {
      await suite.fn()
    }

    await suite.after?.()
  }

  const suite = await suiteFn()
  await suite.before?.()
  let time = performance.now()
  const allowPromiseAll = isPromiseAllStep && suite.promiseAll

  if (suite.sync) {
    suite.firstFn?.()
    if (suite.oneTime) {
      suite.fn()
    } else {
      for (let i = 0; i < number; ++i) {
        suite.fn(i)
      }
    }
    suite.lastFn?.()
  } else {
    await suite.firstFn?.()
    if (suite.oneTime) {
      await suite.fn()
    } else {
      if (allowPromiseAll) {
        const promises = []

        for (let i = 0; i < number; ++i) {
          promises.push(suite.fn(i))
        }

        await Promise.all(promises)
      } else {
        for (let i = 0; i < number; ++i) {
          await suite.fn(i)
        }
      }
    }
    await suite.lastFn?.()
  }
  time = performance.now() - time
  await suite.after?.(true)

  let name = suite.name || suiteFn.name

  if (allowPromiseAll) {
    name += ' [promise.all]'
  }

  console.log(`${name.padEnd(32, ' ')} takes to complete ${time.toFixed(3)} ms\n`)

  if (!isPromiseAllStep && suite.promiseAll) {
    await check(suiteFn, {
      warm,
      number,
      isPromiseAllStep: true
    })
  }
}

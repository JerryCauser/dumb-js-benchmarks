function testSample (
  TEST_DATA_SIZE = 2 ** 10,
  ITERATIONS_SIZE = 100,
  WARMING_UP_ITERATIONS = 10
) {

  function defineTestData (size = TEST_DATA_SIZE) {
    const obj = Object.create(null)
    Array.from({ length: size }).forEach((_, i) => {obj[`${Math.random().toString().slice(2)}${Math.random().toString().slice(2)}`] = i})

    return obj
  }

  function pureDelete (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      Object.keys(obj).forEach(key => {
        delete obj[key]
      })
    }

    return obj
  }

  function nullDelete (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      Object.keys(obj).forEach(key => {
        obj[key] = null
        delete obj[key]
      })
    }

    return obj
  }

  function setUndefined (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      Object.keys(obj).forEach(key => {
        obj[key] = undefined
      })
    }

    return obj
  }

  function reflectDelete (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      Object.keys(obj).forEach(key => {
        Reflect.deleteProperty(obj, key)
      })
    }

    return obj
  }

  function startTestWithFunction (func) {
    func(WARMING_UP_ITERATIONS)
    console.time(func.name)
    func()
    console.timeEnd(func.name)
  }

  return {
    d: startTestWithFunction(setUndefined),
    a: startTestWithFunction(pureDelete),
    c: startTestWithFunction(nullDelete),
    b: startTestWithFunction(reflectDelete),
  }
}

console.log('\nstart tiny sample')
const tiny = testSample(1_000, 1000, 100)

console.log('\nstart small sample')
const small = testSample(50_000, 100, 10)

console.log('\nstart medium sample')
const medium = testSample(500_000, 10, 1)

// console.log('\nstart big sample')
// const big = testSample(5_000_000, 5, 1)

console.log(Object.keys(Object.assign({}, tiny, small, medium)).length)

// console.log('\nstart super big sample')
// testSample(20_000_000, 5, 1)

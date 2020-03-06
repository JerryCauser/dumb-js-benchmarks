function testSample (
  TEST_DATA_SIZE = 2 ** 20,
  ITERATIONS_SIZE = 100,
  WARMING_UP_ITERATIONS = 10
) {

  function defineTestData (size = TEST_DATA_SIZE) {
    const obj = Object.create(null)
    Array.from({ length: size }).forEach((_, i) => {obj[`${Math.random().toString().slice(2)}${Math.random().toString().slice(2)}`] = i})

    return obj
  }

  function forIn (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      for (let i in obj) obj[i]++
    }

    return obj
  }

  function ObjectKeysForEach (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      Object.keys(obj).forEach(key => obj[key]++)
    }

    return obj
  }

  function ObjectKeysForOf (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      for(const key of Object.keys(obj)) obj[key]++
    }

    return obj
  }

  function ObjectKeysFor (iterations = ITERATIONS_SIZE, obj = defineTestData()) {
    while (iterations--) {
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
        obj[keys[i]]++
      }
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
    b: startTestWithFunction(ObjectKeysForEach),
    a: startTestWithFunction(ObjectKeysForOf),
    d: startTestWithFunction(ObjectKeysFor),
    c: startTestWithFunction(forIn),
  }
}

console.log('\nstart tiny sample')
const tiny = testSample(1_000, 1000, 100)

console.log('\nstart small sample')
const small = testSample(50_000, 100, 10)

console.log('\nstart medium sample')
const medium = testSample(500_000, 10, 1)

console.log('\nstart big sample')
const big = testSample(5_000_000, 5, 1)

console.log(Object.keys(Object.assign({}, tiny, small, medium, big)).length)

// console.log('\nstart super big sample')
// testSample(20_000_000, 5, 1)

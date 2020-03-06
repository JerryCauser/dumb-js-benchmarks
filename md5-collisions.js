const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid');

const superIterations = 10
const superHashes = {}

for (let i = 0; i < superIterations; i++) {
  superHashes[`hashes_${i}`] = {}
}

let colCount = 0
const maxIterationsForOneStep = 1_000_00
const maxIterationsWHOLE = superIterations * maxIterationsForOneStep
const logStep = Math.ceil(maxIterationsWHOLE / 100)

console.time('hashing')
for (let i = 0; i < maxIterationsWHOLE; i++) {
  // const payload = uuidv4()
  const payload = i.toString()
  const h = crypto.createHash('md5').update(payload).digest('hex').slice(0, 14)

  for (let j = 0; j < superIterations; j++) {
    if (superHashes[`hashes_${j}`][h] !== undefined) {
      console.log('collision', ++colCount)
    }
  }

  superHashes[`hashes_${~~(i/maxIterationsForOneStep)}`][h] = i
  if (i % logStep === 0) console.log(`${new Date().toISOString()} ${(~~(i / maxIterationsWHOLE * 100_00)) / 100}%`)
}
console.timeEnd('hashing')
console.log((~~(colCount / maxIterationsWHOLE * 100_0000)) / 10000, 'percent of collisions')

import { check } from './tools/check.js'

async function testTypeOf () {
  return {
    sync: true,
    data: ['a', Buffer.alloc(0)],
    fn (i) {
      return typeof this.data[i % 2] === 'string'
    }
  }
}

const TYPE = 'string'

async function testTypeOfVar () {
  return {
    sync: true,
    data: ['a', Buffer.alloc(0)],
    fn (i) {
      return typeof this.data[i % 2] === TYPE
    }
  }
}

async function testInstanceOf () {
  return {
    sync: true,
    data: ['a', Buffer.alloc(0)],
    fn (i) {
      return this.data[i % 2] instanceof Buffer
    }
  }
}

async function testIsBuffer () {
  return {
    sync: true,
    data: ['a', Buffer.alloc(0)],
    fn (i) {
      return Buffer.isBuffer(this.data[i % 2])
    }
  }
}




async function _main() {
  const options = { number: 1_000_000 }

  await check(testTypeOf, options)
  await check(testTypeOfVar, options)
  await check(testInstanceOf, options)
  await check(testIsBuffer, options)

}

_main().catch(console.error).then(() => process.exit(0))



import fs from 'node:fs'
import url from 'node:url'
import path from 'node:path'
import crypto from 'node:crypto'
import stream from 'node:stream'
import { check, DEFAULT_ITERATIONS_NUMBER } from '../tools/check.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const DEFAULT_CHUNK = 'a'

async function appendPromise () {
  return {
    promiseAll: true,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'app-prom.log'),
    async before () {
      fs.writeFileSync(this.path, '' )
    },
    async fn (i) {
      await fs.promises.appendFile(this.path, this.data + i)
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function appendSync () {
  return {
    promiseAll: true,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'app-sync.log'),
    async before () {
      fs.writeFileSync(this.path, '' )
    },
    fn (i) {
      fs.appendFileSync(this.path, this.data + i)
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function writePromise () {
  return {
    promiseAll: true,
    data: DEFAULT_CHUNK,
    opts: { flag: 'a' },
    path: path.resolve(__dirname, 'wri-prom.log'),
    async before () {
      fs.writeFileSync(this.path, '' )
    },
    async fn (i) {
      await fs.promises.writeFile(this.path, this.data + i, this.opts)
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function writeSync () {
  return {
    promiseAll: true,
    data: DEFAULT_CHUNK,
    opts: { flag: 'a' },
    path: path.resolve(__dirname, 'wri-sync.log'),
    async before () {
      fs.writeFileSync(this.path, '')
    },
    fn (i) {
      fs.writeFileSync(this.path, this.data + i, this.opts)
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function writeableStream () {
  return {
    promiseAll: true,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'wri-str.log'),
    async before () {
      fs.writeFileSync(this.path, '')
      this.stream = fs.createWriteStream(this.path)
      await new Promise(resolve => {
        this.stream.once('ready', resolve)
      })
    },
    async fn (i) {
      await new Promise(resolve => {
        this.stream.write(this.data + i, resolve)
      })
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      this.stream.close()
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function writeableStreamPipe () {
  return {
    promiseAll: true,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'wri-str-pipe.log'),
    async before () {
      fs.writeFileSync(this.path, '')
      this.stream = fs.createWriteStream(this.path)
      await new Promise(resolve => {
        this.stream.once('ready', resolve)
      })
    },
    oneTime: true,
    async fn () {
      this.allData = []
      for (let i = 0; i < DEFAULT_ITERATIONS_NUMBER; ++i) {
        this.allData[i] =  this.data + i
      }

      await stream.promises.pipeline(
        this.allData,
        this.stream
      )
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      this.stream.close()
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function openWriteCache () {
  return {
    promiseAll: true,
    cache: [],
    size: 0,
    lock: false,
    timeout: null,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'open-write-cache.log'),
    async write () {
      const data = this.cache.slice(0)
      this.cache = []
      this.lock = true
      await fs.promises.writeFile(this.path, Buffer.concat(data), { flag: 'a' })
      this.lock = false
    },
    async before () {
      fs.writeFileSync(this.path, '')
    },
    async fn (i) {
      this.cache.push(Buffer.from(this.data + i))

      if (!this.lock) await this.write()
    },
    async lastFn () {
      if (this.cache.length > 0) await this.write()
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function openWriteFd () {
  return {
    promiseAll: true,
    cache: [],
    size: 0,
    lock: false,
    fd: null,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'open-write-fd.log'),
    async write (i) {
      await new Promise(resolve => {
        fs.write(this.fd, this.data + i, resolve)
      })
    },
    async before () {
      fs.writeFileSync(this.path, '')
      this.fd = fs.openSync(this.path, 'a')
    },
    async fn (i) {
      // this.cache.push(Buffer.from(this.data + i))

      await this.write(i)
    },
    async after (hash) {
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}


const utf8 = 'utf8'

async function openWriteFdCache () {
  return {
    promiseAll: true,
    // cache: [],
    cache: '',
    lock: false,
    fd: null,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'open-write-fd-cache.log'),
    async write () {
      // const data = Buffer.concat(this.cache)
      // this.cache = []
      const data = this.cache
      this.cache = ''
      this.lock = true
      await new Promise(resolve => fs.write(this.fd, data, undefined, utf8, resolve))
      this.lock = false
    },
    async before () {
      fs.writeFileSync(this.path, '')
      this.fd = fs.openSync(this.path, 'a')
    },
    async fn (i) {
      // this.cache.push(Buffer.from(this.data + i))
      this.cache += this.data + i

      if (!this.lock) await this.write()
    },
    async lastFn () {
      if (this.cache.length > 0) await this.write()
    },
    async after (hash) {
      fs.close(this.fd)
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function openWriteFdCacheAsync () {
  return {
    promiseAll: true,
    // cache: [],
    cache: '',
    lock: false,
    fileHandle: null,
    fd: null,
    data: DEFAULT_CHUNK,
    path: path.resolve(__dirname, 'open-write-fd-cache.log'),
    async write () {
      // const data = Buffer.concat(this.cache)
      // this.cache = []
      const data = this.cache
      this.cache = ''
      this.lock = true
      // await this.fileHandle.write(data)
      await this.fileHandle.writeFile(data)
      // await new Promise(resolve => fs.write(this.fd, data, resolve))
      this.lock = false
    },
    async before () {
      fs.writeFileSync(this.path, '')
      this.fileHandle = await fs.promises.open(this.path, 'a')
      this.fd = this.fileHandle.fd
    },
    async fn (i) {
      // this.cache.push(Buffer.from(this.data + i))
      this.cache += this.data + i

      if (!this.lock) await this.write()
    },
    async lastFn () {
      if (this.cache.length > 0) await this.write()
    },
    async after (hash) {
      await this.fileHandle?.close()
      hash && console.log('file hash', crypto.createHash('sha256').update(fs.readFileSync(this.path)).digest('hex'))
      fs.rmSync(this.path, { recursive: true })
    }
  }
}

async function _main() {
  await check(appendPromise)
  await check(appendSync)
  await check(writePromise)
  await check(writeSync)
  await check(writeableStream)
  await check(writeableStreamPipe, { warm: false })
  await check(openWriteCache)
  await check(openWriteFd)
  await check(openWriteFdCache)
  await check(openWriteFdCacheAsync)
}

_main().catch(console.error).then(() => process.exit(0))



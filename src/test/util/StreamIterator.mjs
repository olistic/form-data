import stream from "stream"
import path from "path"

import test from "ava"
import fs from "promise-fs"

import read from "../__helper__/readStreamWithAsyncIterator"

import StreamIterator from "../../lib/util/StreamIterator"

const filePath = path.join(__dirname, "..", "..", "package.json")

test("Should have a \"next\" method", t => {
  const iterator = new StreamIterator(fs.createReadStream(filePath))

  t.is(typeof iterator.next, "function")
})

test("The next method should return a Promise", async t => {
  const readStream = new stream.Readable({
    read() { this.push(null) }
  })

  const iterator = new StreamIterator(readStream)

  const actual = iterator.next()

  t.true(actual instanceof Promise)

  await actual
})

test("Should return a value in correct format", async t => {
  const readStream = new stream.Readable({
    read() { /* noop */ }
  })

  readStream.push(Buffer.from("I've seen things you people wouldn't believe"))

  const iterator = new StreamIterator(readStream)

  const actual = await iterator.next()

  readStream.push(null)

  t.deepEqual(Object.keys(actual).sort(), ["done", "value"])
  t.is(String(actual.value), "I've seen things you people wouldn't believe")
  t.false(actual.done)
})

test("Should return correctly object on readStream ending", async t => {
  const readStream = new stream.Readable({
    read() { this.push(null) }
  })

  const iterator = new StreamIterator(readStream)

  const actual = await iterator.next()

  t.deepEqual(actual, {
    done: true,
    value: undefined
  })
})

test("Should correctly read a content from the readStream", async t => {
  const iterator = new StreamIterator(
    fs.createReadStream("/usr/share/dict/words")
  )

  const chunks = []
  for await (const chunk of iterator) {
    chunks.push(chunk)
  }

  const expected = await fs.readFile("/usr/share/dict/words")
  const actual = Buffer.concat(chunks)

  t.true(actual.equals(expected))
})

test("Should throw an error from strem event", async t => {
  const readStream = fs.createReadStream("/usr/share/dict/words")

  const trap = () => {
    const iterator = new StreamIterator(readStream)

    readStream.emit("error", new Error("Just an error."))

    return read(iterator)
  }


  await t.throwsAsync(trap(), "Just an error.")
})

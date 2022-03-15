import 'reflect-metadata'
import express from 'express'
import 'dotenv/config'
import App from './core/app'
// "graphql": "15.7.2",
;(async () => {
  try {
    const app = new App(express())
    await app.run()
  } catch (e) {
    console.log(e)
    console.log({
      code: e.statusCode,
      msg: e.message,
    })
    process.exit(1)
  }
})()

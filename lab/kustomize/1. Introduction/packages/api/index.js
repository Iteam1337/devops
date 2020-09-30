const express = require('express')
const app = express()
const config = require('./config')
const { port } = config

app.get('/', (_, res) => {
  res.send({ ...config, date: new Date() })
})
app.listen(port, () => {
  console.log(`server listening on ${port}`)
})
const express = require('express')
const app = express()
const config = require('./config')
const { port, logging } = config

app.get('/', (req, res) => {
  if (logging) {
    console.debug(`new request from ${req.ip}`)
  }
  res.send({ ...config, date: new Date() })
})
app.listen(port, () => {
  console.log(`server listening on ${port}`)
})

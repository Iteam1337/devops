const http = require('http')

const requestListener = function (_, res) {
  res.writeHead(200)
  res.end(new Date().toISOString())
}

const server = http.createServer(requestListener)
server.listen(8080)

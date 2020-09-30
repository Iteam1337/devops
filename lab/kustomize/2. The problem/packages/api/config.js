const port = process.env.PORT || 4000
const server = process.env.SERVER_ID || 'dev-server'
const databaseUrl = process.env.DATABASE_URL || 'missing-db-url'

module.exports = { server, databaseUrl, port }

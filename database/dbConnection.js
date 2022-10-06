require('dotenv').config()
const { Client } = require('pg')

const dbClient = process.env.ENV === 'test'
  ? new Client({
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres'

  })
  : new Client({
    connectionString: 'postgres://wmwooebafjunrs:19e66365d8654239103b4a680a9ee198df22c47f91242f0c0c3f6b01cf7f9883@ec2-44-206-214-233.compute-1.amazonaws.com:5432/de3l38ruet51gd',
    ssl: {
      rejectUnauthorized: false
    }
  })

dbClient.connect().then(() => {
  if (process.env.ENV !== 'test') { console.log('Database connected!') }
})

module.exports = dbClient

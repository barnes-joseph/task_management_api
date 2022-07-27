require('dotenv').config();
const {Client} = require('pg');

const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
      }
})

dbClient.connect().then(()=>{
    console.log(`Database connected!`)
});

module.exports = dbClient;
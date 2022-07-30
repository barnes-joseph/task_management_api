require('dotenv').config();
const {Client} = require('pg');

const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
      }
})

dbClient.connect().then(()=>{
    if(process.env.ENV !== 'test')
    console.log(`Database connected!`)
});

module.exports = dbClient;
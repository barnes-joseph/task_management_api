require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('./api-docs/swagger_output.json');
// const {taskRouter} = require('./routers/taskRouter.js');
const {createTables} = require('./database/createDatabase');

const app = express();
const PORT = process.env.PORT || 8081

app.use(cors({
    origin:'*'
}))
app.use(bodyParser.json())
// app.use('/api/task/doc',swaggerUI.serve,swaggerUI.setup(swaggerFile))
// app.use('/api/task',taskRouter);

createTables();

app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
})

module.exports = app;


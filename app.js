require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');



const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('./api-docs/swagger_output.json');

const {userRouter} = require('./routers/userRouter');
const {taskRouter} = require('./routers/taskRouter');
const {categoryRouter} = require('./routers/categoryRouter')

const {createTables} = require('./database/createDatabase');
const { subTaskRouter } = require('./routers/subTaskRouter');

const app = express();
const PORT = process.env.PORT || 8081

app.use(cors({
    origin:'*'
}))
app.use(bodyParser.json())
// app.use(morgan('dev'));

app.use('/api/docs',swaggerUI.serve,swaggerUI.setup(swaggerFile));
app.use('/api/taskify/users',userRouter);
app.use('/api/taskify/tasks',taskRouter);
app.use('/api/taskify/categories',categoryRouter);
app.use('/api/taskify/subtasks',subTaskRouter);

createTables();

app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
})

module.exports = app;



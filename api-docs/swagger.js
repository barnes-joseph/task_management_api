const swaggerAutogen = require('swagger-autogen')()

const outputFile = './api-docs/swagger_output.json'
const apiEndpoints = ['./routers/taskRouter.js', './routers/userRouter.js', './routers/subTaskRouter.js', './routers/categoryRouter.js']

swaggerAutogen(outputFile, apiEndpoints)

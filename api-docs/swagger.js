const swaggerAutogen = require('swagger-autogen')();

const outputFile = './api-docs/swagger_output.json'
const api_endpoints = ['./routers/taskRouter.js']

swaggerAutogen(outputFile,api_endpoints)
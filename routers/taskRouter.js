const taskRouter = require('express').Router();
const {authenticateUser} = require('../middlewares/authenticateMiddleware')
const {createTaskController} = require('../controllers/taskControllers')

taskRouter.post('/',authenticateUser,createTaskController);

module.exports = {taskRouter};
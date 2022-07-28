const taskRouter = require('express').Router();
const {authenticateUser} = require('../middlewares/authenticateMiddleware')
const {createTaskController, getAllTasksByUserIdController, getTaskByIdController, deleteTaskByIdController} = require('../controllers/taskControllers')

taskRouter.get('/',authenticateUser,getAllTasksByUserIdController);
taskRouter.post('/',authenticateUser,createTaskController);

taskRouter.get('/:id',authenticateUser,getTaskByIdController);
taskRouter.delete('/:id',authenticateUser,deleteTaskByIdController);

module.exports = {taskRouter};
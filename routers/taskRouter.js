const taskRouter = require('express').Router();
const {tasksController} = require('../controllers/taskControllers.js')

taskRouter.get('/',tasksController.getTasks);

taskRouter.get('/:id',tasksController.getTaskById);

taskRouter.post('/',tasksController.createTask);

taskRouter.delete('/:id',tasksController.deleteTaskById);


module.exports.taskRouter = taskRouter;
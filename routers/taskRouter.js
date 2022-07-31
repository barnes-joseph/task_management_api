const taskRouter = require('express').Router();
const {authenticateUser} = require('../middlewares/authenticateMiddleware')
const {createTaskController, getAllTasksByUserIdController, getTaskByIdController, deleteTaskByIdController, getAllTasksByCategory, getAllTaskByDate, getAllTaskByPriority, getAllTaskByStatus, updateTaskByIdController} = require('../controllers/taskControllers')

taskRouter.get('/',authenticateUser,getAllTasksByUserIdController);
taskRouter.post('/',authenticateUser,createTaskController);

taskRouter.get('/:taskId',authenticateUser,getTaskByIdController);
taskRouter.delete('/:taskId',authenticateUser,deleteTaskByIdController);
taskRouter.put('/:taskId',authenticateUser,updateTaskByIdController);

taskRouter.get('/filter/category/:categoryId',authenticateUser,getAllTasksByCategory);
taskRouter.get('/filter/date/',authenticateUser,getAllTaskByDate);
taskRouter.get('/filter/priority/:priority',authenticateUser,getAllTaskByPriority);
taskRouter.get('/filter/status/:status',authenticateUser,getAllTaskByStatus);


module.exports = {taskRouter};
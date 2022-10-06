const subTaskRouter = require('express').Router()
const { createSubTaskController, getAllSubTasksByTaskIdController, updateSubTaskControllerById, deleteSubTaskControllerById } = require('../controllers/subTaskControllers')
const { authenticateUser } = require('../middlewares/authenticateMiddleware')

subTaskRouter.post('/:taskId', authenticateUser, createSubTaskController)
subTaskRouter.get('/:taskId', authenticateUser, getAllSubTasksByTaskIdController)
subTaskRouter.put('/:subtaskId', authenticateUser, updateSubTaskControllerById)
subTaskRouter.delete('/:subtaskId', authenticateUser, deleteSubTaskControllerById)

module.exports = { subTaskRouter }

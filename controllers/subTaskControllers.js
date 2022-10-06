const dbClient = require('../database/dbConnection')
const { SubTask } = require('../models/subTaskModel')

const createSubTaskController = async (req, res) => {
  try {
    const taskId = req.params.taskId
    // check if task exists
    const fetchSql = 'SELECT * FROM tasks WHERE task_id=$1'
    const task = await dbClient.query(fetchSql, [taskId])
    if (task.rowCount === 0) {
      return res.status(404).json({ error: 'Task does not exist' })
    }
    const subTasks = req.body.subtasks
    const createdSubTasks = []
    const createSubTaskSql = 'INSERT INTO subtasks(subtask_id,name,task_id) VALUES($1,$2,$3)'
    for (const subtask of subTasks) {
      const subTask = new SubTask(subtask, taskId)
      const newSubTask = await dbClient.query(createSubTaskSql, [subTask.subTaskId, subTask.name, subTask.parentId])
      createdSubTasks.push(newSubTask.rows[0])
    }
    return res.status(200).json({ subTasks: createdSubTasks })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'An error occurred in the server' })
  }
}

const getAllSubTasksByTaskIdController = async (req, res) => {
  try {
    const taskId = req.params.taskId
    const fetchSql = 'SELECT * FROM tasks WHERE task_id=$1'
    const task = await dbClient.query(fetchSql, [taskId])
    if (task.rowCount === 0) {
      return res.status(404).json({ error: 'Task does not exist' })
    }
    const fetchSubTaskSql = 'SELECT * FROM subtasks WHERE task_id=$1'
    const subTasks = await dbClient.query(fetchSubTaskSql, [taskId])
    return res.status(200).json({ subtasks: subTasks.rows })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'An error occurred in the server' })
  }
}

const updateSubTaskControllerById = async (req, res) => {
  try {
    const subTaskId = req.params.subtaskId
    const fetchSubTaskSql = 'SELECT * FROM subtasks WHERE subtask_id=$1'
    const subtask = await dbClient.query(fetchSubTaskSql, [subTaskId])
    if (subtask.rowCount === 0) {
      return res.status(404).json({ error: 'Subtask does not exist' })
    }
    const updateSql = 'UPDATE subtasks SET name=$1 WHERE subtask_id=$2 RETURNING *'
    const updatedSubTask = await dbClient.query(updateSql, [req.body.name, subTaskId])
    return res.status(200).json({ subtask: updatedSubTask.rows[0] })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'An error occurred in the server' })
  }
}

const deleteSubTaskControllerById = async (req, res) => {
  try {
    const subTaskId = req.params.subtaskId
    const fetchSubTaskSql = 'SELECT * FROM subtasks WHERE subtask_id=$1'
    const subtask = await dbClient.query(fetchSubTaskSql, [subTaskId])
    if (subtask.rowCount === 0) {
      return res.status(404).json({ error: 'Subtask does not exist' })
    }
    const deleteSql = 'DELETE FROM subtasks WHERE subtask_id=$1'
    await dbClient.query(deleteSql, [subTaskId])
    return res.status(200).json({ message: 'SubTask deleted successfully' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'An error occurred in the server' })
  }
}

module.exports = {
  createSubTaskController,
  deleteSubTaskControllerById,
  updateSubTaskControllerById,
  getAllSubTasksByTaskIdController
}

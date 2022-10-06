const { v4: uuidv4 } = require('uuid')

const priority = {
  low: 1,
  medium: 2,
  high: 3
}

const status = {
  todo: 1,
  inprogress: 2,
  completed: 3
}

class Task {
  constructor (task, userId) {
    this.taskId = uuidv4()
    this.taskName = task.name
    this.userId = userId
    this.category = task.categories || []
    this.startDate = task.startDate || null
    this.endDate = task.endDate || null
    this.priority = task.priority || priority.low
    this.description = task.description || ''
    this.subTasks = task.subTasks || []
    this.dateCreated = new Date(Date.now())
    this.status = status.todo
  }
}

module.exports.Task = Task

const {v4:uuidv4} = require('uuid');

class Task{
    constructor(task,userId){
        this.taskId = uuidv4();
        this.taskName = task.name;
        this.userId = userId;
        this.category = task.categories || [];
        this.startDate = task.startDate || null;
        this.endDate = task.endDate || null;
        this.priority = task.priority || 'low';
        this.description = task.description || null;
        this.subTasks = task.subTasks || [];
        this.dateCreated = new Date(Date().now());
        this.status = 'to-do';
    }
}


module.exports.Task = Task;
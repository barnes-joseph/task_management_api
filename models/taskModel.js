const {v4:uuidv4} = require('uuid');

class Task{
    constructor(taskName,userId){
        this.taskId = uuidv4();
        this.taskName = taskName;
        this.userId = userId;
        this.category = [];
        this.startDate = null;
        this.endDate = null;
        this.priority = 'low';
        this.description = null;
        this.subTasks = [];
        this.dateCreated = new Date();
        this.status = 'to-do';
    }
}


module.exports.Task = Task;
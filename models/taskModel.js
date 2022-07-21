const {v4:uuidv4} = require('uuid');

class Task{
    constructor(name,completionDate=null,startDate=null,taskList=null,parentId=null){
       this.id =  uuidv4();
       this.name = name;
       this.completionDate = completionDate;
       this.startDate = startDate;
       this.dateCreated = new Date();
       this.taskList = taskList;
       this.comment = '';
       this.status = {started:false,progress:false,completed:false}
       this.parentId = parentId;
    }

    toString(){
        return {
            id:this.id,
            task: this.name,
            dateCreated: this.dateCreated,
            taskList:this.taskList,
            comment: this.comment,
            status: this.status,
            completionDate: this.completionDate,
            parentId: this.parentId
        }
    }
}

module.exports.Task = Task;
const {v4:uuidv4} = require('uuid');

class CategoryToTask{
    constructor(categoryId,taskId){
        this.entryId = uuidv4();
        this.categoryId = categoryId;
        this.taskId = taskId;
    }
}

module.exports = {CategoryToTask};
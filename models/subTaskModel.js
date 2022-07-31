const {v4:uuidv4} = require('uuid');

class SubTask{
    constructor(name,parentId){
        this.subTaskId = uuidv4();
        this.name = name;
        this.parentId = parentId;
    }
}

module.exports = {SubTask};
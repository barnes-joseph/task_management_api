const {Task} = require('../models/taskModel.js');

const Ids = {}

class Tasks{
    constructor(){
        this.nextId = 1
        this.tasks = [];
    }

    getTaskIndex(taskId){
        const taskIndex = this.tasks.findIndex(task=>{
            return task.id===Ids[taskId]});
        return taskIndex;
    }

    createTask(name){
        const task = new Task(name);
        Ids[this.nextId] = task.id;
        this.nextId++;
        console.log(Ids);
        this.tasks.push(task);
        return task;
    }

    getTasks(){
        return this.tasks.map(task=>task.toString());
    }

    getTaskById(taskId){
        const taskIndex = this.getTaskIndex(taskId);
        if(taskIndex !== -1){
            return this.tasks.taskIndex.toString();
        }
        else{
            return -1;
        }
    }

    deleteTaskById(taskId){
        const taskIndex = this.getTaskIndex(taskId);
        if(taskIndex !== -1){
            this.tasks.splice(taskIndex,1);
            return 0;
        }
        else{
            return -1;
        }
    }
}


const TaskDB = new Tasks();

TaskDB.createTask('Water Plants');
TaskDB.createTask('Buy food');
TaskDB.createTask('Eat Plaintain');


module.exports= {TaskDB};
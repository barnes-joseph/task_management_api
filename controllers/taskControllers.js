const {TaskDB} = require('../database/taskdb.js')

function getTasks(req,res,next){
    res.status(200).json({tasks:TaskDB.getTasks()})
}

function getTaskById(req,res,next){
    const taskId = Number(req.params.id).toString();
    const retrievedTask = TaskDB.getTaskById(taskId);
    if(retrievedTask !== -1){
        res.status(200).json({task:retrievedTask})
    }else{
        res.status(404).json({message:"Task not found"})
    }
}

function createTask(req,res,next){
    const task = req.body.task;
    if(!task){
        res.status(400).json({error:'Request body is empty'})
    }
    else{
        const newTask = TaskDB.createTask(task);
        res.status(201).json({task:newTask.toString()});
    }
}

function deleteTaskById(req,res,next){
    const isDeleted = TaskDB.deleteTaskById(req.params.id);
    if(isDeleted === 0){
        res.status(204).json();
    }else{
        res.status(404).json({"message":"Task not found"})
    }
}

module.exports.tasksController={
    getTasks,
    getTaskById,
    createTask,
    deleteTaskById
}
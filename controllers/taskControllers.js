const dbClient = require('../database/dbConnection');
const {Task} = require('../models/taskModel')
const {SubTask} = require('../models/subTaskModel')

const createTaskController = (req,res)=>{
   try{
       const userId = req.jwtPayload.userId;
       const task = new Task(req.body,userId);
       const subTasks = [];
       if(task.subTasks.length !== 0){
           const createSubTaskSql = `INSERT INTO subtasks(subtask_id,name,task_id) VALUES($1,$2,$3) RETURNING subtask_id,name`;
           for(let subTask of task.subTasks){
               subTask = new SubTask(subTask,task.taskId);
               const values = [subTask.subTaskId,subTask.name,subTask.parentId];
               const newSubTask = await dbClient.query(createSubTaskSql,values);
               subTasks.push(newSubTask.rows[0]);
           }
       }
       const createSql = `INSERT INTO tasks(task_id,user_id,task,start_date,end_date,priority,description,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
       const values = [task.taskId,task.userId,task.taskName,task.startDate,task.endDate,task.priority,task.description,task.status];
       const createdTask = await dbClient.query(createSql,values);
       return res.status(201).json({task:{...createdTask.rows[0],subTasks}});

   }catch(err){
       console.log(err);
       return res.status(500).json({error:"An error occurred in the server"});
   }
}

const getAllTasksByUserIdController = (req,res) =>{
    try{
        const userId = req.jwtPayload.userId;
        const fetchTasksSql = `SELECT * FROM tasks WHERE user_id=$1`;
        const tasks = await dbClient.query(fetchTasksSql,[userId]);
        return res.status(200).json({tasks});

    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const getTaskByIdController = (req,res) =>{
    try{
        const taskId = req.params.id;
        const fetchSql = `SELECT * FROM tasks WHERE task_id=$1`;
        const task = await dbClient.query(fetchSql,[taskId]);
        if(task.rowCount===0){
            return res.status(404).json({error:"Task not found"});
        }
        const fetchSubTasksSql = `SELECT * FROM subtasks WHERE task_id=$1`;
        const subTasks = await dbClient.query(fetchSubTasksSql,[taskId]);
        return res.status(200).json({task:{...task.rows[0],subTasks:subTasks.rows}});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const deleteTaskByIdController = (req,res) => {
    try{
        const taskId = req.params.id;
        const deleteSql = `DELETE FROM tasks WHERE task_id=$1`;
        await dbClient.query(deleteSql,[taskId]);
        return res.status(200).json({message:"Task deleted successfully"});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"});
    }
}

module.exports = {createTaskController,getAllTasksByUserIdController,getTaskByIdController,deleteTaskByIdController}
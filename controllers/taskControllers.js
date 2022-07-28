const dbClient = require('../database/dbConnection');
const {Task} = require('../models/taskModel')
const {SubTask} = require('../models/subTaskModel');
const { CategoryToTask } = require('../models/categoryToTaskModel');

const createTaskController = (req,res)=>{
   try{
       const userId = req.jwtPayload.userId;
       const task = new Task(req.body,userId);
       const subTasks = [];
       const categories = [];
       if(task.subTasks.length !== 0){
           const createSubTaskSql = `INSERT INTO subtasks(subtask_id,name,task_id) VALUES($1,$2,$3) RETURNING subtask_id,name`;
           for(let subTask of task.subTasks){
               subTask = new SubTask(subTask,task.taskId);
               const values = [subTask.subTaskId,subTask.name,subTask.parentId];
               const newSubTask = await dbClient.query(createSubTaskSql,values);
               subTasks.push(newSubTask.rows[0]);
           }
       }
       if(task.category.length !== 0){
           const addCategorySql = `INSERT INTO categorytotask(entry_id,category_id,task_id)`;
           for(let category of task.category){
                const categoryToTaskEntry = new CategoryToTask(category.categoryId,task.taskId);
                await dbClient.query(addCategorySql,categoryToTaskEntry);
                const fetchCategorySql = `SELECT * FROM categories WHERE category_id=$1`;
                const categoryEntry =  await dbClient.query(fetchCategorySql,[category.categoryId]);
                categories.push(categoryEntry.rows[0]);
           }
       }
       const createSql = `INSERT INTO tasks(task_id,user_id,task,start_date,end_date,priority,description,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
       const values = [task.taskId,task.userId,task.taskName,task.startDate,task.endDate,task.priority,task.description,task.status];
       const createdTask = await dbClient.query(createSql,values);
       return res.status(201).json({task:{...createdTask.rows[0],subTasks,categories}});

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

const updateTaskByIdController = (req,res) => {
    try{
        const userId = req.jwtPayload.userId;
        const updates = req.body;
        const taskId = req.params.taskId;
        // check if task exists
        const fetchTaskSql = `SELECT * FROM tasks WHERE task_id=$1 AND user_id=$2`;
        const task = await dbClient.query(fetchTaskSql,[taskId,userId]);
        if(task.rowCount===0){
            return res.status(404).json({error:"An error occurred in the server"});
        }
        const updatedDetails = {...task.rows[0],...updates};
        const updateSql = `UPDATE tasks SET task=$1,start_date=$2,end_date=$3,priority=$4,description=$5,status=$6 WHERE task_id=$7 RETURNING *`;
        const values = [updatedDetails.task,updatedDetails.startDate,updatedDetails.endDate,updatedDetails.priority,updatedDetails.description,updatedDetails.status,taskId];
        const updatedTask = await dbClient.query(updateSql,values);
        return res.status(200).json({task:updatedTask.rows[0]});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const getAllTasksByCategory = async (req,res) => {
    try{
        const categoryId = req.params.categoryId;
        const userId = req.jwtPayload.userId;
        const fetchTaskIdsSql = `SELECT task_id FROM categorytotask WHERE category_id=$1`;
        let taskIds = await dbClient.query(fetchTaskIdsSql,[categoryId])
        taskIds = taskIds.rows[0];
        const tasks = []
        for (let taskId of taskIds){
            const fetchTasksSql = `SELECT * FROM tasks WHERE user_id=$1 and task_id=$2`;
            const task = await dbClient.query(fetchTasksSql,[userId,taskId]);
            tasks.push(task.rows[0]);
        }
        return res.status(200).json({tasks:tasks});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const getAllTaskByDate = async (req,res) =>{
    try{
        const startDate = req.query.start;
        const endDate = req.query.end;
        const userId = req.jwtPayload.userId;
        if(startDate){
            const fetchSql = `SELECT * FROM tasks WHERE user_id=$1 AND start_date=$2`;
            const tasks = await dbClient.query(fetchSql,[userId,startDate]);
            return res.status(200).json({tasks:tasks.rows});
        }else if(endDate){
            const fetchSql = `SELECT * FROM tasks WHERE user_id=$1 AND end_date=$2`;
            const tasks = await dbClient.query(fetchSql,[userId,endDate]);
            return res.status(200).json({tasks:tasks.rows});
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const getAllTaskByPriority = async (req,res) =>{
    try{
        const priority = req.params.priority;
        const userId = req.jwtPayload.userId;
        const fetchSql = `SELECT * FROM tasks WHERE user_id=$1 AND priority=$2`;
        const tasks = await dbClient.query(fetchSql,[userId,priority]);
        return res.status(200).json({tasks:tasks.rows});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const getAllTaskByStatus = async (req,res) =>{
    try{
        const status = req.params.status;
        const userId = req.jwtPayload.userId;
        const fetchSql = `SELECT * FROM tasks WHERE user_id=$1 AND status=$2`;
        const tasks = await dbClient.query(fetchSql,[userId,status]);
        return res.status(200).json({tasks:tasks.rows});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}


const getTaskByIdController = (req,res) =>{
    try{
        const taskId = req.params.taskId;
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
        const taskId = req.params.taskId;
        const deleteSql = `DELETE FROM tasks WHERE task_id=$1`;
        await dbClient.query(deleteSql,[taskId]);
        return res.status(200).json({message:"Task deleted successfully"});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"});
    }
}

module.exports = {createTaskController,
                  getAllTasksByUserIdController,
                  getTaskByIdController,
                  deleteTaskByIdController,
                  getAllTasksByCategory,
                  getAllTaskByDate,
                  getAllTaskByPriority,
                  getAllTaskByStatus,
                  updateTaskByIdController
                }
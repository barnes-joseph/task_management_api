const dbClient = require('../../database/dbConnection')
const {SubTask} = require('../../models/subTaskModel');
const format = require('pg-format')
const {CategoryToTask} = require('../../models/categoryToTaskModel')

const createTask = (task,subtask) => {
    const createSql = `INSERT INTO tasks(task_id,user_id,task,start_date,end_date,priority,description,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`;
    const values = [task.taskId,task.userId,task.taskName,task.startDate,task.endDate,task.priority,task.description,task.status];
    dbClient.query(createSql,values);
    const subTasks = [];
    if(task.subTasks && task.subTasks.length !== 0){
        for(let subTask of task.subTasks){
            subTask = new SubTask(subTask,task.taskId);
            const values = [subTask.subTaskId,subTask.name,subTask.parentId];
            subTasks.push(values);
        }
        const createSubTaskSql = format(`INSERT INTO subtasks(subtask_id,name,task_id) VALUES %L`,subTasks);
        dbClient.query(createSubTaskSql);
    }
    if(task.category && task.category.length !== 0){
        const categoriesValues = [];
        for(let category of task.category){
            category = new CategoryToTask(category.categoryId,task.taskId);
            const values = [category.entryId,category.taskId,category.categoryId];
            categoriesValues.push(values);
        }
    const createCategorySql = format(`INSERT INTO taskcategory(entry_id,task_id,category_id) VALUES %L RETURNING *`,categoriesValues);
    dbClient.query(createCategorySql);
    if(subtask){
        return subTasks;
    }
    }
}


module.exports = {createTask}
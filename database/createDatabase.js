const dbClient = require('./dbConnection');

async function createTable(query){
    try{
        // await dbClient.connect();
        await dbClient.query(query);
        return true;
    }
    catch(error){
        console.error(error);
        return false;
    }
    // finally{
    //     await dbClient.end();
    // }
}

function createUserTable(){
    const sql = `CREATE TABLE IF NOT EXISTS "users"(
        "user_id" UUID PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "username" TEXT UNIQUE NOT NULL,
        "profile" TEXT NOT NULL
        )`
    createTable(sql).then((created)=>{
        if(created)
            console.log('User Table created!');
    })
}

function createCategoryTable(){
    const sql = `CREATE TABLE IF NOT EXISTS "categories"(
        "category_id" UUID PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "avatar" TEXT
        )`
    createTable(sql).then((created)=>{
        if(created)
            console.log('Category Table created!');
    })
}

function createSubTaskTable(){
    const sql = `CREATE TABLE IF NOT EXISTS "subtasks"(
        "subtask_id" UUID PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "task_id" UUID NOT NULL,
        CONSTRAINT fk_task FOREIGN KEY(task_id) REFERENCES tasks(task_id)
        )`
    createTable(sql).then((created)=>{
        if(created)
            console.log('SubTask Table created!');
    })
}

function createTaskTable(){
    const sql = `CREATE TABLE IF NOT EXISTS "tasks"(
        "task_id" UUID NOT NULL PRIMARY KEY,
        "user_id" UUID NOT NULL,
        "task" TEXT NOT NULL,
        "start_date" DATE,
        "end_date" DATE CHECK (end_date > start_date),
        "priority" INT CHECK (priority < 4 AND priority > 0 ),
        "description" TEXT,
        "created" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "status" INT CHECK (status > 0 AND status < 4),
        CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id)
        )`
    createTable(sql).then((created)=>{
        if(created)
            console.log('Task Table created!');
    })
}

function createCategoryToTaskTable(){
    const sql = `CREATE TABLE IF NOT EXISTS "taskcategory"(
        "entry_id" UUID PRIMARY KEY NOT NULL,
        "task_id" UUID NOT NULL,
        "category_id" UUID NOT NULL,
        CONSTRAINT fk_task FOREIGN KEY(task_id) REFERENCES tasks(task_id),
        CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES categories(category_id)
        )`
    createTable(sql).then((created)=>{
        if(created)
            console.log('CategoryToTask Table created!');
    })
}

function createTables(){
    createUserTable();
    createTaskTable();
    createSubTaskTable();
    createCategoryTable();
    createCategoryToTaskTable();
}

module.exports.createTables = createTables;
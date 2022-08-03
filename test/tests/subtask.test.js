const chai = require('chai');
const chaiHttp = require('chai-http');
const dbClient = require('../../database/dbConnection')
const app = require('../../app.js');
const should = chai.should();
const { User } = require('../../models/userModel.js');
const { createSimpleTask,createTaskData,createRandomTask } = require('../test-data/taskTestData.js');
const { createGoodUserData } = require('../test-data/userTestData.js');
const { createUser, userLogin } = require('../test-utils/userTestUtils.js');
const { createCategoriesData } = require('../test-data/categoryTestData');
const { createCategoriesModels,createCategories } = require('../test-utils/categoryTestUtils');
const { Task } = require('../../models/taskModel');
const { createTask } = require('../test-utils/taskTestUtils');
const { createSubTasks, createRandomSubTask } = require('../test-data/subTaskTestData');
const { randPhrase, randUuid } = require('@ngneat/falso');


chai.use(chaiHttp);
describe('SubTasks',()=>{
    beforeEach(async function(done){
        try{
        // Before each test, empty the database
        dbClient.query(`TRUNCATE TABLE users,tasks,categories,subtasks,taskcategory`)
        done();
        }catch(err){
            console.log(err);
            done()
        }
    });

    after(async function(done){
        try{
            // After all the tests, empty the database
            dbClient.query(`TRUNCATE TABLE users,tasks,categories,subtasks,taskcategory`)
            done();
            }catch(err){
                console.log(err);
                done()
            }
    });

    describe('Create SubTask',()=>{
        it('it should allow an authenticated user to create a subtask of a task',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createSubTasks();
            createTask(task);
            chai.request(app)
            .post(`/api/taskify/subtasks/${task.taskId}`)
            .set('Authorization',`Bearer ${token}`)
            .send(subtasks)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.subTasks.should.have.length(2);
                done();
            })            
        });

        it('it should not allow an authenticated user to create a subtask of a task which does not exist',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createSubTasks();
            chai.request(app)
            .post(`/api/taskify/subtasks/${task.taskId}`)
            .set('Authorization',`Bearer ${token}`)
            .send(subtasks)
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.be.eql('Task does not exist');
                done();
            })            
        });

        it('it should not allow an unauthenticated user to create a subtask of a task',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createSubTasks();
            createTask(task);
            chai.request(app)
            .post(`/api/taskify/subtasks/${task.taskId}`)
            .send(subtasks)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })            
        });

        it('it should not allow a user with an invalid token to create a subtask of a task',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createSubTasks();
            createTask(task);
            chai.request(app)
            .post(`/api/taskify/subtasks/${task.taskId}`)
            .set('Authorization',`Bearer ${invalidToken}`)
            .send(subtasks)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.be.eql('User is not authorized');
                done();
            })            
        })
    })

    describe('Get SubTasks By Task Id',()=>{
        it('it should allow an authenticated user to retrieve all subtasks of a given task',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            createTask(task);
            chai.request(app)
            .get(`/api/taskify/subtasks/${task.taskId}`)
            .set('Authorization',`Bearer ${token}`)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.subtasks.should.have.length(5);
                done();
            })            
        });

        it('it should not allow an authenticated user to retrieve all subtasks of a given task which does not exist',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            chai.request(app)
            .get(`/api/taskify/subtasks/${task.taskId}`)
            .set('Authorization',`Bearer ${token}`)
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Task does not exist')
                done();
            })            
        });

        it('it should not allow an unauthenticated user to retrieve all subtasks of a given task',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            createTask(task);
            chai.request(app)
            .get(`/api/taskify/subtasks/${task.taskId}`)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })            
        });

        it('it should not allow a user with an invalid token to retrieve all subtasks of a given task',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            createTask(task);
            chai.request(app)
            .get(`/api/taskify/subtasks/${task.taskId}`)
            .set('Authorization',`Bearer ${invalidToken}`)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })            
        })
    });

    describe('Update SubTask',()=>{
        it('it should allow an authenticated user to update a subtask',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createTask(task,true);
            const updateSubtask = createRandomSubTask();
            chai.request(app)
            .put(`/api/taskify/subtasks/${subtasks[0][0]}`)
            .set('Authorization',`Bearer ${token}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('subtask');
                res.body.subtask.should.be.an('object');
                res.body.subtask.name.should.be.eql(updateSubtask);
                done();
            })
        });

        it('it should not allow an authenticated user to update a subtask which does not exist',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            createTask(task);
            const updateSubtask = createRandomSubTask();
            const randomId = randUuid({length:1})[0];
            chai.request(app)
            .put(`/api/taskify/subtasks/${randomId}`)
            .set('Authorization',`Bearer ${token}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Subtask does not exist');
                done();
            })
        });

        it('it should not allow an unauthenticated user to update a subtask',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createTask(task,true);
            const updateSubtask = createRandomSubTask();
            chai.request(app)
            .put(`/api/taskify/subtasks/${subtasks[0][0]}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });

        it('it should not allow a user with an invalid token to update a subtask',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createTask(task,true);
            const updateSubtask = createRandomSubTask();
            chai.request(app)
            .put(`/api/taskify/subtasks/${subtasks[0][0]}`)
            .set('Authorization',`Bearer ${invalidToken}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        })
    })

    describe('Delete SubTask',()=>{
        it('it should allow an authenticated user to delete a subtask',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createTask(task,true);
            const updateSubtask = createRandomSubTask();
            chai.request(app)
            .delete(`/api/taskify/subtasks/${subtasks[0][0]}`)
            .set('Authorization',`Bearer ${token}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('message');
                res.body.message.should.be.eql('SubTask deleted successfully');
                done();
            })
        });

        it('it should not allow an authenticated user to delete a subtask which does not exist',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createTask(task,true);
            const updateSubtask = createRandomSubTask();
            const randomId = randUuid({length:1})[0]
            chai.request(app)
            .put(`/api/taskify/subtasks/${randomId}`)
            .set('Authorization',`Bearer ${token}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Subtask does not exist');
                done();
            })
        });

        it('it should allow an unauthenticated user to delete a subtask',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createTask(task,true);
            const updateSubtask = createRandomSubTask();
            chai.request(app)
            .put(`/api/taskify/subtasks/${subtasks[0][0]}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });

        it('it should allow a user with an invalid token to delete a subtask',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            const categories = createCategoriesData();
            const categoriesModels  = createCategoriesModels(categories,newUser.userId);
            createCategories(categoriesModels);
            let task = createTaskData(categoriesModels);
            task = new Task(task,newUser.userId);
            const subtasks = createTask(task,true);
            const updateSubtask = createRandomSubTask();
            chai.request(app)
            .put(`/api/taskify/subtasks/${subtasks[0][0]}`)
            .set('Authorization',`Bearer ${invalidToken}`)
            .send({name:updateSubtask})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        })
    })

})
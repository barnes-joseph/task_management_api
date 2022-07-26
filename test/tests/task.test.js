const chai = require('chai')
const chaiHttp = require('chai-http')
const dbClient = require('../../database/dbConnection')
const app = require('../../app.js')
const { User } = require('../../models/userModel.js')
const { createSimpleTask, createTaskData, createRandomTask } = require('../test-data/taskTestData.js')
const { createGoodUserData } = require('../test-data/userTestData.js')
const { createUser, userLogin } = require('../test-utils/userTestUtils.js')
const { createCategoriesData } = require('../test-data/categoryTestData')
const { createCategoriesModels, createCategories } = require('../test-utils/categoryTestUtils')
const { Task } = require('../../models/taskModel')
const { createTask } = require('../test-utils/taskTestUtils')
const should = chai.should()

chai.use(chaiHttp)

describe('Tasks', function () {
  beforeEach(async function (done) {
    try {
      // Before each test, empty the database
      dbClient.query('TRUNCATE TABLE users,tasks,categories,subtasks,taskcategory')
      done()
    } catch (err) {
      console.log(err)
      done()
    }
  })

  after(async function (done) {
    try {
      // After all the tests, empty the database
      dbClient.query('TRUNCATE TABLE users,tasks,categories,subtasks,taskcategory')
      done()
    } catch (err) {
      console.log(err)
      done()
    }
  })

  describe('Create Task Route', function () {
    it('it should allow an authenticated user to create a simple task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task = createSimpleTask()
      chai.request(app)
        .post('/api/taskify/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(task)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.an('object')
          res.body.should.have.property('task')
          res.body.task.should.be.an('object')
          res.body.task.task.should.be.eql(task.name)
          res.body.task.description.should.be.eql(task.description)
          res.body.task.status.should.be.eql(1)
          res.body.task.user_id.should.be.eql(newUser.userId)
          res.body.task.priority.should.be.eql(1)
          res.body.task.subTasks.should.be.eql([])
          res.body.task.categories.should.be.eql([])
          res.body.task.should.have.property('created')
          res.body.task.should.have.property('start_date')
          res.body.task.should.have.property('end_date')
          res.body.task.should.have.property('task_id')
          done()
        })
    })

    it('it should allow an authenticated user to create a task with all options', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      const task = createTaskData(categoriesModels)
      chai.request(app)
        .post('/api/taskify/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(task)
        .end((err, res) => {
          res.should.have.status(201)
          res.body.should.be.an('object')
          res.body.should.have.property('task')
          res.body.task.should.be.an('object')
          res.body.task.task.should.be.eql(task.name)
          res.body.task.description.should.be.eql(task.description)
          res.body.task.status.should.be.eql(1)
          res.body.task.user_id.should.be.eql(newUser.userId)
          res.body.task.priority.should.be.eql(task.priority)
          res.body.task.subTasks.should.have.length(5)
          res.body.task.categories.should.have.length(5)
          res.body.task.should.have.property('created')
          task.startDate.should.be.eql(new Date(res.body.task.start_date))
          task.endDate.should.be.eql(new Date(res.body.task.end_date))
          res.body.task.should.have.property('task_id')
          done()
        })
    })

    it('it should not allow an authenticated user to create a task without a name', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      const task = createTaskData(categoriesModels)
      delete task.name
      chai.request(app)
        .post('/api/taskify/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(task)
        .end((err, res) => {
          res.should.have.status(400)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('Name of task not provided')
          done()
        })
    })

    it('it should not allow an unauthenticated user to create a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      const task = createTaskData(categoriesModels)
      chai.request(app)
        .post('/api/taskify/tasks')
        .send(task)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })

    it('it should not allow a user with an invalid token to create a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      const task = createTaskData(categoriesModels)
      chai.request(app)
        .post('/api/taskify/tasks')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send(task)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })
  })

  describe('Get Tasks Route', function () {
    it('it should allow an authenticated user to retrieve all tasks', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('tasks')
          res.body.tasks.should.have.length(2)
          done()
        })
    })

    it('it should not allow a user with invalid token to retrieve all tasks', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks')
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })

    it('it should not allow an unauthenticated user to retrieve all tasks', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks')
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })
  })

  describe('Get Single Task Route', function () {
    it('it should allow an authenticated user to retrieve a single task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task = createSimpleTask()
      const createdTask = new Task(task, newUser.userId)
      createTask(createdTask)
      chai.request(app)
        .get(`/api/taskify/tasks/${createdTask.taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('task')
          res.body.task.task.should.be.eql(createdTask.taskName)
          res.body.task.subTasks.should.be.eql([])
          res.body.task.categories.should.be.eql([])
          res.body.task.task_id.should.be.eql(createdTask.taskId)
          res.body.task.user_id.should.be.eql(createdTask.userId)
          res.body.task.should.have.property('start_date')
          res.body.task.should.have.property('end_date')
          res.body.task.status.should.be.eql(1)
          res.body.task.priority.should.be.eql(1)
          done()
        })
    })

    it('it should not allow an authenticated user to retrieve a single task which does not exist', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task = createSimpleTask()
      const createdTask = new Task(task, newUser.userId)
      chai.request(app)
        .get(`/api/taskify/tasks/${createdTask.taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(404)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('Task not found')
          done()
        })
    })

    it('it should not allow an unauthenticated user to retrieve a single task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const task = createSimpleTask()
      const createdTask = new Task(task, newUser.userId)
      createTask(createdTask)
      chai.request(app)
        .get(`/api/taskify/tasks/${createdTask.taskId}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })

    it('it should not allow a user with an invalid token to retrieve a single task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const task = createSimpleTask()
      const createdTask = new Task(task, newUser.userId)
      createTask(createdTask)
      chai.request(app)
        .get(`/api/taskify/tasks/${createdTask.taskId}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })
  })

  describe('Get Tasks By Status', function () {
    it('it should allow an authenticated user to retrieve all tasks by status', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/status/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('tasks')
          res.body.tasks.should.have.length(2)
          done()
        })
    })

    it('it should not allow an unauthenticated user to retrieve all tasks by status', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/status/1')
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })

    it('it should allow a user with an invalid token to retrieve all tasks', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/status/1')
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })
  })

  describe('Get Tasks By Priority', function () {
    it('it should allow an authenticated user to retrieve all tasks by priority', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/priority/1')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('tasks')
          res.body.tasks.should.have.length(2)
          done()
        })
    })

    it('it should not allow an unauthenticated user to retrieve all tasks by priority', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/priority/1')
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })

    it('it should allow a user with an invalid token to retrieve all tasks', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const task1 = createSimpleTask()
      const task2 = createRandomTask()
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/priority/1')
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })
  })

  describe('Get Tasks By Date', function () {
    it('it should allow an authenticated user to retrieve all tasks by start date', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task1 = createTaskData([])
      const task2 = createTaskData([])
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/date')
        .set('Authorization', `Bearer ${token}`)
        .send({ start: task1.startDate })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('tasks')
          res.body.tasks.should.have.length(2)
          done()
        })
    })

    it('it should allow an authenticated user to retrieve all tasks by end date', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task1 = createTaskData([])
      const task2 = createTaskData([])
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/date')
        .set('Authorization', `Bearer ${token}`)
        .send({ end: task1.endDate })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('tasks')
          res.body.tasks.should.have.length(2)
          done()
        })
    })

    it('it should not allow a user with an invalid token to retrieve all tasks by date', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const task1 = createTaskData([])
      const task2 = createTaskData([])
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/date')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ end: task1.endDate })
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })

    it('it should not allow an unauthenticated user to retrieve all tasks by date', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const task1 = createTaskData([])
      const task2 = createTaskData([])
      const createdTask1 = new Task(task1, newUser.userId)
      const createdTask2 = new Task(task2, newUser.userId)
      createTask(createdTask1)
      createTask(createdTask2)
      chai.request(app)
        .get('/api/taskify/tasks/filter/date')
        .send({ end: task1.endDate })
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })
  })

  describe('Get Tasks By Category', function () {
    it('it should allow an authenticated user to retrieve tasks by category', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      let task = createTaskData(categoriesModels)
      task = new Task(task, newUser.userId)
      createTask(task)
      chai.request(app)
        .get(`/api/taskify/tasks/filter/category/${categoriesModels[0].categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('tasks')
          res.body.tasks.should.be.an('array')
          res.body.tasks.should.have.length(1)
          done()
        })
    })

    it('it should not allow a user with an invalidToken to retrieve tasks by category', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      let task = createTaskData(categoriesModels)
      task = new Task(task, newUser.userId)
      createTask(task)
      chai.request(app)
        .get(`/api/taskify/tasks/filter/category/${categoriesModels[0].categoryId}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })

    it('it should not allow an unauthenticated user to retrieve tasks by category', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      let task = createTaskData(categoriesModels)
      task = new Task(task, newUser.userId)
      createTask(task)
      chai.request(app)
        .get(`/api/taskify/tasks/filter/category/${categoriesModels[0].categoryId}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })
  })

  describe('Update Task', function () {
    it('it should allow an authenticated user to update a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      let task = createTaskData(categoriesModels)
      task = new Task(task, newUser.userId)
      createTask(task)
      const update = createSimpleTask()
      chai.request(app)
        .put(`/api/taskify/tasks/${task.taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ task: update.name, description: update.description })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.task.should.be.an('object')
          res.body.task.task.should.be.eql(update.name)
          res.body.task.description.should.be.eql(update.description)
          done()
        })
    })

    it('it should not allow an authenticated user to update a task which does not exist', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      let task = createTaskData(categoriesModels)
      task = new Task(task, newUser.userId)
      const update = createSimpleTask()
      chai.request(app)
        .put(`/api/taskify/tasks/${task.taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ task: update.name, description: update.description })
        .end((err, res) => {
          res.should.have.status(404)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('Task not found')
          done()
        })
    })

    it('it should not allow an unauthenticated user to update a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      let task = createTaskData(categoriesModels)
      task = new Task(task, newUser.userId)
      createTask(task)
      const update = createSimpleTask()
      chai.request(app)
        .put(`/api/taskify/tasks/${task.taskId}`)
        .send({ task: update.name, description: update.description })
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })

    it('it should not allow a user with an invalid token to update a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const categories = createCategoriesData()
      const categoriesModels = createCategoriesModels(categories, newUser.userId)
      createCategories(categoriesModels)
      let task = createTaskData(categoriesModels)
      task = new Task(task, newUser.userId)
      createTask(task)
      const update = createSimpleTask()
      chai.request(app)
        .put(`/api/taskify/tasks/${task.taskId}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ task: update.name, description: update.description })
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })
  })

  describe('Delete Task Route', function () {
    it('it should allow an authenticated user to delete a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const task = createSimpleTask()
      const createdTask = new Task(task)
      createTask(createdTask)
      chai.request(app)
        .delete(`/api/taskify/tasks/${createdTask.taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.have.property('message')
          res.body.message.should.be.eql('Task deleted successfully')
          done()
        })
    })

    it('it should not allow an unauthenticated user to delete a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const task = createSimpleTask()
      const createdTask = new Task(task)
      createTask(createdTask)
      chai.request(app)
        .delete(`/api/taskify/tasks/${createdTask.taskId}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authenticated')
          done()
        })
    })

    it('it should not allow a user with an invalid token to delete a task', function (done) {
      const user = createGoodUserData()
      const newUser = new User(user)
      createUser(newUser)
      const token = userLogin(newUser)
      const invalidToken = token.slice(0, -3)
      const task = createSimpleTask()
      const createdTask = new Task(task)
      createTask(createdTask)
      chai.request(app)
        .delete(`/api/taskify/tasks/${createdTask.taskId}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          res.should.have.status(401)
          res.body.should.have.property('error')
          res.body.error.should.be.eql('User is not authorized')
          done()
        })
    })
  })
})

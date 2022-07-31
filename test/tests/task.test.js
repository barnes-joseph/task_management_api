// const {TaskDB} = require('../database/taskdb.js');
// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const app = require('../../app.js');
// const should = chai.should();


// chai.use(chaiHttp);
// describe('Tasks',()=>{
//     beforeEach((done)=>{
//         //Before each test we empty the database
//         TaskDB.tasks = [];
//         done();
//     });

//     // Test the GET / route
//     describe('GET /',()=>{
//     it('it should get all the tasks',(done)=>{
//         chai.request(app)
//         .get('/api/task')
//         .end((err,res)=>{
//             res.should.have.status(200);
//             res.body.tasks.should.be.a('array');
//             res.body.tasks.length.should.be.eql(0);
//             done();
//         })
//     })
//     })

//     // Test the POST / route
//     describe('POST /',()=>{
//         it('it should create a task',(done)=>{
//             const task = 'Wash dishes';
//             chai.request(app)
//             .post('/api/task')
//             .send({task:task})
//             .end((err,res)=>{
//                 res.should.have.status(201);
//                 res.body.task.should.be.an('object');
//                 res.body.task.task.should.be.eql(task);
//                 done();
//             })
//         })

//         it('it should not create a task',(done)=>{
//             chai.request(app)
//             .post('/api/task')
//             .end((err,res)=>{
//                 res.should.have.status(400);
//                 res.body.should.be.an('object');
//                 res.body.error.should.be.eql('Request body is empty');
//                 done();
//             })
//         })
//     })

//     // Test the GET /:id route
//     describe('GET /:id',()=>{
//         it('it should get the task with id',(done)=>{
//             const newTask = TaskDB.createTask('Wash clothes');
//             chai.request(app)
//             .get('/api/task/4')
//             .end((err,res)=>{
//                 res.should.have.status(200);
//                 res.body.task.should.be.an('object');
//                 res.body.task.task.should.be.eql('Wash clothes');
//                 done();
//             })
//         })

//         // it('it should not get the task with id',(done)=>{
//         //     chai.request(app)
//         //     .get('/api/task/5')
//         //     .end((err,res)=>{
//         //         res.should.have.status(404);
//         //         res.body.should.be.an('object');
//         //         res.body.message.should.be.eql('Task not found');
//         //         done();
//         //     })
//         // })
//     })

// });


const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app.js');
const should = chai.should();
const {createGoodUserData,createBadUserData, createUsername, createEmail, createPassword, createRandomUser} = require('../test-data/userTestData');
const dbClient = require('../../database/dbConnection');
const { User } = require('../../models/userModel.js');
const { createUser, userLogin } = require('../test-utils/userTestUtils.js');

chai.use(chaiHttp);

describe('Users',()=>{
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
    })

    // TEST the POST /users route
    describe('Create User Route',()=>{
        it('it should create a new user',function (done){
            const user = createGoodUserData();
            chai.request(app)
            .post('/api/taskify/users')
            .send(user)
            .end((err,res)=>{
                res.should.have.status(201);
                res.body.should.be.an('object');
                res.body.user.should.be.an('object');
                res.body.user.email.should.be.eql(user.email);
                res.body.user.username.should.be.eql(user.username);
                res.body.user.name.should.be.eql(user.name);
                done();
            })
        });
        
        it('it should not create a user with bad data format',function(done){
            const user = createBadUserData();
            chai.request(app)
            .post('/api/taskify/users')
            .send(user)
            .end((err,res)=>{
                res.should.have.status(400);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.eql('Bad Data Format');
                done();
            })
        });

        it('it should not create a user whose username exists',function(done){
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            chai.request(app)
            .post('/api/taskify/users')
            .send(user)
            .end((err,res)=>{
                res.should.have.status(409);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.eql('Username not available');
                done();
            })
        });

        it('it should not create a user which exists',function(done){
            const user = createGoodUserData();
            const newUser = new User(user);
            const username = createUsername();
            createUser(newUser,username);
            chai.request(app)
            .post('/api/taskify/users')
            .send(user)
            .end((err,res)=>{
                res.should.have.status(409);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.eql('User already exists');
                done();
            })
        })
    });

    // Test the Get /user route
    describe('Get User Route',()=>{
        it('it should get a user from the database with given email',function(done){
            const random_user = createGoodUserData();
            const user = new User(random_user);
            createUser(user)
            user.user_id = user.userId;
            delete user.userId;
            delete user.password;
            chai.request(app)
            .get(`/api/taskify/users/?email=${user.email}`)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.user.should.be.an('object');
                res.body.user.should.eql(user);
                done();
            })
        });

        it('it should get a user from the database with given username',function(done){
            const random_user = createGoodUserData();
            const user = new User(random_user);
            createUser(user)
            user.user_id = user.userId;
            delete user.userId;
            delete user.password;
            chai.request(app)
            .get(encodeURI(`/api/taskify/users/?username=${user.username}`))
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.user.should.be.an('object');
                res.body.user.should.eql(user);
                done();
            })
        });

        it('it should not get a user from the database with given email',function(done){
            const random_user = createGoodUserData();
            const user = new User(random_user);
            const random_email = createEmail();
            createUser(user)
            user.user_id = user.userId;
            delete user.userId;
            delete user.password;
            chai.request(app)
            .get(`/api/taskify/users/?email=${random_email}`)
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.eql('User with given email does not exist');
                done();
            })
        });

        it('it should not get a user from the database with given username',function(done){
            const random_user = createGoodUserData();
            const user = new User(random_user);
            const random_username = createUsername();
            createUser(user)
            user.user_id = user.userId;
            delete user.userId;
            delete user.password;
            chai.request(app)
            .get(encodeURI(`/api/taskify/users/?username=${random_username}`))
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.eql('User with given username does not exist');
                done();
            })
        });

        it('it should not get a user from the database without query parameter of username or email',function(done){
            const random_user = createGoodUserData();
            const user = new User(random_user);
            createUser(user);
            user.user_id = user.userId;
            delete user.userId;
            delete user.password;
            chai.request(app)
            .get(`/api/taskify/users/`)
            .end((err,res)=>{
                res.should.have.status(400);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.eql('Query must contain email or username');
                done();
            })
        });
    });

    // Test /user/login
    describe('Login User Router',()=>{
        it('it should log a user with a valid email and password into the application',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            chai.request(app)
            .post('/api/taskify/users/login')
            .send({email:newUser.email,password:newUser.password})
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('token');
                done();
            })
        });

        it('it should log a user with a valid username and password into the application',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            chai.request(app)
            .post('/api/taskify/users/login')
            .send({username:newUser.username,password:newUser.password})
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('token');
                done();
            })
        });

        it('it should not log a user with an invalid email and password into the application',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const random_email = createEmail();
            chai.request(app)
            .post('/api/taskify/users/login')
            .send({email:random_email,password:newUser.password})
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.be.eql('User does not exist');
                done();
            })
        });

        it('it should not log a user with an invalid username and password into the application',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const random_username = createUsername();
            chai.request(app)
            .post('/api/taskify/users/login')
            .send({username:random_username,password:newUser.password})
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.be.eql('User does not exist');
                done();
            })
        });

        it('it should not log a user with an valid email and invalid password into the application',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const random_password = createPassword();
            chai.request(app)
            .post('/api/taskify/users/login')
            .send({email:newUser.email,password:random_password})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.be.eql('Invalid credentials');
                done();
            })
        });

        it('it should not log a user with an valid username and invalid password into the application',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const random_password = createPassword();
            chai.request(app)
            .post('/api/taskify/users/login')
            .send({username:newUser.username,password:random_password})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error')
                res.body.error.should.be.eql('Invalid credentials');
                done();
            })
        });
    })

    // Test /user/update
    describe('Update User Route',()=>{
        it('it should update a user with valid token and good data format',(done)=>{
            const user = createGoodUserData();
            const newUsername = createUsername();
            const newEmail = createEmail();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const updatedUser = {...newUser,username:newUsername,email:newEmail,user_id:newUser.userId};
            delete updatedUser.password;
            delete updatedUser.userId;
            chai.request(app)
            .put('/api/taskify/users/update')
            .set('Authorization',`Bearer ${token}`)
            .send({username:newUsername,email:newEmail})
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('user');
                res.body.user.should.be.eql(updatedUser);
                done();
            })
        });

        it('it should not update a user with valid token and email that already exists',(done)=>{
            const user1 = createGoodUserData();
            const user2 = createRandomUser();
            const newUsername = createUsername();
            const newUser1 = new User(user1);
            const newUser2 = new User(user2);
            createUser(newUser1);
            createUser(newUser2);
            const token = userLogin(newUser1);
            chai.request(app)
            .put('/api/taskify/users/update')
            .set('Authorization',`Bearer ${token}`)
            .send({username:newUsername,email:newUser2.email})
            .end((err,res)=>{
                res.should.have.status(409);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Email already registered');
                done();
            })
        });

        it('it should not update a user with valid token and username that already exists',(done)=>{
            const user1 = createGoodUserData();
            const user2 = createRandomUser();
            const newEmail = createEmail();
            const newUser1 = new User(user1);
            const newUser2 = new User(user2);
            createUser(newUser1);
            createUser(newUser2);
            const token = userLogin(newUser1);
            chai.request(app)
            .put('/api/taskify/users/update')
            .set('Authorization',`Bearer ${token}`)
            .send({username:newUser2.username,email:newEmail})
            .end((err,res)=>{
                res.should.have.status(409);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Username already taken');
                done();
            })
        });

        it('it should not update a user without a token',(done)=>{
            const user1 = createGoodUserData();
            const user2 = createRandomUser();
            const newEmail = createEmail();
            const newUser1 = new User(user1);
            const newUser2 = new User(user2);
            createUser(newUser1);
            chai.request(app)
            .put('/api/taskify/users/update')
            .send({username:newUser2.username,email:newEmail})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });

        it('it should not update a user with an invalid token',(done)=>{
            const user1 = createGoodUserData();
            const newUsername = createUsername();
            const newEmail = createEmail();
            const newUser1 = new User(user1);
            createUser(newUser1);
            const token = userLogin(newUser1);
            const invalidToken = token.slice(0,-3);
            chai.request(app)
            .put('/api/taskify/users/update')
            .set('Authorization',`Bearer ${invalidToken}`)
            .send({username:newUsername,email:newEmail})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        });
    });

    describe('Change User Password Route',()=>{
       it('it should allow an authenticated user to change a password with valid previous password',(done)=>{
        const user = createGoodUserData();
        const newUser = new User(user);
        const newPassword = createPassword();
        createUser(newUser);
        const token = userLogin(newUser);
        chai.request(app)
        .put('/api/taskify/users/change_password')
        .set('Authorization',`Bearer ${token}`)
        .send({oldPassword:user.password,newPassword})
        .end((err,res)=>{
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('message');
            res.body.message.should.be.eql('Update successfully');
            done();
        })
       });

       it('it should not allow an authenticated user to change a password with invalid previous password',(done)=>{
        const user = createGoodUserData();
        const newUser = new User(user);
        const newPassword = createPassword();
        const randomPassword = createPassword();
        createUser(newUser);
        const token = userLogin(newUser);
        chai.request(app)
        .put('/api/taskify/users/change_password')
        .set('Authorization',`Bearer ${token}`)
        .send({oldPassword:randomPassword,newPassword})
        .end((err,res)=>{
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.should.have.property('error');
            res.body.error.should.be.eql('Last Used password invalid');
            done();
        })
       });

       it('it should not allow a user without a token to change a password',(done)=>{
        const user = createGoodUserData();
        const newUser = new User(user);
        const newPassword = createPassword();
        const randomPassword = createPassword();
        createUser(newUser);
        chai.request(app)
        .put('/api/taskify/users/change_password')
        .send({oldPassword:randomPassword,newPassword})
        .end((err,res)=>{
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.should.have.property('error');
            res.body.error.should.be.eql('User is not authenticated');
            done();
        })
       });

       it('it should not allow a user with an invalid token to change a password',(done)=>{
        const user = createGoodUserData();
        const newUser = new User(user);
        const newPassword = createPassword();
        const randomPassword = createPassword();
        createUser(newUser);
        const token = userLogin(newUser);
        const invalidToken = token.slice(0,-3);
        chai.request(app)
        .put('/api/taskify/users/change_password')
        .set('Authorization',`Bearer ${invalidToken}`)
        .send({oldPassword:randomPassword,newPassword})
        .end((err,res)=>{
            res.should.have.status(401);
            res.body.should.be.an('object');
            res.body.should.have.property('error');
            res.body.error.should.be.eql('User is not authorized');
            done();
        })
       });
    });

    describe('Change User Profile Picture Route',()=>{
        it('it should allow an authenticated user to change his/her profile',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const updatedUser = {...newUser,profile:'test/test-data/test-image.png'}
            delete updatedUser.password;
            delete updatedUser.userId;
            const token = userLogin(newUser);
            chai.request(app)
            .put('/api/taskify/users/update_profile')
            .set('Authorization',`Bearer ${token}`)
            .attach('profile','test/test-data/test-image.png')
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('user');
                res.body.user.should.be.eql({...updatedUser,user_id:newUser.userId,profile:`assets/profiles/profile--${newUser.userId}--test-image.png`});
                done();
            })
        });

        it('it should not allow a user without a token to change his/her profile',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const updatedUser = {...newUser,profile:'test/test-data/test-image.png'}
            delete updatedUser.password;
            delete updatedUser.userId;
            chai.request(app)
            .put('/api/taskify/users/update_profile')
            .attach('profile','test/test-data/test-image.png')
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });

        it('it should not allow a user with an invalid token to change his/her profile',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            const updatedUser = {...newUser,profile:'test/test-data/test-image.png'}
            delete updatedUser.password;
            delete updatedUser.userId;
            chai.request(app)
            .put('/api/taskify/users/update_profile')
            .set('Authorization',`Bearer ${invalidToken}`)
            .attach('profile','test/test-data/test-image.png')
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        });
    })
})
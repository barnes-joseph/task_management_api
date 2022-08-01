const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app.js');
const dbClient = require('../../database/dbConnection');
const {Category} = require('../../models/categoryModel.js');
const { User } = require('../../models/userModel.js');
const { createCategoryData, createRandomCategoryData } = require('../test-data/categoryTestData.js');
const { createGoodUserData } = require('../test-data/userTestData.js');
const { createCategory } = require('../test-utils/categoryTestUtils.js');
const { createUser, userLogin } = require('../test-utils/userTestUtils.js');
const should = chai.should();

chai.use(chaiHttp);

describe('Categories',()=>{
    beforeEach(async(done)=>{
        try{
            // Before each test, empty the database
            dbClient.query(`TRUNCATE TABLE users,tasks,categories,subtasks,taskcategory`)
            done();
            }catch(err){
                console.log(err);
                done()
            }
    });

    after(async (done)=>{
        try{
            // After all tests, empty the database
            dbClient.query(`TRUNCATE TABLE users,tasks,categories,subtasks,taskcategory`)
            done();
            }catch(err){
                console.log(err);
                done()
            }
    })

    describe('Create Category Route',()=>{
        it('it should allow an authenticated user to create a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const token = userLogin(newUser);
            chai.request(app)
            .post('/api/taskify/categories/')
            .set('Authorization',`Bearer ${token}`)
            .send({category})
            .end((err,res)=>{
                res.should.have.status(201);
                res.body.should.be.an('object');
                res.body.should.have.property('category');
                res.body.category.name.should.be.eql(category.name);
                res.body.category.emoji.should.be.eql(category.emoji);
                res.body.category.user_id.should.be.eql(newUser.userId);
                done();
            })
        });

        it('it should not allow an authenticated user to create a category whose name exists',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const createdCategory = new Category(category,newUser.userId);
            createCategory(createdCategory);
            const token = userLogin(newUser);
            chai.request(app)
            .post('/api/taskify/categories/')
            .set('Authorization',`Bearer ${token}`)
            .send({category})
            .end((err,res)=>{
                res.should.have.status(409);
                res.body.should.be.an('object');
                res.body.error.should.be.eql('Category already exists');
                done();
            });
        });

        it('it should not allow an unauthenticated user to create a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const createdCategory = new Category(category,newUser.userId);
            createCategory(createdCategory);
            chai.request(app)
            .post('/api/taskify/categories/')
            .send({category})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });

        it('it should not allow a user with an invalid token to create a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const createdCategory = new Category(category,newUser.userId);
            createCategory(createdCategory);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            chai.request(app)
            .post('/api/taskify/categories/')
            .set('Authorization',`Bearer ${invalidToken}`)
            .send({category})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        });

        it('it should not allow a user with a token to create a category without a category name',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const createdCategory = new Category(category,newUser.userId);
            delete category.name;
            createCategory(createdCategory);
            const token = userLogin(newUser);
            chai.request(app)
            .post('/api/taskify/categories/')
            .set('Authorization',`Bearer ${token}`)
            .send({category})
            .end((err,res)=>{
                res.should.have.status(400);
                res.body.should.be.an('object');
                res.body.error.should.be.eql('Name of category not provided');
                done();
            })
        });
    })

    describe('Get All Categories Route',()=>{
        it('it should allow an authenticated user to get all categories',(done)=>{
            const user = createGoodUserData();
            const newUser  = new User(user);
            createUser(newUser);
            const token = userLogin(newUser);
            const category1 = createCategoryData();
            const category2 = createRandomCategoryData();
            const createdCategory1 = new Category(category1,newUser.userId);
            const createdCategory2 = new Category(category2,newUser.userId);
            createCategory(createdCategory1);
            createCategory(createdCategory2);
            chai.request(app)
            .get('/api/taskify/categories')
            .set('Authorization',`Bearer ${token}`)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('categories');
                res.body.categories.should.be.a('array')
                res.body.categories.should.have.length(2);
                done();
            })
        });

        it('it should not allow an unauthenticated user to get all categories',(done)=>{
            const user = createGoodUserData();
            const newUser  = new User(user);
            createUser(newUser);
            const category1 = createCategoryData();
            const category2 = createRandomCategoryData();
            const createdCategory1 = new Category(category1,newUser.userId);
            const createdCategory2 = new Category(category2,newUser.userId);
            createCategory(createdCategory1);
            createCategory(createdCategory2);
            chai.request(app)
            .get('/api/taskify/categories')
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });

        it('it should not allow a user with an to get all categories',(done)=>{
            const user = createGoodUserData();
            const newUser  = new User(user);
            createUser(newUser);
            const category1 = createCategoryData();
            const category2 = createRandomCategoryData();
            const createdCategory1 = new Category(category1,newUser.userId);
            const createdCategory2 = new Category(category2,newUser.userId);
            createCategory(createdCategory1);
            createCategory(createdCategory2);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            chai.request(app)
            .get('/api/taskify/categories')
            .set('Authorization',`Bearer ${invalidToken}`)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        });
    });

    describe('Get Category By Name Route',()=>{
        it('it should allow an authenticated user to get a category by name',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            let newCategory = new Category(category,newUser.userId);
            createCategory(newCategory);
            newCategory = {...newCategory,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete newCategory.userId;
            delete newCategory.categoryId;
            const token  = userLogin(newUser);
            chai.request(app)
            .get(`/api/taskify/categories/category_name/${category.name}`)
            .set('Authorization',`Bearer ${token}`)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('category');
                res.body.category.should.be.eql(newCategory);
                done();
            })
        });

        it('it should not allow an authenticated user to get a category that does not exist',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const randomCategory = createRandomCategoryData();
            let newCategory = new Category(category,newUser.userId);
            createCategory(newCategory);
            newCategory = {...newCategory,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete newCategory.userId;
            delete newCategory.categoryId;
            const token  = userLogin(newUser);
            chai.request(app)
            .get(`/api/taskify/categories/category_name/${randomCategory.name}`)
            .set('Authorization',`Bearer ${token}`)
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Category not found');
                done();
            })
        });


        it('it should not allow an unauthenticated user to get a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const randomCategory = createRandomCategoryData();
            let newCategory = new Category(category,newUser.userId);
            createCategory(newCategory);
            newCategory = {...newCategory,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete newCategory.userId;
            delete newCategory.categoryId;
            chai.request(app)
            .get(`/api/taskify/categories/category_name/${randomCategory.name}`)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });


        it('it should not allow a user with an invalid token to get a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            let newCategory = new Category(category,newUser.userId);
            createCategory(newCategory);
            newCategory = {...newCategory,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete newCategory.userId;
            delete newCategory.categoryId;
            chai.request(app)
            .get(`/api/taskify/categories/category_name/${category.name}`)
            .set('Authorization',`Bearer ${invalidToken}`)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        });
    });

    describe('Update Categories Route',()=>{
        it('it should allow an authenticated user to update a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            createCategory(newCategory);
            const categoryUpdates = createRandomCategoryData();
            const updatedCategory = {...newCategory,...categoryUpdates,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete updatedCategory.categoryId,
            delete updatedCategory.userId
            const token = userLogin(newUser);
            chai.request(app)
            .put(`/api/taskify/categories/${newCategory.categoryId}`)
            .set('Authorization',`Bearer ${token}`)
            .send({name:categoryUpdates.name,emoji:categoryUpdates.emoji})
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('category');
                res.body.category.name.should.be.eql(updatedCategory.name);
                done();
            })
        });

        it('it should not allow an authenticated user to update a category which does not exist',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            const categoryUpdates = createRandomCategoryData();
            const updatedCategory = {...newCategory,...categoryUpdates,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete updatedCategory.categoryId,
            delete updatedCategory.userId
            const token = userLogin(newUser);
            chai.request(app)
            .put(`/api/taskify/categories/${newCategory.categoryId}`)
            .set('Authorization',`Bearer ${token}`)
            .send({name:categoryUpdates.name,emoji:categoryUpdates.emoji})
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Category does not exist');
                done();
            })
        });

        it('it should not allow an unauthenticated user to update a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            const categoryUpdates = createRandomCategoryData();
            const updatedCategory = {...newCategory,...categoryUpdates,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete updatedCategory.categoryId,
            delete updatedCategory.userId
            chai.request(app)
            .put(`/api/taskify/categories/${newCategory.categoryId}`)
            .send({name:categoryUpdates.name,emoji:categoryUpdates.emoji})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });


        it('it should not allow a user with an invalid token to update a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            const categoryUpdates = createRandomCategoryData();
            const updatedCategory = {...newCategory,...categoryUpdates,category_id:newCategory.categoryId,user_id:newCategory.userId};
            delete updatedCategory.categoryId,
            delete updatedCategory.userId
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            chai.request(app)
            .put(`/api/taskify/categories/${newCategory.categoryId}`)
            .set('Authorization',`Bearer ${invalidToken}`)
            .send({name:categoryUpdates.name,emoji:categoryUpdates.emoji})
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authorized');
                done();
            })
        });
    })

    describe('Delete Categories Route',()=>{
        
        it('it should allow an authenticated user to delete a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            createCategory(newCategory);
            const token = userLogin(newUser);
            chai.request(app)
            .delete(`/api/taskify/categories/${newCategory.categoryId}`)
            .set('Authorization',`Bearer ${token}`)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.property('message');
                res.body.message.should.be.eql('Delete category successful');
                done();
            })
        });

        it('it should not allow an authenticated user to delete a category which does not exist',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            const token = userLogin(newUser);
            chai.request(app)
            .delete(`/api/taskify/categories/${newCategory.categoryId}`)
            .set('Authorization',`Bearer ${token}`)
            .end((err,res)=>{
                res.should.have.status(404);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('Category does not exist');
                done();
            })
        });

        it('it should not allow an unauthenticated user to delete a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            chai.request(app)
            .delete(`/api/taskify/categories/${newCategory.categoryId}`)
            .end((err,res)=>{
                res.should.have.status(401);
                res.body.should.be.an('object');
                res.body.should.have.property('error');
                res.body.error.should.be.eql('User is not authenticated');
                done();
            })
        });

        it('it should not allow a user with an invalid token to delete a category',(done)=>{
            const user = createGoodUserData();
            const newUser = new User(user);
            createUser(newUser);
            const category = createCategoryData();
            const newCategory = new Category(category,newUser.userId);
            const token = userLogin(newUser);
            const invalidToken = token.slice(0,-3);
            chai.request(app)
            .delete(`/api/taskify/categories/${newCategory.categoryId}`)
            .set('Authorization',`Bearer ${invalidToken}`)
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
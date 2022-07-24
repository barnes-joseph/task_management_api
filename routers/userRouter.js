const {createUserController} = require('../controllers/userControllers');
const userRouter = require('express').Router();
const {checkCreateUserRequest} = require('../middlewares/userMiddlewares')

userRouter.post('/',checkCreateUserRequest,createUserController);


module.exports = {userRouter};
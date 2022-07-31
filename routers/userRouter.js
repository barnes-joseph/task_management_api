const {createUserController, loginController, updateUserController, deleteUserController, getUser, changeUserPassword, changeProfilePicture} = require('../controllers/userControllers');
const { authenticateUser } = require('../middlewares/authenticateMiddleware');
const userRouter = require('express').Router();
const {checkCreateUserRequest,checkUsernameExists, isValidUser, checkUserExists} = require('../middlewares/userMiddlewares')

const multer = require('multer');
const fileStorageEngine = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'assets/profiles');
    },
    filename: function(req,file,cb){
        cb(null,'profile--'+ req.jwtPayload.userId + '--' + file.originalname)
    }
})

const upload = multer({storage:fileStorageEngine});

userRouter.get('/',getUser);
userRouter.post('/',checkCreateUserRequest,checkUsernameExists,createUserController);
userRouter.post('/login',isValidUser,loginController);
userRouter.put('/update',authenticateUser,updateUserController);
userRouter.delete('/delete',authenticateUser,deleteUserController);
userRouter.put('/change_password',authenticateUser,changeUserPassword)
userRouter.put('/update_profile',authenticateUser,upload.single('profile'),changeProfilePicture)



module.exports = {userRouter};
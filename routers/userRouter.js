const { createUserController, loginController, updateUserController, deleteUserController, getUser, changeUserPassword, changeProfilePicture } = require('../controllers/userControllers')
const { authenticateUser } = require('../middlewares/authenticateMiddleware')
const userRouter = require('express').Router()
const { checkCreateUserRequest, checkUsernameExists, isValidUser, checkUserExists, checkPasswordUpdateDataFormat, checkUpdateUserDataFormat } = require('../middlewares/userMiddlewares')

const multer = require('multer')
const fileStorageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/profiles')
  },
  filename: function (req, file, cb) {
    cb(null, 'profile--' + req.jwtPayload.userId + '--' + file.originalname)
  }
})

const upload = multer({ storage: fileStorageEngine })

userRouter.get('/', getUser)
userRouter.post('/', checkCreateUserRequest, checkUsernameExists, createUserController)
userRouter.post('/login', isValidUser, loginController)
userRouter.put('/update', authenticateUser, checkUpdateUserDataFormat, updateUserController)
userRouter.put('/change_password', authenticateUser, checkPasswordUpdateDataFormat, changeUserPassword)
userRouter.put('/update_profile', authenticateUser, upload.single('profile'), changeProfilePicture)
userRouter.delete('/delete', authenticateUser, deleteUserController)

module.exports = { userRouter }

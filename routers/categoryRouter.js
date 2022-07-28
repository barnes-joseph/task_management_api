const categoryRouter = require('express').Router();
const {createCategoryController, updateCategoryController, deleteCategoryByIdController, getAllCategoriesByUserId} = require('../controllers/categoryControllers');
const {checkCategoryExists} = require('../middlewares/categoryMiddlewares');
const {authenticateUser} = require('../middlewares/authenticateMiddleware')

categoryRouter.get('/',authenticateUser,getAllCategoriesByUserId);
categoryRouter.post('/',authenticateUser,createCategoryController);
categoryRouter.put('/:id',authenticateUser,checkCategoryExists,updateCategoryController);
categoryRouter.delete('/:id',authenticateUser,checkCategoryExists,deleteCategoryByIdController);


module.exports = {categoryRouter}
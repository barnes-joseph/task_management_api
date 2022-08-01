const categoryRouter = require('express').Router();
const {createCategoryController, updateCategoryController, deleteCategoryByIdController, getAllCategoriesByUserId, updateCategoryControllerById, getCategoryByNameController} = require('../controllers/categoryControllers');
const {checkCategoryExists,checkCategoryData} = require('../middlewares/categoryMiddlewares');
const {authenticateUser} = require('../middlewares/authenticateMiddleware')

categoryRouter.get('/',authenticateUser,getAllCategoriesByUserId);
categoryRouter.post('/',authenticateUser,checkCategoryData,createCategoryController);

categoryRouter.put('/:categoryId',authenticateUser,checkCategoryExists,updateCategoryControllerById);
categoryRouter.delete('/:categoryId',authenticateUser,checkCategoryExists,deleteCategoryByIdController);

categoryRouter.get('/category_name/:categoryName',authenticateUser,getCategoryByNameController)

module.exports = {categoryRouter}
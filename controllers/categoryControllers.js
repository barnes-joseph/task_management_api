const dbClient = require('../database/dbConnection');
const {Category} = require('../models/categoryModel')

const createCategoryController = async (req,res)=>{
    try{
        // create new category
        const category = new Category(req.body.category,req.jwtPayload.userId);
        // check if category exists by name and user_id
        const fetchSql = `SELECT * FROM categories WHERE name=$1 AND user_id=$2`;
        const queryRes = await dbClient.query(fetchSql,[category.name,category.userId])
        if(queryRes.rowCount===1){
            return res.status(409).json({error:"Category already exists"});
        }
        else{
            // commit category to database
            const createSql = `INSERT INTO categories(user_id,category_id,name,emoji) VALUES ($1,$2,$3,$4) RETURNING *`;
            const values = [category.userId,category.categoryId,category.name,category.emoji];
            const newCategory = await dbClient.query(createSql,values);
            // return new category
            return res.status(201).json({category:newCategory.rows[0]})
        }
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"An error occurred in the server"});
    }
}

const updateCategoryControllerById = async(req,res) =>{
    try{
        const categoryId = req.params.categoryId;
        const newCategory = req.body;
        const oldCategory = req.category;
        const updated = {...oldCategory,...newCategory};
        const updateSql = `UPDATE categories SET name=$1,emoji=$2 WHERE category_id=$3 RETURNING *`;
        const updatedCategory = await dbClient.query(updateSql,[updated.name,updated.emoji,categoryId]);
        res.status(200).json({category:updatedCategory.rows[0]});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"});
    }

}

const getCategoryByNameController = async (req,res) =>{
    try{
        const categoryName = req.params.categoryName;
        const fetchSql = `SELECT * FROM categories WHERE name=$1 AND user_id=$2`;
        const category = await dbClient.query(fetchSql,[categoryName,req.jwtPayload.userId]);
        if(category.rowCount===0){
            return res.status(404).json({error:"Category not found"});
        }
        return res.status(200).json({category:category.rows[0]});
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const getAllCategoriesByUserId = async (req,res) =>{
    try{
        const userId = req.jwtPayload.userId;
        const fetchSql = `SELECT * FROM categories WHERE user_id=$1`;
        const categories = await dbClient.query(fetchSql,[userId]);
        return res.status(200).json({categories:categories.rows});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const deleteCategoryByIdController = async (req,res) =>{
    try{
        const categoryId = req.params.categoryId;
        const deleteSql = `DELETE FROM categories WHERE category_id=$1`;
        await dbClient.query(deleteSql,[categoryId]);
        return res.status(200).json({message:"Delete category successful"})
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

module.exports = {createCategoryController,
                  updateCategoryControllerById,
                  getCategoryByNameController,
                  getAllCategoriesByUserId,
                  deleteCategoryByIdController}

const dbClient = require("../../database/dbConnection");
const { Category } = require("../../models/categoryModel");
const format = require('pg-format');


const createCategory = (category) => {
    const insertSql = `INSERT INTO categories(user_id,category_id,name,emoji) VALUES($1,$2,$3,$4)`;
    dbClient.query(insertSql,[category.userId,category.categoryId,category.name,category.emoji]);
}

const createCategories = (categories) => {
    const values = [];
    for(let i=0;i<categories.length;i++){
            values.push([categories[i].userId,categories[i].categoryId,categories[i].name,categories[i].emoji]);
    }
    const insertSql = format(`INSERT INTO categories(user_id,category_id,name,emoji) VALUES %L`,values);
    dbClient.query(insertSql);
}

const createCategoriesModels = (categories,userId) => {
    const categoriesModels = [];
    for(let i=0;i<categories.length;i++){
        const category = new Category(categories[i],userId);
        categoriesModels.push(category)
    }
    return categoriesModels
}

module.exports = {createCategory,createCategories,createCategoriesModels};
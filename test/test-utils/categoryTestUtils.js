const dbClient = require("../../database/dbConnection")

const createCategory = (category) => {
    const insertSql = `INSERT INTO categories(user_id,category_id,name,emoji) VALUES($1,$2,$3,$4)`;
    dbClient.query(insertSql,[category.userId,category.categoryId,category.name,category.emoji]);
}

module.exports = {createCategory}
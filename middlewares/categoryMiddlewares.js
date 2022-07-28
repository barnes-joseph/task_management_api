const dbClient = require('../database/dbConnection')

const checkCategoryExists = async (req,res,next) =>{
    const categoryId = req.params.id;
    const fetchSql = `SELECT * FROM categories WHERE category_id=$1`;
    const category = await dbClient.query(fetchSql,[categoryId]);
    if(category.rowCount===0){
        return res.status(404).json({error:"Category does not exist"})
    }
    req.category = category.rows[0];
    next();
}

module.exports = {checkCategoryExists}
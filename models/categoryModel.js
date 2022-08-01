const {v4:uuidv4} = require('uuid');

class Category{
    constructor(category,userId){
        this.categoryId = uuidv4();
        this.userId = userId;
        this.name = category.name;
        this.emoji = category.emoji || '';
    }
}

module.exports = {Category};
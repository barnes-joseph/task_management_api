const {v4:uuidv4} = require('uuid');

class Category{
    constructor(name,userId){
        this.categoryId = uuidv4();
        this.userId = userId;
        this.name = name;
        this.categoryAvatar = '';
    }
}

module.exports = Category;
const {v4:uuidv4} = require('uuid');

class Category{
    constructor(name){
        this.categoryId = uuidv4();
        this.name = name;
        this.categoryAvatar = null;
    }
}

module.exports = Category;
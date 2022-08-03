const {randEmoji,randAlpha} = require('@ngneat/falso')

const emoji = randEmoji({length:1});
const name = randAlpha({length:8});

const createCategoryData = () => {
    return {emoji:emoji[0],name:name.join('')};
}

const createRandomCategoryData = () => {
    return {emoji:randEmoji({length:1})[0],name:randAlpha({length:8}).join('')}
}

const createCategoriesData = () => {
    const categories = [];
    for (let i=0;i<5;i++){
        categories.push({emoji:randEmoji({length:1})[0],name:randAlpha({length:8}).join('')})
    }
    return categories;
}

module.exports = {createCategoryData,createRandomCategoryData,createCategoriesData};
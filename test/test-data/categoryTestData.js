const {randEmoji,randAlpha} = require('@ngneat/falso')

const emoji = randEmoji({length:1});
const name = randAlpha({length:8});

const createCategoryData = () => {
    return {emoji:emoji[0],name:name.join('')};
}

const createRandomCategoryData = () => {
    return {emoji:randEmoji({ength:1})[0],name:randAlpha({length:8}).join('')}
}

module.exports = {createCategoryData,createRandomCategoryData};
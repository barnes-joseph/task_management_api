const {randEmail,randFullName,randPassword,randUserName} = require('@ngneat/falso');

const goodUserData = {
    email:randEmail({nameSeparator:'.'}),
    name:randFullName(),
    password:randPassword(),
    username:randUserName()
}

const badUserData = {
    email: randEmail(),
    username: randUserName()
}

const randomUserData = {
    email:randEmail({nameSeparator:'.'}),
    name:randFullName(),
    password:randPassword(),
    username:randUserName()
}

const createGoodUserData = () => {
    return goodUserData;
}

const createBadUserData = () => {
    return badUserData
}

const createUsername = () =>{
    return randUserName();
}

const createPassword = () => {
    return randPassword();
}

const createEmail = () => {
    return randEmail({nameSeparator:'.'});
}

const createRandomUser = () => {
    return randomUserData;
}

module.exports = {createGoodUserData,createBadUserData,createUsername,createEmail,createPassword,createRandomUser}

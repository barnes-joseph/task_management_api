const dbClient = require('../../database/dbConnection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const createUser = (user,random_username) => {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(user.password,salt);
    if(random_username)
        dbClient.query(`INSERT INTO users(user_id,name,email,password,username,profile) VALUES($1,$2,$3,$4,$5,$6)`,[user.userId,user.name,user.email,password,random_username,user.profile]);
    else 
        dbClient.query(`INSERT INTO users(user_id,name,email,password,username,profile) VALUES($1,$2,$3,$4,$5,$6)`,[user.userId,user.name,user.email,password,user.username,user.profile]);

    }

const userLogin = (user) => {
    const token = jwt.sign(
        {userId:user.userId},
        process.env.TOKEN_KEY,
        {
            expiresIn:"2h"
        })
        return token;
}


module.exports = {createUser,userLogin};

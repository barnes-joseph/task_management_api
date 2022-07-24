const bcrypt = require('bcrypt');
const {Users} = require('../crud/userCrud');
const {User} = require('../models/userModel')

const createUserController = async (req,res,next) => {
    // creating new user
    const user = new User(req.user);
    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    // hash the password with given salt
    user.password = await bcrypt.hash(user.password,salt)
    Users.createUser(user).then((err,results)=>{
        if(err){
            res.status(500).json({error:"An error occurred. Could not create user"})
        }else{
            res.status(201).json({user:results});
        }
    })
}

module.exports = {createUserController};
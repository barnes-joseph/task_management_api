const dbClient = require('../database/dbConnection');
const bcrypt = require('bcrypt');


function checkCreateUserRequest(req,res,next){
    const user = req.body;
    // check if request contains all parameters 
    if(user.name && user.email && user.password && user.username){
        req.body = user;
        next();
    }else{
        res.status(400).json({error:"Bad Data Format"});
    }
}

async function checkUsernameExists(req,res,next){
    try {
        // retrieve user request
        const username = req.body.username;
        const checkSql = `SELECT * FROM users WHERE username=$1`;
        // fetch user from database
        const queryRes = await dbClient.query(checkSql,[username])
            if(queryRes.rowCount === 1){
                return res.status(409).json({error:"Username not available"});
            }else{
                next()
            }
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

async function checkUserExists(req,res,next){
    // check user exists
    const checkSql = `SELECT * FROM users WHERE user_id=$1`;
    const queryRes = await dbClient.query(checkSql,[req.jwtPayload.userId]);
    if(queryRes.rowCount===0){
        return res.status(404).json({error:"User not found"});
    }
    req.user = queryRes.rows[0];
    next();
}

async function isValidUser(req,res,next){
    try{
        // retrieve user request
    const requestUser = req.body;
    console.log(requestUser);
    // check if all parameters are provided
    if((!requestUser.email && !requestUser.password) || (!requestUser.username && !requestUser.password)){
        return res.status(400).json({error:"Must contain username/email and password"});
    }
    const fetchSqlByEmail = `SELECT * FROM users WHERE email=$1`;
    const fetchSqlByUsername = `SELECT * FROM users WHERE username=$1`;
    let user;
    // fetch user by email
    if(requestUser.email){
        const queryRes = await dbClient.query(fetchSqlByEmail,[requestUser.email])
        if(queryRes.rowCount===0){
            return res.status(404).json({error:"User does not exist"});
        }
        else{
            user = queryRes.rows[0];
        }
    }
    // fetch user by username
    else if(requestUser.username){
        const queryRes = await dbClient.query(fetchSqlByUsername,[requestUser.username])
        if(queryRes.rowCount===0){
            return res.status(404).json({error:"User does not exist"});
        }
        else{
            user = queryRes.rows[0];
        }
    }
    console.log(user);
    // check if password is valid
    const isValid = bcrypt.compare(requestUser.password,user.password);
    if(!isValid){
        return res.status(401).json({error:"Invalid credentials"})
        
    }
    req.body = user;
    next();

    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"})
    }
}


module.exports = {checkCreateUserRequest,checkUsernameExists,isValidUser,checkUserExists};
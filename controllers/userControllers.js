const bcrypt = require('bcrypt');
const {User} = require('../models/userModel');
const dbClient = require('../database/dbConnection');
const jwt = require('jsonwebtoken');


const createUserController = async (req,res) => {
    // creating new user
    const user = new User(req.body);
    try{
        // check if user exists
        const checkSql = `SELECT * FROM users WHERE email=$1`;
        const email = [user.email];
        const queryRes = await dbClient.query(checkSql, email);
        if (queryRes.rowCount === 1) {
            return res.status(409).json({ error: "User already exists" });
        }
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // hash the password with given salt
        user.password = await bcrypt.hash(user.password,salt);
        // commit user to database
        const createSql = `INSERT INTO users(user_id,name,email,password,username,profile) VALUES($1,$2,$3,$4,$5,$6) RETURNING user_id,name,email,username,profile`;
        const userValues = [user.userId,user.name,user.email,user.password,user.username,user.profile];
        const newUser = await dbClient.query(createSql, userValues);
        return res.status(201).json({user:newUser.rows[0]});
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error occurred in the server"});
    }
       
}

const loginController = async (req,res)=>{
    const user = req.body;
    // console.log(user);
    // create login token
    const token = jwt.sign(
        {userId:user.user_id},
        process.env.TOKEN_KEY,
        {
            expiresIn:"2h"
        })
    return res.status(200).json({...user,token});
}

const getUser = async (req,res)=>{
    try{
        const searchKey = req.query;
        if(searchKey.email){
            const searchSql =  `SELECT user_id,name,email,username,profile FROM users WHERE email=$1`;
            const user = await dbClient.query(searchSql,[searchKey.email])
            if(user.rowCount===0){
                return res.status(404).json({error:"User with given email does not exist"})
            }
            return res.status(200).json({user:user.rows[0]});       
        }
        else if(searchKey.username){
            const searchSql =  `SELECT user_id,name,email,username,profile FROM users WHERE username=$1`;
            const user = await dbClient.query(searchSql,[searchKey.username])
            if(user.rowCount===0){
                return res.status(404).json({error:"User with given username does not exist"})
            }
            return res.status(200).json({user:user.rows[0]});  
        }
        else{
            return res.status(400).json({error:"Query must contain email or username"});
        }
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"An error has occurred in the server"})
    }
}


const updateUserController = async (req,res) => {
    try{
        // retrieving the user
        const userId = req.jwtPayload.userId;
        const checkSql = `SELECT * FROM users WHERE user_id=$1`;
        const user = await dbClient.query(checkSql,[userId])
        // console.log(req.body);
        // removing the password from the retrieved user
        delete user.password
        // updating the user details
        const updatedData = {...user.rows[0],...req.body};

        // console.log(updatedData)
        // check if new username or new email exists
        if(req.body.username){
            const fetchSql = `SELECT username FROM users WHERE username=$1`;
            const queryRes = await dbClient.query(fetchSql,[req.body.username]);
            if(queryRes.rowCount === 1){
                return res.status(409).json({error:"Username already taken"});
            }
        }
        if(req.body.email){
            const fetchSql = `SELECT email FROM users WHERE email=$1`;
            const queryRes = await dbClient.query(fetchSql,[req.body.email]);
            if(queryRes.rowCount === 1){
                return res.status(409).json({error:"Email already registered"});
            }
        }
        // committing updates to database
        const updateSql = `UPDATE users SET name=$1,email=$2,username=$3 WHERE user_id=$4 RETURNING user_id,name,email,username,profile`;
        const values = [updatedData.name,updatedData.email,updatedData.username,req.jwtPayload.userId];
        const queryRes = await dbClient.query(updateSql,values);
        return res.status(200).json({user:queryRes.rows[0]});
    }catch(err){
        console.log(err)
        return res.status(500).json({error:"An error occurred in the server"})
    }
}

const changeUserPassword = async (req,res) =>{
    try{
        const userId = req.jwtPayload.userId;
        const fetchSql = `SELECT password FROM users WHERE user_id=$1`;
        const user = await dbClient.query(fetchSql,[userId]);
        const isValid = await bcrypt.compare(req.body.oldPassword,user.rows[0].password);
        if(!isValid){
            return res.status(401).json({error:"Last Used password invalid"})
        }
        // generate salt
        const salt = await bcrypt.genSalt(10);
        // hash the password with given salt
        const newPassword = await bcrypt.hash(req.body.newPassword,salt);
        const updateSql = `UPDATE users SET password=$1 WHERE user_id=$2`;
        const values = [newPassword,userId];
        const updatePassword = await dbClient.query(updateSql,values);
        return res.status(200).json({message:"Update successfully"});

    }catch(err){
        console.log(err);
        return res.status(500).json({error:"An error has occurred in the server"});
    }
}

const changeProfilePicture = async (req,res)=>{
    try{
    const profile = req.file.path;
    const updateSql = `UPDATE users SET profile=$1 WHERE user_id=$2 RETURNING user_id,name,username,email,profile`;
    const values = [profile,req.jwtPayload.userId]
    const updatedUser = await dbClient.query(updateSql,values);
    return res.status(200).json({user:updatedUser.rows[0]});
    } catch(err){
        console.log(err)
        return res.status(500).json({error:"An error occurred in the server"})
    }

}

const deleteUserController = async (req,res) =>{
    try{
        const checkSql = `SELECT * FROM users WHERE user_id=$1`;
        const user = await dbClient.query(checkSql,[req.jwtPayload.userId])
        const deleteSql = `DELETE FROM users WHERE user_id=$1`;
        const values = [user.rows[0].user_id];
        const queryRes = await dbClient.query(deleteSql,values);
        return res.status(200).json({message:"Delete successful"});
    }catch(err){
        return res.status(500).json({error:"An error occurred in the server"})
    }
}



module.exports = {createUserController,updateUserController,loginController,deleteUserController,getUser,changeUserPassword,changeProfilePicture};
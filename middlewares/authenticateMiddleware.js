const jwt = require("jsonwebtoken");

function authenticateUser(req,res,next){
    // check if authorization header exists
    const authHeader = req.headers['authorization'];
    // retrieve token
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
       return res.status(401).json({error:"User is not authenticated"})
    }
    // verify token
    else{
    jwt.verify(token,process.env.TOKEN_KEY,(err,user)=>{
        if(!user){
            return res.status(401).json({error:"User is not authorized"})
        }
        // console.log(user);
        if(user){
            req.jwtPayload = user;
            next();
        }
    })
    }
}

module.exports = {authenticateUser}
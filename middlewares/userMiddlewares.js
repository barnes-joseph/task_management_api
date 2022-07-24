function checkCreateUserRequest(req,res,next){
    const user = req.body;
    if(user.name && user.email && user.password && user.username){
        req.user = user;
        next();
    }else{
        res.status(400).json({error:"Bad Data Format"});
    }
}


module.exports = {checkCreateUserRequest};
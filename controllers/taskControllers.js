const createTaskController = (req,res,next)=>{
    console.log(req.jwtPayload);
    return res.status(200).json("Task created");
}

module.exports = {createTaskController}
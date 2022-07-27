const dbClient = require("../database/dbConnection");

class Users{

    static createUser(user){
        const sql = `INSERT INTO users(user_id,name,email,password,username,profile) VALUES($1,$2,$3,$4,$5,$6)`;
        const values = [user.userId,user.name,user.email,user.password,user.username,user.profile];
        let created;
        dbClient.query(sql,values,(err,res)=>{
            console.log(res.rowCount);
            created = {err,userCreated:res.rowCount};
        })
        console.log(created)
        return created;
    }   


    static getUser(user_id){
        const sql = `SELECT * FROM  users WHERE user_id=$1`;
        const values = [user_id];
        let user;
        dbClient.query(sql,values,(err,res)=>{
            console.log(res.rows[0]);
            user = {err,user:res.rows[0]};
        })
        console.log(user);
        return user;
    }

    static deleteUser(user_id){
        const sql = `DELETE FROM users WHERE user_id=$1`;
        const values = [user_id]
        dbClient.query(sql,values,(err,res)=>{
            return (err,res.rowCount);
        })
    }

    static async checkUserExists(user_id){
        const [err,user] = await this.getUser(user_id);
        if(err){
            return (err,undefined);
        }else if(user){
            return(undefined,user);
        }
    }

}


module.exports.Users = Users;
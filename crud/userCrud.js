const dbClient = require("../database/dbConnection");

class Users{

    static async createUser(user){
        const sql = ` INSERT INTO users(user_id,name,email,password,username,profile) VALUES($1,$2,$3,$4,$5,$6)`;
        const values = [user.userId,user.name,user.email,user.password,user.username,user.profile];
        await dbClient.query(sql,values,(err,res)=>{
            return (err,res.rows[0]);
        })
    }   

    static async getUser(user_id){
        const sql = `SELECT * FROM  users WHERE user_id=${user_id}`;
        await dbClient.query(sql,(err,res)=>{
            return (err,res.rows[0]);
        })
    }

    static deleteUser(user_id){
        const sql = `DELETE FROM users WHERE user_id=${user_id}`;
        dbClient.query(sql,(err,res)=>{
            return (err,res.rowCount);
        })
    }

    // static async checkUserExists(user_id){
    //     const [err,user] = await this.getUser(user_id);
    //     if(err){
    //         return err;
    //     }else if(user !== ){}
    // }

}

module.exports.Users = Users;
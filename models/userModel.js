const {v4:uuidv4} = require('uuid');
const path = require('path');
const baseProfilePath = path.resolve('assets','profiles');
const defaultProfile = 'default-profile.png';


class User{
    constructor(name,email,password,username){
        this.userId = uuidv4();
        this.name = name;
        this.email = email;
        this.password = password;
        this.username = username;
        this.profile = path.join(baseProfilePath,defaultProfile);
    }
}



module.exports = User;
const {v4:uuidv4} = require('uuid');
const path = require('path');
const defaultProfile = 'assets/profile/default-profile.png';


class User{
    constructor(user){
        this.userId = uuidv4();
        this.name = user.name;
        this.email = user.email;
        this.password = user.password;
        this.username = user.username;
        this.profile = defaultProfile;
    }
}



module.exports = {User};
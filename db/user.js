const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userschema = new mongoose.Schema({
    name : {
        type:String,
        required:[true,'Please enter an username!'],
        unique:true
    },
    password : {
        type:String,
        required:[true,'Please enter the password'],
        minLength:[6,'minimum lenght of the password is 6 characters']
    },
});


userschema.pre('save',async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt)
    next();
})

userschema.statics.login = async function(name,password){
    const user = await this.findOne({name});
    if(user){
        const auth = await bcrypt.compare(password,user.password)
    if(auth){
        return user;
    }
    throw Error('Incorrect Password')
}
    throw Error('Incorrect Username')
}

const BookLogin = mongoose.model('BookLogin',userschema)
module.exports = BookLogin;
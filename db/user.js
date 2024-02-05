const mongoose = require('mongoose');
const schema1 = mongoose.Schema;

const userSchema = new schema1({
    names: { type: String,unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema,'users');
module.exports = User;
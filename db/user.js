const mongoose = require('mongoose');
const schema1 = mongoose.Schema;

const userSchema = new schema1({
    username: { type: String,unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('login', userSchema);
module.exports = User;
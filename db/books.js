const mongoose = require('mongoose');
const schema = mongoose.Schema;

const bookschema = new schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type : String,
        required:true
    },
    description:{
        type : String,
        required:true
    }
},{timestamps:true});

const books = mongoose.model('book',bookschema);
module.exports = books;
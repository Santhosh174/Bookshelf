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
    },
    genre:{
        type:String,
        required:true
    },
    published:{
        type:Number,
        required:true
    }
},{timestamps:true});

const books = mongoose.model('books',bookschema);
module.exports = books;



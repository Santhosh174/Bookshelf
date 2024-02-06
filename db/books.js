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
    },
    pdf: {
        data: Buffer, 
        contentType: String
    }
},{timestamps:true});

const books = mongoose.model('book',bookschema);
module.exports = books;



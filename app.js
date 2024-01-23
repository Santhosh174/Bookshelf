const express = require('express');
const { result } = require('lodash');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
app.listen(port,()=>{
    console.log(`Server is running on local host:${port}`)
});

const Book_db = require('./db/books');
//const routes = require('./routes/blogRoutes')
const db = 'mongodb+srv://santhosh_18:santhosh1818@santhosh.q56f2et.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
    .then((result)=> console.log('connected to db'))
    .catch((err)=> console.log(err));
const morgan = require('morgan');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    Book_db.find().sort({createdAt:-1})
    .then((result)=>{
        console.log(result)
        res.render('index',{title:"All books",book:result});
    })
    
})

app.get('/create',(req,res)=>{
    res.render('create',{title:'Add a Book'})
})
app.get('/books',(req,res)=>{
    res.redirect('/')
})
app.post("/books",(req,res)=>{
    const book = new Book_db(req.body);
    book.save()
        .then((result)=>{
            res.redirect('/');
        })
        .catch((err)=>{
            console.log(err);
        })
})

app.use(morgan('dev'));
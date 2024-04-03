const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const { result } = require('lodash');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const cookiesParser = require('cookie-parser')
const { requireAuth,checkUser } = require('./middleware/auth')
const app = express();
const port = 8000;
app.listen(port,()=>{
    console.log(`Server is running on local host:${port}`)
});

const Book_db = require('./db/books');
const User = require('./db/user');
const db = 'mongodb+srv://santhosh_18:santhosh1818@santhosh.q56f2et.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(db)
    .then((result)=> console.log('connected to db'))
    .catch((err)=> console.log(err));
const morgan = require('morgan');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));


app.use(express.json())
app.use(cookiesParser());



const handleErrors =(err)=>{
    console.log(err.message,err.code)
    let error = { name:'' , password:'' }

    if(err.message == 'Incorrect Username'){
        error.name = 'That Username is not registered'
    }

    if(err.message == 'Incorrect Password'){
        error.password = 'That Password is incorrect'
    }


    if (err.code === 11000){
        error.name = 'This username is already registered';
        return error
    }

    if (err.message.includes('user validation failed')){
    Object.values(err.errors).forEach(({properties}) =>{
    error[properties.path] = properties.message;
    });
}
    return error
}

const maxAge = 3*24*60*60;
const createToken = (id) => {
    return jwt.sign({id},'santy secret',{
        expiresIn:maxAge
    })
}

app.get('*',checkUser)

app.get('/signin',(req,res)=>{
    res.render('signin',{message:""})
})

app.get('/signup',(req,res)=>{
    res.render('signup',{message:""})
})

app.post('/signin',async(req,res)=>{
    const { name , password } = req.body;
    try{
        const user = await User.login(name,password)
        const token = createToken(user._id)
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.status(200).json({user: user._id})
    }
    catch(err){
        const errors = handleErrors(err)
        res.status(400).json({errors})
    }

})

app.post('/signup',async(req,res)=>{
    const { name , password } = req.body;
    try{
        const user1 = await User.create({name,password})
        const token = createToken(user1._id)
        res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
        res.status(201).json({user1:user1._id})
    }
    catch(err){
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }
})

app.get('/',(req,res)=>{
    Book_db.find().sort({createdAt:-1})
    .then((result)=>{
        console.log('Book Fetched')
        res.render('index',{title:"All books",header:"All Books",book:result,show:""});
    })
    
})

app.get('/create',requireAuth,(req,res)=>{
    res.render('create',{title:'Add a Book'})
})
app.get('/books',(req,res)=>{
    res.redirect('/')
})
app.post("/books", async(req,res)=>{
    console.log(req.body);
    try{
    const book = new Book_db({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        genre: req.body.genre,
        published: req.body.published
    });
    await book.save()
            res.redirect('/');
    }
    catch(err){
        console.log(err)
    }
})

app.get('/books/:id',requireAuth,(req,res)=>{
    const ids = req.params.id
    Book_db.findById(ids)
        .then((result)=>{
            res.render('details',{book:result,title:'Book details'})
        })
        .catch((err)=>{
            res.status(404).render('404',{title:'error'});
        })
})

app.delete('/books/:id',(req,res)=>{
    const id = req.params.id;
    Book_db.findByIdAndDelete(id)
        .then((result)=>{
            res.json({redirect:'/books'});
        })
        .catch((err)=>{
            console.log(err);
        })
});


app.get('/search', (req, res) => {
    const searchQuery = req.query.title;
    const heading = searchQuery
    if (!searchQuery) {
      return res.redirect('/');
    }
  
    const searchRegex = new RegExp(searchQuery, 'i');
  
    Book_db.find({
        $or: [
            { title: searchRegex },
            { author: searchRegex }
        ]
    }).sort({ createdAt: -1 })
      .then((result) => {
        res.render('index', { title: "Search Results",header:`Books related to  "${heading}"`, book: result ,show:""});
      })
      .catch((err) => {
        console.log(err);
        res.status(500).render('error', { title: 'Internal Server Error' });
      });
  });

  app.get('/genre', (req, res) => {
    const filter = req.query.genre ;
    if (!filter || filter === 'All') {
      return res.redirect('/');
    }
  
    const filter_req = new RegExp(filter, 'i');
  
    Book_db.find({ genre:filter_req }).sort({ createdAt: -1 })
      .then((result) => {
        res.render('index', { title: `${filter} Results`,header: `Books related to genre "${filter}"`,show:filter, book: result });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).render('error', { title: 'Internal Server Error' });
      });
  });


  app.get('/books/edit/:id',(req, res) => {
    const id = req.params.id;
    Book_db.findById(id)
        .then((result) => {
            res.render('edit', { book: result, title: 'Edit Book' });
        })
        .catch((err) => {
            res.status(404).render('404', { title: 'error' });
        });
});

app.post('/books/edit/:id', async(req, res) => {
    const id = req.params.id;

    try {
        const existingBook = await Book_db.findById(id);

        if (!existingBook) {
            return res.status(404).render('404', { title: 'error' });
        }

        // Update other fields
        existingBook.title = req.body.title;
        existingBook.author = req.body.author;
        existingBook.description = req.body.description;
        existingBook.genre = req.body.genre;
        existingBook.published = req.body.published;

        

        // Save the updated book
        await existingBook.save();
        res.redirect('/books/' + existingBook._id);
    } catch (err) {
        console.log(err);
        res.status(404).render('404', { title: 'error' });
    }
});


app.get('/logout',(req,res)=>{
        res.cookie('jwt','',{maxAge:1})
        res.redirect('/')
})

app.use(morgan('dev'));
const express = require('express');
const { result } = require('lodash');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
app.listen(port,()=>{
    console.log(`Server is running on local host:${port}`)
});

const Book_db = require('./db/books');
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
        res.render('index',{title:"All books",header:"All Books",book:result});
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

app.get('/books/:id',(req,res)=>{
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
    const searchTitle = req.query.title;
    const heading = searchTitle
    if (!searchTitle) {
      return res.redirect('/');
    }
  
    const searchRegex = new RegExp(searchTitle, 'i');
  
    Book_db.find({ title: searchRegex }).sort({ createdAt: -1 })
      .then((result) => {
        res.render('index', { title: "Search Results",header:`Books related to name "${heading}"`, book: result });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).render('error', { title: 'Internal Server Error' });
      });
  });


  app.get('/books/edit/:id', (req, res) => {
    const id = req.params.id;
    Book_db.findById(id)
        .then((result) => {
            res.render('edit', { book: result, title: 'Edit Book' });
        })
        .catch((err) => {
            res.status(404).render('404', { title: 'error' });
        });
});

app.post('/books/edit/:id', (req, res) => {
    const id = req.params.id;
    Book_db.findByIdAndUpdate(id, req.body, { new: true })
        .then((result) => {
            res.redirect('/books/' + result._id);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).render('404', { title: 'error' });
        });
});
app.use(morgan('dev'));
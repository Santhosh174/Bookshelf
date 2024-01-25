const express = require('express');
const { result } = require('lodash');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});


app.get('/',(req,res)=>{
    Book_db.find().sort({createdAt:-1})
    .then((result)=>{
        console.log(result)
        res.render('index',{title:"All books",header:"All Books",book:result,show:""});
    })
    
})

app.get('/create',(req,res)=>{
    res.render('create',{title:'Add a Book'})
})
app.get('/books',(req,res)=>{
    res.redirect('/')
})
app.post("/books",upload.single('pdf'), async(req,res)=>{
    console.log(req)
    const book = new Book_db({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        genre: req.body.genre,
        published: req.body.published,
        pdf: {
            data: fs.readFileSync(req.file.path),
            contentType: req.file.mimetype
        }
    });
    await book.save()
            res.redirect('/');
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

app.post('/books/edit/:id', upload.single('pdf'), async(req, res) => {
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

        // Update PDF if a new file is provided
        if (req.file && req.file.path) {
            existingBook.pdf.data = fs.readFileSync(req.file.path);
            existingBook.pdf.contentType = req.file.mimetype;
        }

        // Save the updated book
        await existingBook.save();
        res.redirect('/books/' + existingBook._id);
    } catch (err) {
        console.log(err);
        res.status(404).render('404', { title: 'error' });
    }
});

app.get('/books/pdf/:id', (req, res) => {
    const id = req.params.id;
    Book_db.findById(id)
        .then((result) => {
            res.contentType(result.pdf.contentType);
            res.send(result.pdf.data);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).render('404', { title: 'error' });
        });
});


app.use(morgan('dev'));
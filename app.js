const express = require('express');
const ejs = require('ejs');
const morgan = require('morgan');
const mongoose = require('mongoose')
const blogRoutes = require('./routes/blogRoutes')

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

//express app
const app = express();

// register view engine
app.set('view engine', 'ejs');

//middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));

//blog routes
app.use('/blogs', blogRoutes);

app.get('/', (req, res) => {
  res.redirect('/blogs')
});



app.get('/about', (req, res) => {
    // res.send('<p>About Page</p>')
    res.render('about', {title: 'About'});
});



//404 page
app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
});

//connect to mongodb & listen for requests
const dbURI = "mongodb+srv://seenx:muntibunti01@nodetutorial.vxux9kg.mongodb.net/l";
mongoose.connect(dbURI, {
  dbName: 'nodetutorial',
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server started on http://localhost:3000');
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));
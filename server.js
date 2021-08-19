'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const mongoose = require('mongoose');
const BookModel = require('./modules/books.js');
const seedBooks = require('./modules/seed');
const { response } = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

const client = jwksClient({
  jwksUri: 'https://dev-kqrep13d.us.auth0.com/.well-known/jwks.json'
});
app.use(cors());

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

async function addBook(obj) {
  return await BookModel(obj).save();
}

function clearDbase() {
  try {
    BookModel.deleteMany({});
    console.log('Bombed the dBase');
  }
  catch (err) {
    console.log('Unable to Clear Document');
  }
}
app.get('/test', async (request, response) => {
  // TODO: 
  // STEP 1: get the jwt from the headers
  const token = request.headers.authorization.split(' ')[1];
  // STEP 2. use the jsonwebtoken library to verify that it is a valid jwt

  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      console.log('invalid token');
      response.send('invalid token');
    }
    else {//console.log('user:', user, token);
      //
      console.log('user:', user);
      response.send(user);
    }
  });
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end  

})
app.get('/allBooks', (req, res) => {
  console.log('Getting All Books');
  BookModel.find({}, (err, books) => {

    if (err) return res.status(500).send('error in find operations', err);
    res.status(200).send(books);
  })
});
app.get('/books', async (req, res) => {

  const token = req.headers.authorization.split(' ')[1];
  ///
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      console.log('invalid token');
      response.send('invalid token');
    }
    else {
      let email;
      if (req.query.email) email = req.query.email;
      //Could use the user obj from auth for email (more ADV for students)
      //console.log('user:', user);
      else {
        console.log('No email query provided.  Using Auth User email');
        email = user.email;
      }
      console.log('email:', email);


      //
      BookModel.find({ email }, (err, books) => {
        if (err) return res.status(500).send('error in find operations', err);
        res.status(200).send(books);
      });
    }
  });
});

app.get('/seed', async (req, res) => await seedBooks());
//Solution Code Way to connect to the database
mongoose.connect(process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', _ => {
  console.log('We\'re Connected to the Database!');
  console.log('Checking to Seed');
  let books = BookModel.find({});
  if (books.length === 0) {
    console.log('No entries found.  Seeding the Database');
    seedBooks();
  }
  else { console.log('Seeding not required') }
});


//

//Jacob way
// mongoose.connect(process.env.MONGODB_URI,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   }
// )
//   .then(console.log('Connection to DB Successful'))
//   .then(async () => {
//     console.log('Checking for Seed');
//     let books = await BookModel.find({});
//     if (books.length === 0) {
//       console.log('Seeding book document');
//       await seedBooks();
//     } else {
//       console.log('No Seeding Required');
//     }
//   });





app.listen(PORT, () => console.log(`listening on ${PORT}`));
//clearDbase();
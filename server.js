'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const mongoose = require('mongoose');
const BookModel = require('./modules/books.js');
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
async function seedBooks() {
  console.log(await addBook({
    title: "Tobin's Spirit Guide",
    description: "Ghostbuster Reference Manual for all paranormal entities",
    status: "In Circulation",
    email: "jp.jones@codefellows.com"
  }));
  await addBook({
    title: "Spates Catalog",
    description: "Ghostbuster Reference Manual for all occult information",
    status: "Not in circulation",
    email: "ryan@codefellows.com"
  });
  await addBook({
    title: "New Recruit Ghostbusting Handbook",
    description: "Doctrine for Ghostbusting Employees",
    status: "LIMDIS",
    email: "jp.jones@codefellows.com"
  });
}
async function clearDbase() {
  try {
    await BookModel.deleteMany({});
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
app.get('/books', async (req, res) => {
  let books = BookModel.find({});
  console.log('books:', books);
  res.send(books);
  // const token = req.headers.authorization.split(' ')[1];
  // ///
  // jwt.verify(token, getKey, {}, function (err, user) {
  //   if (err) {
  //     console.log('invalid token');
  //     response.send('invalid token');
  //   }
  //   else {
  //     console.log('reqemail:', req.query.email);
  //     console.log('user:', user);
  //     const email = user.email;
  //     BookModel.find({ email }, (err, books) => {
  //       if (err) return console.error(err);
  //       res.status(200).send(books);
  //     });


  //response.send(user);
  // }
  // });
});

app.get('/seed', async (req, res) => await seedBooks());

mongoose.connect(process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
  .then(console.log('Connection to DB Successful'))
  .then(async () => {
    console.log('Checking for Seed');
    let books = await BookModel.find({});
    if (books.length === 0) {
      console.log('Seeding book document');
      await seedBooks();
    } else {
      console.log('No Seeding Required');
    }
  });





app.listen(PORT, () => console.log(`listening on ${PORT}`));
//clearDbase();
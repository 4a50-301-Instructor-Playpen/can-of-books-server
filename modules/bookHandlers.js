'use strict'
const BookModel = require('./books.js');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const client = jwksClient({
  jwksUri: 'https://dev-kqrep13d.us.auth0.com/.well-known/jwks.json'
});
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
function allBooks(req, res) {
  console.log('AllBooksReqheaders:', req.headers);

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

      BookModel.find({ email }, (err, books) => {
        if (err) return res.status(500).send('error in find operations', err);
        res.status(200).send(books);
      });
    }
  });
}
function postBooks(req, res) {
  console.log('headers:', req.headers);
  console.log('body', req.body)
  let { email } = req.query;
  let { title, description, status } = req.body;
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
      else {
        console.log('No email query provided.  Using Auth User email');
        email = user.email;
      }
      console.log('email:', email);
      let newBook = new BookModel({ title, description, status, email });
      newBook.save();
      res.status(200).send(newBook);
    }
  });


  // let newBook = new BookModel({ title, description, status, email });
  // newBook.save();
  // res.status(200).send(`Save Book:${newBook.title}`);
}
async function deleteBooks(req, res) {
  console.log(req.params);
  let myId = req.params.id;
  await BookModel.findByIdAndDelete(myId);
  res.send('Deleted Book');

}
module.exports = { allBooks, postBooks, deleteBooks }
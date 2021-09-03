'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const mongoose = require('mongoose');
const BookModel = require('./modules/books.js');
const bookRoutes = require('./modules/bookHandlers');
const seedBooks = require('./modules/seed');
const app = express();
//Lab 13
app.use(express.json());
const PORT = process.env.PORT || 3001;
app.use(cors());

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
app.get('/test', (request, response) => {
  console.log('Test \'GET\' route complete!');
  response.send('Test Complete.  Regard all further alarms');

});

app.get('/allBooks', (req, res) => {
  console.log('Getting All Books');
  BookModel.find({}, (err, books) => {

    if (err) return res.status(500).send('error in find operations', err);
    res.status(200).send(books);
  })

});
app.get('/books', bookRoutes.allBooks);
app.post('/books', bookRoutes.postBooks);
app.delete('/books/:id', bookRoutes.deleteBooks);
app.get('/seed', async (req, res) => {
  await seedBooks();
  res.status(200).send('Database seeded');
});

//Solution Code Way to connect to the database
//#region mongoose connections
mongoose.connect(process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', _ => {
  console.log('We\'re Connected to the Database!');
});
// console.log('Checking to Seed');
// let books = BookModel.find({});
// if (books.length === 0) {
//   console.log('No entries found.  Seeding the Database');
//   seedBooks();
// }
// else { console.log('Seeding not required') }
//#endregion
//#region Jacob's way mongoose connections 
//Jacob way to connect to the Database
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
//#endregion
app.listen(PORT, () => console.log(`listening on ${PORT}`));
//clearDbase();
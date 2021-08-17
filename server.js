'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

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


app.get('/test', (request, response) => {
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
      response.send(user);
    }
  });
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end  

})

app.listen(PORT, () => console.log(`listening on ${PORT}`));

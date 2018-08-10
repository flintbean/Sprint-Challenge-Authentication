const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig')
const jwt = require('jsonwebtoken');
const { authenticate } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

const secret = require('../_secrets/keys').jwtKey;

function generateToken(user) {
  const payload = {
    username: user.username,
  };

  const options = {
    expiresIn: '24h',
    jwtid: '8728391',
  };

  return jwt.sign(payload, secret, options);
}
async function register(req, res) {
  // implement user registration
  const user = req.body;

  user.password = bcrypt.hashSync(user.password, 10);

  db('users')
    .insert(user)
    .then(ids => {
      db('users')
        .where({ id: ids[0] })
        .first()
        .then(user => {
          const token = generateToken(user);
          res.status(201).json(token)
        })
    })
    .catch(err => {
      res.status(500).json(err)
    })

}

async function login(req, res) {
  // implement user login

  const credentials = req.body;

  db('users')
    .where({ username: credentials.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(credentials.password, user.password)) {
        const token = generateToken(user);
        res.send(token)
      }
      else {
        return res.status(401).json({ error: 'Invalid Credentials' })
      }
    })
    .catch(err => res.status(500).json({ error }))
}

async function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

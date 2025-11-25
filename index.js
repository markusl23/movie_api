const express = require("express"), 
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

app.use(express.static('public'));

let movies = [
  {
    title: 'Forrest Gump',
    director: 'Robert Zemeckis'
  },
  {
    title: 'Lord of the Rings',
    director: 'Peter Jackson'
  },
  {
    title: 'The Shawshank Redemption',
    director: 'Frank Darabont'
  },
  {
    title: 'Star Wars',
    director: 'George Lucas'
  },
  {
    title: 'The Matrix',
    director: 'The Wachowskis'
  },
  {
    title: 'The Martian',
    director: 'Ridley Scott'
  },
  {
    title: 'Gladiator',
    director: 'Ridley Scott'
  },
  {
    title: 'Almost Famous',
    director: 'Cameron Crowe'
  },
  {
    title: 'The Truman Show',
    director: 'Peter Weir'
  },
  {
    title: 'Point Break',
    director: 'Kathryn Bigelow'
  }
];

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('This is Movie API. Three endpoints are available:\n\n1. "/" displays this current message\n2. "/movies" returns an array of movies in JSON format\n3. "/documentation.html" returns the full API documentation');
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Movie API is listening on port 8080.');
});
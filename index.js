const express = require("express"), 
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
const Movies = Models.Movie;
const Users = Models.User;

app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

const { check, validationResult } = require('express-validator');

const cors = require('cors');
app.use(cors());
// Add actual CORS policy in the future!
/*
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));
*/

const auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

// mongoose.connect('mongodb://localhost:27017/movieAPI_DB');
mongoose.connect(process.env.CONNECTION_URI);

// App routing for root endpoint
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('This is Movie API. Three endpoints are available:\n\n1. "/" displays this current message\n2. "/movies" returns an array of movies in JSON format\n3. "/documentation.html" returns the full API documentation');
});

// Gets list of all movie data
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies)
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets data about single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ Title: req.params.title })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch ((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err)
    });
});

// Gets data about a genre by name
app.get('/genres/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'Genre.Name': req.params.name })
    .then((movie) => {
      res.status(201).json(movie.Genre);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets data about a director by name
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.name })
    .then((movie) => {
      res.status(201).json(movie.Director);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get single user data by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.username) {
    return res.status(400).send('Permission denied!');
  }
  await Users.findOne({ Username: req.params.username })
    .then((user) => { return Users.findById(user._id).select('-Password'); })
      .then((userDataWithoutPassword) => { res.status(201).json(userDataWithoutPassword); })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err)
    });
});

// Adds data for new movie api user to user list (users array)
app.post('/users', [
  check('Username', 'Username is required.').not().isEmpty(),
  check('Username', 'Username contains non-alphanumeric characters, not allowed.').isAlphanumeric(),
  check('Password', 'Password minimum length is eight characters.').isLength({ min: 8 }),
  check('Email', 'Email address format does not appear to be valid.').isEmail(),
  check('Birthday', 'Birthday must be a valid date. (YYYY-MM-DD)').isDate().optional({ checkFalsy: true })
], async (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({  errors: errors.array() });
  };

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
          FavoriteMovies: req.body.FavoriteMovies
        })
        .then((user) => { return Users.findById(user._id).select('-Password'); })
        .then((userDataWithoutPassword) => { res.status(201).json(userDataWithoutPassword); })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error: ' + err);
      })
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Delete user from movie api user list by name
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.username) {
    return res.status(400).send('Permission denied!');
  }
  await Users.deleteOne({ Username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send('User with username ' + req.params.username + ' was not found');
      } else {
        res.status(200).send('User with username ' + req.params.username + ' was deleted');
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update user data
app.put('/users/:username/', [
  check('Username', 'Username is required.').not().isEmpty(),
  check('Username', 'Username contains non-alphanumeric characters, not allowed.').isAlphanumeric(),
  check('Password', 'Password minimum length is eight characters.').isLength({ min: 8 }),
  check('Email', 'Email address format does not appear to be valid.').isEmail(),
  check('Birthday', 'Birthday must be a valid date. (YYYY-MM-DD)').isDate().optional({ checkFalsy: true })
], passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.username) {
    return res.status(400).send('Permission denied!');
  };

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({  errors: errors.array() });
  };

  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOneAndUpdate({ Username: req.params.username }, {
    $set: {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
      FavoriteMovies: req.body.FavoriteMovies
    }
  },
  { new: true })
    .then((updatedUser) => { return Users.findById(updatedUser._id).select('-Password'); })
      .then((userDataWithoutPassword) => { res.status(201).json(userDataWithoutPassword); })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add movie to user favorites
app.put('/users/:username/FavoriteMovies/:movieid', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.username) {
    return res.status(400).send('Permission denied!');
  }
  await Users.findOneAndUpdate({ Username: req.params.username }, {
    $push: { FavoriteMovies: req.params.movieid },
  },
  {new: true})
    .then((updatedUser) => { return Users.findById(updatedUser._id).select('-Password'); })
      .then((userDataWithoutPassword) => { res.status(201).json(userDataWithoutPassword); })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Remove movie from user favorites
app.delete('/users/:username/FavoriteMovies/:movieid', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.username) {
    return res.status(400).send('Permission denied!');
  }
  await Users.findOneAndUpdate({ Username: req.params.username }, {
    $pull: { FavoriteMovies: req.params.movieid },
  },
  {new: true})
    .then((updatedUser) => { return Users.findById(updatedUser._id).select('-Password'); })
      .then((userDataWithoutPassword) => { res.status(201).json(userDataWithoutPassword); })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Server start
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening to port ' + port);
});
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

const auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

mongoose.connect('mongodb://localhost:27017/movieAPI_DB');

// App routing for root endpoint
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('This is Movie API. Three endpoints are available:\n\n1. "/" displays this current message\n2. "/movies" returns an array of movies in JSON format\n3. "/documentation.html" returns the full API documentation');
});

// Gets list of all movie data
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.get('/movies/:title', async (req, res) => {
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
app.get('/genres/:name', async (req, res) => {
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
app.get('/directors/:name', async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.name })
    .then((movie) => {
      res.status(201).json(movie.Director);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Gets list of all user data
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users)
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get single user data by ID
app.get('/users/:id', async (req, res) => {
  await Users.findOne({ _id: req.params.id })
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err)
    });
});

// Adds data for new movie api user to user list (users array)
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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

// Delete user from movie api user list by ID
app.delete('/users/:id', async (req, res) => {
  await Users.deleteOne({ _id: req.params.id })
    .then((user) => {
      if (!user) {
        res.status(400).send('User with ID ' + req.params.id + ' was not found');
      } else {
        res.status(200).send('User with ID ' + req.params.id + ' was deleted');
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update user data
app.put('/users/:id/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if (req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied!');
  }
  await Users.findOneAndUpdate({ _id: req.params.id }, {
    $set: {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday,
      FavoriteMovies: req.body.FavoriteMovies
    }
  },
  { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add movie to user favorites
app.put('/users/:userId/FavoriteMovies/:movieId', async (req, res) => {
  await Users.findOneAndUpdate({ _id: req.params.userId }, {
    $push: { FavoriteMovies: req.params.movieId },
  },
  {new: true})
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

// Remove movie from user favorites
app.delete('/users/:userId/FavoriteMovies/:movieId', async (req, res) => {
  await Users.findOneAndUpdate({ _id: req.params.userId }, {
    $pull: { FavoriteMovies: req.params.movieId },
  },
  {new: true})
    .then((updatedUser) => {
      res.json(updatedUser);
    })
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
})
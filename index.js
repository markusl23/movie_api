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

mongoose.connect('mongodb://localhost:27017/movieAPI_DB');

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

// Gets list of all genre data
app.get('/genres', (req, res) => {
  res.json(genres);
});

// Gets list of all director data
app.get('/directors', (req, res) => {
  res.json(directors);
});

// Gets data about single movie by title
app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) => {
    return movie.title === req.params.title;
  }));
});

// Gets data about a genre by name
app.get('/genres/:name', (req, res) => {
  res.json(genres.find((genre) => {
    return genre.name === req.params.name;
  }));
});

// Gets data about a director by name
app.get('/directors/:name', (req, res) => {
  res.json(directors.find((director) => {
    return director.name === req.params.name;
  }));
});

// Adds data for new movie api user to user list (users array)
app.post('/users', (req, res) => {
  let newUser = req.body;

  if (!newUser || !newUser.name || !newUser.email) {
    return res.status(400).send('Missing user data in request body, check name/email.');
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

// Get single user data by ID
app.get('/users/:id', (req, res) => {
  res.json(users.find((user) => {
    return user.id === req.params.id;
  }));
});

// Delete user from movie api user list by ID
app.delete('/users/:id', (req, res) => {
  let user = users.find((user) => {
    return user.id === req.params.id;
  });

  if (user) {
    users = users.filter((obj) => {
      return obj.id !== req.params.id;
    });
    res.status(200).send('User ' + req.params.id + ' was deleted.');
  } else {
    res.status(404).send('User not found');
  }
});

// Update user name
app.put('/users/:id/user_name/:name', (req, res) => {
  let user = users.find((user) => {
    return user.id === req.params.id;
  });

  if (user) {
    user.name = req.params.name;
    res.status(200).send('User with ID ' + req.params.id + ' was assigned the name ' + req.params.name + '.');
  } else {
    res.status(404).send('Student with id' + req.params.id + ' was not found.');
  }
});

// Update user email
app.put('/users/:id/user_email/:email', (req, res) => {
  let user = users.find((user) => {
    return user.id === req.params.id;
  });

  if (user) {
    user.email = req.params.email;
    res.status(200).send('User with ID ' + req.params.id + ' was assigned the email address ' + req.params.email + '.');
  } else {
    res.status(404).send('Student with id' + req.params.id + ' was not found.');
  }
});

// Add movie to user favorites
app.put('/users/:id/favorites/:title', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('This is the Movie API endpoint to add a movie as a user favorite.');
});

// Remove movie from user favorites
app.delete('/users/:id/favorites/:title', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('This is the Movie API endpoint to add a movie as a user favorite.');
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
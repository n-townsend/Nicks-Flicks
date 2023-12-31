const express = require('express'); // This imports Express locally to be used in the file
morgan = require('morgan');
bodyParser = require('body-parser');
uuid = require('uuid');

const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Models = require('./models');
/**
 * declare models
 */
const Movies = Models.Movie;
const Users = Models.User;

//Select Database you wish to use by commenting out the other option below

//mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true });
/**
 * connect mongoose to online database
 */
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express(); // Declares variable encapsulating Express's functionality so it can configure web server.
/**
 * set up bodyParser
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
/**
 * allow only requests from specific origins
 */
const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');

require('./passport');

app.use(express.static('public')); // Will route any request for static files to the correct file in the public folder

//Home Page Message
app.get('/', (req, res) => {
	res.send('Welcome to my movie app.');
});

//Add a user
/* Expected return in JSON with this format
{
	ID: Integer,
	Username: String,
	Password: String,
	Email: String,
	Birthday: Date
}*/
app.post('/users', [ //Validation Logic for Request
	check('username', 'username is required').isLength({ min: 5 }),
	check('username', 'username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
	check('password', 'password is required').not().isEmpty(),
	check('email', 'email does not appear to be valid').isEmail()
], (req, res) => {
	//Check the Validation object for errors
	let errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	let hashedPassword = Users.hashPassword(req.body.password);
	Users.findOne({ username: req.body.username }) //Looks for existing username
		.then((user) => {
			if (user) {
				return res.status(400).send(req.body.username + 'already exists');//If it exists
			} else {//If it is available
				Users
					.create({
						username: req.body.username,
						password: hashedPassword,
						email: req.body.email,
						birthday: req.body.birthday
					})
					.then((user) => { res.status(201).json(user) })//Informs client that user has been created
					.catch((error) => {
						console.error(error);
						res.status(500).send('Error: ' + error);
					})
			}
		})
		.catch((error) => {//Error Handling Function
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * Endpoint returns a list of ALL movies to the user using the GET method.
 * @example Using `https://nicks-movie-app-8dea9f746e67.herokuapp.com/` will return an array of movie objects in JSON format.
 * The URL endpoint is `/movies`. 
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find()
		.then((movies) => {
			res.status(200).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Return Specific Movie by Title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({ title: req.params.title })
		.then((movie) => {
			if (!movie) {
				return res.status(404).send('Error: ' + req.params.title + ' was not found');
			}
			res.status(200).json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Return data about a genre by name
app.get('/movies/genres/:genre', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find({ 'genre.name': req.params.genre })
		.then((movies) => {
			if (movies.length == 0) {
				return res.status(404).send('Error: no movies found with the ' + req.params.genre + ' genre type.');
			} else {
				res.status(200).json(movies);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Return data about a director by name
app.get('/movies/directors/:director', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find({ 'director.name': req.params.director })
		.then((movies) => {
			if (movies.length == 0) {
				return res.status(404).send('Error: no movies found with the director ' + req.params.director + ' name');
			} else {
				res.status(200).json(movies);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Return a list of all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.find()
		.then((users) => {
			res.status(201).json(users);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Return a single user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOne({ username: req.params.username })
		.then((user) => {
			res.json(user);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Update a user's info, by username
/* Expected return in JSON with this format
{
	Username: String,
	(required)
	Password: String,
	(required)
	Email: String,
	(required)
	Birthday: Date
}*/
app.put('/users/:username', [
	check('username', 'username is required').isLength({ min: 5 }),
	check('username', 'username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
	check('password', 'password is required').not().isEmpty(),
	check('email', 'email does not appear to be valid').isEmail()
], passport.authenticate('jwt', { session: false }), (req, res) => {
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$set: {
				username: req.body.username,
				password: req.body.password,
				email: req.body.email,
				birthday: req.body.birthday,
			},
		},
		{ new: true }
	)
		.then((user) => {
			if (!user) {
				return res.status(404).send('Error: No user was found');
			} else {
				res.json(user);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Allow users to add movie to favorites list
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$addToSet: { favoriteMovies: req.params.movieID },
		},
		{ new: true }
	)
		.then((updatedUser) => {
			if (!updatedUser) {
				return res.status(404).send('Error: User was not found');
			} else {
				res.json(updatedUser);
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

//Allow users to remove movie from favorites list
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate(
		{ username: req.params.username },
		{
			$pull: { favoriteMovies: req.params.movieID },
		},
		{ new: true }
	)
		.then((updatedUser) => {
			if (!updatedUser) {
				return res.status(404).send('Error: User not found');
			} else {
				res.json(updatedUser);
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

//Allow a user to be removed
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndRemove({ username: req.params.username })
		.then((user) => {
			if (!user) {
				res.status(404).send('User ' + req.params.username + ' was not found');
			} else {
				res.status(200).send(req.params.username + ' was deleted.');
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Ooops! Something Broke!');
}); // Error Handling Middleware to catch any errors not previously resolved.

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on Port ' + port);
});
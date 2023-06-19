const express = require('express'); // This imports Express locally to be used in the file
    morgan = require('morgan');
    bodyparser = require('body-parser');
    uuid = require('uuid');

const app = express(); // Declares variable encapsulating Express's functionality so it can configure web server.
app.use(morgan('common'));


let movies = [];

//Create User Account
app.post('/users', (req, res) => {
    res.send('Successful POST request sending data about New User');
});

//Return a list of all movies
app.get('/movies', (req, res) => {
    res.send('Successful GET request returning data for all movies');
});

//Return data about a genre by name
app.get('/movies/genres/:Genre', (req, res) => {
    res.send('Successful GET request returning data for all movies based on Genre');
});

//Return data about a director by name
app.get('/movies/directors/:Name', (req, res) => {
    res.send('Successful GET request returning data for all Directors');
});

//Return a list of all users
app.get('/users', (req, res) => {
    res.send('Successful GET request returning data for all Users');
});

//Return a single user by username
app.get('/users/:Username', (req, res) => {
    res.send('Successful GET request returning data for specific User');
});

//Allow users to change their information
app.put('/users/:Username', (req, res) => {
    res.send('Successful PUT request changing user information');
});

//Allow users to add movie to favorites list
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    res.send('Successful POST request allowing users to save movies to favorites');
});

//Allow users to remove movie from favorites list
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    res.send('Successful DELETE request removing movies from favorites list');
});

//Allow a user to be removed
app.delete('/users/:Username', (req, res) => {
    res.send('Successful DELETE request removing User from System');
});

app.use(express.static('public')); // Will route any request for static files to the correct file in the public folder

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Ooops! Something Broke!');
}); // Error Handling Middleware to catch any errors not previously resolved.

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
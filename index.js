const express = require('express'); // This imports Express locally to be used in the file
    morgan = require('morgan');

const app = express(); // Declares variable encapsulating Express's functionality so it can configure web server.
app.use(morgan('common'));

let topMovies = []; // Creates object to return List of Movies, Currently Blank.

app.get('/movies', (req, res) => {
    res.json(topMovies); // Calls for the list of movies when website is directed to the /movies page.
});

app.get('/', (req, res) => {
    res.send('Welcome to my Movie Catalog.');
});

app.use(express.static('public')); // Will route any request for static files to the correct file in the public folder

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Ooops! Something Broke!');
}); // Error Handling Middleware to catch any errors not previously resolved.

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
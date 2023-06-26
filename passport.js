const passport = require('passport'),
  localStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  jwtStrategy = passportJWT.Strategy,
  extractJWT = passportJWT.ExtractJwt;

/*takes a username and password from the request body and uses Mongoose 
to check your database for a user with the same username*/
passport.use(new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, (username, password, callback) => {
    console.log(username + '  ' + password);
    Users.findOne({ username: username }, (error, user) => {
      if (error) {
        console.log(error);
        return callback(error);
      }
  
      if (!user) {
        console.log('incorrect username');
        return callback(null, false, {message: 'Incorrect username or password.'});
      }
  
      console.log('finished');
      return callback(null, user);
    });
  }));

/*allows you to authenticate users based on the JWT submitted alongside their request.
[secretOrKey]- this signature verifies that the sender of the JWT (the client) 
is who it says it is—and also that the JWT hasn’t been altered.*/
passport.use(new jwtStrategy({
    jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  }, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
      .then((user) => {
        return callback(null, user);
      })
      .catch((error) => {
        return callback(error)
      });
  }));

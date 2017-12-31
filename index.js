var express = require('express'),
  bodyParser = require('body-parser'),
  firebase = require('firebase'),
  admin = require('firebase-admin'),
  ejs = require('ejs');

var port = 8080;
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

var serviceAccount = require('./gpsgroup10-firebase-adminsdk-d67zw-5eefb716dc.json');

// Initialize the default app
var defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gpsgroup10.firebaseio.com/'
});
app.use(express.static(__dirname + '/assets'));
console.log(defaultApp.name); // "[DEFAULT]"

// Retrieve services via the defaultApp variable...
var auth = defaultApp.auth();
var database = defaultApp.database();

var ref = database.ref();

app.use(express.static('stylesheets'));
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log('Listening on port: ' + port);
});

function listAllUsers(nextPageToken) {
  // List batch of users, 1000 at a time.
  admin
    .auth()
    .listUsers()
    .then(function (listUsersResult) {
      listUsersResult.users.forEach(function (userRecord) {
        console.log('user', userRecord.toJSON());
      });
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });
}
var message = "";
//get home page
app.get('/', (req, res) => {
  //listAllUsers();
  res.redirect('/user');
});
app.get('/maps', (req, res) => {
  //listAllUsers();)
  res.render('map.ejs')
});
//get home page
app.post('/user', (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  admin.auth().createUser({
      email: email,
      password: password,
      displayName: name
    })
    .then(function (userRecord) {
      var usersRef = ref.child("Users/" + userRecord.uid);
      usersRef.set({
        name:name,
        email:email,
        password:password
      });
      message = "Successfully created new user:" + userRecord.email;
      res.redirect('/user');
    })
    .catch(function (error) {
      console.log("Error creating new user:", error);
      message = error;
      res.redirect('/user');
    });
});
//get home page
app.get('/user', (req, res) => {
  //listAllUsers();
  admin
    .auth()
    .listUsers()
    .then(function (listUsersResult) {
      res.render('user.ejs', {
        messages: message,
        data: listUsersResult.users
      });

      // listUsersResult.users.forEach(function (userRecord) {
      //   //console.log('user', userRecord.toJSON());
        
      // });
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });

});
app.delete('/user', (req, res) => {
  //listAllUsers();
  var uid = req.body.uid.replace(/\s+/g, '');
  console.log(uid);
  admin.auth().deleteUser(uid)
    .then(function () {
      console.log("Successfully deleted user");
    })
    .catch(function (error) {
      console.log("Error deleting user:", error);
    });


});
//get home page
app.get('/devices', (req, res) => {
  admin
    .auth()
    .listUsers()
    .then(function (listUsersResult) {
      res.render('devices.ejs', {
        data: listUsersResult.users
      });

      // listUsersResult.users.forEach(function (userRecord) {
      //   //console.log('user', userRecord.toJSON());

      // });
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });
});
app.post('/devices', (req, res) => {
    var device = req.body.name;
    var uid = req.body.user;

    var usersRef = ref.child("Devices/" + device);
    usersRef.set({
        uid: uid
    })
    messages="Successfully add device!";
    res.redirect("/devices");

});


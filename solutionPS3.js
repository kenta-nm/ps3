// this uses /login to authorize a use

var express = require("express");
var app = express();
const fetch = require("node-fetch");
var bodyParser = require("body-parser");
const port = 3001;
// body parser extracts the entire body portion of an incoming request stream and exposes it on req.body
// the middleware was a part of Express.js earlier but now you have to install it separately.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({}));

// authenticate is a middleware function that checks for a secret token in the url
// if the token is present, it calls next() to call the next route
// if the token is not present, it sends a 401 error
const authenticate = (req, res, next) => {
  const url = req.url;
  if (url) {
    let path = url.split("=");
    // not so secrt token is in the url
    if (path[1] == "secret-token") {
      req.user = "admin";
      next();
    }
  } else {
    res.sendStatus(401);
  }
};
// store contacts in an arrays
// role is a property of each contact that is either "reader" or "editor"
// reader can only read contacts
// editor can read and write contacts
var contacts = [
  {
    name: "peter parker",
    age: 21,
    email: "peter@mit.edu",
    role: "reader",
    password: "test1"
  },
  {
    name: "bruce wayne",
    age: 32,
    email: "bruce@mit.edu",
    role: "reader",
    password: "test2"
  },
  {
    name: "diana prince",
    age: 25,
    email: "diana@mit.edu",
    role: "editor",
    password: "test3"
  },
];
function checkUser(name, password) {
  let user = null
  contacts.forEach((contact) => {
      if (contact.name == name && contact.password == password) {
          user = contact
      }
      
  });
    return user
};

// app.get("/", function (req, res) {
app.get("/", function (req, res) {
  res.send(`<h1> Routes: Try http://localhost: ${port}/login </h1>`);
});
// login form with a post request to /auth  and a get request to /login
app.get("/login", (req, res) => {
  // send back a login form
  let form = `<form action="/auth" method="post">
    <label for="name">Enter name: </label>
    <input id="name" type="text" name="name" value="name">
    <input id="password" type="text" name="password" value="password">
    <input type="submit" value="OK">
    </form>`;
  res.send(form);
});
// app.post("/auth", (req, res) => {
// write a funcheck the user name and password against the contacts array
// if (req.body.name == "name" && req.body.password == "password") {
//   res.send("authorized");
app.post("/auth", (req, res) => {
    let form = null
    let { name, password } = req.body;
  // check the user name and password
   // find name in contacts
    let user = checkUser(name, password);
    if (user!= null && user.role == "admin") {
  // we should check if user is in DB if so send back security token
  // we dynamically create a form with a hidden field that contains the token
        form = `<form action="/contacts" method="get">
        <label for="name">Get Contacts </label>
        <input id="token" type="hidden" name="token" value="secret-token">
        <input type="submit" value="OK">
        </form>`;
    } else {
     // send back a login form
        form = `<h1>Not Authorized</h1>
        <form action="/auth" method="post">
        <label for="name">Enter name: </label>
        <input id="name" type="text" name="name" value="name">
        <input id="password" type="text" name="password" value="password">
        <input type="submit" value="OK">
        </form>`;
    }

    res.send(form);
});

//athenticate is used to check if the token is correct
app.get("/contacts", authenticate, (req, res) => {
  res.json(contacts);
});


app.post("/contact", (req, res) => {
  // add a contact
  let contact = req.body;
  contacts.push(contact);
  res.redirect("/contacts/" + req.body.name);
});

app.listen(port, ()=> {console.log(`Running on port: ${port}`);});

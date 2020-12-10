const express = require("express");
const cookieParser = require('cookie-parser') 
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

function generateRandomString() {
  let output = Math.random().toString(36).replace(/[^a-z+0-9]+/g, '').substr(0, 6);
  return output;
};

const getUserByEmail = (email) => {
  for (let user_id in users){
    if(users[user_id].email === email) {
      return users[user_id];
    }
  }
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@blah.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@blah.com",
    password: "1234"
  }
};

function urlsForUser(user_id) {
  var userURLS = {};
  for (let key in urlDatabase)
    if (urlDatabase[key].user_id === user_id) {
      userURLS[key] = urlDatabase[key];
    }
  return userURLS;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies.id;
  let userObject = users[user_id];
  const templateVars = { urls: urlDatabase, userObject };
  res.render("urls_index", templateVars);
});

//Create a new page with form for user to submit
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.id;
  let userObject = users[user_id];
  const templateVars = { urls: urlDatabase, userObject };
  res.render("urls_new", templateVars);
}); 

//Use POST method to create shortURL, and populate longURL then redirect 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/register", (req, res) => {
  let user_id = req.cookies.id;
  let userObject = users[user_id];
  const templateVars = { userObject };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  let newUser = {
    id,
    email,  
    password
  };
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Bad request.");
  } 
  if (getUserByEmail(email)) {
      res.status(400).send("User already exists.");
  }
  users[id] = newUser;
  res.cookie("id", id)
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let user_id = req.cookies.id;
  let userObject = users[user_id];
  const templateVars = { shortURL, longURL, userObject };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let user_id = req.cookies.id;
  let userObject = users[user_id];
  const templateVars = { userObject };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userObject = getUserByEmail(email);
  if (!email || !password) {
    res.status(403).send("Please enter a username and password.");
  } 
  if (!userObject) {
    res.status(403).send("Username not found. Please register")
  }
  if (userObject) {
    if (userObject.password !== password) {
      res.status(403).send("Username or password do not match.");
    };
    res.cookie("id", userObject["id"]);
    res.redirect("/urls");
  }
  });

app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/login");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


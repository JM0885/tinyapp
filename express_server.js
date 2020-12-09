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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  
  let username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});
//Create a new page with form for user to submit
app.get("/urls/new", (req, res) => {
  const templateVars = { name: req.body.username }
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
  res.render("/urls_register");
});

app.post("/register", (req, res) => {

})

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { username: null }
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.email);
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatbase[shortURL]);
  res.redirect("/urls_show");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


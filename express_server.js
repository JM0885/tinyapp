const express = require("express");
const helpers = require("./helpers");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'asdfghjkl'
}));
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");

const generateRandomString = () => {
  let output = Math.random().toString(36).replace(/[^a-z+0-9]+/g, '').substr(0, 6);
  return output;
};

const userUrls = (user_id) => {
  let userURLS = {};
  for (let key in urlDatabase)
    if (urlDatabase[key].user_id === user_id) {
      userURLS[key] = urlDatabase[key];
    }
  return userURLS;
};

//URL database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//user database
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

//Establish server connection
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});

//Get JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Main page of app
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = {
    user_id,
    user: users[user_id],
    urlDatabase: userUrls(user_id)
  };
  if (!user_id) {
    res.status(400).send("Please login.");
  } else {
    res.render("urls_index", templateVars);
  }
});

//Create a new page with form for user to submit
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (user_id) {
    let templateVars = { user_id, user: users[user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//New user registration
app.get("/register", (req, res) => {
  res.render("urls_register", {user: users[req.session.user_id]});
});

//Allow user to go from shortURL to full web page
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//Send user to edit page if user is logged in
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  let shortURL = req.params.shortURL;
  let templateVars = {
    shortURL: shortURL,
    user: users[user_id],
    longURL: urlDatabase[shortURL].longURL,
    user_id: req.session.user_id,
    email: req.session["email"]
  };
  res.render("urls_show", templateVars);

});
//User login
app.get("/login", (req, res) => {
  let user_id = req.session.user_id;
  res.render("urls_login", {user: users[user_id]});
});

//POST - registration logic
app.post("/register", (req, res) => {
  const id = generateRandomString();
  let { email, password } = req.body;
  let hashpassword = bcrypt.hashSync(password, 10);
  let newUser = {
    id,
    email,
    password: hashpassword
  };
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter username or password.");
  }
  if (helpers.getUserByEmail(email, users)) {
    res.status(400).send("Please login.");
  } else {
    users[id] = newUser;
    console.log(req.session);
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

//Use POST method to create shortURL, and set longURL, then redirect
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  let user_id = req.session.user_id;
  let mainObject = {
    longURL: longURL,
    user_id,
    user: users[user_id],
  };
  if (longURL) {
    urlDatabase[shortURL] = mainObject;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid entry");
  }
});

//Update and redirect
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.id;
  if (!req.session["user_id"]) {
    res.redirect("/urls");
  } else if (urlDatabase[shortURL].user_id === req.session["user_id"]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

//LOGIN POST
app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let userObject = helpers.getUserByEmail(email, users);
  if (!email || !password) {
    res.status(403).send("Please enter a username and password.");
  }
  if (!userObject) {
    res.status(403).send("Username not found. Please register");
  }
  if (!bcrypt.compareSync(password, userObject.password)) {
    res.status(403).send("Username or password do not match.");
  } else {
    req.session.user_id = userObject["id"];
    res.redirect("/urls");
  }
});

//LOGOUT POST
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//DELETE POST
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.id;
  if (urlDatabase[shortURL].user_id === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});


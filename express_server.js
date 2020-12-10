const express = require("express");
const cookieParser = require('cookie-parser') 
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");

const generateRandomString = () => {
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

const urlsForUser = (user_id) => {
  let userURLS = {};
  for (let key in urlDatabase)
    if (urlDatabase[key].user_id === user_id) {
      userURLS[key] = urlDatabase[key];
    }
  return userURLS;
};


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

//Establish server connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Get JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Main page of app
app.get("/urls", (req, res) => {
  let user_id = req.cookies.id;
  let templateVars = {
    user_id,
    user: users[user_id],
    urlDatabase: urlsForUser(user_id)
  };
  res.render("urls_index", templateVars);
});

//Create a new page with form for user to submit
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.id;
    if (user_id) {
  let templateVars = { user_id, user: users[user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls_login");
  };
}); 

//New user registration
app.get("/register", (req, res) => {
  res.render("urls_register", {user: users[req.cookies.user_id]});
});

//Send user to edit page if user is logged in
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies.id;
  let shortURL = req.params.shortURL;
  let templateVars = {
  shortURL: shortURL,
  user: users[user_id],
  longURL: urlDatabase[shortURL].longURL, 
  user_id: req.cookies.id,
  email: req.cookies["email"]
  }; 
  res.render("urls_show", templateVars);

});

//Allow user to go from shortURL to full web page
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//User login
app.get("/login", (req, res) => {
  let user_id = req.cookies.user_id;
  res.render("urls_login", {user: users[user_id]});
});

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
  };
  if (getUserByEmail(email)) {
      res.status(400).send("Please login.");
  } else {
  users[id] = newUser;
  res.cookie("id", id)
  res.redirect("/urls");
  };
});

//Use POST method to create shortURL, and populate longURL then redirect 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  let user_id = req.cookies.id;
  let urlObj = {
    longURL: longURL,
    user_id,
    user: users[user_id],
  };
  if (longURL) {
    urlDatabase[shortURL] = urlObj;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid entry")
  }
});

//Update and redirect
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.id;
  if (!req.cookies["user_id"]) {
    res.redirect("/urls");
  } else if (urlDatabase[shortURL].user_id === req.cookies["user_id"]) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let {email, password} = req.body;
  let userObject = getUserByEmail(email);
  if (!email || !password) {
    res.status(403).send("Please enter a username and password.");
  } 
  if (!userObject) {
    res.status(403).send("Username not found. Please register")
  }
  if (!bcrypt.compareSync(password, userObject.password)) {
    res.status(403).send("Username or password do not match.");
  } else {
    res.cookie("id", userObject["id"]);
    res.redirect("/urls");
  };
});

app.post("/logout", (req, res) => {
  res.clearCookie("id");
  res.redirect("/login");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.id;
  if (urlDatabase[shortURL].user_id === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});


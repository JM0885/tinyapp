const express = require("express");
const cookieParser = require('cookie-parser') 
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let user_id = req.cookies.id;
  let templateVars = {
    user_id: user_id,
    user: users[user_id],
    urlDatabase: urlsForUser(user_id)
  };
  res.render("urls_index", templateVars);
});

//Create a new page with form for user to submit
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.id;
    if (user_id) {
  let templateVars = { user_id: user_id, user: users[user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
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

app.get("/register", (req, res) => {
  res.render("urls_register", {user: users[req.cookies.user_id]});
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
    res.status(400).send("Please enter username or password.");
  } 
  if (getUserByEmail(email)) {
      res.status(400).send("User already exists.");
  }
  users[id] = newUser;
  res.cookie("id", id)
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies.user_id;
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

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let user_id = req.cookies.user_id;
  res.render("urls_login", {user: users[user_id]});
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
  let shortURL = req.params.id;
  if (urlDatabase[shortURL].user_id === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});


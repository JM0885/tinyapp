const database = {
  g : {
    shortURL : "g",
    longURL : "https://www.google.ca",
    userID : "userID",
    lastUpdated : Date.now(),
    'visits' : Math.floor(Math.random() * 500)
  },
  LH : {
    shortURL : "LH",
    longURL : "https://www.lighthouselabs.ca",
    userID : "userID",
    lastUpdated : Date.now(),
    'visits' : Math.floor(Math.random() * 500)
  },
  example : {
    shortURL : "example",
    longURL : "https://www.example.com",
    userID : "example",
    lastUpdated : Date.now(),
    'visits' : Math.floor(Math.random() * 500)
  }
};

const addURL = (shortURL, longURL, userID) => {
  shortURL = typeof(shortURL) === 'string' ? shortURL : undefined;
  longURL = typeof(longURL) === 'string' ? longURL : undefined;
  userID = typeof(userID) === 'string' ? userID : undefined;

  if (shortURL && longURL && userID) {
    database[shortURL] = {
      shortURL,
      longURL,
      userID,
      lastUpdated : Date.now(),
      'visits' : 0
    };
    return true;
  } else {
    return false;
  }
};

const removeURL = (shortURL, userID) => {
  shortURL = typeof(shortURL) === 'string' ? shortURL : undefined;
  userID = typeof(userID) === 'string' ? userID : undefined;
  let owner = typeof(database[shortURL].userID) === 'string' ? database[shortURL].userID : 'unknownOwner';

  if (shortURL && userID === owner) {
    return delete database[shortURL];
  } else {
    return false;
  }
};

const getURL = (shortURL, incrementVisit = false) => {
  shortURL = typeof(shortURL) === 'string' ? shortURL : undefined;
  incrementVisit = typeof(increment) === 'boolean' ? incrementVisit : false;

  if (shortURL && database[shortURL]) {
    if (incrementVisit) {
      database[shortURL].visits += 1;
    }
    return database[shortURL];
  } else {
    return false;
  }
};
const updateURL = (shortURL, longURL, userID) => {
  shortURL = typeof(shortURL) === 'string' ? shortURL : undefined;
  longURL = typeof(longURL) === 'string' ? longURL : undefined;
  userID = typeof(userID) === 'string' ? userID : undefined;
  let owner = typeof(database[shortURL].userID) === 'string' ? database[shortURL].userID : 'unknownOwner';

  if (shortURL && longURL && userID && userID === owner) {
    database[shortURL].longURL = Date.now();
    database[shortURL].longURL = longURL;
    return true;
  } else {
    return false;
  }
};

module.exports = {
  addURL,
  removeURL,
  updateURL,
  getURL
};
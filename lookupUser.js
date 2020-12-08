const {generateRandomString} = require('./generateRandomString');
const {hashSync, compareSync} = require('bcrypt');

const localVariables = {
  sessionDuration : 15    //Time in minutes until session expires
};


const sessions = {
  "sessionID" : {
    "userID": "userID",
    "Expires" :  new Date(Date.now() + 60000)
  }
};

const users = {
  "userID": {
    id: "userID",
    email: "admin@example.com",
    password: hashSync("password", 10),
    urls : ['g', 'LH']
  },

  "example": {
    id: "example",
    email: "example@example.com",
    password: hashSync("password", 10),
    urls : ['example']
  }
};

const authenticate = (email, pass) => {
  email = typeof(email) === "string" ? email : false;
  pass = typeof(pass) === "string" ? pass : false;

  if (email && pass && isRegistered(email)) {
    
    for (let user in users) {
      if (email === users[user].email) {
        if (compareSync(pass, users[user].password)) {
          return users[user].id;
        } else {
          return false;
        }
      }
    }
    return false;
  } else {
    return false;
  }
};

const createSession = (email, pass) => {
  email = typeof(email) === "string" ? email : false;
  pass = typeof(pass) === "string" ? pass : false;
  let userID = authenticate(email, pass);
  
  if (email && pass && userID) {
    const sessionID = generateRandomString(32);
    sessions[sessionID] = {
      "userID" : userID,
      "Expires" : new Date(Date.now() + localVariables.sessionDuration * 60 * 1000)
    };
    return sessionID;
  } else {
    return false;
  }
};

const authenticateSession = (sessionID) => {
  sessionID = typeof(sessionID) === 'string' ? sessionID : false;
  if (sessionID && sessions[sessionID]) {
    if (sessions[sessionID].Expires > Date.now()) {
      return true;
    } else {
      delete sessions[sessionID];
      return false;
    }
  } else {
    return false;
  }
};

const getSessionUserID = (sessionID) => {
  sessionID = typeof(sessionID) === "string" ? sessionID : false;
  if (sessionID && sessions[sessionID]) {
    return sessions[sessionID].userID;
  } else {
    return false;
  }
};

const getSessionExpires = (sessionID) => {
  sessionID = typeof(sessionID) === "string" ? sessionID : false;
  if (sessionID && sessions[sessionID]) {
    return sessions[sessionID].Expires;
  } else {
    return false;
  }
};

const extendSession = (sessionID) => {
  sessionID = typeof(sessionID) === "string" ? sessionID : false;

  if (sessionID && sessions[sessionID]) {
    if (sessions[sessionID].Expires > Date.now()) {
      sessions[sessionID].Expires = new Date(Date.now() + localVariables.sessionDuration * 60 * 1000);
      return sessions[sessionID].Expires;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const destroySession = (sessionID) => {
  sessionID = typeof(sessionID) === "string" ? sessionID : false;
  return delete sessions[sessionID];
};

const registerNewUser = (email, pass) => {
  email = typeof(email) === "string" ? email : false;
  pass = typeof(pass) === "string" ? pass : false;

  if (email && pass && !isRegistered(email)) {
    const id = generateRandomString();
    users[id] = {
      'id': id,
      'email': email,
      'password': hashSync(pass,10),
      'urls': []
    };
    return true;
  } else {
    return false;
  }
};

const isRegistered = (email) => {
  email = typeof(email) === "string" ? email : false;

  if (email) {
    for (let user in users) {
      if (email === users[user].email) {
        return users[user].id;
      }
    }
    return false;
  } else {
    return false;
  }
};



const initSessions = () => {
  setInterval(() => {
    for (let session in sessions) {
      if (sessions[session].Expires <= Date.now()) {
        delete sessions[session];
      }
    }
    return true;
  }, localVariables.sessionDuration * 60 * 1000);
};


const addToURI = (uri, value, sessionID) => {
  uri = typeof(uri) === 'string' ? uri : false;
  sessionID = typeof(sessionID) === 'string' ? sessionID : false;
  value = typeof(value) === 'string' || typeof(value) === 'object' || typeof(value) === 'number' ? value : false;

  if (uri && value && sessionID) {
    if (getSessionUserID(sessionID)) {
      return users[getSessionUserID(sessionID)][uri].push(value);
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const deleteFromURI = (uri, value, sessionID) => {
  uri = typeof(uri) === 'string' ? uri : false;
  sessionID = typeof(sessionID) === 'string' ? sessionID : false;
  value = typeof(value) === 'string' || typeof(value) === 'object' || typeof(value) === 'number' ? value : false;

  if (uri && value && sessionID) {
    if (getSessionUserID(sessionID)) {
      const index = users[getSessionUserID(sessionID)][uri].indexOf(value);
      if (index > -1) {
        users[getSessionUserID(sessionID)][uri].splice(index, 1);
        return true;
      } else {
        return true;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const getURI = (uri, sessionID) => {
  uri = typeof(uri) === 'string' ? uri : false;
  sessionID = typeof(sessionID) === 'string' ? sessionID : false;
  
  if (uri && sessionID) {
    let userID = getSessionUserID(sessionID);
    if (userID) {
      return users[userID][uri];
    } else {
      return [];
    }
  } else {
    return [];
  }
};

const getUserEmailByID = (userID) => {
  userID = typeof(userID) === 'string' ? userID : false;

  if (users[userID]) {
    return users[userID].email;
  } else {
    return false;
  }
};


module.exports = {
  initSessions,
  authenticate,
  createSession,
  destroySession,
  extendSession,
  getSessionUserID,
  getUserEmailByID,
  getSessionExpires,
  authenticateSession,
  registerNewUser,
  isRegistered,
  addToURI,
  deleteFromURI,
  getURI
};
const getUserByEmail = (email, users) => {
  
  for (let user_id in users){
    if(users[user_id].email === email) {
      return users[user_id];
    } 
  } return null;
};

module.exports = { getUserByEmail };
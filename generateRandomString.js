module.exports = {
  generateRandomString: (length = 7) => {
    let array = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randString = '';
    
    randString += array[Math.floor(Math.random() * array.length)];
    array += "0123456789";

    while (randString.length < length) {
      randString += array[Math.floor(Math.random() * array.length)];
    }
    
    return randString;
  }
};
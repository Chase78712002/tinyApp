const databaseCheck = (email, database) => {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return false;
}

const generateRandomString = () => {
  // return a string of 6 random alphaNumeric characters
  let output = "";
  const alphaNumeric = "0123456789abcdefghij0123456789klmnopqrstuvwxyzABCD0123456789EFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    output += alphaNumeric[(Math.floor(Math.random() * alphaNumeric.length))];
  }
  return output;
}

const urlsForUser = (id, database) => {
  // return URLs when current user ID matches the userID on the URL
  let userUrlDatabase = {};
  for (const url in database) {
    if (database[url].userID === id) {
      userUrlDatabase[url] = database[url];
    }
  }
  return userUrlDatabase;
}


module.exports = {
  databaseCheck,
  generateRandomString,
  urlsForUser
}
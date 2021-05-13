const getUserByEmail = (email, database) => {
  const userIDsArr = Object.keys(database);
  for (const id of userIDsArr) {
    if (email === database[id]["email"]) {
      return database[id]["id"];
    }
  }
  return undefined;
};

const getUserByPassword = (email, database) => {
  const userIDsArr = Object.keys(database);
  for (const id of userIDsArr) {
    if (email === database[id]["email"]) {
      return database[id]["password"];
    }
  }
  return undefined;
};

const getUserByID = (email, database) => {
  const userIDsArr = Object.keys(database);
  for (const id of userIDsArr) {
    if (email === database[id]["email"]) {
      return database[id]["id"];
    }
  }
  return undefined;
};

// GET USERS URLS BASED ON THEIR ID
const getUrlsForUser = (user, database) => {
  let returnUrls = {};
  const urls = Object.keys(database);
  for (let key of urls) {
    if (user !== undefined && user === database[key]["userID"]) {
      returnUrls[key] = database[key];
    }
  }
  return returnUrls;
};

// GENERATE RANDOM STRING
const generateRandomString = (num) => {
  let returnValue = "";
  const randomCharacter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < num; i++) {
    returnValue += randomCharacter[Math.floor(Math.random() * 61)];
  }

  return returnValue;
};

module.exports = {
  getUserByEmail,
  getUserByPassword,
  getUserByID,
  getUrlsForUser,
  generateRandomString
};
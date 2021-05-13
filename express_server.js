const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// SUPER SECURE DATABASES
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: '8675309'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: '8675309'
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "8675309": {
    id: "8675309",
    email: "test@test.com",
    password: "test"
  }
};

// MIDDLEWARE
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// HELPER FUNCTIONS

// GENERATE RANDOM STRING
const generateRandomString = (num) => {
  let returnValue = "";
  const randomCharacter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < num; i++) {
    returnValue += randomCharacter[Math.floor(Math.random() * 61)];
  }

  return returnValue;
};

// FIND TRUE OR FALSE FOR EMAIL IN USERS OBJECT; OR RETURN ID
const findUserValue = (userEnteredValue, keyName) => {
  const userIDsArr = Object.keys(users);
  for (const id of userIDsArr) {
    // We return the user's ID instead of boolean if keyName is "id"
    if (keyName === "id") {
      if (userEnteredValue === users[id]["email"]) {
        return id;
      }
    // Otherwise, we just want to make sure the value matches
    } else if (userEnteredValue === users[id][keyName]) {
      return true;
    }
  }
  return false;
};

// GET USER_ID ()
// const findUserID = (userEmail) => {
//   const userIDsArr = Object.keys(users);
//   for (const id of userIDsArr) {
//     if (userEmail === users[id]["email"]) {
//       return id;
//     }
//   }
//   return;
// };

// GET HOMEPAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

// LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    attempt: "correct",
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

// LOGIN
app.post("/login", (req, res) => {

  let userID = 0;
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (findUserValue(userEmail, "email") && findUserValue(userPassword, "password")) {
    userID = findUserValue(userEmail, "id");
  }

  if (userID === 0) {
    const templateVars = {
      attempt: "incorrect",
      user: users[req.cookies["user_id"]]
    };
    return res.render("login", templateVars);
  }
 
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);
  res.redirect("/urls");
});

// GET REGISTRATION FORM
app.get("/registration", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("registration", templateVars);
});

// CREATE NEW USER
app.post("/registration", (req, res) => {
  const userID = generateRandomString(10);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (userEmail !== "" && userPassword !== "" && !findUserValue(userEmail, "email")) {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: userPassword
    };
    res.cookie("user_id", userID);
    return res.redirect("/urls");
  }
  
  res.sendStatus(400).end();
});

// REDIRECT SHORT URL TO LONGURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

// MY URLS PAGE
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

// CREATE SHORTURL FROM URL/NEW && ADD TO MY URLS
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString(6);
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = {
    longURL: newLongURL,
    userID: req.cookies.user_id};

  console.log("urlDatabase:", urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

// SHOW TEMPLATE TO CREATE NEW URL
app.get("/urls/new", (req, res) => {

  if (req.cookies.user_id) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

// EACH SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user: users[req.cookies["user_id"]]
    };
    return res.render("urls_show", templateVars);
  }

  return res.sendStatus(404).end();
});

// EDIT URL FROM SHORTURL PAGE
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// DELETE URL BUTTON
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
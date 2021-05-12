const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// SUPER SECURE DATABASES
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// FIND TRUE OR FALSE FOR EMAIL IN USERS OBJECT
const findUserEmail = (userEmail) => {
  const userIds = Object.keys(users);
  for (const keys of userIds) {
    if (userEmail === users[keys]["email"]) {
      return false;
    }
  }
  return true;
};

// GET HOMEPAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

// LOGIN
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
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

  if (userEmail !== "" && userPassword !== "" && findUserEmail(userEmail)) {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: userPassword
    };
    res.cookie("user_id", userID);
    res.redirect("/urls");
    res.end();
  } else {
    res.sendStatus(400);
  }
});

// REDIRECT SHORT URL TO LONGURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  urlDatabase[newShortURL] = newLongURL;

  res.redirect(`/urls/${newShortURL}`);
});

// SHOW TEMPLATE TO CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

// EACH SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };

  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  }
  
  res.render("urls_show", templateVars);
});

// EDIT URL FROM SHORTURL PAGE
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
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
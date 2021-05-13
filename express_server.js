const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['never', 'gonna', 'give', 'you', 'up'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 * 10 // 10 days
}));


// SUPER SECURE DATABASES
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'E1Xoq5rffL'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'E1Xoq5rffL'
  },
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
  "E1Xoq5rffL": {
    id: 'E1Xoq5rffL',
    email: 'asdf@asdf',
    password: '$2b$10$4RYCI1zDAqN8vYACgLTycuWEfeY/yGYAf/rVl5tGrg9MVKX6XIxJm'
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

const getUserPassword = (userEmail) => {
  const userIDsArr = Object.keys(users);
  for (const id of userIDsArr) {

    if (userEmail === users[id]["email"]) {
      return users[id]["password"];
    }
  }
  return undefined;
};

// GET USERS URLS BASED ON ID
const urlsForUser = (user) => {
  let returnUrls = {};
  const urls = Object.keys(urlDatabase);
  for (let key of urls) {
    if (user !== undefined && user.id === urlDatabase[key]["userID"]) {
      returnUrls[key] = urlDatabase[key];
    }
  }
  return returnUrls;
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
    user: req.session.user_id
  };
  res.render("login", templateVars);
});

// LOGIN
app.post("/login", (req, res) => {
  console.log("Login - All users:", users);
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (findUserValue(userEmail, "email")) {
    const hashPassword = getUserPassword(userEmail);

    bcrypt.compare(userPassword, hashPassword, (err, result) => {
      if (err) {
        console.log("err3", err);
        return res.sendStatus(500).end();
      }
      if (result) {
        const userID = findUserValue(userEmail, "id");
        req.session.user_id = userID;
        res.redirect("/urls");
        return;
      }
    });
  } else {
    const templateVars = {
      attempt: "incorrect",
      user: users[req.cookies["user_id"]]
    };
  
    res.render("login", templateVars);
    return;
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
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
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        console.log("err1", err);
        return res.sendStatus(500).end();
      }
      bcrypt.hash(userPassword, salt, (err, hash) => {
        if (err) {
          console.log("err2", err);
          return res.sendStatus(500).end();
        }
        users[userID] = {
          id: userID,
          email: userEmail,
          password: hash
        };

        console.log("Registration - All users:", users);
        req.session.user_id = userID;
        res.redirect("/urls");
      });
    });
    return;
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
  const user = req.session.user_id;
  const userUrls = urlsForUser(user);
  const profile = users[req.session.user_id];

  const templateVars = {
    user,
    profile,
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

// CREATE SHORTURL FROM URL/NEW && ADD TO MY URLS
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString(6);
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = {
    longURL: newLongURL,
    userID: req.cookies.user_id
  };

  res.redirect(`/urls/${newShortURL}`);
});

// SHOW TEMPLATE TO CREATE NEW URL
app.get("/urls/new", (req, res) => {

  if (req.cookies.user_id) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});

// EACH SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const user = users[req.cookies["user_id"]];
    const templateVars = {
      user,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
    };

    res.render("urls_show", templateVars);
    return;
  }

  res.sendStatus(404).end();
});

// EDIT URL FROM SHORTURL PAGE
app.post("/urls/:shortURL/update", (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    const shortURL = req.params.shortURL;
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL: newLongURL,
      userID: req.cookies.user_id
    };

    res.redirect(`/urls/${shortURL}`);
    return;
  }
  
  res.sendStatus(401).end();
});

// DELETE URL BUTTON
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }

  res.sendStatus(401).end();
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
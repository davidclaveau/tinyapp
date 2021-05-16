const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const { getUserByEmail, getUserByPassword, getUserByID, getUrlsForUser, generateRandomString } = require('./helpers');

// SUPER SECURE DATABASES
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'E1Xoq5rffL',
    visitNum: 0
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'E1Xoq5rffL',
    visitNum: 0
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
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['never', 'gonna', 'give', 'you', 'up'],
  
  maxAge: 24 * 60 * 60 * 1000 * 10 // 10 days
}));

// GET HOMEPAGE
app.get("/", (req, res) => {
  const user = req.session.user_id;
  const profile = users[req.session.user_id];
  const templateVars = {
    user,
    profile
  };
  res.render("home", templateVars);
});

// GET HOMEPAGE
app.get("/home", (req, res) => {
  const user = req.session.user_id;
  const profile = users[req.session.user_id];
  const templateVars = {
    user,
    profile
  };
  res.render("home", templateVars);
});

// LOGIN
app.get("/login", (req, res) => {
  const user = req.session.user_id;
  const profile = users[req.session.user_id];
  const templateVars = {
    user,
    profile,
    attempt: "correct"
  };
  res.render("login", templateVars);
});

// LOGIN
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  // If email entered is correct
  if (getUserByEmail(userEmail, users)) {
    const hashPassword = getUserByPassword(userEmail, users);

    bcrypt.compare(userPassword, hashPassword, (err, result) => {
      if (err) {
        const user = req.session.user_id;
        const profile = users[req.session.user_id];
        const error = "401: Unauthorized Client";
        const templateVars = {
          user,
          profile,
          error
        };
        
        res.status(401).render("error", templateVars);
        return;
      }
      if (result) {
        const userID = getUserByID(userEmail, users);
        req.session.user_id = userID;
        res.redirect("/urls");
        return;
      }
    });
  } else {
    // Otherwise, ask user to try logging in again
    const templateVars = {
      attempt: "incorrect",
      user: req.session.user_id
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
  // Redirect user from this page if already logged in
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: req.session.user_id };
  res.render("registration", templateVars);
});

// CREATE NEW USER
app.post("/registration", (req, res) => {
  const userID = generateRandomString(10);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  // If email or password is empty, and email is already in use
  if (userEmail === "" || userPassword === "" || getUserByEmail(userEmail, users)) {
    const user = req.session.user_id;
    const profile = users[req.session.user_id];
    const error = "409: Conflict - Username Already Exists!";
    const templateVars = {
      user,
      profile,
      error
    };
    
    res.status(409).render("error", templateVars);
    return;
  }

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      const user = req.session.user_id;
      const profile = users[req.session.user_id];
      const error = "401: Unauthorized Client";
      const templateVars = {
        user,
        profile,
        error
      };
      
      res.status(401).render("error", templateVars);
      return;
    }
    bcrypt.hash(userPassword, salt, (err, hash) => {
      if (err) {
        const user = req.session.user_id;
        const profile = users[req.session.user_id];
        const error = "401: Unauthorized Client";
        const templateVars = {
          user,
          profile,
          error
        };
        
        res.status(401).render("error", templateVars);
        return;
      }
      users[userID] = {
        id: userID,
        email: userEmail,
        password: hash
      };

      // Assign the userID as encrypted cookie
      req.session.user_id = userID;
      res.redirect("/urls");
    });
  });
});

// REDIRECT SHORT URL TO LONGURL
app.get("/u/:shortURL", (req, res) => {
  // Count number of visits
  urlDatabase[req.params.shortURL]["visitNum"] += 1;
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

// MY URLS PAGE
app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  const userUrls = getUrlsForUser(user, urlDatabase);
  const profile = users[req.session.user_id];

  const templateVars = {
    user,
    profile,
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

// CREATE SHORTURL FROM URL/NEW && ADD TO 'MY URLS'
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString(6);
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = {
    longURL: newLongURL,
    userID: req.session.user_id,
    visitNum: 0
  };

  res.redirect(`/urls/${newShortURL}`);
});

// SHOW TEMPLATE TO CREATE NEW URL
app.get("/urls/new", (req, res) => {
  // Only allow user to create new urls if logged in
  if (req.session.user_id) {
    const user = req.session.user_id;
    const profile = users[req.session.user_id];

    const templateVars = {
      user,
      profile
    };
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});

// SHOW SHORTURL EDIT PAGE
app.get("/urls/:shortURL", (req, res) => {
  // Only show shortURL pages that exist, otherwise send 404
  const user = req.session.user_id;
  const profile = users[req.session.user_id];
  const visits = urlDatabase[req.params.shortURL]["visitNum"];
  const userID = urlDatabase[req.params.shortURL]["userID"];
  
  if (!urlDatabase[req.params.shortURL]) {
    const error = "404: Page Not Found";
    const templateVars = {
      user,
      profile,
      error
    };
        
    res.status(404).render("error", templateVars);
    return;
  }

  if (user !== userID) {
    const error = "401: Unauthorized";
    const templateVars = {
      user,
      profile,
      error
    };
        
    res.status(401).render("error", templateVars);
    return;
  }

  const templateVars = {
    user,
    profile,
    visits,
    userID,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
  };

  res.render("urls_show", templateVars);
  return;

});

// EDIT URL FROM SHORTURL PAGE
app.put("/urls/:shortURL", (req, res) => {
  // Only allow users whose cookie matches userID to edit shortURLs, otherwise send 401
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    const shortURL = req.params.shortURL;
    const currentVisits = urlDatabase[req.params.shortURL]["visitNum"];
    const newLongURL = req.body.longURL;

    urlDatabase[shortURL] = {
      longURL: newLongURL,
      userID: req.session.user_id,
      visitNum: currentVisits
    };

    res.redirect(`/urls/${shortURL}`);
    return;
  }
  
  const user = req.session.user_id;
  const profile = users[req.session.user_id];
  const error = "401: Unauthorized";
  const templateVars = {
    user,
    profile,
    error
  };
  
  res.status(401).render("error", templateVars);
  return;
});

// DELETE URL BUTTON
app.delete("/urls/:shortURL", (req, res) => {
  // Only allow users whose cookie matches userID to delete shortURLs, otherwise send 401
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    return;
  }
  
  const user = req.session.user_id;
  const profile = users[req.session.user_id];
  const error = "401: Unauthorized Client";
  const templateVars = {
    user,
    profile,
    error
  };
  
  res.status(401).render("error", templateVars);
  return;
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  // Keep this easter egg, as no one told me to remove it :)
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
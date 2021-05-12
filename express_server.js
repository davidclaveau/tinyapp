const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const generateRandomString = () => {
  let returnValue = "";
  const randomCharacter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    returnValue += randomCharacter[Math.floor(Math.random() * 61)];
  }

  return returnValue;
};

// HOMEPAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

// LOGIN
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.cookies["username"])
  res.redirect("/urls");
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
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// CREATE NEW URL FROM URL/NEW && ADD TO MY URLS
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL;

  res.redirect(`/urls/${newShortURL}`);
});

// CREATE URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// EACH SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
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
  res.redirect(`/urls/${shortURL}`)
});

// DELETE URL BUTTON
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
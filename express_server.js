const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { databaseCheck, generateRandomString, urlsForUser } = require('./helpers');


// Database objects
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "h7z6gB" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "h7z6gB" },
  "cBYvji": { longURL: "http://www.youtube.com", userID: "2cmglg" },
  "cnJMLf": { longURL: "http://www.getbootstrap.com", userID: "2cmglg" },
  "R9tO59": { longURL: "http://www.pomofocus.io", userID: "2cmglg" }
};
const users = {
  'h7z6gB': {
    id: 'h7z6gB',
    email: 'aloha1234@nomail.com',
    password: '$2b$10$nA0Ibn5nPjFhvqj2ww9oyOJrVEhLxmf9IbSV0SOgMHXVmh1JVptvS' //qwer
  },
  '2cmglg': {
    id: '2cmglg',
    email: 'pineapple123@nomail.com',
    password: '$2b$10$JH8y5zQeWdkDSqnsvU8sq.xN/wPnHiokwjaEvO0HeWgKuTN6rHZPe' //123
  }
};
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'user_id',
  keys: ['super-secret-key']
}));

// Home
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.redirect('login');
});
// Main page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    cookie: req.session.user_id
  };
  if (req.session.user_id) {
    templateVars.urls = urlsForUser(req.session.user_id, urlDatabase);
  }
  res.render('urls_index', templateVars);
});
// Create shortURL page
app.get("/urls/new", (req, res) => {
  // if not logged in. redirect to /login
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_new', templateVars);
});
// Showing newly created url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session.user_id]
  };
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send('Requested Url does not exist');
  }
  if (req.session.user_id) {
    return res.render('urls_show', templateVars);
  }
  res.redirect('/urls');
});
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send('Requested Url does not exist');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
// Handle the post request after the user submit their longURL
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = { "longURL": `http://${req.body.longURL}`, "userID": req.session.user_id };
  const keysArr = Object.keys(urlDatabase);
  const key = keysArr[keysArr.length - 1];
  res.redirect(`/urls/${key}`);
});
// Update URL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = { "longURL": `http://${req.body.newURL}`, "userID": req.session.user_id };
  res.redirect("/urls");
});
// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const currentUserID = req.session.user_id;
  const urlUserID = urlDatabase[req.params.shortURL].userID;
  if (currentUserID === urlUserID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }
  res.status(403);
  res.end("You have no permission to delete this URL!!");
});

// Login
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});
// Registration page
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_registre', templateVars);
});

app.post('/login', (req, res) => {
  const testEmail = req.body.email;
  const testPassword = req.body.password;
  const userMatch = databaseCheck(testEmail, users);
  // if email not match, return 403
  if (!userMatch) {
    return res.status(403).send('Incorrect email, try again later');
  }
  if (bcrypt.compareSync(testPassword, userMatch.password)) {
    req.session.user_id = userMatch.id;
    return res.redirect('/urls');
  }
  res.status(403);
  return res.send('Incorrect password, try again later');
});
app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (!newEmail || !newPassword) {
    return res.status(400).send('invalid email password');
  }
  const existingUser = databaseCheck(newEmail, users);
  if (existingUser) {
    return res.status(400).send('user already exists');
  }
  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
  const newRandomID = generateRandomString();
  users[newRandomID] = {
    "id": newRandomID,
    "email": newEmail,
    "password": hashedNewPassword
  };
  req.session.user_id = newRandomID;
  res.redirect('/urls');
});
// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}`);
});
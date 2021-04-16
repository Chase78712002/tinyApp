const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const generateRandomString = () => {
  // return a string of 6 random alphaNumeric characters
  let output = "";
  const alphaNumeric = "0123456789abcdefghij0123456789klmnopqrstuvwxyzABCD0123456789EFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    output += alphaNumeric[(Math.floor(Math.random() * alphaNumeric.length))];
  }
  return output;
}
const databaseCheck = (testValue, databaseProperty) => {
  for (const user in users) {
    if (testValue === users[user][databaseProperty]) {
      return users[user];
    }
  }
  return false;
}
const urlsForUser = (id) => {
  // return URLs when current user ID matches the userID on the URL
  let userUrlDatabase = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlDatabase[url] = urlDatabase[url];
    }
  }
  return userUrlDatabase;
}

// Database objects
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "E7HRz3" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "E7HRz3" },
  "cBYvji": { longURL: "http://www.youtube.com", userID: "0w1dxG" },
  "cnJMLf": { longURL: "http://www.getbootstrap.com", userID: "0w1dxG" },
  "R9tO59": { longURL: "http://www.pomofocus.io", userID: "j22L2z" }
};
const users = {
  "j22L2z": {
    id: "j22L2z",
    email: "user@example.com",
    password: "1234"
  },
  "E7HRz3": {
    id: "E7HRz3",
    email: "aloha1234@nomail.com",
    password: "qwerty"
  },
  "0w1dxG": {
    id: "0w1dxG",
    email: "pineapple123@nomail.com",
    password: "asdf"
  }
}
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'user_id',
  keys: ['super-secret-key']
}))


// app.get("/", (req, res) => {
//   // Home
//   const templateIndex = { urls: urlDatabase };
//   res.render('urls_index', templateIndex);
// });
// const loggedIn = (reqCookie) => {
//   return (Object.keys(reqCookie).length !== 0);
// }
// Main page
app.get("/urls", (req, res) => {
  console.log('top of url',req.session.user_id);
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    cookie: req.session.user_id
  };
  if (req.session.user_id) {
    templateVars.urls = urlsForUser(req.session.user_id);
    console.log(req.session.user_id);
  }
  console.log(templateVars.user);
  console.log('bottom of url',req.session.user_id);
  res.render('urls_index', templateVars);
});
// Create shortURL page
app.get("/urls/new", (req, res) => {
  // if not logged in. redirect to /login
  if (req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id]
  }
  res.render('urls_new', templateVars);
});
// Handle the post request after the user submit their longURL
app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // bodyParser processed the body and gave us the decoded content in the form of object and throw it into the req.body
  urlDatabase[generateRandomString()] = { "longURL": `http://${req.body.longURL}`, "userID": req.session.user_id };
  console.log('new urlDatabase obj', urlDatabase);
  const keysArr = Object.keys(urlDatabase);
  const key = keysArr[keysArr.length - 1];
  res.redirect(`/urls/${key}`);
})
// Showing newly created url page
app.get("/urls/:shortURL", (req, res) => {
  const templateShow = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session.user_id]
  }
  if (req.session.user_id) {
    return res.render('urls_show', templateShow);
  }
  res.redirect('/urls');
});
// Redirect to the source url page
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
// Update URL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = `http://${req.body.newURL}`;
  res.redirect("/urls");
});
// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const currentUserID = req.session.user_id;
  const urlUserID = urlDatabase[req.params.shortURL].userID
  if (currentUserID === urlUserID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }
  res.status(403);
  res.end("You have no permission to delete this URL!!")
});

app.get('/alvin', (req, res) => {
  req.session.newCookie = 'abcde';
  res.cookie('key', 'value');
  res.send('hello');
})



// Login
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  res.render('urls_login', templateVars);
})
app.post('/login', (req, res) => {
  const testEmail = req.body.email;
  const testPassword = req.body.password;
  const userMatch = databaseCheck(testEmail, "email");
  // if email not match, return 403
  if (!userMatch) {
    res.status(403)
    return res.send('Incorrect email, try again later');
  }
  if (bcrypt.compareSync(testPassword, userMatch.password)) {
    req.session.user_id = userMatch.id;
    console.log('below log in ', req.session.user_id);
    return res.redirect('/urls');
  }
  // if passwords not match, return 403
  res.status(403);
  return res.send('Incorrect password, try again later');
});
// Registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  res.render('urls_registre', templateVars);
});
app.post('/register', (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  
  if (!newEmail || !newPassword) {
    return res.status(400).send('invalid email password');
  }
  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
  const newRandomID = generateRandomString();
  const existingUser = databaseCheck(newEmail, "email");
  console.log('newPassword', newPassword);
  console.log('hashedPassword', hashedNewPassword);
  if (existingUser) {
    return res.status(400).send('user already exists');
  }
  users[newRandomID] = {
    "id": newRandomID,
    "email": newEmail,
    "password": hashedNewPassword
  };
  // set 'user_id' cookie paired with the generated random ID
  console.log(newRandomID);
  req.session.user_id = newRandomID;
  console.log('hi , im below req.session.user_id', req.session.user_id);
  // redirect to /urls
  res.redirect('/urls');
})
// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}`);
});
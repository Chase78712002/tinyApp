const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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
// Database objects
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
  "E7HRz3": {
    id: "E7HRz3",
    email: "aloha1234@nomail.com",
    password: "qwerty"
  }
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// app.get("/", (req, res) => {
//   // Home
//   const templateIndex = { urls: urlDatabase};
//   res.render('urls_index',templateIndex);
// });
// Main page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});
// Create shortURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_new', templateVars);
});
// Handle the post request after the user submit their longURL
app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // bodyParser processed the body and gave us the decoded content in the form of object and throw it into the req.body
  urlDatabase[generateRandomString()] = `http://${req.body.longURL}`;
  console.log('new urlDatabase obj', urlDatabase);
  const keysArr = Object.keys(urlDatabase);
  const key = keysArr[keysArr.length - 1];
  res.redirect(`/urls/${key}`);
})
// Showing newly created url page
app.get("/urls/:shortURL", (req, res) => {
  // above value behind ":", in this case, "shortURL" is populated to req.param object as the key and the actual value passed in becomes the value: eg. req.params = {shortURL: "b2xVn2"}
  const templateShow = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_show', templateShow);
});
// Redirect to the source url page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
// Update URL
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = `http://${req.body.newURL}`;
  res.redirect("/urls");
});
// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});
// Login
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_login', templateVars);
})
app.post('/login', (req, res) => {
  const testEmail = req.body.email;
  const testPassword = req.body.password;
  // compare the test email&password with the ones we have in database
  const emailMatch = databaseCheck(testEmail, "email");
  const passwordMatch = databaseCheck(testPassword, "password");
  // if email not match, return 403
  if (!emailMatch) {
    res.status(403)
    return res.send('Incorrect email, try again later');
  }
  // if passwords not match, return 403
  if (!passwordMatch) {
    res.status(403);
    return res.send('Incorrect password, try again later');
  }
  // if all match, set user_id cookie with the random ID
  res.cookie('user_id', passwordMatch.id);
  // redirect back to the /urls
  res.redirect('/urls');

});
// Registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_registre', templateVars);
});
app.post('/register', (req, res) => {
  // add new user object to the users (global) object
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const newRandomID = generateRandomString();
  // if email or password are empty, return 400
  if (!newEmail || !newPassword) {
    res.status(400);
    res.end();
  }
  // if duplicated email, return 400
  const existingUser = databaseCheck(newEmail,"email");
  if (existingUser) {
    console.log('This new user exists', existingUser);
    res.status(400);
    res.end();
  }
  users[newRandomID] = {
    "id": newRandomID,
    "email": newEmail,
    "password": newPassword
  };
  // set 'user_id' cookie paired with the generated random ID
  res.cookie('user_id', newRandomID);
  // driver code
  console.log(`\n This is the content of the users global objects: \n ${JSON.stringify(users)}`);

  // redirect to /urls
  res.redirect('/urls');
  console.log("Here's the req.cookies for user_id", req.cookies)

})
// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
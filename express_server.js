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
    output += alphaNumeric[(Math.floor(Math.random()*alphaNumeric.length))];
  }
  return output;
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

// app.get("/", (req, res) => {
//   // Home
//   const templateIndex = { urls: urlDatabase};
//   res.render('urls_index',templateIndex);
// });

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index',templateVars);
});

app.post("/urls", (req, res)=> {
  console.log(req.body.longURL); // bodyParser processed the body and gave us the decoded content in the form of object and throw it into the req.body
  urlDatabase[generateRandomString()] = `http://${req.body.longURL}`;
  console.log('new urlDatabase obj', urlDatabase);
  const keysArr = Object.keys(urlDatabase);
  const key = keysArr[keysArr.length-1];
  res.redirect(`/urls/${key}`);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render('urls_new', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.get("/urls/:shortURL", (req, res) => {
  // above value behind ":", in this case, "shortURL" is populated to req.param object as the key and the actual value passed in becomes the value: eg. req.params = {shortURL: "b2xVn2"}
  const templateShow = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  }
  res.render('urls_show', templateShow);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  const usernameValue = req.body.username;
  const username = Object.keys(req.body);
  //set a cookie named username to the value submitted in the request body via the login form
  res.cookie(username, usernameValue);
  // redirect back to the /urls
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
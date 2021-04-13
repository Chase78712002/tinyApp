const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

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
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  // Home
  const templateIndex = { urls: urlDatabase};
  res.render('urls_index',templateIndex);
});

app.get("/urls", (req, res) => {
  const templateIndex = { urls: urlDatabase};
  res.render('urls_index',templateIndex);
});

app.post("/urls", (req, res)=> {
  console.log(req.body.longURL); // bodyParser processed the body and gave us the decoded content in the form of object and throw it into the req.body
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log('new urlDatabase obj', urlDatabase);
  res.redirect("urls");
})

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:shortURL", (req, res) => {
  // above value behind ":", in this case, "shortURL" is populated to req.param object as the key and the actual value passed in becomes the value: eg. req.params = {shortURL: "b2xVn2"}
  const templateShow = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
  res.render('urls_show', templateShow);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
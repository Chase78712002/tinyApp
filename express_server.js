const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  // Home page
});

app.get("/urls", (req, res) => {
  const templateIndex = { urls: urlDatabase};
  res.render('urls_index',templateIndex);
});

app.get("/urls/:shortURL", (req, res) => {
  // above value behind ":", in this case, "shortURL" is populated to req.param object as the key and the actual value passed in becomes the value: eg. req.params = {shortURL: "b2xVn2"}
  const templateShow = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
  res.render('urls_show', templateShow);
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
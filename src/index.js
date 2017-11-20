const path = require('path');
const express = require('express');
const fetch = require('node-fetch');

import parse from './parser'

const app = express();

function handleIndex(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
}

const URL_TEMPLATE = "https://en.wikipedia.org/wiki/List_of_UN_numbers_{0}_to_{1}";
const range = [1, 3600];

function generateUrls() {
  const urls = [];

  let index = range[0];
  while(index < range[1]) {

    // Range 601 to 1000 does not exist
    if (index < 600 || index > 901) {

      let start = index.toString();
      while (start.length < 4) {
        start = '0' + start;
      }

      let end = (index + 99).toString();
      while (end.length < 4) {
        end = '0' + end;
      }

      const url = URL_TEMPLATE.replace('{0}', start).replace('{1}', end);
      urls.push(url);

  }

    index += 100;
  }
  return urls;
}

function handleUrl(req, res) {
  const urls = generateUrls();

  const promises = urls.map(function(url){
    return fetch(url, {"method": "GET"})
      .then(function(response){
        return response.text()
      })
      .then(function(result){
        return parse(result);
      })
      .catch(console.error)
  })

  Promise.all(promises)
    .then(function(resultArr){
      let collector = "";
      resultArr.forEach(function(result){
        collector += '\r\n' + result;
      })
      res.send(collector);
    });
}

app.get('/', handleIndex);
app.post('/url', handleUrl);

app.listen(3000);

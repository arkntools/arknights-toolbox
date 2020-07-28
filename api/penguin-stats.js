const express = require('express');
const http = require('http');
const { get } = require('axios').default;

const app = express();

app.get('*', (req, res) => {
  get('https://penguin-stats.io/PenguinStats/api/v2/result/matrix').then(({ data }) => {
    res.json(data);
  });
});

module.exports = http.createServer(app);

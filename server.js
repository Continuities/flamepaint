'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const throttle = require('./src/throttle');
const argv = require('yargs')
    .usage('Usage: $0 --backend [address] [options]')
    .default('backport', 1075)
    .default('port', 8080)
    .demandOption(['backend'])
    .argv;

const app = express();

app.use(express.static(path.resolve(__dirname, 'build')));
app.use(bodyParser.json() );

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.post('/', (req, res) => {
  // TODO: Post to the flame panel backend
  console.log('received', req.body);
  res.send('OK');
});

app.listen(argv.port, () => {
  console.log(`FlamePaint live on port ${argv.port}!`);
});
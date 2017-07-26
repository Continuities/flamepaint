'use strict';

const express = require('express');
const path = require('path');
const argv = require('yargs')
    .usage('Usage: $0 --backend [address] [options]')
    .default('backport', 1075)
    .default('port', 8080)
    .demandOption(['backend'])
    .argv;

const app = express();

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.post('/', (req, res) => {
  // TODO: Post to the flame panel backend
});

app.listen(argv.port, () => {
  console.log(`FlamePaint live on port ${argv.port}!`);
});
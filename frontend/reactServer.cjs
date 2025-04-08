// Citation for the following code:
// Date: 2/24/2025
// Copied from:
// https://github.com/osu-cs340-ecampus/react-starter-app

// reactServer.cjs
// Uses common javascript to serve the react build folder (/dist)

const express = require('express');
const path = require('path');
const app = express();
require("dotenv").config();

// Use the custom 'REACT_SERVER_PORT' port from .env, with a fallback 
const PORT = process.env.REACT_SERVER_PORT || 3121;

// Serve the static files from the React app located in the build folder '/dist'
// React router will take over frontend routing
app.use(express.static(path.join(__dirname, 'dist')));

// Handles any requests that don't match the ones above to return the React app
// A request to '/nonExist' will redirect to the index.html where react router takes over at '/'
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  // Change this text to whatever server you're on
  console.log(`Server running:  localhost:${PORT}...`);
});
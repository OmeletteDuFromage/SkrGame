const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { json } = require('body-parser');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');

let i = 0;
const app = express();
const server = http.createServer(app);
const wss = socketIO(server);


/*/////////////////////////////////////////////////////////////////////////////////

                                WEBSERVER PART

/////////////////////////////////////////////////////////////////////////////////*/


// Serve the index.html file when the user hits the main URL
const { JSDOM } = require('jsdom');
const fs = require('fs');
const { randomInt, randomUUID } = require('crypto');
app.use(express.json());
app.use(cookieParser());
app.use('/images', express.static('public/images'))
app.use(express.static(path.join(__dirname, 'views')));



/// routes definitions
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading login.html:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(data);
    });
});


app.get('image', (req, res) => {
    console.log(selectedImage);
})

app.post('/login', (req, res) => {
    const { login, team } = req.body;

    if (!req.cookies.team || req.cookies.team !== team) {
        res.cookie('team', randomInt(2), { maxAge: 900000, httpOnly: true });
    }
    if (!req.cookies.login || req.cookies.login !== login) {
        res.cookie('login', login, { maxAge: 900000, httpOnly: true });
    }
    if (!req.cookies.clientId || req.cookies.clientId !== login) {
        res.cookie('clientId', generateUniqueId(), { maxAge: 900000, httpOnly: true });
    }
    // Construct the JSON string
    let evt = `{
    "UserId": "${req.cookies.clientId}",
    "UserName": "${req.cookies.login}",
    "Team": ${req.cookies.team}
}`;
    // Parse the JSON string to an object
    let data;
    try {
        data = JSON.parse(evt);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return;
    }

    // Emit the WebSocket event

    wss.emit('OnUserAdded', data);
    res.status(200).json({ message: 'Validation successful!' });
});

// OnButtonClicked create json and send it to wss clients
app.post('/button-click', (req, res) => {
    const buttonId = req.body.buttonId;
    const teamID = req.cookies.team;
    const clientId = req.cookies.clientId;
    const login = req.cookies.login;
    let response = `{
  "UserId": "${clientId}",
  "UserName": "${login}",
  "Team": ${teamID},
  "Zone": "${buttonId}"
}`
    // Handle the button click as needed
    wss.emit('button-click', response);
    

    res.status(200).send();
});

//right button clicked
app.post('/right-click', (req, res) => {
    if (i >= 4) {
        i = 0;
    }
    else {
        i++;
    }
    // UpdateImage(i);
});

//left buttonclicked
app.post('/left-click', (req, res) => {
    // Handle the button click (e.g., perform some action)
    // console.log('left Button was clicked on the server!');
    res.status(200).send('Button click received.');
    if (i <= 0) {
        i = 4;
    }
    else {
        i++;
    }
    // UpdateImage(i);
});

/*/////////////////////////////////////////////////////////////////////////////////

                                WEBSOCKET PART

/////////////////////////////////////////////////////////////////////////////////*/

// WebSocket server
wss.on('connection', (socket) => {
    // Handle incoming messages
    console.log('Client connected');
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

wss.on('StartGame', (data) =>{
    console.log("start game" + data);
});

// Start the server
const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`WebSocket server running at http://localhost:${port}`);
});

/*/////////////////////////////////////////////////////////////////////////////////

                                MISC PART

/////////////////////////////////////////////////////////////////////////////////*/


function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}
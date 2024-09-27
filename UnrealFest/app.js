const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { json } = require('body-parser');
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');
const fs = require('fs');


/*/////////////////////////////////////////////////////////////////////////////////

WEBSERVER PART

/////////////////////////////////////////////////////////////////////////////////*/



let i = 0;
const app = express();
const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/unrealfest2024.sky-real.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/unrealfest2024.sky-real.com/privkey.pem')
  };
  
const server = http.createServer(options, app);
const wss = socketIO(server);
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

app.get('/get-cookie', (req, res) => {
    const cookieValue = req.cookies.team;
    res.json({ team: cookieValue, clientId: req.cookies.clientId, login: req.cookies.login });
});

app.get('image', (req, res) => {
})

app.post('/login', (req, res) => {
    const { login } = req.body;
    
    team = getRandomInt(0, 1);
    clientId = generateUniqueId();
    res.cookie('team', team, { maxAge: 60000, httpOnly: true });
    res.cookie('clientId', clientId, { maxAge: 60000, httpOnly: true });
    res.cookie('login', login, { maxAge: 60000, httpOnly: true });
    
    let evt = `{
    "UserId": "${clientId}",
    "UserName": "${login}",
    "Team": ${team}
}`;
let data;
try {
    data = JSON.parse(evt);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return;
    }

    wss.emit('OnUserAdded', data);
    res.status(200).json({ message: 'Validation successful!' });
});


// OnButtonClicked create json and send it to wss clients
app.post('/button-click', (req, res) => {
    const buttonId = req.body.buttonId;
    const teamID = req.cookies.team;
    const clientId = req.cookies.clientId;
    const login = req.cookies.login;

    console.log(buttonId, teamID, clientId, req.cookies.login)
    if (!teamID || !clientId || !login || !buttonId)
    {
        res.status(400).send('Missing required cookies');
        return;
    }

    let response = `{
  "UserId": "${clientId}",
  "UserName": "${login}",
  "Team": ${teamID},
  "Zone": "${buttonId}"
}`



    let data;
    try {
        data = JSON.parse(response);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return;
    }
    wss.emit('OnClick', data);


    res.status(200).send();
});

/*/////////////////////////////////////////////////////////////////////////////////

                                WEBSOCKET PART

/////////////////////////////////////////////////////////////////////////////////*/

// WebSocket server
wss.on('connect', (socket) => {
    // Handle incoming messages
    console.log('Client connected');
    socket.on('close', () => {
        console.log('Client disconnected');
    });
    socket.on('StartGame', () => {
        socket.broadcast.emit('GameStarted');
    });
    socket.on('UpdateScore', (data) => {
        socket.broadcast.emit('ScoreUpdated', JSON.stringify(data));
    });

    socket.on('GameTerminated', (data) => {
        socket.broadcast.emit('OnGameTerminated', data);
    })
    
});

// Start the server
const port = process.env.PORT || 443;
server.listen(port, () => {
    console.log(`WebSocket server running at http://localhost:${port}`);
});

/*/////////////////////////////////////////////////////////////////////////////////

                                MISC PART

/////////////////////////////////////////////////////////////////////////////////*/


function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min + 1)) + min) > 0.5 ? 1 : 0;
  }

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { json } = require('body-parser');
const cookieParser = require('cookie-parser');

let i = 0;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let client = [];


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
    const {login, team} = req.body;
    if (!req.cookies.team || req.cookies.team !== team) {
        res.cookie('team', team, { maxAge: 900000, httpOnly: true });
    }
    if (!req.cookies.login || req.cookies.login !== login) {
        res.cookie('login', login, { maxAge: 900000, httpOnly: true });    
    }
    if (!req.cookies.clientId || req.cookies.clientId !== login) {
        res.cookie('clientId', generateUniqueId(), { maxAge: 900000, httpOnly: true });    
    }

    
    
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
  "Team": "${teamID}",
  "Zone": "${buttonId}"
}`
    // Handle the button click as needed
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event: 'button-click', data: response }));
        }
    });
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

function UpdateImage(i) {
    const filePath = path.join(__dirname, 'views/index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Load the HTML into jsdom
        const dom = new JSDOM(data);
        const document = dom.window.document;


        const regex = /images\/(\d+)\.jpg/;
        const url = document.getElementById('image').src;
        const match = url.match(regex);
        let number = 0;
        if (match) {
            number = match[1];
            console.log('Captured number:', number);
        } else {
            console.log('No match found');
        }



        const selectedImage = 'images/' + number + '.jpg';
        console.log(selectedImage);
        document.getElementById('image').src = selectedImage;
    });
}
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
    socket.on('message', (message) => {
        // const rq = JSON.parse(message);
        // if (rq.channel == 'UpdateScore') {
        //     wss.clients.forEach((client) => {
        //         if (client !== socket && client.readyState === WebSocket.OPEN) {
        //             client.send(message);
        //         }
        //     });
        // }

        // Broadcast the message to all connected clients

    });

    // Handle client disconnection
    socket.on('close', () => {
        console.log('Client disconnected');
    });
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
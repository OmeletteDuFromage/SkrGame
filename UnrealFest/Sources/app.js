const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { json } = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve the index.html file when the user hits the main URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.post('/button-click', (req, res) => {
    // Handle the button click (e.g., perform some action)
    console.log('Button was clicked on the server!');
    res.status(200).send('Button click received.');
});


// WebSocket server
wss.on('connection', (socket) => {
    // Handle incoming messages
    socket.on('message', (message) => {
        const rq = JSON.parse(message);



        if (rq.channel == 'UpdateScore')
        {
            // do your magic here
        }

        // Broadcast the message to all connected clients
        // wss.clients.forEach((client) => {
        //     if (client !== socket && client.readyState === WebSocket.OPEN) {
        //         client.send(message);
        //     }
        // });
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

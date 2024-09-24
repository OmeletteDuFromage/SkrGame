
const socketIo = require('socket.io-client');
// Define the WebSocket server URL
// const serverUrl = 'ws://18.169.64.77:8080/'; // Replace with your server URL
const serverUrl = 'http://localhost:8080/'; // Replace with your server URL

// Define the JSON message
const channel = 'UpdateScore';
const message = {
    Zones: [
        {
            Zone: 'LeftWing',
            TeamScores: [
                { Team: 0, Score: 25 },
                { Team: 1, Score: 15 },
            ],
        },
        {
            Zone: 'Cockpit',
            TeamScores: [
                { Team: 0, Score: 12 },
                { Team: 1, Score: 32 },
            ],
        },
    ],
};

// Convert the message to JSON string
const messageStr = JSON.stringify({ channel, message });

// Create a WebSocket connection
const ws = socketIo.io(serverUrl);

ws.on('connect', () => {
    ws.emit('StartGame');
    ws.emit('UpdateScore');
});


ws.on('message', function (event) {
    console.log(event)
});

ws.on('OnUserAdded', (event) => {
    console.log(JSON.stringify(event))
});

ws.on('button-clicked', (event) => {
    console.log(event)
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('WebSocket connection closed.');
});

ws.on('StartGame', () => {
    console.log('PARTY STARTED');
});

ws.on('UpdateScore', () => {
    console.log('PARTY STARTED');
});

ws.on('OnClick', (data) => {
    console.log(data);
});
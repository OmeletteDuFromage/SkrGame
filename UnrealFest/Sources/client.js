const WebSocket = require('ws');

// Define the WebSocket server URL
const serverUrl = 'ws://localhost:8080'; // Replace with your server URL

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
const messageStr = JSON.stringify({channel, message});

// Create a WebSocket connection
const ws = new WebSocket(serverUrl);

ws.on('open', () => {
    // Send the message
    ws.send(messageStr);
    console.log(`Sent message: ${messageStr}`);
});

ws.on('message', (response) => {
    console.log(`Received response: ${response}`);
});

ws.on('close', () => {
    console.log('WebSocket connection closed.');
});

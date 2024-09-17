const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Route to handle incoming data from the Telegram bot
app.post('/store', (req, res) => {
    const userData = req.body;

    // Save the userData to a JSON file
    try {
        fs.writeFileSync('userData.json', JSON.stringify(userData, null, 2));
        res.status(200).send('Data received and stored successfully!');
    } catch (error) {
        console.error('Error writing data to file:', error);
        res.status(500).send('Internal Server Error: Could not store data.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Storage bot server listening on port ${port}`);
});

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const botToken = process.env.STORAGE_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });
const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for registered students
let studentData = [];

// Middleware to parse JSON
app.use(bodyParser.json());

// Endpoint to receive and store data from registration bot
app.post('/store_data', (req, res) => {
    const data = req.body;

    // Store the data in memory
    studentData.push(data);
    console.log('Data received:', data);

    // Respond to the registration bot
    res.status(200).send('Data stored successfully.');
});

// Command handler for retrieving data
bot.onText(/\/get_data/, (msg) => {
    const chatId = msg.chat.id;

    if (studentData.length === 0) {
        bot.sendMessage(chatId, 'No data available.');
        return;
    }

    // Format and send the stored data
    let response = 'Stored Data:\n\n';
    studentData.forEach((data, index) => {
        response += `Student ${index + 1}:\nName: ${data.name}\nEmail: ${data.email}\nLinkedIn: ${data.linkedin}\nGitHub: ${data.github}\n\n`;
    });

    bot.sendMessage(chatId, response);
});

// Start the express server to listen for incoming data
app.listen(port, () => {
    console.log(`Storage bot server is running on port ${port}`);
});

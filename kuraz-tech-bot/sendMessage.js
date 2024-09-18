require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const botToken = process.env.NEW_INTERNS_BOT_TOKEN; // Replace with your bot token
const bot = new TelegramBot(botToken, { polling: true });

const channelUsername = '@https://t.me/+QobhBYXu2f9hNTk8'; // Use your channel username with '@'
const testMessage = 'Test message';

bot.sendMessage(channelUsername, testMessage)
    .then(() => {
        console.log('Message sent successfully.');
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });

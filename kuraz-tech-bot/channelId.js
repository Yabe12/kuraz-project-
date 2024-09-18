require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const botToken = process.env.NEW_INTERNS_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

// Log and respond to channel messages
bot.on('channel_post', (msg) => {
    console.log('Received a channel post:', msg);
    bot.sendMessage(msg.chat.id, `Channel ID: ${msg.chat.id}`);
});

console.log('Bot is running and listening for messages...');

const TelegramBot = require('node-telegram-bot-api');

// Create a new bot instance
const bot = new TelegramBot('7529904140:AAGFu9HOBWG37v1K7qWItll9H-CWJWu5LJk', { polling: true });

// Handle errors
bot.on('polling_error', (error) => {
  console.log('Polling error:', error.code);  // e.g. "ETELEGRAM"
});

// Handle messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello World!');
});

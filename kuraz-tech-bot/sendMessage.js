const axios = require('axios');
const botToken = '7529904140:AAGFu9HOBWG37v1K7qWItll9H-CWJWu5LJk'; // Use your bot token here
const chatId = 'CHAT_ID';
const message = 'Your message here';

const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
axios.post(url, {
  chat_id: chatId,
  text: message,
}).then(response => {
  console.log('Message sent:', response.data);
}).catch(error => {
  console.error('Error sending message:', error);
});

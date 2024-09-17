require('dotenv').config();  // Load environment variables from .env file
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const storageBotUrl = process.env.STORAGE_BOT_URL; // URL to send data to storage bot

const bot = new TelegramBot(botToken, { polling: true });

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Start command handler
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            keyboard: [
                ['Register'],
                ['Get Info'],
                ['Education']
            ],
            one_time_keyboard: true
        }
    };

    bot.sendPhoto(chatId, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsz5Oq28O_F3dr_xQ78cYouVib22RLd5pqhA&s', {
        caption: '*Welcome to Our Internship Bot!*\n_We are excited to have you here. Please choose an option below._',
        parse_mode: 'Markdown'
    });
    bot.sendMessage(chatId, '*Please choose an option:*', options, { parse_mode: 'Markdown' });
});

// Register command handler
bot.onText(/Register/, (msg) => {
    const chatId = msg.chat.id;

    // Collect user's name
    bot.sendMessage(chatId, '*Please send your name.*', { parse_mode: 'Markdown' })
        .then(() => {
            bot.once('message', (msg) => {
                if (msg.text && msg.text !== '/start') {
                    const name = msg.text;

                    // Collect user's email
                    bot.sendMessage(chatId, '*Please send your email.*', { parse_mode: 'Markdown' })
                        .then(() => {
                            bot.once('message', (msg) => {
                                if (msg.text && msg.text !== '/start') {
                                    const email = msg.text;

                                    // Validate email format
                                    if (!isValidEmail(email)) {
                                        bot.sendMessage(chatId, '*Invalid email format. Please send a valid email.*', { parse_mode: 'Markdown' });
                                        return;
                                    }

                                    // Collect user's LinkedIn profile link
                                    bot.sendMessage(chatId, '*Please send your LinkedIn profile link.*', { parse_mode: 'Markdown' })
                                        .then(() => {
                                            bot.once('message', (msg) => {
                                                if (msg.text && msg.text !== '/start') {
                                                    const linkedin = msg.text;

                                                    // Collect user's GitHub account link
                                                    bot.sendMessage(chatId, '*Please send your GitHub account link.*', { parse_mode: 'Markdown' })
                                                        .then(() => {
                                                            bot.once('message', (msg) => {
                                                                if (msg.text && msg.text !== '/start') {
                                                                    const github = msg.text;

                                                                    // Ask user to upload their resume
                                                                    bot.sendMessage(chatId, '*Please send your resume (upload file).*', { parse_mode: 'Markdown' })
                                                                        .then(() => {
                                                                            bot.once('document', async (msg) => {
                                                                                const resume = msg.document;

                                                                                // Collect all the data into a JSON object
                                                                                const userData = {
                                                                                    name: name,
                                                                                    email: email,
                                                                                    linkedin: linkedin,
                                                                                    github: github,
                                                                                    resume: resume.file_id // Save the file_id to fetch later
                                                                                };

                                                                                // Send the JSON data to the storage bot
                                                                                try {
                                                                                    await axios.post(storageBotUrl, userData);
                                                                                    bot.sendMessage(chatId, '*Congratulations!* Your registration is complete and data is stored.', { parse_mode: 'Markdown' });
                                                                                } catch (error) {
                                                                                    console.error('Error sending data to storage bot:', error);
                                                                                    bot.sendMessage(chatId, '*Error:* Could not save your data. Please try again later.', { parse_mode: 'Markdown' });
                                                                                }

                                                                                bot.sendMessage(chatId, 'Click /start to return to the main menu.');
                                                                            });
                                                                        });
                                                                }
                                                            });
                                                        });
                                                }
                                            });
                                        });
                                }
                            });
                        });
                }
            });
        });
});

// Get Info command handler
bot.onText(/Get Info/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '*For more information, visit:* [Kuraz Tech](https://t.me/kuraztech)', { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, 'Click /start to return to the main menu.');
});

// Education command handler
bot.onText(/Education/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '*For educational content, visit:* [Kuraz Tech Education](https://kuraztech.com/)', { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, 'Click /start to return to the main menu.');
});

// Back command handler
bot.onText(/\/back/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            keyboard: [
                ['Register'],
                ['Get Info'],
                ['Education']
            ],
            one_time_keyboard: true
        }
    };
    bot.sendMessage(chatId, '*Please choose an option:*', options, { parse_mode: 'Markdown' });
});

// Start polling
bot.startPolling();

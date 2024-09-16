require('dotenv').config();  // Load environment variables from .env file
const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('pg');
const fs = require('fs');

// Access the bot token and database connection string from the environment variable
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const dbConnectionString = process.env.DATABASE_URL;

// Initialize the bot and PostgreSQL client
const bot = new TelegramBot(botToken, { polling: true });
const dbClient = new Client({ connectionString: dbConnectionString });
dbClient.connect();

function isValidEmail(email) {
    // Regular expression to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


// Handle /start command
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
// Handle Register command
bot.onText(/Register/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '*Please send your name.*', { parse_mode: 'Markdown' });

    bot.once('message', (msg) => {
        if (msg.text && msg.text !== '/start') {
            const name = msg.text;
            bot.sendMessage(chatId, '*Please send your email.*', { parse_mode: 'Markdown' });

            bot.once('message', (msg) => {
                if (msg.text && msg.text !== '/start') {
                    const email = msg.text;
                    
                    // Validate the email format
                    if (!isValidEmail(email)) {
                        bot.sendMessage(chatId, '*Invalid email format. Please send a valid email.*', { parse_mode: 'Markdown' });
                        return;
                    }
                    
                    bot.sendMessage(chatId, '*Please send your LinkedIn profile link.*', { parse_mode: 'Markdown' });

                    bot.once('message', (msg) => {
                        if (msg.text && msg.text !== '/start') {
                            const linkedin = msg.text;
                            bot.sendMessage(chatId, '*Please send your GitHub account link.*', { parse_mode: 'Markdown' });

                            bot.once('message', (msg) => {
                                if (msg.text && msg.text !== '/start') {
                                    const github = msg.text;
                                    bot.sendMessage(chatId, '*Please send your resume (upload file).*', { parse_mode: 'Markdown' });

                                    // Handle resume upload (both document and photo)
                                    bot.once('document', async (msg) => {
                                        const resume = msg.document;
                                        bot.sendMessage(chatId, '*Congratulations!* Your registration is complete.', { parse_mode: 'Markdown' });
                                        bot.sendMessage(chatId, 'Click /start to return to the main menu.');
                                    });

                                    bot.once('photo', async (msg) => {
                                        const resume = msg.photo;
                                        bot.sendMessage(chatId, '*Congratulations!* Your registration is complete.', { parse_mode: 'Markdown' });
                                        bot.sendMessage(chatId, 'Click /start to return to the main menu.');
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});



// Handle Get Info command
bot.onText(/Get Info/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '*For more information, visit:* [Kuraz Tech](https://t.me/kuraztech)', { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, 'Click /start to return to the main menu.');
});

// Handle Education command
bot.onText(/Education/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '*For educational content, visit:* [Kuraz Tech Education](https://kuraztech.com/)', { parse_mode: 'Markdown' });
    bot.sendMessage(chatId, 'Click /start to return to the main menu.');
});

// Handle /back command (Not required as /start covers it)
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

bot.startPolling();

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const botToken = process.env.NEW_INTERNS_BOT_TOKEN;
const channelId = process.env.CHANNEL_ID; // Channel ID to send data to

const bot = new TelegramBot(botToken, { polling: true });


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

    bot.sendMessage(chatId, 'Welcome to Our Internship Bot! Please choose an option:', options);
});

// Register command handler
bot.onText(/Register/, (msg) => {
    const chatId = msg.chat.id;

    // Collect user's name
    bot.sendMessage(chatId, 'Please send your name.')
        .then(() => {
            bot.once('message', (msg) => {
                const name = msg.text;

                // Collect user's email
                bot.sendMessage(chatId, 'Please send your email.')
                    .then(() => {
                        bot.once('message', (msg) => {
                            const email = msg.text;

                            // Validate email format
                            if (!isValidEmail(email)) {
                                bot.sendMessage(chatId, 'Invalid email format. Please send a valid email.');
                                return;
                            }

                            // Collect user's LinkedIn profile link
                            bot.sendMessage(chatId, 'Please send your LinkedIn profile link.')
                                .then(() => {
                                    bot.once('message', (msg) => {
                                        const linkedin = msg.text;

                                        // Collect user's GitHub account link
                                        bot.sendMessage(chatId, 'Please send your GitHub account link.')
                                            .then(() => {
                                                bot.once('message', (msg) => {
                                                    const github = msg.text;

                                                    // Ask user to upload their resume
                                                    bot.sendMessage(chatId, 'Please send your resume (upload file).')
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

                                                                // Convert JSON data to a string
                                                                const userDataString = JSON.stringify(userData, null, 2);

                                                                // Send the JSON data to the private channel
                                                                try {
                                                                    await bot.sendMessage(channelId, `New Registration:\n\`\`\`${userDataString}\`\`\``, { parse_mode: 'Markdown' });
                                                                    bot.sendMessage(chatId, 'Registration complete and data stored.');
                                                                } catch (error) {
                                                                    console.error('Error sending data to channel:', error);
                                                                    bot.sendMessage(chatId, 'Error: Could not save your data. Please try again later.');
                                                                }

                                                                bot.sendMessage(chatId, 'Click /start to return to the main menu.');
                                                            });
                                                        });
                                                });
                                            });
                                    });
                                });
                        });
                    });
            });
        });
});

// Get Info command handler
bot.onText(/Get Info/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'For more information, visit: [Kuraz Tech](https://t.me/kuraztech)', { parse_mode: 'Markdown' });
});

// Education command handler
bot.onText(/Education/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'For educational content, visit: [Kuraz Tech Education](https://kuraztech.com/)', { parse_mode: 'Markdown' });
});

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const token = process.env.STUDENT_BOT_TOKEN;
const adminChannelId = process.env.ADMIN_CHANNEL_ID; // The private Telegram channel ID
const bot = new TelegramBot(token, { polling: true });

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Kuraze Internship Bot! Please choose an option:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Register', callback_data: 'register' }],
                [{ text: 'Information', callback_data: 'info' }],
                [{ text: 'Education', callback_data: 'education' }],
                [{ text: 'Support & Discussion Group', callback_data: 'support' }],
                [{ text: 'Direct Contact', callback_data: 'contact' }]
            ]
        }
    });
});

// Listen for callback queries
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'register') {
        startRegistration(chatId);
    } else if (data === 'info') {
        bot.sendMessage(chatId, 'Here is the official channel link for more information: [Official Channel](t.me/kuraztech)', { parse_mode: 'Markdown' });
    } else if (data === 'education') {
        bot.sendMessage(chatId, 'Visit our educational website for learning materials: [Educational Website](www.kuraztech.com)', { parse_mode: 'Markdown' });
    } else if (data === 'support') {
        bot.sendMessage(chatId, 'Join our support & discussion group here: [Support & Discussion Group](https://t.me/kuraztechnologies)', { parse_mode: 'Markdown' });
    } else if (data === 'contact') {
        bot.sendMessage(chatId, 'For direct contacts, please reach out to @bkhappy.');
    }
});

function startRegistration(chatId) {
    bot.sendMessage(chatId, 'Please provide your full name:');
    bot.once('message', (msg) => {
        const fullName = msg.text;
        bot.sendMessage(chatId, 'Please provide your GitHub account:');
        bot.once('message', (msg) => {
            const github = msg.text;
            bot.sendMessage(chatId, 'Please provide your LinkedIn account:');
            bot.once('message', (msg) => {
                const linkedin = msg.text;
                bot.sendMessage(chatId, 'Please justify why you want the scholarship:');
                bot.once('message', (msg) => {
                    const justification = msg.text;
                    saveRegistrationData(chatId, fullName, github, linkedin, justification);
                });
            });
        });
    });
}

function saveRegistrationData(chatId, fullName, github, linkedin, justification) {
    const studentData = {
        chatId,
        fullName,
        github,
        linkedin,
        justification
    };

    // Send data to the admin channel
    bot.sendMessage(adminChannelId, `New student registered:\nName: ${fullName}\nGitHub: ${github}\nLinkedIn: ${linkedin}\nJustification: ${justification}`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Approve', callback_data: `approve_${chatId}` }]
            ]
        }
    });

    bot.sendMessage(chatId, 'Your registration is complete. Thank you!');
}

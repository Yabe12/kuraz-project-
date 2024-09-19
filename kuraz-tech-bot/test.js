const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const adminChatId = process.env.ADMIN_CHAT_ID; // Add your admin's Telegram ID here

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

// Registration process
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

// Save registration data and notify admin
function saveRegistrationData(chatId, fullName, github, linkedin, justification) {
    const studentData = {
        fullName,
        github,
        linkedin,
        justification,
        chatId
    };

    // Save data as JSON file in a dedicated directory
    const fileName = `./registrations/${chatId}.json`;
    if (!fs.existsSync('./registrations')) {
        fs.mkdirSync('./registrations');
    }

    fs.writeFile(fileName, JSON.stringify(studentData, null, 2), (err) => {
        if (err) {
            bot.sendMessage(chatId, 'There was an error saving your data. Please try again.');
            console.error(err);
        } else {
            bot.sendMessage(chatId, 'Your registration is complete. Thank you!');

            // Notify admin about the new registration
            bot.sendMessage(adminChatId, `New registration received from ${fullName}. Use /approve_${chatId} to approve or /delete_${chatId} to delete.`);
        }
    });
}

// Admin commands
bot.onText(/\/approve_(\d+)/, (msg, match) => {
    const studentChatId = match[1];

    // Approve the student and send them a message
    const fileName = `./registrations/${studentChatId}.json`;
    if (fs.existsSync(fileName)) {
        const studentData = JSON.parse(fs.readFileSync(fileName));
        bot.sendMessage(studentChatId, `Congratulations ${studentData.fullName}, you have been selected for the Kuraze internship!`);
        bot.sendMessage(adminChatId, `Student ${studentData.fullName} has been approved.`);
    } else {
        bot.sendMessage(adminChatId, `No student found with ID ${studentChatId}.`);
    }
});

bot.onText(/\/delete_(\d+)/, (msg, match) => {
    const studentChatId = match[1];

    // Delete the student data
    const fileName = `./registrations/${studentChatId}.json`;
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
        bot.sendMessage(studentChatId, `Your internship application has been deleted.`);
        bot.sendMessage(adminChatId, `Student with ID ${studentChatId} has been deleted.`);
    } else {
        bot.sendMessage(adminChatId, `No student found with ID ${studentChatId}.`);
    }
});

// Admin command to delete all student data after the internship
bot.onText(/\/delete_all_students/, (msg) => {
    if (msg.chat.id === parseInt(adminChatId)) {
        const files = fs.readdirSync('./registrations');
        files.forEach((file) => {
            fs.unlinkSync(`./registrations/${file}`);
        });
        bot.sendMessage(adminChatId, 'All student registrations have been deleted.');
    } else {
        bot.sendMessage(msg.chat.id, 'You do not have permission to perform this action.');
    }
});

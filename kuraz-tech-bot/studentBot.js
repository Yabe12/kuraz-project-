const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const token = process.env.STUDENT_BOT_TOKEN;
const adminChannelId = process.env.ADMIN_CHANNEL_ID; // The private Telegram channel ID
const bot = new TelegramBot(token, { polling: true });

const adminId = process.env.ADMIN_ID; // Add your admin user ID here

let pendingRegistrations = {}; // To store registration data temporarily

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (chatId == adminId) {
        showAdminMenu(chatId);
    } else {
        showUserMenu(chatId);
    }
});

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (chatId == adminId) {
        handleAdminCallback(chatId, data);
    } else {
        handleUserCallback(chatId, data);
    }

    // Acknowledge the callback query
    bot.answerCallbackQuery(callbackQuery.id);
});

// Show user menu
function showUserMenu(chatId) {
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
}

// Handle user callback queries
function handleUserCallback(chatId, data) {
    switch (data) {
        case 'register':
            startRegistration(chatId);
            break;
        case 'info':
            bot.sendMessage(chatId, 'Here is the official channel link for more information: [Official Channel](https://t.me/kuraztech)', { parse_mode: 'Markdown' });
            break;
        case 'education':
            bot.sendMessage(chatId, 'Visit our educational website for learning materials: [Educational Website](https://www.kuraztech.com)', { parse_mode: 'Markdown' });
            break;
        case 'support':
            bot.sendMessage(chatId, 'Join our support & discussion group here: [Support & Discussion Group](https://t.me/kuraztechnologies)', { parse_mode: 'Markdown' });
            break;
        case 'contact':
            bot.sendMessage(chatId, 'For direct contacts, please reach out to @bkhappy.');
            break;
    }
}

// Handle admin callback queries
function handleAdminCallback(chatId, data) {
    switch (data) {
        case 'view_students':
            viewAllStudents(chatId);
            break;
        case 'delete_all':
            deleteAllStudents(chatId);
            break;
        default:
            if (data.startsWith('approve_')) {
                const studentChatId = data.split('_')[1];
                approveStudent(studentChatId);
            } else if (data.startsWith('reject_')) {
                const studentChatId = data.split('_')[1];
                rejectStudent(studentChatId);
            }
            break;
    }
}
// Start registration process
function startRegistration(chatId) {
    bot.sendMessage(chatId, 'Please provide your full name (e.g., John Doe):');
    bot.once('message', (msg) => {
        const fullName = msg.text;
        bot.sendMessage(chatId, 'Please provide your GitHub account (e.g., https://github.com/username):');
        bot.once('message', (msg) => {
            const github = msg.text;
            bot.sendMessage(chatId, 'Please provide your LinkedIn account (e.g., https://www.linkedin.com/in/username):');
            bot.once('message', (msg) => {
                const linkedin = msg.text;
                bot.sendMessage(chatId, 'Please provide your phone number (e.g., 0912345678):');
                bot.once('message', (msg) => {
                    const phoneNumber = msg.text;

                    // Phone number validation
                    if (!/^09\d{8}$/.test(phoneNumber)) {
                        bot.sendMessage(chatId, 'Invalid phone number. It must start with 09 and be 10 digits long, e.g., 0912345678.');
                        return;
                    }

                    bot.sendMessage(chatId, 'Please provide your email address (e.g., example@domain.com):');
                    bot.once('message', (msg) => {
                        const email = msg.text;

                        // Email validation
                        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                            bot.sendMessage(chatId, 'Invalid email format. Please provide a valid email address, e.g., example@domain.com.');
                            return;
                        }

                        bot.sendMessage(chatId, 'Please provide your Telegram username (e.g., @username):');
                        bot.once('message', (msg) => {
                            const telegramUsername = msg.text;
                            bot.sendMessage(chatId, "Please select one of the following areas to continue your development: Frontend, Backend, or Mobile App, e.g., Frontend ");
                            bot.once('message', (msg) => {
                                const justification = msg.text;
                                saveRegistrationData(chatId, fullName, github, linkedin, phoneNumber, email, telegramUsername, justification);
                            });
                        });
                    });
                });
            });
        });
    });
}
// Save registration data and send to the admin channel
function saveRegistrationData(chatId, fullName, github, linkedin, phoneNumber, email, telegramUsername, justification) {
    const studentData = {
        chatId,
        fullName,
        github,
        linkedin,
        phoneNumber,
        email,
        telegramUsername,
        justification
    };

    // Store the registration data temporarily
    pendingRegistrations[chatId] = studentData;

    // Send registration data to the admin channel with approve/reject buttons
    bot.sendMessage(adminChannelId, `New Registration Request:\n\nName: ${fullName}\nGitHub: ${github}\nLinkedIn: ${linkedin}\nPhone: ${phoneNumber}\nEmail: ${email}\nTelegram Username: ${telegramUsername}\nJustification: ${justification}`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Approve', callback_data: `approve_${chatId}` }],
                [{ text: 'Reject', callback_data: `reject_${chatId}` }]
            ]
        }
    });

    bot.sendMessage(chatId, '✔️ Your registration is complete! If you are selected for this internship, we will send you a message. Thank you! 🙏🌟');
}

// Approve a student
function approveStudent(studentChatId) {
    const studentData = pendingRegistrations[studentChatId];
    if (studentData) {
        bot.sendMessage(studentChatId, "🎉🎊 Congratulations! 🎊🎉 Your registration has been successfully approved! 🌟✨Our office location is [here](https://maps.app.goo.gl/SjmxFtyEenXJcCE89). We look forward to seeing you! 🏢📍");
        delete pendingRegistrations[studentChatId]; // Remove from pending list
    }
}

// Reject a student
function rejectStudent(studentChatId) {
    const studentData = pendingRegistrations[studentChatId];
    if (studentData) {
        bot.sendMessage(studentChatId, '🚫😔 Sorry, your registration has been rejected. 😔🚫');
        delete pendingRegistrations[studentChatId]; // Remove from pending list
    }
}
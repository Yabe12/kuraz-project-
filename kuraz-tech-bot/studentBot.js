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
    bot.sendMessage(chatId, 'Please provide your full name:');
    bot.once('message', (msg) => {
        const fullName = msg.text;
        bot.sendMessage(chatId, 'Please provide your GitHub account:');
        bot.once('message', (msg) => {
            const github = msg.text;
            bot.sendMessage(chatId, 'Please provide your LinkedIn account:');
            bot.once('message', (msg) => {
                const linkedin = msg.text;
                bot.sendMessage(chatId, 'Please provide your phone number:');
                bot.once('message', (msg) => {
                    const phoneNumber = msg.text;
                    bot.sendMessage(chatId, 'Please provide your email address:');
                    bot.once('message', (msg) => {
                        const email = msg.text;
                        bot.sendMessage(chatId, 'Please provide your Telegram username:');
                        bot.once('message', (msg) => {
                            const telegramUsername = msg.text;
                            bot.sendMessage(chatId, 'Please justify why you want the scholarship:');
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

// Save registration data as JSON and send to the channel
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

    // Save the data to a JSON file
    const filename = `registration_${chatId}.json`;
    fs.writeFileSync(filename, JSON.stringify(studentData, null, 2));

    // Store the file info for admin review
    pendingRegistrations[chatId] = filename;

    // Send the file to the admin channel
    bot.sendDocument(adminChannelId, filename)
       .then(() => {
           // Delete the file after sending
           fs.unlinkSync(filename);
       })
       .catch(err => {
           console.error('Error sending document:', err);
       });

    bot.sendMessage(chatId, 'Your registration is complete. Thank you!');
}

// Admin menu
function showAdminMenu(chatId) {
    bot.sendMessage(chatId, 'Welcome Admin! Please choose an option:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'View All Students', callback_data: 'view_students' }],
                [{ text: 'Delete All Students', callback_data: 'delete_all' }]
            ]
        }
    });
}

// View all students
function viewAllStudents(chatId) {
    let message = 'Here are the pending registrations:\n\n';
    for (const [studentChatId, filename] of Object.entries(pendingRegistrations)) {
        const studentData = JSON.parse(fs.readFileSync(filename, 'utf8'));
        message += `Name: ${studentData.fullName}\nGitHub: ${studentData.github}\nLinkedIn: ${studentData.linkedin}\nJustification: ${studentData.justification}\n\n`;
        // Add buttons for approve/reject
        bot.sendMessage(chatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Approve', callback_data: `approve_${studentChatId}` }],
                    [{ text: 'Reject', callback_data: `reject_${studentChatId}` }]
                ]
            }
        });
        // Remove processed student data
        fs.unlinkSync(filename);
    }
}

// Delete all students
function deleteAllStudents(chatId) {
    pendingRegistrations = {};
    bot.sendMessage(chatId, 'All student data has been deleted.');
}

// Approve a student
function approveStudent(studentChatId) {
    const filename = pendingRegistrations[studentChatId];
    const studentData = JSON.parse(fs.readFileSync(filename, 'utf8'));
    bot.sendMessage(studentChatId, 'Congratulations! Your registration has been approved.');
    // Optionally, you can remove the student from the pending list after approval
    delete pendingRegistrations[studentChatId];
}

// Reject a student
function rejectStudent(studentChatId) {
    bot.sendMessage(studentChatId, 'Sorry, your registration has been rejected.');
    // Optionally, you can remove the student from the pending list after rejection
    delete pendingRegistrations[studentChatId];
}

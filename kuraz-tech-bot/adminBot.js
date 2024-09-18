const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.ADMIN_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID; // Admin's chat ID for direct communication
const adminChannelId = process.env.ADMIN_CHANNEL_ID; // The private Telegram channel ID
const bot = new TelegramBot(token, { polling: true });

// Listen for callback queries
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith('approve_')) {
        const studentChatId = data.split('_')[1];
        approveStudent(studentChatId);
    } else if (data === 'delete_all') {
        deleteAllStudents();
    }
});

// Approve a student
function approveStudent(studentChatId) {
    bot.sendMessage(studentChatId, 'Congratulations! You have been approved for the internship program.');
    bot.sendMessage(adminChatId, 'Student has been approved successfully.');
}

// Delete all student data
function deleteAllStudents() {
    bot.sendMessage(adminChannelId, 'Deleting all student data...');

    // Here you would need to implement the logic for deleting student data, 
    // e.g., removing files if they are saved elsewhere or managing records if they are handled differently.
    
    bot.sendMessage(adminChatId, 'All student data has been deleted.');
}

// Admin command to delete all students
bot.onText(/\/delete_all_students/, (msg) => {
    if (msg.chat.id == adminChatId) {
        deleteAllStudents();
    } else {
        bot.sendMessage(msg.chat.id, 'You do not have permission to perform this action.');
    }
});

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const token = process.env.STUDENT_BOT_TOKEN;
const adminChannelId = process.env.ADMIN_CHANNEL_ID;
const bot = new TelegramBot(token, { polling: true });

const adminId = process.env.ADMIN_ID;

let pendingRegistrations = {}; // To store registration data temporarily

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Send a welcome message
    bot.sendMessage(chatId, "Welcome to Kuraze Internship Bot! 🌟🙏");

    // Show the main menu
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

    bot.answerCallbackQuery(callbackQuery.id);
});

// Show user menu
function showUserMenu(chatId) {
    bot.sendMessage(chatId, 'Please choose an option:', {
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
            showPolicyAndAgreement(chatId);
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

// Show policy and agreement before registration
function showPolicyAndAgreement(chatId) {
    const policyMessage = `📜 *Policy and Agreement* 📜

Before proceeding with the registration, please read the following terms carefully:
1. By registering, you agree to provide accurate information.
2. You accept that the internship will require your full commitment.
3. Your personal data will be handled confidentially.

Read the full policy here: [Kuraz Tech Internship Policy](https://telegra.ph/Kuraz-Tech-company-internship-police-09-22)

Do you agree to the terms?`;

    bot.sendMessage(chatId, policyMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Yes, I agree', callback_data: 'agree_policy' }],
                [{ text: 'No, I do not agree', callback_data: 'disagree_policy' }]
            ]
        }
    });
}

// Handle policy agreement callback
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'agree_policy') {
        startRegistration(chatId);
    } else if (data === 'disagree_policy') {
        bot.sendMessage(chatId, 'You have declined the policy. Unfortunately, you cannot proceed with the registration without agreeing to the terms.');
    }
});

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
                            bot.sendMessage(chatId, "Please provide your university name:");
                            bot.once('message', (msg) => {
                                const university = msg.text;
                                bot.sendMessage(chatId, "What area do you want to work in?", {
                                    reply_markup: {
                                        inline_keyboard: [
                                            [{ text: 'Backend', callback_data: 'area_backend' }],
                                            [{ text: 'Frontend', callback_data: 'area_frontend' }],
                                            [{ text: 'Mobile', callback_data: 'area_mobile' }]
                                        ]
                                    }
                                });

                                bot.once('callback_query', (callbackQuery) => {
                                    const area = callbackQuery.data.split('_')[1];
                                    bot.sendMessage(chatId, "Please upload your profile picture:");

                                    bot.once('photo', (photo) => {
                                        const fileId = photo.photo[photo.photo.length - 1].file_id;

                                        bot.sendMessage(chatId, "Please upload your resume file (PDF or Word):");
                                        bot.once('document', (doc) => {
                                            const resumeFileId = doc.document.file_id;

                                            saveRegistrationData(chatId, fullName, github, linkedin, phoneNumber, email, telegramUsername, university, area, fileId, resumeFileId);
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
}

// Save registration data and send to admin channel
function saveRegistrationData(chatId, fullName, github, linkedin, phoneNumber, email, telegramUsername, university, area, fileId, resumeFileId) {
    const studentData = {
        chatId,
        fullName,
        github,
        linkedin,
        phoneNumber,
        email,
        telegramUsername,
        university,
        area, // Store the selected area
        fileId,
        resumeFileId // Store resume file ID
    };

    // Store the registration data temporarily
    pendingRegistrations[chatId] = studentData;

    // Send registration data to the admin channel with a beautiful arrangement
    const registrationMessage = `*New Registration Request:*
*Name:* ${fullName}
*GitHub:* ${github}
*LinkedIn:* ${linkedin}
*Phone:* ${phoneNumber}
*Email:* ${email}
*Telegram Username:* ${telegramUsername}
*University:* ${university}
*Area of Interest:* ${area}`;

    bot.sendPhoto(adminChannelId, fileId, {
        caption: registrationMessage,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Approve', callback_data: `approve_${chatId}` }],
                [{ text: 'Reject', callback_data: `reject_${chatId}` }]
            ]
        }
    });

    // Send the resume to the admin channel
    bot.sendDocument(adminChannelId, resumeFileId, {
        caption: `Resume of ${fullName}`,
        parse_mode: 'Markdown'
    });

    bot.sendMessage(chatId, '✔️ Your registration is complete! If you are selected for this internship, we will send you a message. Thank you! 🙏🌟');
}

// Approve a student
function approveStudent(studentChatId) {
    const studentData = pendingRegistrations[studentChatId];
    if (studentData) {
        bot.sendMessage(studentChatId, "🎉🎊 Congratulations! 🎊🎉 Your registration has been successfully approved! 🌟✨ Our office location is [here](https://maps.app.goo.gl/SjmxFtyEenXJcCE89). Please reach out to @bkhappy for further instructions.");
        delete pendingRegistrations[studentChatId];
    }
}

// Reject a student
function rejectStudent(studentChatId) {
    bot.sendMessage(studentChatId, "We're sorry, but your registration has been rejected. Thank you for your interest! 🙏");
    delete pendingRegistrations[studentChatId];
}

// Handle admin callback queries
function handleAdminCallback(chatId, data) {
    const parts = data.split('_');
    if (parts[0] === 'approve') {
        const studentChatId = parts[1];
        approveStudent(studentChatId);
    } else if (parts[0] === 'reject') {
        const studentChatId = parts[1];
        rejectStudent(studentChatId);
    }
}

// Show admin menu
function showAdminMenu(chatId) {
    bot.sendMessage(chatId, 'Welcome Admin! Please choose an option:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'View Registrations', callback_data: 'view_registrations' }],
                [{ text: 'Statistics', callback_data: 'statistics' }]
            ]
        }
    });
}

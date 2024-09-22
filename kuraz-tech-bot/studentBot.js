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
                            bot.sendMessage(chatId, 'Please provide the name of your university:');
                            bot.once('message', (msg) => {
                                const university = msg.text;
                                bot.sendMessage(chatId, 'Please provide your year of study (e.g., 3rd year, 4th year):');
                                bot.once('message', (msg) => {
                                    const yearOfStudy = msg.text;
                                    bot.sendMessage(chatId, "Please select one of the following areas to continue your development: Frontend, Backend, or Mobile App, e.g., Frontend");
                                    bot.once('message', (msg) => {
                                        const learn = msg.text;
                                        saveRegistrationData(chatId, fullName, github, linkedin, phoneNumber, email, telegramUsername, university, yearOfStudy, learn);
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

// Save registration data and send to the admin channel
function saveRegistrationData(chatId, fullName, github, linkedin, phoneNumber, email, telegramUsername, university, yearOfStudy, learn) {
    const studentData = {
        chatId,
        fullName,
        github,
        linkedin,
        phoneNumber,
        email,
        telegramUsername,
        university,
        yearOfStudy,
        learn
    };

    // Send studentData to admin or store it somewhere
    bot.sendMessage(chatId, "Registration completed. Your information has been saved.");
}

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/store', (req, res) => {
    const userData = req.body;

    // Save the userData to a JSON file or database
    fs.writeFileSync('userData.json', JSON.stringify(userData, null, 2));

    res.status(200).send('Data received and stored successfully!');
});

app.listen(port, () => {
    console.log(`Storage bot server listening on port ${port}`);
});

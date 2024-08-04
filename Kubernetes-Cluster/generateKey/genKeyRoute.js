// Fuction for generating and matching the secret text for verify the crediential data which obtained from OAuth2.0

import express from 'express';

const app = express();
const port = 3001;

var randomTextKey = ''

// Endpoint to generate random text
app.get('/generate', async(req, res) => {
    randomTextKey =  await generateRandomText();
    
    res.json({ secret_key: randomTextKey });
});

// Function to generate random text
 async function generateRandomText() {
    const length = 30;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomText = '';
    for (let i = 0; i < length; i++) {
        randomText += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomText;
}

app.use(express.json()); // Parse JSON bodies

// Endpoint to receive user data and check secret key
app.post('/verify', (req, res) => {
    randomTextKey = "Mekky"+ randomTextKey + "Mumil"
    const userData = JSON.parse(req.body.userData); // Parse userData directly
    const secretKey = userData.secretKey;

    // Check if the provided secret key matches the generated one
    if (secretKey == randomTextKey) {
        res.json({ status: true, message: 'Secret key matches' });
    } else {
        res.json({ status: false, message: 'Secret key does not match' });
    }
    console.log("randomTextKey",randomTextKey)
    console.log("secretKey",secretKey)
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'; // Only needed if using ES modules
import createConnection from '../App2/connect.js';

const router_login = express.Router();

// Get the directory name of the current module's file (if using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startTimeMap = new Map();

// Serve static files from the "style" directory
router_login.use('/style', express.static(path.join(__dirname, '../style')));

// GET request handler for serving the login page
router_login.get('/', (req, res) => {
    try {
        // Path to the login.html file
        const loginFilePath = path.join(__dirname, '../views/login.html');
        startTimeMap.set(req.sessionID, Date.now());
        // Send the login.html file as the response
        res.sendFile(loginFilePath);
    } catch (error) {
        console.error('Error serving login page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router_login.post('/', async (req, res) => {
  try {
    const db = await createConnection(); // Establish database connection

    const { userGmail, password } = req.body;
    console.log(`Login attempt for user with email: ${userGmail}`);

    const query = 'SELECT Password, Role FROM user WHERE Gmail = ?';
    const [rows] = await db.query(query, [userGmail]);

    if (!rows || rows.length === 0) {
      console.log('User not found');
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const { Password, Role } = rows[0];

    if (Password !== password) {
      console.log('Invalid password');
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    console.log('User authenticated successfully');

    if (Role === 'admin') {
      console.log('User is an admin');
      res.redirect('/admin'); // Redirect to admin route
    } else {
      console.log('User is a client');
      res.redirect('/client'); // Redirect to client route
    }
    const stopTime = Date.now();
      const startTime = startTimeMap.get(req.sessionID);
      const duration = stopTime - startTime;
      console.log(`Login duration for ${userGmail}: ${duration} milliseconds`);
      startTimeMap.delete(req.sessionID); // Cleanup start time entry from the map
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router_login;

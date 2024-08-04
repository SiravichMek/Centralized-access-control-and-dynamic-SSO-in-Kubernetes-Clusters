import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router_admin = express.Router();

// Get the directory name of the current module's file (if using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "style" directory
router_admin.use('/style', express.static(path.join(__dirname, '../style')));

// GET request handler for serving the admin page
router_admin.get('/', (req, res) => {
  try {
    // Path to the admin.html file
    const adminFilePath = path.join(__dirname, '../views/admin.html');
    // Send the admin.html file as the response
    res.sendFile(adminFilePath);
  } catch (error) {
    console.error('Error serving admin page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router_admin;

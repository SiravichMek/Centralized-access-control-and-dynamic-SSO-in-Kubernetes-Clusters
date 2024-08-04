import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

const router_client = express.Router();

router_client.get('/', async (req, res) => {
   
  try {
    console.log("Reached /client endpoint");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, '../views/client.html');
    console.log("File path:", filePath);

    // Read the HTML file
    const htmlContent = await readFile(filePath, 'utf8');
    
    // Send the HTML content as the response
    res.send(htmlContent);
} catch (error) {
    console.error("Error reaching client page:", error);
    res.status(500).json({ error: 'Error reaching client page' });
}
});

export default router_client;
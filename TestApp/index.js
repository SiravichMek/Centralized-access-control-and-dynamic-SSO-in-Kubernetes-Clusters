import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import router_login from './route/login.js';
import clientRouter from './route/client.js';
import router_admin from './route/admin.js';
import middlewareRouter from './middleware/middleware.js';

const app = express();
const port = 8084;

// Get the directory name of the current module's file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files (including login.html and login.css)
app.use(express.static(path.join(__dirname, 'views')));
app.use('/style', express.static(path.join(__dirname, 'style')));

// Routers
app.use('/login', router_login);
app.use('/client', clientRouter);
app.use('/admin', router_admin);
app.use('/kube', middlewareRouter);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

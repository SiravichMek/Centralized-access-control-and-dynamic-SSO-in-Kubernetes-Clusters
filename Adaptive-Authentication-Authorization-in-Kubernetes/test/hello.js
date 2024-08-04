// index.js
import express from 'express';

const app = express();
const port = 8083;

app.get('/', (req, res) => {
  res.send('Hello, this is your sample app running on port 8083!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});


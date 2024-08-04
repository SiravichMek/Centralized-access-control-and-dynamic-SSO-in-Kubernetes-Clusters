import mysql from 'mysql2/promise';

const createConnection =  async() => {
    try {
      const connection =  await mysql.createConnection({
        host: '172.20.0.2',
        user: 'root',
        password: 'root',
        database: 'app-a',
      });
      console.log('Connected to MySQL');
      return connection;
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
      throw err;
    }
  };
  
  export default createConnection;
import mysql from 'mysql2/promise';

const createConnection =  async() => {
    try {
      const connection =  await mysql.createConnection({
        host: '172.21.0.5',
        user: 'root',
        password: 'root',
        database: 'app-b',
      });
      console.log('Connected to MySQL');
      return connection;
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
      throw err;
    }
  };
  
  export default createConnection;
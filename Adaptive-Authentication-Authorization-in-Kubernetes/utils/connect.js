// Connecting setup for webhook's database

import mysql from 'mysql2/promise';
const createConnection =  async() => {
    try {
      const connection =  await mysql.createConnection({
        host: 'kubernetescluster.czuq6imooyep.us-east-1.rds.amazonaws.com',
        user: 'root',
        password: '12345678',
        database: 'kubernetescluster',
      });
      console.log('Connected to MySQL');
      return connection;
    } catch (err) {
      console.error('Error connecting to MySQL:', err);
      throw err;
    }
  };
  
  export default createConnection;
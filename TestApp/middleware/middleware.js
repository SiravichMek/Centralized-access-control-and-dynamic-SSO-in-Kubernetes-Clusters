import express from 'express';
import createConnection from './connect.js';

const router = express.Router();

// Redirect to the specific endpoint route when access with Role JSON from Kubernetes Cluster.
router.get('/', async (req, res) => {
  try {
    const db = await createConnection(); // Establish database connection

    const query = 'SELECT Role FROM user WHERE Gmail = ?';
    const [rows] = await db.query(query, [req.query.userGmail]);

    if (!rows || rows.length === 0) {
      console.log('User not found');
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const { Role } = rows[0];
    console.log('User role:', Role);

    // For user who has Admin Role in this application (App-A)
    if (Role === 'admin') {
      console.log('User is an admin');
      res.redirect('/admin');
    } 

    // For user who has Client Role in this application (App-A)
    else {
      console.log('User is a client');
      res.redirect('/client');
    }

  } catch (error) {
    console.error('Error in /kube route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

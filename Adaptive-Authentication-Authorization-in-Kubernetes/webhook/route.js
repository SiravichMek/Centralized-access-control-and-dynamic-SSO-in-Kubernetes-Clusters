// Main algorithm processes for this webhook

import express from 'express';
import passport from '../utils/auth.js';
import axios from 'axios';
import { sendProfileDataToKubernetes } from '../services/sendDataProfile.js';
import fs from 'fs';
import createConnection from '../utils/connect.js';

const router = express.Router();

var startTimeMap ;
var userGmail = '';
var podList = [];

function isLogin(req,res,next){
  req.user ? next(): res.sendStatus(401);
}

// Define routes
router.get('/', (req, res) => {
  fs.readFile('./views/loginPage.html', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.sendStatus(500); // Internal Server Error
      return;
    }
    startTimeMap = Date.now();
    
    res.send(data);
  });
});

// Redirect to Google's authentication page
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/webfail' }),
  async (req, res) => {
    try {
      // Step 1: Send API to Kubernetes Generate secret text Function Endpoint to optain the secret text.
      const response = await axios.get('http://172.20.10.3:30000/generate');
      var secretKey = response.data.secret_key;
      const profile = req.user;
      console.log("User's credential = ",profile)
      console.log("Random Text From Kubernetes",secretKey) 
      secretKey = "Mekky"+ secretKey + "Mumil";
      console.log("Signature Text = 'Mekky........Mumul' ")
      console.log("SecretText which generated from combination of SignatureText and Random Text =",secretKey)
      
      // Step 2: Send the credential JSON with secret text to Kubernetes Cluster for verification.
      const userData = await sendProfileDataToKubernetes(profile, secretKey);
      const verifyResponse = await axios.post('http://172.20.10.3:30000/verify', { userData });
      userGmail = profile.emails[0].value
      
      // If cluster send back the status verifacation is complete, the program will move to next process. 
      if (verifyResponse.data.status) {
        return res.redirect('/getRole');
      }
      
      return res.redirect('/webfail');
    } catch (error) {
      console.error('Error in Google callback:', error);
      return res.redirect('/webfail'); // Redirect to /webfail in case of error
    }
  }
);

router.get('/getRole',isLogin ,async(req,res)=>{
  try {
    // Step 3: Get list of avaliable pods based on user's role from Kubernetes.
    const response = await axios.post('http://172.20.10.3:30070/getPod', { userGmail: userGmail }); 
    podList = response.data.data.podList
    console.log('Go to Kubernetes Cluster!!')
    console.log("pod available List = ", podList)
    return res.redirect('/getToken');
  } catch (error) {
    console.error('Error in Google callback:', error);
    return res.redirect('/webfail'); // Redirect to /webfail in case of error
  }
})

// Step 4: Construct the JSON with userGmail and avaliable pod lists then send it to Kubernetes for optain the endpoint for each pod.
router.get('/getToken', async (req, res) => {
  try {
    const payload = {
      data: {
        userGmail: userGmail,
        podList: podList
      }
    };
    const response = await axios.post('http://172.20.10.3:30035/generateToken', payload);
    console.log("Role JSON =", response.data.token);

    fs.readFile('./views/choosePod.html', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading choosePod.html:', err);
        return res.status(500).send('Internal Server Error');
      }
      // Inject pod data into the HTML content
      const modifiedHtml = data.replace('<!-- Dynamic list items will be inserted here -->', `
      <script>
      const podList = ${JSON.stringify(response.data.token.pods)};
      const userGmail = ${JSON.stringify(response.data.token.userGmail)};
      const podListContainer = document.getElementById('podList');
      Object.entries(podList).forEach(([podName, endpoint]) => {
        const li = document.createElement('li');
        const form = document.createElement('form');
        const endpointWithKube = endpoint + '/kube'; // Append /kube to the endpoint
        form.setAttribute('action', endpointWithKube); // Set the modified endpoint as the form action
        
        // Add hidden input field for userGmail
        const hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', 'userGmail');
        hiddenInput.setAttribute('value', userGmail);
        form.appendChild(hiddenInput);
        
        const button = document.createElement('button');
        button.setAttribute('type', 'submit');
        button.textContent = podName;
        form.appendChild(button);
        li.appendChild(form);
        podListContainer.appendChild(li);
      });
    </script>
      `);
      // Send the modified HTML content as the response
      res.setHeader('Content-Type', 'text/html');
      res.send(modifiedHtml);
      const stopTime = Date.now();
      const duration = stopTime - startTimeMap;
      console.log(`Login duration for ${userGmail}: ${duration} milliseconds`);
    });
  } catch (error) {
    console.error('Error in Google callback:', error);
    return res.redirect('/webfail'); // Redirect to /webfail in case of error
  }
});


// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Endpoint to handle sign-up form submission
router.post('/process_signup', async(req, res) => {
  
  const { email, role } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required fields." });
  }

  const db = await createConnection();
  const query = 'INSERT INTO user (Gmail, Role) VALUES (?, ?) ';
  const values = [email, role];
  const results = await db.query(query,values);
  
  console.log("New sign-up data:", { email, role });

  // Respond with a success message or redirect to a success page
  res.redirect('/');
});

export default router;

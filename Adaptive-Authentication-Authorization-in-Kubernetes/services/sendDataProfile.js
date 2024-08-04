import fetch from 'node-fetch';

// Function to send user profile data to Kubernetes API server
async function sendProfileDataToKubernetes(profile, secretKey) {
  try {

    // Construct the payload with user profile data
    const payload = {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.email,
      secretKey: secretKey
    }

    return JSON.stringify(payload)
    
  } catch (error) {
    // Handle errors
    console.error('Error sending profile to Kubernetes:', error);
  }
}

export { sendProfileDataToKubernetes };

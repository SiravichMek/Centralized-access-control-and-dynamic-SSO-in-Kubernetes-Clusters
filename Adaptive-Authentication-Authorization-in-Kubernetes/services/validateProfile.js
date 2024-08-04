import createConnection from '../utils/connect.js';

// Function to validate profile by checking if the email exists in the database
export async function validateProfile(profile) {
    try {
        const db = await createConnection();
        const query = 'SELECT Gmail FROM user';
        const results = await db.query(query);
        
        // Extract the Gmails from the database results
        const flattenedResults = results.flat(Infinity);
        const dbGmails = flattenedResults.map(result => result.Gmail);
        console.log('profile.email:', profile.emails[0].value);

        // Check if the email in the profile exists in the database
        if (dbGmails.includes(profile.emails[0].value)) {
            console.log('Gmail found in database:', profile.emails[0].value);
            return true; // Profile is valid
        } else {
            console.log('Gmail not found in database:', profile.emails[0].value);
            return false; // Profile is invalid
        }
    } catch (error) {
        // Handle errors
        console.error('Error validating profile:', error);
        return false; // Profile validation failed due to error
    }
}

// Function to validate email status (verified or not)
export async function validateStatus(profile) {
    try {
        console.log('profile.status:', profile.emails[0].verified);

        // Check if the email in the profile is verified
        if (profile.emails[0].verified) {
            console.log('Gmail is verified');
            return true; // Profile is valid
        } else {
            console.log('Gmail not verified');
            return false; // Profile is invalid
        }
    } catch (error) {
        // Handle errors
        console.error('Error validating profile:', error);
        return false; // Profile validation failed due to error
    }
}

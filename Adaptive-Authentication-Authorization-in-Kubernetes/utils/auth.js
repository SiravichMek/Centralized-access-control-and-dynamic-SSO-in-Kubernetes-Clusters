// OAuth2.0 Setup
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { validateProfile,validateStatus } from '../services/validateProfile.js';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecretKey = process.env.CLIENT_SECRET_KEY;
const oauthRedirectUrl = process.env.OAUTH_REDIRECT_URL;

// Configure Passport to use Google OAuth 2.0
passport.use(new GoogleStrategy({
  clientID: clientId,
  clientSecret: clientSecretKey,
  callbackURL: oauthRedirectUrl,
  scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // This function is called after successful authentication
    if (await validateProfile(profile) && await validateStatus(profile)) {
      return done(null, profile);
    } else {
      // Profile validation failed, user is not authorized
      return done(null, false, { message: 'Unauthorized user' });
    }
  } catch (error) {
    // Handle errors
    console.error('Error in Google OAuth callback:', error);
    return done(error);
  }
}
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;

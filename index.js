import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import cookieSession from 'cookie-session';

const app = express();
const { spawn } = multer
const port = 3001;

// Middleware for cookie session
app.use(
    cookieSession({
        name: 'session',
        keys: ['your_cookie_session_secret'],
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
);

// Middleware for passport
app.use(passport.initialize());
app.use(passport.session());

// Mock database to store user data (replace with MongoDB or other database)
const usersDB = {};

// Configure Passport to use Google OAuth 2.0
passport.use(
    new GoogleStrategy(
        {
            clientID : '312144831459-jvhcc79jni8dc89ih10b4juu9vme7rul.apps.googleusercontent.com',
            clientSecret : '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',
            callbackURL : 'http://localhost:3001/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            // This function wil be called after successful authentication
            // We can store the user data in the database here

            usersDB[profile.id] = {
                id: profile.id,
                displayName: profile.displayName,
                // Add other data here
            };
            return done(null, profile);
        }
    )
)

// Serialize user data
passport.serializeUser((user, done) => {
    done(null, user.id);
})

// Deserialize user data
passport.deserializeUser((id, done) => {
    const user = usersDB[id];
    done(null, user);
})

// Endpoint for start Google Oauth2.0 authentication
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback URL for handling Google OAuth 2.0 callback after successful authentication
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  (req, res) => {
    // Redirect to the frontend dashboard after successful authentication
    console.log()
    res.redirect('http://localhost:3000/dashboard');
  }
);

// Middleware to check if the user is authenticated before accessing protected routes
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // If not authenticated, redirect to the login page
  res.redirect('http://localhost:3000/login');
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
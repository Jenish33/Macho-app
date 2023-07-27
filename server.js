import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import cookieSession from 'cookie-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import axios from 'axios';
import FormData from 'form-data';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Multer configuration for video uploaded files
const upload = multer({ dest: 'uploads/' })


// Middleware for CORS
app.use(cors());

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

// Middleware to check if the user is authenticated before accessing protected routes
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // If not authenticated, redirect to the login page
  res.redirect('http://localhost:3000/login');
}

// Function to call the Python AI script for push-up counting
function countPushUps(videoFilePath, callback) {
  console.log("directory Name",__dirname)
  // specify the path to the python script
  const pythonScriptPath = path.join(__dirname,'python_scripts', 'push_up_counter.py');
  console.log("pythonScriptPath", pythonScriptPath)
  // Python script arguments (here, we'll pass the videoFilePath)
  const pythonArgs = [videoFilePath];
  console.log("pythonArgs", pythonArgs)
  // Spawn a python process
  const pythonProcess = spawn('python', [pythonScriptPath, ...pythonArgs]);
  console.log("pythonProcess", pythonProcess)
  // Handle data output from the Python script
  let pushUpCount = 0;
  pythonProcess.stdout.on('data', (data) => {
    pushUpCount = parseInt(data.toString());
  })
  
  // Handle errors if any
  pythonProcess.stderr.on('data', (data) => {
    console.error('Error from Python script:', data.toString());
  });

  // When the Python script exits
  pythonProcess.on('exit', (code) => {
    console.log('Python script exited with code:', code);
    // Callback with the push-up count
    callback(pushUpCount);
  });

}

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

app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No Video file uploaded' });
    }

    // Get the path of the uploaded video file
    console.log("***********************************************************")
    console.log("Got the request", req.file.path)
    const videoFilePath = req.file.path;
    

    // Create a FormData object and append the video file to it
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoFilePath));

    // Call the Python API using axios
    console.log("Calling the python API...")
    const pythonApiUrl = 'http://127.0.0.1:8000/api/pushup-counter/';
    const response = await axios.post(pythonApiUrl, formData, {
      headers: formData.getHeaders(),
    });

    console.log("Got the response from python API...", response.data)
    // Get the push-up count from the response
    const pushUpCount = {...response.data};

    // Delete the uploaded video file after processing
    fs.unlinkSync(videoFilePath);

    // Return the push-up count as a response
    res.send(pushUpCount);
  } catch (err) {
    console.log('Error while processing the video');
    return res.status(500).json({ error: 'Something went wrong', detail: err });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
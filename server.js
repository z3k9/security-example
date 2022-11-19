const https= require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const app = express();

require('dotenv').config();

const PORT = process.env.PORT;

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};


const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
};

function verifyCallback(accessToken, refreshToken, profile, done){
    console.log("Google profile", profile);
    done(null, profile);
}
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

// Save the session to cookie
passport.serializeUser((user, done)=>{
    done(null, user);
});

// Read the session from the cookie
passport.deserializeUser((obj, done)=>{
    done(null, obj);
})

// helmet middleware to check headers
app.use(helmet());

//
app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2]
}));

// Sets up a passport session
app.use(passport.initialize());
// Authenticate the session being sent to server
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

function checkLoggedIn(req, res, next){
    const isLoggedIn = true;
    if(!isLoggedIn){
        return res.status(401).json({
            error: 'You must be logged in'
        });
    }
    next();
}

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email'],
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google' ,{
        failureRedirect: '/failure',
        successRedirect: '/',
        session: true,  
    }),
    (req,res)=>{
        console.log('Google called us back!')
    }
);

app.get('/auth/logout', (req,res)=>{});

app.get('/secret',checkLoggedIn, (req,res)=>{
    return res.send('Your personal secret value is 42!');
});

app.get('/failure', (req,res)=>{
    res.send('Failed to log in');
});

app.get('/*', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
    }, app
).listen(PORT, ()=>{
    console.log(`listening on port: ${PORT}`)
})

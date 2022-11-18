const https= require('https');

const path = require('path');

const fs = require('fs');

const express = require('express');

const app = express();

const helmet = require('helmet');

const PORT = 3000;

app.use('helmet');

function checkLoggedIn(req, res, next){
    const isLoggedIn = true;
    if(!isLoggedIn){
        return res.status(401).json({
            error: 'You must be logged in'
        });
    }
    next();
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/secret',checkLoggedIn, (req,res)=>{
    return res.send('Your personal secret value is 42!');
})

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
    }, app
).listen(PORT, ()=>{
    console.log(`listening on port: ${PORT}`)
})

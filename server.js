const https= require('https');

const path = require('path');

const express = require('express');

const app = express();

const fs = require('fs');

const PORT = 3000;

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/secret', (req,res)=>{
    return res.send('Your personal secret value is 42!');
})

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
    }, app
).listen(PORT, ()=>{
    console.log(`listening on port: ${PORT}`)
})

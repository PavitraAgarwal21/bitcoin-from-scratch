// server.js
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Endpoint to get JSON file names
app.get('/api/json-files', (req, res) => {
    const directoryPath = path.join(__dirname, 'checkpool');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        res.json(jsonFiles);
    });
});


app.post('/api/selected-files', (req, res) => {
    const  data  = req.body.files ; 
    console.log('Received data:', data);
    res.send({ message: 'Data received successfully' });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
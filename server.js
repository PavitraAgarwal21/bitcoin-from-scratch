// server.js
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fsExtra = require('fs-extra');
const app = express();
const { exec } = require('child_process');

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
    const { files } = req.body;
    const scriptDirectory = __dirname;
    const checkpoolDirectory = path.join(scriptDirectory, 'checkpool');
    const selectedFilesDirectory = path.join(scriptDirectory, 'selected-files');

    // Create selected-files directory if it doesn't exist
    if (!fs.existsSync(selectedFilesDirectory)) {
        fs.mkdirSync(selectedFilesDirectory);
    }

    files.forEach(file => {
        const sourceFile = path.join(checkpoolDirectory, file);
        const destinationFile = path.join(selectedFilesDirectory, file);

        // Check if the source file exists
        if (fs.existsSync(sourceFile)) {
            // Check if the file already exists in the destination
            if (!fs.existsSync(destinationFile)) {
                fsExtra.copySync(sourceFile, destinationFile);
            } else {
                console.log(`File already exists: ${file}`);
            }
        } else {
            console.log(`Source file does not exist: ${file}`);
        }
    });

    console.log('Files copied successfully:', files);
    const scriptPath = path.join(__dirname, 'run.sh');
    exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Script error output: ${stderr}`);
            return;
        }
        console.log(`Script output:\n${stdout}`);
    });

    
    res.send({ message: 'Files copied successfully' });
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
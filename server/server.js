// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Load environment variables
dotenv.config();



// Set storage directory and admin password from environment variables
const storageDir = process.env.STORAGE_DIR || 'storage';
const adminPassword = process.env.ADMIN_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 6002;

const SongTagEnum = {
    LEAD_VOCAL: "lead_vocal",
    BACKING_VOCAL: "backing_vocal",
    ELECTRIC_GUITAR: "electric_guitar",
    ACOUSTIC_GUITAR: "acoustic_guitar",
    BASS: "bass",
    DRUMS: "drums",
    PIANO: "piano",
    SYNTH: "synth",
    STRINGS: "strings",
    BRASS: "brass",
    SNARES: "snares",
    KICKS: "kicks",
    OTHER: "other",
}

const corsOptions = {
    origin: 'http://localhost:5002',
    credentials: true,
}

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(require('cookie-parser')());

if (!jwtSecret || !adminPassword) {
    console.error('Environment variables not set.');
    process.exit(1);
}

// Create storage directory if it doesn't exist
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir);
}

// Create projects.json file if it doesn't exist
if (!fs.existsSync(storageDir+'/projects.json')) {
    writeJSONFile(storageDir+'/projects.json', []);
}

// Create presets.json file if it doesn't exist
if (!fs.existsSync(storageDir+'/presets.json')) {
    let tags = [];
    for (let key in SongTagEnum) {
        tags.push({
            "tag": SongTagEnum[key],
            "presets": []
        })
    }
    writeJSONFile(storageDir+'/presets.json', tags);
}

// Middleware to verify JWT token
function verifyJWT(req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    const token = req.cookies.token; // Extract the token from the cookie

    try {
        req.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
}


// Function to read and parse JSON file
function readJSONFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Function to write JSON to a file
function writeJSONFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Route to get all projects
app.get('/projects', verifyJWT, (req, res) => {
    const projects = readJSONFile(storageDir+'/projects.json');
    res.json(projects.map(({ username, name, date, id }) => ({ username, name, date, id })));
});

// Route to get all projects with given username or project name
app.get('/projects/search', (req, res) => {
    const { user, project } = req.query;

    const lowerUsernameQuery = user ? user.toLowerCase() : "";
    const lowerProjectNameQuery = project ? project.toLowerCase() : "";

    const projects = readJSONFile(storageDir+'/projects.json');
    const filteredProjects = projects.filter(({ username, name }) => {
        const lowerUsername = username.toLowerCase();
        const lowerName = name.toLowerCase();
        return (
            (lowerUsernameQuery === "" || lowerUsername.includes(lowerUsernameQuery)) &&
            (lowerProjectNameQuery === "" || lowerName.includes(lowerProjectNameQuery))
        );
    });

    res.json(filteredProjects.map(({ username, name, date, id }) => ({ username, name, date, id })));
});


// Route to get a specific project by ID
app.get('/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const projects = readJSONFile(storageDir+'/projects.json');
    const project = projects.find(({ id }) => id === projectId);

    if (project) {
        const projectData = readJSONFile(project.path);
        res.json({id: projectId, user: project.username, project: project.name, data: projectData});
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

// Route to post a new project
app.post('/projects', (req, res) => {
    const { username, projectName, override, data } = req.body;

    const projects = readJSONFile(storageDir+'/projects.json');
    const userDir = path.join(storageDir, username);
    const projectFile = path.join(userDir, `${projectName}.json`);

    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    const existingProject = projects.find(
        (project) => project.username === username && project.name === projectName
    );

    if (existingProject && !override) {
        res.status(400).json({
            message: 'Project already exists',
            "name": existingProject.name,
            "date": existingProject.date
        });
    } else {
        if (existingProject && override) {
            const index = projects.findIndex(({ id }) => id === existingProject.id);
            projects.splice(index, 1);
        }

        const projectId = uuidv4();
        const project = {
            username,
            name: projectName,
            date: new Date().toISOString(),
            path: projectFile,
            id: projectId,
        };

        projects.push(project);
        writeJSONFile(storageDir+'/projects.json', projects);
        writeJSONFile(projectFile, data);

        res.status(201).json({ message: 'Project created', id: projectId });
    }
});

// Route to login as admin
app.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === adminPassword) {
        const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '1h' });

        // Set the JWT as an HTTP-Only cookie
        res.cookie('token', token, {
            httpOnly: true,
            // secure: true, // Uncomment this line to enforce secure (https) cookies
            sameSite: 'strict' // Uncomment this line if you want to enforce same site policy
        });

        res.json({ message: 'Logged in' });
    } else {
        res.status(401).json({ message: 'Invalid admin password' });
    }
});

// Route to save the presets
app.post('/presets', verifyJWT, (req, res) => {
    const presets = req.body;
    console.log(presets)
    writeJSONFile(storageDir+'/presets.json', presets);
    res.json({ message: 'Presets saved' });
});

// Route to get the presets
app.get('/presets', (req, res) => {
    const presets = readJSONFile(storageDir+'/presets.json');
    res.json(presets);
});

// Route to logout
app.post('/logout', (req, res) => {
    res.cookie('token', "loggedout", {
        httpOnly: true,
        sameSite: 'strict'
    }).json({ message: 'Logged out' });
});

// Route to verify JWT token
app.get('/verify', verifyJWT, (req, res) => {
    res.json({ message: 'Valid token' });
});


// Route to delete a project by ID (requires valid JWT token)
app.delete('/projects/:id', verifyJWT, (req, res) => {
    const projectId = req.params.id;
    const projects = readJSONFile(storageDir+'/projects.json');
    const projectIndex = projects.findIndex(({ id }) => id === projectId);

    if (projectIndex !== -1) {
        const project = projects[projectIndex];
        fs.unlinkSync(project.path);
        projects.splice(projectIndex, 1);
        writeJSONFile(storageDir+'/projects.json', projects);
        res.json({ message: 'Project deleted' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
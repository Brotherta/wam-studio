const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config= require('../config');
const utils = require('../utils');

const allowedOrigins = ['https://wam-studio.i3s.univ-cotedazur.fr'];

const cors= (req,res,next)=>{
    console.log(req.method, req.url)
    //res.set('Access-Control-Allow-Origin',['*'])
    // MB
    const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Preflight request is successful.
  }
  next();
}



const router = express.Router();
//router.use(cors)

// Setup multer for audio file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const projectId = req.params.id;
        const projects = utils.readJSONFile(config.storageDir+'/projects.json');
        const project = projects.find(({ id }) => id === projectId);

        if (project) {
            let baseDir = path.dirname(project.path);
            console.log(baseDir)
            const projectAudioDir = path.join(baseDir, 'audio');
            if (!fs.existsSync(projectAudioDir)) {
                fs.mkdirSync(projectAudioDir, { recursive: true });
            }
            cb(null, projectAudioDir);
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Route to post a new project
router.get('/projects', (req, res) => {
    const projects = utils.readJSONFile(config.storageDir+'/projects.json');
    res.json(projects.map(({ username, name, date, id }) => ({ username, name, date, id })));
});

// Route to get all projects with given username or project name
router.get('/projects/search', (req, res) => {
    const { user, project } = req.query;

    const lowerUsernameQuery = user ? user.toLowerCase() : "";
    const lowerProjectNameQuery = project ? project.toLowerCase() : "";

    const projects = utils.readJSONFile(config.storageDir+'/projects.json');
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
router.get('/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const projects = utils.readJSONFile(config.storageDir+'/projects.json');
    const project = projects.find(({ id }) => id === projectId);

    if (project) {
        const projectData = utils.readJSONFile(project.path);
        res.json({id: projectId, user: project.username, project: project.name, data: projectData});
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

// Route to get audio file of a project
router.get('/projects/:id/audio/:filename', (req, res) => {
    const projectId = req.params.id;
    const filename = req.params.filename;
    const projects = utils.readJSONFile(config.storageDir+'/projects.json');
    const project = projects.find(({ id }) => id === projectId);

    if (project) {
        const baseDir = path.dirname(project.path);
        const projectAudioDir = path.join(baseDir, 'audio');
        const filePath = path.resolve(projectAudioDir, filename);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        }
        else {
            res.status(404).json({ message: 'Audio file not found' });
        }
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

// Add a new route for uploading audio files
router.post('/projects/:id/audio', upload.single('audio'), (req, res) => {
    console.log(req.file)
    if (req.file) {
        res.status(200).json({ message: 'Audio uploaded', filename: req.file.filename });
    } else {
        res.status(400).json({ message: 'No file provided' });
    }
});

// Route to post a new project
router.post('/projects', (req, res) => {
    const { username, projectName, override, data } = req.body;

    const projects = utils.readJSONFile(config.storageDir+'/projects.json');
    const projectDir = path.join(config.storageDir, username, projectName);
    const projectFile = path.join(projectDir, 'project.json');

    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
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
            // delete all audio files in project directory
            const projectAudioDir = path.join(projectDir, 'audio');
            if (fs.existsSync(projectAudioDir)) {
                fs.readdirSync(projectAudioDir).forEach((file) => {
                    fs.unlinkSync(path.join(projectAudioDir, file));
                });
                fs.rmdirSync(projectAudioDir);
            }
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
        utils.writeJSONFile(config.storageDir+'/projects.json', projects);
        utils.writeJSONFile(projectFile, data);

        res.status(201).json({ message: 'Project created', id: projectId });
    }
});

// Route to delete a project by ID (requires valid JWT token)
router.delete('/projects/:id', utils.verifyJWT, (req, res) => {
    const projectId = req.params.id;
    const projects = utils.readJSONFile(config.storageDir+'/projects.json');
    const projectIndex = projects.findIndex(({ id }) => id === projectId);

    if (projectIndex !== -1) {
        const project = projects[projectIndex];

        const projectDir = path.dirname(project.path);
        const projectAudioDir = path.join(projectDir, 'audio');
        if (fs.existsSync(projectAudioDir)) {
            fs.readdirSync(projectAudioDir).forEach((file) => {
                fs.unlinkSync(path.join(projectAudioDir, file));
            });
            fs.rmdirSync(projectAudioDir);
        }

        fs.unlinkSync(project.path);
        projects.splice(projectIndex, 1);
        utils.writeJSONFile(config.storageDir+'/projects.json', projects);

        res.json({ message: 'Project deleted' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

module.exports = router;

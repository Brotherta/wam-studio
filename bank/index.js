const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const {writeJSONFile, readJSONFile, verifyJWT} = require("./utils.js");

// Load environment variables
dotenv.config();

// Set storage directory and admin password from environment variables
const HTTPS = process.env.HTTPS === "true";
const storageDir = process.env.STORAGE_DIR || 'storage';
const adminPassword = process.env.ADMIN_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 6002;

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


const plugins = require("./plugins.json");
const app = express();

app.use(cors());

app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.get("/wams", (req, res) => {
  res.send(plugins.map((plugin) => `${HTTPS ? 'https' : 'http'}://${req.get("Host")}/plugins/${plugin}/`));
});

app.use("/", express.static(path.join(__dirname, "./PedalBoard")));

app.use("/plugins", express.static(path.join(__dirname, "./plugins")));

app.use("/songs", express.static(path.join(__dirname, "./songs")));


// Route to get all projects
app.get('/projects', (req, res) => {
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
app.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid admin password' });
  }
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

// Route to delete a user and all their projects (requires valid JWT token)
app.delete('/users/:username', verifyJWT, (req, res) => {
  const username = req.params.username;
  const projects = readJSONFile(storageDir+'/projects.json');
  const userProjects = projects.filter(({ username: u }) => u === username);

  if (userProjects.length > 0) {
    userProjects.forEach((project) => {
      fs.unlinkSync(project.path);
    });

    const updatedProjects = projects.filter(({ username: u }) => u !== username);
    writeJSONFile(storageDir+'/projects.json', updatedProjects);

    const userDir = path.join(storageDir, username);
    fs.rmdirSync(userDir);

    res.json({ message: 'User and their projects deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


app.listen(port, () => {
  console.log(`App working on http://localhost:${port}`);
});

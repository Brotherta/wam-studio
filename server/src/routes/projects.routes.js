const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const config= require('../config');
const utils = require('../utils');

const router = express.Router();

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

// Route to post a new project
router.post('/projects', (req, res) => {
    const { username, projectName, override, data } = req.body;

    const projects = utils.readJSONFile(config.storageDir+'/projects.json');
    const userDir = path.join(config.storageDir, username);
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
        fs.unlinkSync(project.path);
        projects.splice(projectIndex, 1);
        utils.writeJSONFile(config.storageDir+'/projects.json', projects);
        res.json({ message: 'Project deleted' });
    } else {
        res.status(404).json({ message: 'Project not found' });
    }
});

module.exports = router;

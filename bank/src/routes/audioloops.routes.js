const express = require('express');
const fs = require('fs');
const path = require('path');
const config= require('../config');
const plugins = require("../../plugins.json");

const router = express.Router();

function generateFolderStructure(rootFolder) {
    const stats = fs.statSync(rootFolder);
  
    if (!stats.isDirectory()) {
      return null;
    }
  
    const folderName = path.basename(rootFolder);
    const contents = fs.readdirSync(rootFolder);
    const structure = {
      name: folderName,
      type: 'folder',
      children: [],
    };
  
    contents.forEach((item) => {
        if(item === ".DS_Store") return;
        
      const itemPath = path.join(rootFolder, item);
      const itemStats = fs.statSync(itemPath);
  
      if (itemStats.isDirectory()) {
        const subStructure = generateFolderStructure(itemPath);
        if (subStructure) {
          structure.children.push(subStructure);
        }
      } else if (itemStats.isFile()) {
        structure.children.push({
          name: item,
          type: 'file',
          // On ajoute le chemin du fichier sous forme d'url relatif
          url: `/${itemPath}`,
        });
      }
    });
  
    return structure;
  }

router.get('/api/audioloops', (req, res) => {
    // get path of current directory
    const currentPath = path.resolve('./');
    console.log("Current path in audioloops.routes.js: " + currentPath);

    const rootFolder = './loops'; // Replace with your root folder path
  
    const folderStructure = generateFolderStructure(rootFolder);
  
    if (folderStructure) {
      res.json(folderStructure);
    } else {
      res.status(404).json({ error: 'Invalid root folder' });
    }
  });

module.exports = router;


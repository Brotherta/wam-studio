const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { config, utils } = require('./config');

const projectsRoutes = require('./routes/projects.routes');
const presetsRoutes = require('./routes/presets.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(express.json());
app.use(cors(config.corsOptions));
app.use(cookieParser());

utils.checkEnvVars();
utils.createDirectories();
utils.createFiles();

app.use(projectsRoutes);
app.use(presetsRoutes);
app.use(authRoutes);

app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
});
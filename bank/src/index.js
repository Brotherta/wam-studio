const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config= require('./config');
const utils = require('./utils');


console.log(config.jwtSecret);

const projectsRoutes = require('./routes/projects.routes');
const presetsRoutes = require('./routes/presets.routes');
const authRoutes = require('./routes/auth.routes');
const pluginsRoutes = require('./routes/plugins.routes');
const path = require("path");

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors(config.corsOptions));
app.use(cookieParser());
app.use((req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
});

utils.checkEnvVars();
utils.createDirectories();
utils.createFiles();

app.use(projectsRoutes);
app.use(presetsRoutes);
app.use(authRoutes);
app.use(pluginsRoutes);

app.use("/", express.static(path.join(__dirname, "../PedalBoard")));
app.use("/plugins", express.static(path.join(__dirname, "../plugins")));
app.use("/songs", express.static(path.join(__dirname, "../songs")));

app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
});
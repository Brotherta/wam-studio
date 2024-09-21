const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config= require('./config');
const utils = require('./utils');

const projectsRoutes = require('./routes/projects.routes');
const authRoutes = require('./routes/auth.routes');
const pluginsRoutes = require('./routes/plugins.routes');
const audioloopsRoutes = require('./routes/audioloops.routes');
const pedalboard2Routes = require('./routes/pedalboard2.routes.js');

const path = require("path");

const CORS_ALL = config.corsOptions.all;
const CORS_VERIFIED = config.corsOptions.verified;

const app = express();
app.use(express.json());
// app.use(cors(config.corsOptions));
app.use(cookieParser());
// Custom middleware to set Cross-Origin-Resource-Policy header
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});
  

utils.checkEnvVars();
utils.createDirectories();
utils.createFiles();

app.use(cors(CORS_VERIFIED), projectsRoutes);
app.use(cors(CORS_VERIFIED), authRoutes);
app.use(cors(CORS_ALL), pluginsRoutes);
app.use(cors(CORS_ALL), audioloopsRoutes);
app.use(cors(CORS_ALL), pedalboard2Routes);

app.use("/pedalboard", cors(CORS_ALL), express.static(path.join(__dirname, "../PedalBoard")));
app.use("/plugins", cors(CORS_ALL), express.static(path.join(__dirname, "../plugins")));
app.use("/songs", cors(CORS_ALL), express.static(path.join(__dirname, "../songs")));
app.use("/loops", cors(CORS_ALL), express.static(path.join(__dirname, "../loops")));
app.use("/AudioMetro", cors(CORS_ALL), express.static(path.join(__dirname, "../AudioMetro")));


app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
});
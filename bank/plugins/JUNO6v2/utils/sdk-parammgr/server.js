var fs = require("fs");
// We need to use the express framework: have a real web server that knows how to send mime types etc.
var express = require('express');
var path = require('path');
var Q = require('q');


var bodyParser = require("body-parser");
var cors = require("cors");
const request = require("request");
const unzip = require("unzip");
var multer = require("multer");
var multerData = multer();
const zl = require("zip-lib");

//CONFIG
var PORT_HTTPS = 443;
var PORT_HTTP = 80;
var HOST = '0.0.0.0';
var TRACKS_PATH = './client/multitrack/';
var TRACKS_URL = 'multitrack/';

var https_options = {
	key: fs.readFileSync('./ssl/mainline_i3s_unice_fr.key'),
	cert: fs.readFileSync('./ssl/mainline_i3s_unice_fr.crt'),
	ca: fs.readFileSync('./ssl/DigiCertCA.crt')
};

var app = express();
var https = require('https');
var serverHTTPS = https.createServer(https_options, app);
// launch the https server on given port
serverHTTPS.listen(PORT_HTTPS || 3000, HOST || "0.0.0.0", function () {
	var addr = serverHTTPS.address();
	console.log("Chat server listening at", addr.address + ":" + addr.port);
});
var http = require('http');
serverHTTP = http.createServer(app);
// launch the http server on given port
serverHTTP.listen(PORT_HTTP || 3000, HOST || "0.0.0.0", function () {
	var addr = serverHTTP.address();
	console.log("Chat server listening at", addr.address + ":" + addr.port);
});



// Fin variante HTTPS
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");

    // For Share Array Buffer
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');

	// For Microsoft browsers
	var url = req.originalUrl;
	if (url.endsWith("vtt")) {
		res.header("Content-Type", "text/vtt");
	}
        if (url.endsWith("wasm")) {
           res.header("Content-Type", "application/wasm");
        }
	next();
});

app.use(express.static(path.resolve(__dirname, 'client')));


// routing
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

// routing
app.get('/track', function (req, res) {
	function sendTracks(trackList) {
		if (!trackList)
			return res.send(404, 'No track found');
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.write(JSON.stringify(trackList));
		res.end();
	}

	getTracks(sendTracks);
});


String.prototype.endsWith = function (suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// routing
app.get('/track/:id', function (req, res) {
	var id = req.params.id;

	function sendTrack(track) {
		if (!track)
			return res.send(404, 'Track not found with id "' + id + '"');
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.write(JSON.stringify(track));
		res.end();
	}

	getTrack(id, sendTrack);

});


function getTracks(callback) {
	getFiles(TRACKS_PATH, callback);
}


function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function isASoundFile(fileName) {
	if (endsWith(fileName, ".mp3")) return true;
	if (endsWith(fileName, ".ogg")) return true;
	if (endsWith(fileName, ".wav")) return true;
	return false;
}

function getTrack(id, callback) {
	console.log("id = " + id);
	if (!id) return;

	getFiles(TRACKS_PATH + id, function (fileNames) {
		if (!fileNames) {
			callback(null);
			return;
		}

		var track = {
			id: id,
			instruments: []

		};


		fileNames.sort();
		for (var i = 0; i < fileNames.length; i++) {
			// filter files that are not sound files
			if (isASoundFile(fileNames[i])) {
				var instrument = fileNames[i].match(/(.*)\.[^.]+$/, '')[1];
				track.instruments.push({
					name: instrument,
					sound: fileNames[i]
				});
			} else {
				continue;
			}
		}
		//  heck if there is a metadata.json file
		checkForMetaDataFile(track, id, callback);

	});

}

function checkForMetaDataFile(track, id, callback) {
	var metadataFileName = TRACKS_PATH + id + '/' + 'metadata.json';

	Q.nfcall(fs.readFile, metadataFileName, "utf-8")
		.then(function (data) {
			//console.log('##metadata.json file has been read for track: '+id);
			track.metadata = JSON.parse(data);
			track.metadata.tabFileName = TRACKS_URL + id + '/' + track.metadata.tabFileName;
			//console.log(track.metadata.tabFileName);
		})
		.fail(function (err) {
			//console.log('no metadata.json file for this song: '+id);
		})
		.done(function () {
			//console.log("calling callback");
			callback(track);
		});
}


function comparator(prop) {
	return function (a, b) {
		if (a[prop] > b[prop]) {
			return 1;
		} else if (a[prop] < b[prop]) {
			return -1;
		}
		return 0;
	};
}

function getFiles(dirName, callback) {
	fs.readdir(dirName, function (error, directoryObject) {
		if (directoryObject !== undefined) {
			directoryObject.sort();
		}
		callback(directoryObject);

	});
}

// ############################ WAP CODE ##########################
// For GUI Builder / Faust IDE / WAP
// ############################ WAP CODE ##########################
const baseURL = "https://mainline.i3s.unice.fr";

app.get("/pedals", function(req, res) {
  res.json(JSON.parse(fs.readFileSync("./client/PedalEditor/Back-End/saves.json", "utf8")));
});

app.get("/previews/knobs", function(req, res) {
  fs.readdir("client/PedalEditor/Back-End/img/knobs2", (err, files) => {
    let filesUrl = baseURL + "/PedalEditor/Back-End/functional-pedals/commonAssets/img/knobs2/";

    response = {
      filesUrl,
      files
    };

    res.json(response);
  });
});

app.get("/previews/sliders", (req, res) => {
  fs.readdir("client/PedalEditor/Back-End/img/sliders", (err, files) => {
let filesUrl = baseURL + "/PedalEditor/Back-End/functional-pedals/commonAssets/img/sliders/";

    response = {
      filesUrl,
      files
    };

    res.json(response);
  });
});

app.get("/previews/icons", function(req, res) {
  fs.readdir("client/PedalEditor/Back-End/img/icons", (err, files) => {
let filesUrl = baseURL + "/PedalEditor/Back-End/functional-pedals/commonAssets/img/icons/";
    response = {
      filesUrl,
      files
    };

    res.json(response);
  });
});

app.get("/previews/backgrounds", function(req, res) {
  fs.readdir("client/PedalEditor/Back-End/img/background", (err, files) => {
let filesUrl = baseURL + "/PedalEditor/Back-End/functional-pedals/commonAssets/img/background/";
    response = {
      filesUrl,
      files
    };

    res.json(response);
  });
});


app.get("/previews/switches", function(req, res) {
  fs.readdir("client/PedalEditor/Back-End/img/switches", (err, files) => {
let filesUrl = baseURL + "/PedalEditor/Back-End/functional-pedals/commonAssets/img/switches/";
    response = {
      filesUrl,
      files
    };

    res.json(response);
  });
});

app.post("/pedals", function(req, res) {
  let id;
  let pedals = JSON.parse(fs.readFileSync("client/PedalEditor/Back-End/saves.json", "utf8"));
  let i = 0;

  for (; i < pedals.length; i++) {
    if (pedals[i].id === req.body.id) {
      pedals[i] = req.body;
      id = pedals[i].id;
      break;
    }
  }

  if (i == pedals.length) {
    id = Date.now();
    req.body.id = id;
    pedals.push(req.body);
  }

  fs.writeFile("client/PedalEditor/Back-End/saves.json", JSON.stringify(pedals), err => {
    if (err) {
      res.error("An error occured saving the pedal.");
    } else {
      res.json({ message: "Pedal savec successfully!", id: id });
    }
  });
});

// MICHEL BUFFA
// Generate main.html in functional-pedal/published/<wapname>/main.html
// creates the folder if does not exist, copy assets inside if needed...
app.post("/generateWAP", multerData.fields([]), function(req, res) {
  //console.dir(req.body);
  let wapName = req.body.wapName;
  let wapCode = req.body.wapCode;

  // Check if a working dir exists for this WAP name, if not create it
  let currentDir = process.cwd() + "/client/PedalEditor/Back-End";

  let wapDir = currentDir + "/functional-pedals/published/" + wapName;
  console.log("/generate, checking if dir " + wapDir + "exists...");

  if (fs.existsSync(wapDir)) {
    console.log("Dir existed, deleting it...");
    rimraf(wapDir);
  }
    fs.mkdirSync(wapDir);
    console.log("...created, let's copy assets into it...");
    // copy inside the assets
    // first, the img dir with webaudiocontrol sprites, etc.
    copyFolderRecursiveSync(
      currentDir + "/functional-pedals/commonAssets/img",
      wapDir
    );
    console.log("Folder with imgs copied...");

    // then the mp3 file used by the tester
    copyFileSync(
      currentDir + "/functional-pedals/commonAssets/CleanGuitarRiff.mp3",
      wapDir
    );
    console.log("mp3 file needed to WAP embedded tester copied...");
  //}

  fs.writeFile(wapDir + "/main.html", req.body.generated, err => {
    if (err) {
      res.error("An error occured saving the functional pedal.");
    } else {
      fs.writeFile(wapDir + "/" + wapName + ".dsp", req.body.wapCode, err => {
        if (err) {
          res.error("An error occured saving the functional pedal.");
        } else {
          res.json({
            message:
              wapName +
              ".dsp and main.html generated successfully in directory " +
              wapDir
          });
        }
      });
    }
  });
});

// MICHEL BUFFA
// Gets the binary.zip DSP files from Faust remote server, and unzip it in the WAP dir.
app.post("/addBinaryDotZip", multerData.fields([]), function(req, res) {
  let wapName = req.body.wapName;
  let binaryDotZipURL = req.body.url;

  let currentDir = process.cwd() + "/client/PedalEditor/Back-End";

  let wapDir = currentDir + "/functional-pedals/published/" + wapName;
  console.log("/addBinaryDotZip, adding binary.zip to " + wapDir);

  console.log("Sending request to GET " + binaryDotZipURL);
  // TODO : check if you can do this with promises...
  request(binaryDotZipURL)
    .pipe(fs.createWriteStream(wapDir + "/binary.zip"))
    .on("close", function() {
      console.log("binary.zip has been downloaded, now unzipping it...");
      fs.createReadStream(wapDir + "/binary.zip").pipe(
        unzip.Extract({ path: wapDir })
       ).on("close", function() {
      console.log("The file has been unzipped...");
      console.log("Updating main.json:adding category:FaustIdeNew and thumbnail:img/unknown");
     // update main.json by adding a category and a thumbnail
	let rawdata = fs.readFileSync(wapDir + '/main.json');
	let mainjson = JSON.parse(rawdata);
	mainjson.category = "FaustIdeNew";
	mainjson.thumbnail="img/unknown.jpg";
	let data = JSON.stringify(mainjson);
	fs.writeFileSync(wapDir + '/main.json', data);
      });
   });
});

// Zip a plugin folder and sends back the link for download
app.get("/download", function(req, res) {
    console.log("download");
    let wapName = req.query.wapName;
    let currentDir = process.cwd();
    let pluginsDir = currentDir + "/client/PedalEditor/Back-End/functional-pedals/published";
    let wapDir = pluginsDir + "/" + wapName;

    let zipFile = pluginsDir + "/zips/" + wapName + ".zip";
    let sourceDir=wapDir;
    let zipURL = "https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/published/zips/" + wapName + ".zip";

    zl.archiveFolder(sourceDir, zipFile).then(function () {
        console.log("done zipping " + sourceDir + " into " + zipFile);
        let reponse = {
            msg:"done zipping " + sourceDir + " into " + zipFile + " url = " + zipURL,
	    zipURL:zipURL
	    }
        res.json(reponse);
    }, function (err) {
        console.log(err);
    });
});
/*
{
  "name": "WAMs first repo",
  "root": "optional_abs_url",
  "plugs": {
    "obxd": "https://webaudiomodules.org/synths/wasm/obxd",
    "dexed": "https://webaudiomodules.org/synths/wasm/dexed",
    "noisemaker": "https://webaudiomodules.org/synths/wasm/noisemaker",
    "dx7": "https://webaudiomodules.org/synths/wasm/dx7"
  }
}
*/
app.get("/repository.json", (req, res) => {
    let currentDir = process.cwd() + "/client/PedalEditor/Back-End";
    let pluginsDir = currentDir + "/functional-pedals/published";
    let pluginsDirURL = "https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/published";
    let repository = {
	name: "WAP Repo from Faust IDE",
	root: pluginsDir,
	plugs: {}
    };

    files = fs.readdirSync(pluginsDir);
    console.log("Building Repositiry.json...Reading " + pluginsDir + "...");

    fs.readdirSync(pluginsDir).forEach(function (name) {
        var filePath = path.join(pluginsDir, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            console.log("Ignoring file : " + name);
        } else if (stat.isDirectory()) {
	    if(name !== "zips") {
                console.log("Adding plugin dir " + name + " to repository.json");
	        repository.plugs[name] = pluginsDirURL + "/" + name;
	    }	
        }
    });
    res.json(repository);
});
// ########################## FOR WAP2 ##########################
app.post("/generateWAM2", multerData.fields([]), function (req, res) {
  let wapName = req.body.wapName;
  let wapCode = req.body.wapCode;

  // Check if a working dir exists for this WAP name, if not create it
  let currentDir = process.cwd() + "/client/PedalEditor/Back-End";

  let wapDir = currentDir + "/functional-pedals/published/" + wapName;
  console.log("/generate, checking if dir " + wapDir + "exists...");

  let wapGuiDir = wapDir + "/Gui";
  let wapGuiAssetsDir = wapGuiDir + "/img";
  let wapGuiAssetsBackgroundDir = wapGuiAssetsDir + "/background";
  let wapGuiAssetsKnobsDir = wapGuiAssetsDir + "/knobs";
  let wapGuiAssetsSlidersDir = wapGuiAssetsDir + "/sliders";
  let wapGuiAssetsSwitchesDir = wapGuiAssetsDir + "/switches";

  console.log("/generate, checking if dir " + wapDir + "exists...");

  if (fs.existsSync(wapDir)) {
    console.log("Dir existed, deleting it...");
    rimraf(wapDir);
  }
  fs.mkdirSync(wapDir);

  // ---- ASSETS
  // GENERATE Gui folder and asset subfolders, copy used assets in right places
  fs.mkdirSync(wapGuiDir);
  fs.mkdirSync(wapGuiAssetsDir); // the img dir
  fs.mkdirSync(wapGuiAssetsBackgroundDir); // img/background
  fs.mkdirSync(wapGuiAssetsKnobsDir);      // img/knobs
  fs.mkdirSync(wapGuiAssetsSlidersDir);    // img/sliders
  fs.mkdirSync(wapGuiAssetsSwitchesDir);  // img/switches

  // TODO: Adapt this part 
  let assets = JSON.parse(req.body.listOfAssetsUsedByPlugin);
  assets.forEach(a => {
    let sourceFile = currentDir + "/functional-pedals/commonAssets/" + a;
    const subfolder = a.split('/')[2]; // knob, background, slider, switches etc.
    let targetDir = wapGuiAssetsDir + "/" + subfolder;
    copyFileSync(sourceFile, targetDir);
  })
  console.log("Folder with imgs useb by plugin copied into Gui/img dir...");
  // ---- END OF ASSETS

  copyFolderRecursiveSync(
    currentDir + "/functional-pedals/commonAssets/sourceFiles/utils",
    wapDir
  ); 
  console.log("Folder utils copied into main dir...");

  // then the fetchModule.js in the plugin dir
  copyFileSync(
    currentDir + "/functional-pedals/commonAssets/sourceFiles/fetchModule.js",
    wapDir
  );
  console.log("fetchModule.js copied into main dir...");

    // HERE WE SHOULD CALL A GENERATE DESCRIPTOR.JSON function depending on the value
    // of data.currentPolyState (possible values : wam2-poly-ts if it is an instrument, or wam2-ts if it is an effect)
    console.log("currentPolyState = " + req.body.currentPolyState);

    if(req.body.currentPolyState === "wam2-poly-ts") {
	// instrument
	copyFileSync(
	    currentDir + "/functional-pedals/commonAssets/sourceFiles/descriptorInstrument.json",
	    wapDir + "/descriptor.json"
	);
	console.log("copied descriptorInstrument.json to " + wapDir + "/descriptor.json");
    } else {
	// effect
	copyFileSync(
	    currentDir + "/functional-pedals/commonAssets/sourceFiles/descriptor.json",
	    wapDir
	);
    }
    console.log("descriptor.json copied into main dir...");


  // then the index.js in the Gui dir
  copyFileSync(
    currentDir + "/functional-pedals/commonAssets/sourceFiles/Gui/index.js",
    wapGuiDir
  );
  console.log("Gui/index.js file  copied...");

  fs.writeFile(wapGuiDir + "/Gui.js", req.body.generated, (err) => {
    if (err) {
      res.error("An error occured saving the Gui/Gui.js file");
    } else {
      fs.writeFile(wapDir + "/" + wapName + ".dsp", req.body.wapCode, (err) => {
        if (err) {
          res.error(
            "An error occured saving the " +
              wapDir +
              "/" +
              wapName +
              ".dsp file"
          );
        } else {
          fs.writeFile(wapDir + "/index.js", req.body.indexJS, (err) => {
            if (err) {
              res.error(
                "An error occured saving the " + wapDir + "/index.js file"
              );
            } else {
              // no error, let's send back an answer to the client
              res.json({
                message:
                  wapName +
                  " all plugin files generated successfully in directory " +
                  wapDir,
              });
            }
          });
        }
      });
    }
  });
});

app.post("/addBinaryDotZipWAM2", multerData.fields([]), function(req, res) {
  let wapName = req.body.wapName;
  let binaryDotZipURL = req.body.url;


  let currentDir = process.cwd() + "/client/PedalEditor/Back-End";

  let wapDir = currentDir + "/functional-pedals/published/" + wapName;
  console.log("/addBinaryDotZip, adding binary.zip to " + wapDir);

  console.log("Sending request to GET " + binaryDotZipURL);
  // TODO : check if you can do this with promises...
  request(binaryDotZipURL)
    .pipe(fs.createWriteStream(wapDir + "/binary.zip"))
    .on("close", function () {
      console.log("binary.zip has been downloaded, now unzipping it...");
      fs.createReadStream(wapDir + "/binary.zip").pipe(
        unzip.Extract({ path: wapDir }).on("close", function () {
          // zip has been completely extracted, we can rename
          // main.js into Node.js
          //fs.renameSync(wapDir + "/main.js", wapDir + "/Node.js");
	    fs.copyFileSync(wapDir + "/host/index.js", wapDir + "/Node.js");

          // copy host files
          // delete if exists current index.html (old WAM1.0 host)
          if (fs.existsSync(wapDir + "/index.html")) {
            console.log("File index.html for wam1 host exists, deleting it...");
            fs.unlinkSync(wapDir + "/index.html");
          }
          copyFileSync(
            currentDir +
              "/functional-pedals/commonAssets/sourceFiles/host/index.html",
            wapDir
          );
          copyFileSync(
            currentDir +
              "/functional-pedals/commonAssets/sourceFiles/host/host.js",
            wapDir
          );
          copyFileSync(
            currentDir +
              "/functional-pedals/commonAssets/sourceFiles/host/CleanGuitarRiff.mp3",
            wapDir
          );
          console.log("The file has been unzipped... and host generated");
          fs.unlinkSync(wapDir + "/binary.zip");
          console.log("binary.zip removed...");
          console.log("----- plugin published ----");

        })
      );
    });
});

// ################ END OF WAP2

app.listen(3000, function() {
  console.log("Listening on port 3000!");
});

//################
// UTILS FUNCTIONS
//################

function copyFileSync(source, target) {
 var targetFile = target;

  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  var files = [];

  //check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function(file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

/**
 * Remove directory recursively
 * @param {string} dir_path
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimraf(dir_path) {
  if (fs.existsSync(dir_path)) {
      fs.readdirSync(dir_path).forEach(function(entry) {
          var entry_path = path.join(dir_path, entry);
          if (fs.lstatSync(entry_path).isDirectory()) {
              rimraf(entry_path);
          } else {
              fs.unlinkSync(entry_path);
          }
      });
      fs.rmdirSync(dir_path);
  }
}

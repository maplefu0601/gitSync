
var fs = require('fs');
var path = require('path');
var config = require('./config.json');

var Config = {
	
	checkConfig : function() {
		
		var gitFolder = config.gitdata.gitFolder;
		var sitePath = config.html.sitePath;
		var destPdfPath = config.pdf.destPath;
		var logPath = config.log.logPath;

		[gitFolder, sitePath, destPdfPath, logPath].forEach(function(name) {
			if(!fs.existsSync(name)) {
				createFolder(name, 0777);
			}
			
		});
	},

	saveConfig : function(data) {
		
		fs.writeFile('./config.json', data, function(err) {
			
			if(err) {
				console.log('error writing to config.json. '+ err);
			} else {
				console.log('saved config.json. \n' + data);
			}
		});
	},
};

function createFolder(dirPath, mode, callback) {
	
	fs.mkdir(dirPath, mode, function(error) {
		
		if(error && error.code === 'ENOENT') {
			createFolder(path.dirname(dirPath), mode, callback);
			createFolder(dirPath, mode, callback);
		} else {
			console.log('created folder '+dirPath);
			if(callback) {
				callback(error);
			}
		}
	});
}

//for test
//config.config.autoCreatePdf = true;
//Config.saveConfig(JSON.stringify(config));

module.exports = Config;

